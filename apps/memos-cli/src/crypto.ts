import type { KeyObject } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { execFileSync } from 'node:child_process'
import {
  constants,
  createCipheriv,
  createDecipheriv,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  privateDecrypt,
  publicEncrypt,
  randomBytes,
} from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

/**
 * 配置文件凭证字段的加密存储。
 *
 * 设计：**混合加密（RSA-OAEP 包裹 AES-256-GCM 数据密钥）**。
 * - 公钥：明文存放在 `~/.memos/public.pem`，用于加密。公钥泄露无风险。
 * - 私钥：优先存系统钥匙串（macOS `security` / Linux `secret-tool`），用于解密。
 * - 密文格式：`enc:v1:<base64( RSA(DEK) || IV || TAG || CIPHERTEXT )>`
 *
 * 为什么不用「纯 RSA 直接加密」：RSA-OAEP 单次可加密长度受密钥长度限制
 * （3072 位约 318 字节），Token 可能超长；混合加密无长度限制。
 *
 * 私钥不可用时的行为由调用方决定，不会静默退化成明文。
 *
 * ## 关于 macOS 钥匙串的两个已知限制
 *
 * 1. **无 GUI 会话时必然失败**：SSH、CI、沙箱里调用 `security` 会得到
 *    `User interaction is not allowed`，甚至弹出系统授权框阻塞进程。
 *    因此这里用 `canUseKeychain()` 做 TTY 门控，非交互环境直接走文件降级。
 * 2. **首次访问可能要求授权**：除非给条目配置 partition list
 *    （`security set-generic-password-partition-list -S "apple-tool:,apple:"`），
 *    否则每个调用方（例如不同 nvm 路径下的 node）首次读取都会弹窗。
 *    这是 macOS 的设计，不是本 CLI 的缺陷。
 */

export const ENC_PREFIX = 'enc:v1:'
const KEYCHAIN_SERVICE = 'memos-cli'
const RSA_MODULUS = 3072

export interface CryptoPaths {
  dir: string
  publicKey: string
  /** 降级模式下私钥落盘位置（仅在钥匙串不可用时使用） */
  privateKeyFile: string
}

export function defaultCryptoPaths(dir: string): CryptoPaths {
  return {
    dir,
    publicKey: join(dir, 'public.pem'),
    privateKeyFile: join(dir, 'private.pem'),
  }
}

export function isEncrypted(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith(ENC_PREFIX)
}

// ---------------------------------------------------------------------------
// 私钥存取：系统钥匙串优先，失败则降级到受权限保护的文件
// ---------------------------------------------------------------------------

type KeychainBackend = 'macos' | 'linux' | 'none'

function keychainBackend(): KeychainBackend {
  if (process.platform === 'darwin')
    return 'macos'
  if (process.platform === 'linux')
    return 'linux'
  return 'none'
}

/** 子进程统一超时，避免钥匙串调用在受限环境里长时间阻塞。 */
const KEYCHAIN_TIMEOUT_MS = 3000

/**
 * 当前环境是否适合调用系统钥匙串。
 *
 * 必须同时满足：
 * - 交互式终端（CI、管道、沙箱里调用 macOS `security` 会弹出系统授权框并阻塞）
 * - 未被显式禁用（`MEMOS_CLI_NO_KEYCHAIN=1` 便于脚本强制走文件降级）
 */
export function canUseKeychain(): boolean {
  if (process.env.MEMOS_CLI_NO_KEYCHAIN === '1')
    return false
  return Boolean(process.stdin.isTTY && process.stdout.isTTY)
}

function commandExists(cmd: string): boolean {
  try {
    execFileSync('command', ['-v', cmd], { shell: '/bin/sh', stdio: 'ignore', timeout: KEYCHAIN_TIMEOUT_MS })
    return true
  }
  catch {
    return false
  }
}

/** 从系统钥匙串读取私钥；不存在或不可用时返回 null。 */
export function readPrivateKeyFromKeychain(): string | null {
  if (!canUseKeychain())
    return null
  const backend = keychainBackend()
  try {
    if (backend === 'macos') {
      const out = execFileSync(
        'security',
        ['find-generic-password', '-s', KEYCHAIN_SERVICE, '-a', 'private-key', '-w'],
        { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'], timeout: KEYCHAIN_TIMEOUT_MS },
      )
      return out.trim() || null
    }
    if (backend === 'linux' && commandExists('secret-tool')) {
      const out = execFileSync(
        'secret-tool',
        ['lookup', 'service', KEYCHAIN_SERVICE, 'account', 'private-key'],
        { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'], timeout: KEYCHAIN_TIMEOUT_MS },
      )
      return out.trim() || null
    }
  }
  catch {
    return null
  }
  return null
}

/**
 * 把私钥写入系统钥匙串。
 * 返回 true 表示写入成功；false 表示当前环境不可用（调用方应降级）。
 */
export function writePrivateKeyToKeychain(pem: string): boolean {
  if (!canUseKeychain())
    return false
  const backend = keychainBackend()
  try {
    if (backend === 'macos') {
      // -U：已存在则更新，避免重复添加报错
      execFileSync(
        'security',
        ['add-generic-password', '-s', KEYCHAIN_SERVICE, '-a', 'private-key', '-w', pem, '-U'],
        { stdio: 'ignore', timeout: KEYCHAIN_TIMEOUT_MS },
      )
      return true
    }
    if (backend === 'linux' && commandExists('secret-tool')) {
      execFileSync(
        'secret-tool',
        ['store', '--label', `${KEYCHAIN_SERVICE} private key`, 'service', KEYCHAIN_SERVICE, 'account', 'private-key'],
        { input: pem, stdio: ['pipe', 'ignore', 'ignore'], timeout: KEYCHAIN_TIMEOUT_MS },
      )
      return true
    }
  }
  catch {
    return false
  }
  return false
}

// ---------------------------------------------------------------------------
// 密钥对
// ---------------------------------------------------------------------------

export interface KeyPair {
  publicKeyPem: string
  privateKeyPem: string
}

export function generateKeyPair(): KeyPair {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: RSA_MODULUS })
  return {
    publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
  }
}

