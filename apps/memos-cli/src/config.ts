import { chmodSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { env, exit } from 'node:process'
import {
  decryptSecret,
  defaultCryptoPaths,
  encryptSecret,
  ensureKeys,
  isEncrypted,
  readPrivateKeyPem,
  readPublicKeyPem,
} from './crypto.js'

export interface MemosConfig {
  baseUrl: string
  token?: string
  /** API 路径前缀，v0.29–v0.31 为 /api/v1，main（v0.32+）改为 /api */
  apiPath?: string
}

export const DEFAULT_API_PATH = '/api/v1'

/**
 * 配置目录在**调用时**解析，而不是模块加载时固化。
 * 这样测试可以用临时 HOME 隔离，也避免用户切换 HOME 后仍读旧路径。
 */
function configDir(): string {
  return join(homedir(), '.memos')
}

function configFile(): string {
  return join(configDir(), 'config.json')
}

const TRAILING_SLASHES = /\/+$/

/** 需要加密落盘的字段。baseUrl / apiPath 保持明文，便于人工排查。 */
const SECRET_FIELDS = ['token'] as const

/**
 * 读取配置。
 *
 * - 明文旧格式（升级前写入）：照常返回，并自动迁移为加密格式。
 * - 密文格式：用私钥解密；私钥丢失/缺失时返回 null 并提示，不把密文当明文用。
 */
export function loadConfig(): MemosConfig | null {
  if (!existsSync(configFile())) {
    return null
  }

  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(readFileSync(configFile(), 'utf-8')) as Record<string, unknown>
  }
  catch {
    return null
  }

  if (SECRET_FIELDS.some(f => isEncrypted(raw[f]))) {
    return decryptConfig(raw)
  }

  // 明文旧格式：先按明文用，同时尝试迁移为加密格式
  const config = raw as unknown as MemosConfig
  try {
    saveConfig(config)
  }
  catch (error) {
    // 迁移失败不阻塞使用，但要留痕：多半是目录不可写或密钥生成失败
    console.error(
      `warn: 配置迁移为加密格式失败（本次仍按明文读取）：${error instanceof Error ? error.message : String(error)}`,
    )
  }
  return config
}

function decryptConfig(raw: Record<string, unknown>): MemosConfig | null {
  const paths = defaultCryptoPaths(configDir())
  const privateKeyPem = readPrivateKeyPem(paths)
  const result: Record<string, unknown> = { ...raw }

  for (const field of SECRET_FIELDS) {
    const value = raw[field]
    if (!isEncrypted(value))
      continue

    if (!privateKeyPem) {
      console.error(JSON.stringify({
        success: false,
        message: `配置文件中的 \`${field}\` 已加密，但本机找不到解密私钥（钥匙串或 ${paths.privateKeyFile}）。请重新执行 \`memos-cli auth login\`。`,
      }))
      return null
    }

    try {
      result[field] = decryptSecret(value, privateKeyPem)
    }
    catch {
      console.error(JSON.stringify({
        success: false,
        message: `解密配置项 \`${field}\` 失败（私钥不匹配或密文损坏）。请重新执行 \`memos-cli auth login\`。`,
      }))
      return null
    }
  }

  return result as unknown as MemosConfig
}

export function saveConfig(config: MemosConfig): void {
  if (!existsSync(configDir())) {
    mkdirSync(configDir(), { recursive: true, mode: 0o700 })
  }

  const { paths } = ensureKeys(configDir())
  const publicKeyPem = readPublicKeyPem(paths)
  if (!publicKeyPem) {
    throw new Error('公钥不可用，无法加密配置')
  }

  const out: Record<string, unknown> = { ...config }
  for (const field of SECRET_FIELDS) {
    const value = (config as Record<string, unknown>)[field]
    if (typeof value === 'string' && value.length > 0 && !isEncrypted(value)) {
      out[field] = encryptSecret(value, publicKeyPem)
    }
  }

  writeFileSync(configFile(), JSON.stringify(out, null, 2), { encoding: 'utf-8', mode: 0o600 })
  // 文件已存在时 mode 不生效，显式收紧权限（配置里有密文，仍是敏感文件）
  try {
    chmodSync(configFile(), 0o600)
  }
  catch {
    // 某些文件系统（如 Windows）不支持，忽略
  }
}

export function clearConfig(): void {
  if (existsSync(configFile())) {
    unlinkSync(configFile())
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
 * **环境变量始终是明文**，不参与加解密。
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
