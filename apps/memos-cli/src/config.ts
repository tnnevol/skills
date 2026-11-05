import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { env, exit } from 'node:process'

export interface MemosConfig {
  baseUrl: string
  token?: string
  /** API 路径前缀，v0.29–v0.31 为 /api/v1，main（v0.32+）改为 /api */
  apiPath?: string
}

export const DEFAULT_API_PATH = '/api/v1'

const CONFIG_DIR = join(homedir(), '.memos')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')
const TRAILING_SLASHES = /\/+$/

export function loadConfig(): MemosConfig | null {
  if (!existsSync(CONFIG_FILE)) {
    return null
  }

  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')) as MemosConfig
  }
  catch {
    return null
  }
}

export function saveConfig(config: MemosConfig): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true })
  }

  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')
}

export function clearConfig(): void {
  if (existsSync(CONFIG_FILE)) {
    unlinkSync(CONFIG_FILE)
  }
}

export function normalizeApiPath(value: string | undefined): string {
  const raw = (value || DEFAULT_API_PATH).trim() || DEFAULT_API_PATH
  const trimmed = raw.replace(TRAILING_SLASHES, '')
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

/**
 * 配置优先级：CLI 选项 > 环境变量 > 配置文件。
 * 环境变量沿用技能既有命名：MEMOS_BASE_URL / MEMOS_ACCESS_TOKEN，另加 MEMOS_API_PATH。
 */
export function resolveConfig(options: {
  baseUrl?: string
  token?: string
  apiPath?: string
}): MemosConfig {
  const fileConfig = loadConfig()

  const baseUrl = (options.baseUrl || env.MEMOS_BASE_URL || fileConfig?.baseUrl || '')
    .trim()
    .replace(TRAILING_SLASHES, '')
  const token = options.token || env.MEMOS_ACCESS_TOKEN || fileConfig?.token || ''
  const apiPath = normalizeApiPath(options.apiPath || env.MEMOS_API_PATH || fileConfig?.apiPath)

  if (!baseUrl) {
    console.error(
      JSON.stringify({
        success: false,
        message: 'Memos 服务地址未配置。请使用 --base-url 选项或设置 MEMOS_BASE_URL 环境变量，或运行 `memos-cli auth login` 进行配置。',
      }),
    )
    exit(1)
  }

  if (!token) {
    console.error(
      JSON.stringify({
        success: false,
        message: 'Memos 访问令牌未配置。请使用 --token 选项或设置 MEMOS_ACCESS_TOKEN 环境变量，或运行 `memos-cli auth login` 进行配置。',
      }),
    )
    exit(1)
  }

  return { baseUrl, token, apiPath }
}
