/**
 * Shared sanitization module for Memos scripts.
 *
 * Provides best-effort redaction of sensitive values in text content.
 */

const SENSITIVE_KEYWORDS = [
  "password",
  "passwd",
  "secret",
  "token",
  "credential",
  "apikey",
  "api_key",
  "api-key",
  "api_secret",
  "auth",
  "auth_token",
  "authorization",
  "private_key",
  "private-key",
  "privatekey",
  "access_key",
  "access-key",
  "accesskey",
  "client_secret",
  "client-secret",
];

const SENSITIVE_PATTERN = new RegExp(
  "(" + SENSITIVE_KEYWORDS.join("|") + ")",
  "i"
);

function sanitize(content) {
  // Rule 1: Bearer tokens
  let result = content.replace(
    /Bearer\s+[A-Za-z0-9_.\-\/+=]{4,}/g,
    "Bearer <REDACTED>"
  );

  // Rule 2: Credentials in connection strings (user:pass@host pattern)
  result = result.replace(
    /[A-Za-z0-9_.\-]+:[A-Za-z0-9_.\-]+@[^\s]+/g,
    "<REDACTED>"
  );

  // Rule 3: Values of sensitive-named fields (line-by-line)
  result = result
    .split("\n")
    .map((line) => {
      // JSON: "key": "value"  or  "key": "value",
      const jsonMatch = line.match(
        /^(\s*"([^"]+)"\s*:\s*)"([^"]*)"(.*)$/
      );
      if (jsonMatch) {
        const [, prefix, key, , suffix] = jsonMatch;
        if (SENSITIVE_PATTERN.test(key)) {
          return `${prefix}"<REDACTED>"${suffix}`;
        }
        return line;
      }

      // ENV / TOML: KEY=value  or  KEY = "value"
      const envMatch = line.match(
        /^(\s*([\w.\-]+)\s*=\s*)(.+)$/
      );
      if (envMatch) {
        const [, prefix, key] = envMatch;
        if (SENSITIVE_PATTERN.test(key)) {
          return `${prefix}<REDACTED>`;
        }
        return line;
      }

      return line;
    })
    .join("\n");

  return result;
}

module.exports = { sanitize, SENSITIVE_KEYWORDS, SENSITIVE_PATTERN };
