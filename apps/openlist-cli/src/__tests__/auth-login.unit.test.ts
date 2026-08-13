import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveLoginOptions } from '../commands/auth.js'

const loadConfigMock = vi.hoisted(() => vi.fn())

vi.mock('../config.js', () => ({
  clearConfig: vi.fn(),
  loadConfig: loadConfigMock,
  saveConfig: vi.fn(),
}))

describe('auth login 交互逻辑', () => {
  const originalBaseUrl = process.env.OPENLIST_BASE_URL
  const originalToken = process.env.OPENLIST_TOKEN

  beforeAll(() => {
    process.env.OPENLIST_BASE_URL = ''
    process.env.OPENLIST_TOKEN = ''
  })

  beforeEach(() => {
    loadConfigMock.mockReset()
    loadConfigMock.mockReturnValue(null)
  })

  afterAll(() => {
    if (originalBaseUrl === undefined) {
      delete process.env.OPENLIST_BASE_URL
    }
    else {
      process.env.OPENLIST_BASE_URL = originalBaseUrl
    }
    if (originalToken === undefined) {
      delete process.env.OPENLIST_TOKEN
    }
    else {
      process.env.OPENLIST_TOKEN = originalToken
    }
  })

  it('不允许匿名访问且 Token 为空时返回授权接口真实错误', async () => {
    const promptText = vi.fn(async () => 'https://openlist.example.com')
    const promptConfirm = vi.fn(async () => false)
    const promptSecret = vi.fn(async () => '')
    const validateToken = vi.fn(async ({ token }: { token?: string }) => ({
      valid: false,
      message: token ? 'token is invalidated' : 'token is required',
      code: 401,
    }))

    const promise = resolveLoginOptions(
      { baseUrl: 'https://openlist.example.com' },
      validateToken,
      { isInteractive: true, promptText, promptConfirm, promptSecret },
    )

    await expect(promise).rejects.toMatchObject({
      message: 'token is required',
      code: 401,
    })
    expect(promptSecret).toHaveBeenCalledTimes(1)
    expect(validateToken).toHaveBeenCalledTimes(1)
    expect(validateToken).toHaveBeenCalledWith({
      baseUrl: 'https://openlist.example.com',
      token: undefined,
    })
  })

  it('令牌校验失败后重新填写并再次校验', async () => {
    const promptText = vi.fn(async () => 'https://openlist.example.com')
    const promptConfirm = vi.fn(async () => false)
    const promptSecret = vi
      .fn(async () => 'invalid-token')
      .mockResolvedValueOnce('invalid-token')
      .mockResolvedValueOnce('valid-token')
    const validateToken = vi
      .fn(async ({ token }: { token?: string }) => ({ valid: token === 'valid-token' }))

    const result = await resolveLoginOptions(
      { baseUrl: 'https://openlist.example.com' },
      validateToken,
      { isInteractive: true, promptText, promptConfirm, promptSecret },
    )

    expect(result.token).toBe('valid-token')
    expect(promptSecret).toHaveBeenCalledTimes(2)
    expect(validateToken).toHaveBeenCalledTimes(2)
  })

  it('服务地址变化时不复用配置中的旧 Token', async () => {
    loadConfigMock.mockReturnValue({
      baseUrl: 'https://old-openlist.example.com',
      token: 'old-token',
    })
    const promptText = vi.fn(async () => 'https://new-openlist.example.com')
    const promptConfirm = vi.fn(async () => false)
    const promptSecret = vi.fn(async () => 'new-token')
    const validateToken = vi.fn(async () => ({ valid: true }))

    const result = await resolveLoginOptions(
      {},
      validateToken,
      { isInteractive: true, promptText, promptConfirm, promptSecret },
    )

    expect(result).toEqual({
      baseUrl: 'https://new-openlist.example.com',
      token: 'new-token',
    })
    expect(promptSecret).toHaveBeenCalledWith('API Token（输入时不显示）', undefined)
  })

  it('允许匿名访问时跳过 Token 输入和校验', async () => {
    const promptText = vi.fn(async () => 'https://public-openlist.example.com')
    const promptConfirm = vi.fn(async () => true)
    const promptSecret = vi.fn(async () => 'should-not-be-used')
    const validateToken = vi.fn(async () => ({ valid: false }))

    const result = await resolveLoginOptions(
      { baseUrl: 'https://public-openlist.example.com' },
      validateToken,
      { isInteractive: true, promptText, promptConfirm, promptSecret },
    )

    expect(result).toEqual({ baseUrl: 'https://public-openlist.example.com' })
    expect(promptSecret).not.toHaveBeenCalled()
    expect(validateToken).not.toHaveBeenCalled()
  })
})
