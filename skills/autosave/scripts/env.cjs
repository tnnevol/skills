#!/usr/bin/env node

'use strict';

// Environment variable loader for autosave skill
// Reads from skill directory .env or project root .env if env vars not set

const fs = require('fs');
const path = require('path');

function parseEnv(filePath) {
  const env = {};
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  }
  return env;
}

function loadEnv() {
  // If already set via environment variables, use those
  if (process.env.AUTO_SAVE_BASE_URL && process.env.AUTO_SAVE_TOKEN) {
    return { baseUrl: process.env.AUTO_SAVE_BASE_URL, token: process.env.AUTO_SAVE_TOKEN };
  }

  // Try skill directory .env
  const skillDir = path.dirname(__dirname);
  const skillEnv = path.join(skillDir, '.env');
  if (fs.existsSync(skillEnv)) {
    const env = parseEnv(skillEnv);
    if (env.AUTO_SAVE_BASE_URL && env.AUTO_SAVE_TOKEN) {
      return { baseUrl: env.AUTO_SAVE_BASE_URL, token: env.AUTO_SAVE_TOKEN };
    }
  }

  console.error('[CONFIG_MISSING] AUTO_SAVE_BASE_URL and AUTO_SAVE_TOKEN are required');
  process.exit(1);
}

module.exports = loadEnv;
