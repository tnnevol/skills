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
 * 配置文件凭证字段的加密存储（与 openlist-cli / memos-cli 同一套方案）。
 *
 * - 公钥明文存放，用于加密；私钥优先存系统钥匙串，不可用时降级到 600 权限文件。
 * - 密文格式：`enc:v1:<base64(RSA(DEK) || IV || TAG || CIPHERTEXT)>`
 * - 私钥丢失时由调用方决定报错，不静默降级明文。
 */

export const ENC_PREFIX = 'enc:v1:'
const KEYCHAIN_SERVICE = 'chandao-cli'
const HEX_RE = /^[0-9a-f]+$/i
const RSA_MODULUS = 3072

export interface CryptoPaths {
  dir: string
  publicKey: string
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

type KeychainBackend = 'macos' | 'linux' | 'none'

function keychainBackend(): KeychainBackend {
  if (process.platform === 'darwin')
    return 'macos'
  if (process.platform === 'linux')
    return 'linux'
  return 'none'
}

const KEYCHAIN_TIMEOUT_MS = 3000

export function canUseKeychain(): boolean {
  if (process.env.CHANDAO_CLI_NO_KEYCHAIN === '1')
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

/**
 * macOS `security find-generic-password -w` 对含换行的密码会输出 **hex 字符串**，
 * 而不是原始 PEM；这里统一还原。Linux secret-tool 一般返回原文，原样返回即可。
 */
export function decodeKeychainSecret(value: string | null | undefined): string | null {
  if (!value)
    return null
  const raw = value.trim()
  if (!raw)
    return null
  if (raw.includes('-----BEGIN'))
    return raw
  if (HEX_RE.test(raw) && raw.length % 2 === 0) {
    const decoded = Buffer.from(raw, 'hex').toString('utf-8')
    if (decoded.includes('-----BEGIN'))
      return decoded
  }
  return raw
}

export function readPrivateKeyFromKeychain(): string | null {
  // 读取不依赖交互终端：security/secret-tool 读取已创建的条目通常不需要授权弹窗；
  // 需要禁用时用 CHANDAO_CLI_NO_KEYCHAIN=1（写入仍受 TTY 门控）。
  if (process.env.CHANDAO_CLI_NO_KEYCHAIN === '1')
    return null
  const backend = keychainBackend()
  try {
    if (backend === 'macos') {
      const out = execFileSync(
        'security',
        ['find-generic-password', '-s', KEYCHAIN_SERVICE, '-a', 'private-key', '-w'],
        { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'], timeout: KEYCHAIN_TIMEOUT_MS },
      )
      return decodeKeychainSecret(out)
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

export function writePrivateKeyToKeychain(pem: string): boolean {
  if (!canUseKeychain())
    return false
  const backend = keychainBackend()
  try {
    if (backend === 'macos') {
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

/** 比较公钥与私钥是否成对（都用 SPKI DER 比较）。 */
function keyPairMatches(publicKeyPem: string, privateKeyPem: string): boolean {
  try {
    const publicDer = createPublicKey(publicKeyPem).export({ type: 'spki', format: 'der' })
    const derivedDer = createPublicKey(createPrivateKey(privateKeyPem)).export({ type: 'spki', format: 'der' })
    return Buffer.compare(publicDer, derivedDer) === 0
  }
  catch {
    return false
  }
}

export interface EnsureKeysResult {
  paths: CryptoPaths
  created: boolean
  privateKeyStorage: 'keychain' | 'file'
}

export function ensureKeys(dir: string): EnsureKeysResult {
  const paths = defaultCryptoPaths(dir)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true, mode: 0o700 })
  }

  const existingPublic = readPublicKeyPem(paths)
  const existingPrivate = readPrivateKeyPem(paths)
  if (existingPublic && existingPrivate) {
    if (keyPairMatches(existingPublic, existingPrivate))
      return { paths, created: false, privateKeyStorage: keyStorage(paths) }
    // 公私钥不匹配时自动重建，避免“换账号后永远解密失败”
  }
  if (existingPublic && !existingPrivate) {
    throw new Error(
      '检测到 public.pem 但无法读取私钥（钥匙串可能需要交互终端）。'
      + '为避免覆盖公钥导致已有加密配置无法解密，请在有交互终端的环境重试；'
      + '若确认要重建密钥，请删除 ~/.chandao/public.pem 后重新 auth login。',
    )
  }

  const pair = generateKeyPair()
  writeFileSync(paths.publicKey, pair.publicKeyPem, { encoding: 'utf-8', mode: 0o644 })

  const inKeychain = writePrivateKeyToKeychain(pair.privateKeyPem)
  if (!inKeychain) {
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
    : 384

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