export function readPublicKeyPem(paths: CryptoPaths): string | null {
  if (!existsSync(paths.publicKey))
    return null
  try {
    return readFileSync(paths.publicKey, 'utf-8')
  }
  catch {
    return null
  }
}

/** 读取私钥：钥匙串优先，其次降级文件。 */
export function readPrivateKeyPem(paths: CryptoPaths): string | null {
  const fromKeychain = readPrivateKeyFromKeychain()
  if (fromKeychain)
    return fromKeychain

  if (existsSync(paths.privateKeyFile)) {
    try {
      return readFileSync(paths.privateKeyFile, 'utf-8')
    }
    catch {
      return null
    }
  }
  return null
}

export interface EnsureKeysResult {
  paths: CryptoPaths
  /** 本次是否新建了密钥对 */
  created: boolean
  /** 私钥实际存放位置 */
  privateKeyStorage: 'keychain' | 'file'
}

/**
 * 确保密钥对存在。首次调用会生成并保存公钥（明文）与私钥（钥匙串优先）。
 * 私钥保存位置会记录在 `~/.memos/keymeta.json`，便于诊断。
 */
export function ensureKeys(dir: string): EnsureKeysResult {
  const paths = defaultCryptoPaths(dir)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true, mode: 0o700 })
  }

  const existingPublic = readPublicKeyPem(paths)
  const existingPrivate = readPrivateKeyPem(paths)
  if (existingPublic && existingPrivate) {
    return { paths, created: false, privateKeyStorage: keyStorage(paths) }
  }

  const pair = generateKeyPair()
  writeFileSync(paths.publicKey, pair.publicKeyPem, { encoding: 'utf-8', mode: 0o644 })

  const inKeychain = writePrivateKeyToKeychain(pair.privateKeyPem)
  if (!inKeychain) {
    // 降级：私钥落盘，权限收紧到 600
    writeFileSync(paths.privateKeyFile, pair.privateKeyPem, { encoding: 'utf-8', mode: 0o600 })
  }

  writeFileSync(
    join(dir, 'keymeta.json'),
    JSON.stringify({ version: 1, algorithm: 'RSA-3072-OAEP-SHA256 + AES-256-GCM', storage: inKeychain ? 'keychain' : 'file' }, null, 2),
    { encoding: 'utf-8', mode: 0o644 },
  )

  return { paths, created: true, privateKeyStorage: inKeychain ? 'keychain' : 'file' }
}

function keyStorage(paths: CryptoPaths): 'keychain' | 'file' {
  if (readPrivateKeyFromKeychain())
    return 'keychain'
  return existsSync(paths.privateKeyFile) ? 'file' : 'keychain'
}

// ---------------------------------------------------------------------------
// 加解密
// ---------------------------------------------------------------------------

export function encryptSecret(plaintext: string, publicKeyPem: string): string {
  const publicKey = createPublicKey(publicKeyPem)
  const dataKey = randomBytes(32)
  const iv = randomBytes(12)

  const cipher = createCipheriv('aes-256-gcm', dataKey, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf-8'), cipher.final()])
  const tag = cipher.getAuthTag()

  const wrappedKey = cryptoSafeRsaEncrypt(dataKey, publicKey)

  const blob = Buffer.concat([wrappedKey, iv, tag, ciphertext])
  return ENC_PREFIX + blob.toString('base64')
}

/**
 * RSA-OAEP 加密数据密钥。
 * 单独抽出便于测试，并集中处理 padding 与 hash 参数。
 */
function cryptoSafeRsaEncrypt(dataKey: Buffer, publicKey: KeyObject): Buffer {
  return publicEncrypt(
    { key: publicKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    dataKey,
  )
}

export function decryptSecret(encrypted: string, privateKeyPem: string): string {
  if (!isEncrypted(encrypted)) {
    throw new Error('不是受支持的密文格式')
  }

  const blob = Buffer.from(encrypted.slice(ENC_PREFIX.length), 'base64')
  const privateKey = createPrivateKey(privateKeyPem)

  const keySize = privateKey.asymmetricKeyDetails?.modulusLength
    ? Math.ceil((privateKey.asymmetricKeyDetails.modulusLength) / 8)
    : 384 // 3072 位 -> 384 字节

  const wrappedKey = blob.subarray(0, keySize)
  const iv = blob.subarray(keySize, keySize + 12)
  const tag = blob.subarray(keySize + 12, keySize + 28)
  const ciphertext = blob.subarray(keySize + 28)

  const dataKey = privateDecrypt(
    { key: privateKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    wrappedKey,
  )

  const decipher = createDecipheriv('aes-256-gcm', dataKey, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf-8')
}
