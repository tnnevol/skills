/**
 * Shared configuration loader for Halo scripts.
 *
 * Loads .env files (skill directory first, then project root) and validates
 * the two required variables. Exports { BASE_URL, PAT }.
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
const projectRoot = findProjectRoot(skillDir);

// Lower priority first, higher priority overwrites undefined keys
loadEnv(path.join(projectRoot, ".env"));
loadEnv(path.join(skillDir, ".env"));

const BASE_URL = (process.env.HALO_BASE_URL || "").replace(/\/+$/, "");
const PAT = process.env.HALO_PAT;

if (!BASE_URL || !PAT) {
  const missing = [
    !BASE_URL && "HALO_BASE_URL",
    !PAT && "HALO_PAT",
  ].filter(Boolean);
  console.error(
    `[CONFIG_MISSING] ${missing.join(", ")}\n` +
      "Halo 环境变量未配置。请设置 HALO_BASE_URL 和 HALO_PAT。\n" +
      "可在 skill 目录或项目根目录创建 .env 文件，或 export 环境变量。"
  );
  process.exit(2);
}

module.exports = { BASE_URL, PAT, skillDir };
