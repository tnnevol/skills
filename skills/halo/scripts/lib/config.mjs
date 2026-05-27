import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_VARS = ['HALO_BASE_URL', 'HALO_PAT'];

function parseDotenv(content) {
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    let key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function loadEnvFile(filePath) {
  if (existsSync(filePath)) {
    return parseDotenv(readFileSync(filePath, 'utf-8'));
  }
  return {};
}

export function loadConfig() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const skillDir = dirname(scriptDir);
  const projectRoot = process.cwd();

  let merged = {};

  const projectEnv = resolve(projectRoot, '.env');
  Object.assign(merged, loadEnvFile(projectEnv));

  const skillEnv = resolve(skillDir, '.env');
  Object.assign(merged, loadEnvFile(skillEnv));

  Object.assign(merged, process.env);

  const missing = REQUIRED_VARS.filter((key) => !merged[key]);
  if (missing.length > 0) {
    const missingList = missing.join(', ');
    throw new Error(
      `缺少必需的环境变量: ${missingList}\n` +
        `请在 .env 文件或系统环境中配置，详见 references/setup.md`
    );
  }

  let baseUrl = merged.HALO_BASE_URL.replace(/\/+$/, '');

  return {
    baseUrl,
    pat: merged.HALO_PAT,
  };
}
