/**
 * Shared configuration loader for Memos scripts.
 *
 * Loads .env files (project root first, then skill dir) and validates
 * the two required variables. Exports { BASE_URL, ACCESS_TOKEN }.
 *
 * Priority (higher overrides lower):
 *   1. Environment variables
 *   2. Skill directory .env
 *   3. Project root .env
 */

const fs = require("fs");
const path = require("path");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf-8").split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let value = line.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function findProjectRoot(startDir) {
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    if (
      fs.existsSync(path.join(dir, ".git")) ||
      fs.existsSync(path.join(dir, "package.json"))
    ) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return startDir;
}

const skillDir = path.resolve(__dirname, "..");
const projectRoot = findProjectRoot(process.cwd());

// Lower priority first, higher priority overwrites undefined keys
loadEnv(path.join(projectRoot, ".env"));
loadEnv(path.join(skillDir, ".env"));

const BASE_URL = process.env.MEMOS_BASE_URL;
const ACCESS_TOKEN = process.env.MEMOS_ACCESS_TOKEN;

if (!BASE_URL || !ACCESS_TOKEN) {
  const missing = [
    !BASE_URL && "MEMOS_BASE_URL",
    !ACCESS_TOKEN && "MEMOS_ACCESS_TOKEN",
  ].filter(Boolean);
  console.error(
    `[CONFIG_MISSING] ${missing.join(", ")}\n` +
      "The user has not configured the required environment variables.\n" +
      "DO NOT retry. Ask the user to export them (e.g. `export MEMOS_BASE_URL=...`) or set them in a .env file."
  );
  process.exit(2);
}

module.exports = { BASE_URL, ACCESS_TOKEN };
