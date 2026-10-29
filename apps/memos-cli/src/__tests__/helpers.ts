import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))

// 针对编译后的 CLI 进行测试
export const CLI_PATH = resolve(currentDir, '../../dist/cli.js')

export interface CliResult {
  /** 进程退出码 */
  code: number
  stdout: string
  stderr: string
  /** 解析后的 JSON 输出（优先 stdout，失败时回退 stderr） */

  json: any
}

/**
 * 运行编译后的 CLI 子进程，使用真实环境变量（不使用 mock）。
 * process.env 会被完整继承（凭据来自外部环境变量，如 ~/.zshrc 注入），
 * 额外的 env 参数可用于覆盖。
 */
export function runCli(
  args: string[],
  env: Record<string, string> = {},
): CliResult {
  const result = spawnSync('node', [CLI_PATH, ...args], {
    encoding: 'utf-8',
    env: { ...process.env, ...env },
    timeout: 25000,
  })

  const stdout = result.stdout ?? ''
  const stderr = result.stderr ?? ''

  let json
  const raw = stdout.trim() || stderr.trim()
  try {
    json = JSON.parse(raw)
  }
  catch {
    json = undefined
  }

  return { code: result.status ?? 0, stdout, stderr, json }
}

/** 读取必需的环境变量，缺失时抛错以便测试尽早失败。 */
export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`缺少环境变量 ${name}，请先在 shell 中导出（如 ~/.zshrc 配置）后重试`)
  }
  return value
}

/** 生成本次测试运行专用的唯一标记，便于识别与清理。 */
export function uniqueTag(prefix = 'cli-test'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`
}

/** 创建一条测试笔记并返回资源名，失败时抛错。 */
export function createTestMemo(content: string): string {
  const created = runCli(['memo', 'create', '--content', content])
  if (created.code !== 0 || !created.json?.success) {
    throw new Error(`创建测试笔记失败: ${created.stderr || created.stdout}`)
  }
  return created.json.data.name as string
}

/** 删除笔记，忽略不存在等错误（用于 afterAll 清理）。 */
export function deleteMemoQuietly(name: string): void {
  runCli(['memo', 'delete', name, '--force'])
}
