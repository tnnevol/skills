import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  unlinkSync,
} from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export interface OpenListConfig {
  baseUrl: string;
  token: string;
}

const CONFIG_DIR = join(homedir(), ".openlist");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export function loadConfig(): OpenListConfig | null {
  if (!existsSync(CONFIG_FILE)) {
    return null;
  }

  try {
    const content = readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export function saveConfig(config: OpenListConfig): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }

  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export function clearConfig(): void {
  if (existsSync(CONFIG_FILE)) {
    unlinkSync(CONFIG_FILE);
  }
}

export function resolveConfig(options: {
  baseUrl?: string;
  token?: string;
}): OpenListConfig {
  const fileConfig = loadConfig();

  const baseUrl =
    options.baseUrl ||
    process.env.OPENLIST_BASE_URL ||
    fileConfig?.baseUrl ||
    "";

  const token =
    options.token || process.env.OPENLIST_TOKEN || fileConfig?.token || "";

  if (!baseUrl) {
    console.error(
      "Error: OpenList 服务地址未配置。请使用 --base-url 选项或设置 OPENLIST_BASE_URL 环境变量，或运行 `openlist auth login` 进行配置。",
    );
    process.exit(1);
  }

  if (!token) {
    console.error(
      "Error: API Token 未配置。请使用 --token 选项或设置 OPENLIST_TOKEN 环境变量，或运行 `openlist auth login` 进行配置。",
    );
    process.exit(1);
  }

  return { baseUrl, token };
}
