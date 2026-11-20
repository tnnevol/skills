import { accessSync, chmodSync, constants, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
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

export type ApiVersion = 'v1' | 'v2'
export type ApiVersionPreference = 'auto' | ApiVersion

export interface ChandaoConfig {
  /** 禅道站点根地址，例如 http://192.168.0.19:8890（不含 /api.php） */
  baseUrl: string
  account?: string
  /** auto = 登录探测后优先 v2；也可固定 v1/v2 */
  apiVersion: ApiVersionPreference
  /** 登录时探测到的可用版本（v2 优先） */
  detectedVersion?: ApiVersion
  tokenV1?: string
  tokenV2?: string
  updatedAt?: string
}

export interface ResolvedConfig {
  baseUrl: string
  account?: string
  apiVersion: ApiVersionPreference
  detectedVersion?: ApiVersion
  tokens: Partial<Record<ApiVersion, string>>
  /** CLI --token 覆盖（对当前使用的版本生效） */
  tokenOverride?: string
}

/** 需要加密落盘的字段 */
const SECRET_FIELDS = ['tokenV1', 'tokenV2'] as const

function configDir(): string {
  return join(homedir(), '.chandao')
}

function configFile(): string {
  return join(configDir(), 'config.json')
}

function isConfigDirWritable(): boolean {
  try {
    accessSync(configDir(), constants.W_OK)
    return true
  }
  catch {
    return false
  }
}

function decryptConfig(raw: Record<string, unknown>): ChandaoConfig | null {
  const paths = defaultCryptoPaths(configDir())
  const privateKeyPem = readPrivateKeyPem(paths)
  const result: Record<string, unknown> = { ...raw }

  for (const field of SECRET_FIELDS) {
    const value = raw[field]
    if (!isEncrypted(value))
      continue
    if (!privateKeyPem) {
      console.error(
        `Error: 配置中的 \`${field}\` 已加密，但本机找不到解密私钥（钥匙串或 ${paths.privateKeyFile}）。\n`
        + '请重新执行 `chandao-cli auth login`。',
      )
      return null
    }
    try {
      result[field] = decryptSecret(value, privateKeyPem)
    }
    catch {
      console.error(`Error: 解密配置项 \`${field}\` 失败（私钥不匹配或密文损坏）。请重新登录。`)
      return null
    }
  }
  return result as unknown as ChandaoConfig
}

export function loadConfig(): ChandaoConfig | null {
  if (!existsSync(configFile()))
    return null

  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(readFileSync(configFile(), 'utf-8')) as Record<string, unknown>
  }
  catch {
    return null
  }

  if (SECRET_FIELDS.some(f => isEncrypted(raw[f])))
    return decryptConfig(raw)

  // 明文旧格式：按明文读取并尝试迁移为加密格式
  const config = { ...raw } as unknown as ChandaoConfig
  if (isConfigDirWritable()) {
    try {
      saveConfig(config)
    }
    catch (error) {
      console.error(`warn: 配置迁移为加密格式失败（本次仍按明文读取）：${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return config
}

export function saveConfig(config: ChandaoConfig): void {
  if (!existsSync(configDir()))
    mkdirSync(configDir(), { recursive: true, mode: 0o700 })

  const { paths } = ensureKeys(configDir())
  const publicKeyPem = readPublicKeyPem(paths)
  if (!publicKeyPem)
    throw new Error('公钥不可用，无法加密配置')

  const out: Record<string, unknown> = { ...(config as unknown as Record<string, unknown>) }
  for (const field of SECRET_FIELDS) {
    const value = (config as unknown as Record<string, unknown>)[field]
    if (typeof value === 'string' && value.length > 0 && !isEncrypted(value))
      out[field] = encryptSecret(value, publicKeyPem)
  }

  writeFileSync(configFile(), JSON.stringify(out, null, 2), { encoding: 'utf-8', mode: 0o600 })
  try {
    chmodSync(configFile(), 0o600)
  }
  catch {
    // 某些文件系统不支持，忽略
  }
}

export function clearConfig(): void {
  if (existsSync(configFile()))
    unlinkSync(configFile())
}

export function maskToken(token?: string): string | null {
  if (!token)
    return null
  if (token.length <= 8)
    return '***'
  return `${token.slice(0, 4)}***${token.slice(-4)}`
}

const TRAILING_SLASHES = /\/+$/
const API_PHP_SUFFIX = /\/api\.php(\/v[12])?$/i

/**
 * 归一化站点地址：
 * - http://host:8890/api.php、http://host:8890/api.php/v2 → http://host:8890
 * - 去掉尾部斜杠
 * - 保留子路径部署（如 https://host/zentao）
 */
export function normalizeBaseUrl(input: string): string {
  let value = input.trim()
  if (!value)
    return ''
  value = value.replace(TRAILING_SLASHES, '')
  value = value.replace(API_PHP_SUFFIX, '')
  value = value.replace(TRAILING_SLASHES, '')
  return value
}

export function isValidBaseUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname)
  }
  catch {
    return false
  }
}

export function normalizeApiVersion(value: string | undefined): ApiVersionPreference {
  if (value === 'v1' || value === 'v2')
    return value
  return 'auto'
}

export function resolveConfig(options: {
  baseUrl?: string
  account?: string
  token?: string
  apiVersion?: string
}): ResolvedConfig {
  const fileConfig = loadConfig()

  // 登录后配置优先于环境变量，避免换账号后被旧 CHANDAO_* 环境变量覆盖。
  const baseUrl = normalizeBaseUrl(
    options.baseUrl || fileConfig?.baseUrl || env.CHANDAO_URL || '',
  )
  const account = options.account || fileConfig?.account || env.CHANDAO_ACCOUNT
  const apiVersion = normalizeApiVersion(
    options.apiVersion || fileConfig?.apiVersion || env.CHANDAO_API_VERSION,
  )

  const tokens: Partial<Record<ApiVersion, string>> = {
    v1: fileConfig?.tokenV1 || env.CHANDAO_TOKEN_V1,
    v2: fileConfig?.tokenV2 || env.CHANDAO_TOKEN_V2,
  }
  const hasConfigToken = Boolean(fileConfig?.tokenV1 || fileConfig?.tokenV2)

  if (!baseUrl) {
    console.error(
      'Error: 禅道地址未配置。请使用 --base-url，或设置 CHANDAO_URL，或先运行 `chandao-cli auth login`。',
    )
    exit(1)
  }
  if (!isValidBaseUrl(baseUrl)) {
    console.error(`Error: 无效的禅道地址：${baseUrl}`)
    exit(1)
  }

  return {
    baseUrl,
    account,
    apiVersion,
    detectedVersion: fileConfig?.detectedVersion,
    tokens,
    tokenOverride: options.token || (hasConfigToken ? undefined : env.CHANDAO_TOKEN),
  }
}
