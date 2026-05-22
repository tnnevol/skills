#!/usr/bin/env node

'use strict';

// Sanitize output to redact sensitive values (AUTO_SAVE_TOKEN)
// Usage: echo "json output" | node sanitize.cjs
//        node sanitize.cjs <file>

const fs = require('fs');

function sanitize(str, token) {
  if (!str || !token) return str;
  // Replace all occurrences of the token with masked version
  const masked = token.length > 4 ? `${token.slice(0, 4)}****${token.slice(-4)}` : '****';
  return str.replace(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), masked);
}

function main() {
  const token = process.env.AUTO_SAVE_TOKEN;
  if (!token) {
    process.exit(0);
  }

  const input = process.argv[2] || fs.readFileSync('/dev/stdin', 'utf8');
  console.log(sanitize(input, token));
}

main();
