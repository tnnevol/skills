import { Buffer } from 'node:buffer'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { decryptSecret, ENC_PREFIX, encryptSecret, generateKeyPair, isEncrypted } from '../crypto.js'

function tempDir(): string {
  return mkdtempSync(join(tmpdir(), 'olcrypto-'))
}

describe('加解密', () => {
  const { publicKeyPem, privateKeyPem } = generateKeyPair()

  it('加密后可解密还原', () => {
    const plain = 'token-abcdefghijklmnop'
    const enc = encryptSecret(plain, publicKeyPem)
    expect(enc.startsWith(ENC_PREFIX)).toBe(true)
    expect(decryptSecret(enc, privateKeyPem)).toBe(plain)
  })

  it('同一明文两次加密结果不同（随机 DEK + IV）', () => {
    const a = encryptSecret('same', publicKeyPem)
    const b = encryptSecret('same', publicKeyPem)
    expect(a).not.toBe(b)
    expect(decryptSecret(a, privateKeyPem)).toBe('same')
    expect(decryptSecret(b, privateKeyPem)).toBe('same')
  })

  it('超长 Token 也能加密（混合加密不受 RSA 长度限制）', () => {
    const long = `tok_${'x'.repeat(2000)}`
    const enc = encryptSecret(long, publicKeyPem)
    expect(decryptSecret(enc, privateKeyPem)).toBe(long)
  })

  it('中文与特殊字符保持原样', () => {
    const plain = '令牌-中文-!@#$%^&*()_+'
    expect(decryptSecret(encryptSecret(plain, publicKeyPem), privateKeyPem)).toBe(plain)
  })

  it('私钥不匹配时解密失败而不是返回垃圾', () => {
    const other = generateKeyPair()
    const enc = encryptSecret('secret', publicKeyPem)
    expect(() => decryptSecret(enc, other.privateKeyPem)).toThrow()
  })

  it('密文被篡改时 GCM 校验失败', () => {
    const enc = encryptSecret('secret', publicKeyPem)
    const raw = Buffer.from(enc.slice(ENC_PREFIX.length), 'base64')
    raw[raw.length - 1] ^= 0xFF
    const tampered = ENC_PREFIX + raw.toString('base64')
    expect(() => decryptSecret(tampered, privateKeyPem)).toThrow()
  })

  it('非密文字符串识别为未加密', () => {
    expect(isEncrypted('plain-token')).toBe(false)
    expect(isEncrypted(undefined)).toBe(false)
    expect(isEncrypted(`${ENC_PREFIX}abc`)).toBe(true)
  })

  it('解密非密文格式直接报错', () => {
    expect(() => decryptSecret('plain', privateKeyPem)).toThrow(/密文格式/)
  })
})

describe('配置文件落盘', () => {
  it('saveConfig 只加密凭证字段，其余保持明文', async () => {
    const { saveConfig } = await import('../config.js')
    const dir = tempDir()
    // 用临时目录接管 HOME，避免污染真实 ~/.openlist
    const prevHome = process.env.HOME
    process.env.HOME = dir
    try {
      saveConfig({ baseUrl: 'https://demo.invalid', token: 'my-secret-token' })
      const raw = JSON.parse(readFileSync(join(dir, '.openlist', 'config.json'), 'utf-8'))
      expect(raw.baseUrl).toBe('https://demo.invalid')
      expect(isEncrypted(raw.token)).toBe(true)
      expect(raw.token).not.toContain('my-secret-token')
    }
    finally {
      process.env.HOME = prevHome
    }
  })
})
