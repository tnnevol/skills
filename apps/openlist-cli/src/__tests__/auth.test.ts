import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { requireEnv, runCli } from './helpers.js'

// auth login / status 使用配置文件（~/.openlist/config.json）。
// 为避免污染真实用户配置，测试期间将 HOME 指向 workspace 内的临时目录。
const currentDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(currentDir, '../..')

describe('auth 命令', () => {
  let tmpHome: string
  let env: Record<string, string>
  let baseUrl: string
  let token: string

  beforeAll(() => {
    baseUrl = requireEnv('OPENLIST_BASE_URL')
    token = requireEnv('OPENLIST_TOKEN')
    tmpHome = mkdtempSync(join(projectRoot, '.tmp-home-'))
    // 覆盖 HOME 使配置写入隔离目录；清空 env 中的 base-url/token 以走配置文件路径
    env = { HOME: tmpHome, OPENLIST_BASE_URL: '', OPENLIST_TOKEN: '' }
  })

  afterAll(() => {
    if (tmpHome && existsSync(tmpHome)) {
      rmSync(tmpHome, { recursive: true, force: true })
    }
  })

  it('未登录时 status 返回未登录', () => {
    const r = runCli(['auth', 'status'], env)
    expect(r.json).toBeDefined()
    expect(r.json.success).toBe(false)
    expect(r.json.message).toContain('未登录')
  })

  it('错误 Token 登录失败且不会写入配置', () => {
    const r = runCli(
      ['auth', 'login', '--base-url', baseUrl, '--token', 'invalid-token'],
      env,
    )
    expect(r.code).not.toBe(0)
    expect(r.json.success).toBe(false)
    expect(r.json.message).toMatch(/invalid|无效|失效/i)

    const cfgPath = join(tmpHome, '.openlist', 'config.json')
    expect(existsSync(cfgPath)).toBe(false)
  })

  it('参数模式允许省略 Token 且不执行令牌校验', () => {
    const publicBaseUrl = 'https://public-openlist.example.invalid'
    const r = runCli(['auth', 'login', '--base-url', publicBaseUrl], env)
    expect(r.code).toBe(0)
    expect(r.json.success).toBe(true)

    const cfgPath = join(tmpHome, '.openlist', 'config.json')
    const cfg = JSON.parse(readFileSync(cfgPath, 'utf-8'))
    expect(cfg.baseUrl).toBe(publicBaseUrl)
    expect(cfg.token).toBeUndefined()
  })

  it('login 保存配置并回显 baseUrl', () => {
    const r = runCli(
      ['auth', 'login', '--base-url', baseUrl, '--token', token],
      env,
    )
    expect(r.code).toBe(0)
    expect(r.json.success).toBe(true)
    expect(r.json.operation).toBe('login')
    expect(r.json.data.baseUrl).toBe(baseUrl)

    // 配置确实写入隔离 HOME
    const cfgPath = join(tmpHome, '.openlist', 'config.json')
    expect(existsSync(cfgPath)).toBe(true)
    const cfg = JSON.parse(readFileSync(cfgPath, 'utf-8'))
    expect(cfg.baseUrl).toBe(baseUrl)
    expect(cfg.token).toBe(token)
  })

  it('login 后 status 返回真实用户信息', () => {
    const r = runCli(['auth', 'status'], env)
    expect(r.json.success).toBe(true)
    expect(r.json.operation).toBe('status')
    expect(r.json.data.loggedIn).toBe(true)
    expect(r.json.data.baseUrl).toBe(baseUrl)
    expect(r.json.data.user).toBeDefined()
    expect(typeof r.json.data.user.username).toBe('string')
  })

  it('缺少 --base-url/--token 时 login 报错', () => {
    const r = runCli(['auth', 'login'], env)
    expect(r.json.success).toBe(false)
  })

  it('logout 清除配置', () => {
    const r = runCli(['auth', 'logout'], env)
    expect(r.json.success).toBe(true)
    expect(r.json.operation).toBe('logout')

    const cfgPath = join(tmpHome, '.openlist', 'config.json')
    expect(existsSync(cfgPath)).toBe(false)
  })

  it('logout 后 status 恢复未登录', () => {
    const r = runCli(['auth', 'status'], env)
    expect(r.json.success).toBe(false)
    expect(r.json.message).toContain('未登录')
  })
})
