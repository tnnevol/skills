import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));

// 针对编译后的 CLI 进行测试
export const CLI_PATH = resolve(currentDir, "../../dist/cli.js");

export interface CliResult {
  /** 进程退出码 */
  code: number;
  stdout: string;
  stderr: string;
  /** 解析后的 JSON 输出（优先 stdout，失败时回退 stderr） */
  json: any;
}

/**
 * 运行编译后的 CLI 子进程，使用真实环境变量（不使用 mock）。
 * process.env 会被完整继承（包含 setup.ts 从 .env 加载的变量），
 * 额外的 env 参数可用于覆盖（例如隔离 HOME）。
 */
export function runCli(
  args: string[],
  env: Record<string, string> = {},
): CliResult {
  const result = spawnSync("node", [CLI_PATH, ...args], {
    encoding: "utf-8",
    env: { ...process.env, ...env },
  });

  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";

  let json: any;
  const raw = stdout.trim() || stderr.trim();
  try {
    json = JSON.parse(raw);
  } catch {
    json = undefined;
  }

  return { code: result.status ?? 0, stdout, stderr, json };
}

/** 读取必需的环境变量，缺失时抛错以便测试尽早失败。 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `缺少环境变量 ${name}，请在 apps/openlist-cli/.env 中配置后重试`,
    );
  }
  return value;
}

/** 生成本次测试运行专用的唯一目录名，避免与已有数据冲突。 */
export function uniqueName(prefix = "cli-test"): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
}
