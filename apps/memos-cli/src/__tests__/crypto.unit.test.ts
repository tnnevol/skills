import { Buffer } from 'node:buffer'
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { decryptSecret, ENC_PREFIX, encryptSecret, generateKeyPair, isEncrypted } from '../crypto.js'

function tempDir(): string {
  return mkdtempSync(join(tmpdir(), 'memoscrypto-'))
}

describe('加解密', () => {
  const { publicKeyPem, privateKeyPem } = generateKeyPair()

  it('加密后可解密还原', () => {
    const plain = 'memo-token-abcdefgh'
    const enc = encryptSecret(plain, publicKeyPem)
    expect(enc.startsWith(ENC_PREFIX)).toBe(true)
    expect(decryptSecret(enc, privateKeyPem)).toBe(plain)
  })

  it('同一明文两次加密结果不同', () => {
    const a = encryptSecret('same', publicKeyPem)
    const b = encryptSecret('same', publicKeyPem)
    expect(a).not.toBe(b)
    expect(decryptSecret(a, privateKeyPem)).toBe('same')
  })

  it('超长 Token 也能加密', () => {
    const long = `tok_${'y'.repeat(2000)}`
    expect(decryptSecret(encryptSecret(long, publicKeyPem), privateKeyPem)).toBe(long)
  })

  it('中文与特殊字符保持原样', () => {
    const plain = '令牌-中文-!@#$%^&*()'
    expect(decryptSecret(encryptSecret(plain, publicKeyPem), privateKeyPem)).toBe(plain)
  })

  it('私钥不匹配时解密失败', () => {
    const other = generateKeyPair()
    expect(() => decryptSecret(encryptSecret('s', publicKeyPem), other.privateKeyPem)).toThrow()
  })

  it('密文被篡改时 GCM 校验失败', () => {
    const enc = encryptSecret('secret', publicKeyPem)
    const raw = Buffer.from(enc.slice(ENC_PREFIX.length), 'base64')
    raw[raw.length - 1] ^= 0xFF
    expect(() => decryptSecret(ENC_PREFIX + raw.toString('base64'), privateKeyPem)).toThrow()
  })

  it('非密文识别为未加密', () => {
    expect(isEncrypted('plain')).toBe(false)
    expect(isEncrypted(undefined)).toBe(false)
    expect(isEncrypted(`${ENC_PREFIX}x`)).toBe(true)
  })
})

describe('配置文件落盘', () => {
  it('saveConfig 只加密 token，baseUrl 与 apiPath 保持明文', async () => {
    const { saveConfig } = await import('../config.js')
    const dir = tempDir()
    const prevHome = process.env.HOME
    process.env.HOME = dir
    try {
      saveConfig({ baseUrl: 'https://demo.invalid', token: 'my-secret-token', apiPath: '/api' })
      const raw = JSON.parse(readFileSync(join(dir, '.memos', 'config.json'), 'utf-8'))
      expect(raw.baseUrl).toBe('https://demo.invalid')
      expect(raw.apiPath).toBe('/api')
      expect(isEncrypted(raw.token)).toBe(true)
      expect(raw.token).not.toContain('my-secret-token')
      expect(existsSync(join(dir, '.memos', 'public.pem'))).toBe(true)
    }
    finally {
      process.env.HOME = prevHome
    }
  })
})
