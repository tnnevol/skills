import { beforeAll, describe, expect, it } from 'vitest'
import { requireEnv, runCli } from './helpers.js'

describe('me 命令', () => {
  beforeAll(() => {
    requireEnv('MEMOS_BASE_URL')
    requireEnv('MEMOS_ACCESS_TOKEN')
  })

  it('me get 返回当前用户', () => {
    const r = runCli(['me', 'get'])
    expect(r.code).toBe(0)
    expect(r.json.success).toBe(true)
    expect(r.json.operation).toBe('me.get')
    expect(typeof r.json.data.user.username).toBe('string')
    expect(r.json.data.user.name).toBe(`users/${r.json.data.user.username}`)
  })

  it('me instance 返回实例版本与访问模式', () => {
    const r = runCli(['me', 'instance'])
    expect(r.code).toBe(0)
    expect(r.json.success).toBe(true)
    expect(r.json.operation).toBe('me.instance')
    expect(typeof r.json.data.version).toBe('string')
    expect(r.json.data).toHaveProperty('accessMode')
  })

  it('me stats 返回统计信息', () => {
    const r = runCli(['me', 'stats'])
    expect(r.code).toBe(0)
    expect(r.json.success).toBe(true)
    expect(r.json.operation).toBe('me.stats')
    expect(r.json.data.name).toMatch(/\/stats$/)
  })

  it('auth status 在已配置凭据时报告已登录', () => {
    const r = runCli(['auth', 'status'])
    expect(r.code).toBe(0)
    expect(r.json.success).toBe(true)
    expect(r.json.operation).toBe('auth.status')
    expect(r.json.data.loggedIn).toBe(true)
    expect(r.json.data.baseUrl).toBe(requireEnv('MEMOS_BASE_URL'))
  })
})
