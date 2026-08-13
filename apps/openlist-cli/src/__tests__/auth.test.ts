import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
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

  function configPath(): string {
    return join(tmpHome, '.openlist', 'config.json')
  }

  function writeTestConfig(config: {
    baseUrl: string
    token?: string
  }): void {
    mkdirSync(join(tmpHome, '.openlist'), { recursive: true })
    writeFileSync(configPath(), JSON.stringify(config), 'utf-8')
  }

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

  it('非交互模式缺少服务地址时登录失败', () => {
    const r = runCli(['auth', 'login'], env)
    expect(r.code).not.toBe(0)
    expect(r.json.success).toBe(false)
    expect(r.json.message).toContain('--base-url')
    expect(existsSync(configPath())).toBe(false)
  })

  it('错误 Token 登录失败且不会写入配置', () => {
    const r = runCli(
      ['auth', 'login', '--base-url', baseUrl, '--token', 'invalid-token'],
      env,
    )
    expect(r.code).not.toBe(0)
    expect(r.json.success).toBe(false)
    expect(r.json.message).toMatch(/invalid|无效|失效/i)

    expect(existsSync(configPath())).toBe(false)
  })

  it('配置地址变更时清除配置中的旧 Token', () => {
    const oldBaseUrl = 'https://old-openlist.example.invalid'
    const newBaseUrl = 'https://new-openlist.example.invalid'
    writeTestConfig({ baseUrl: oldBaseUrl, token: 'old-token' })

    const r = runCli(['auth', 'login', '--base-url', newBaseUrl], env)
    expect(r.code).toBe(0)
    expect(r.json.success).toBe(true)

    const cfg = JSON.parse(readFileSync(configPath(), 'utf-8'))
    expect(cfg.baseUrl).toBe(newBaseUrl)
    expect(cfg.token).toBeUndefined()
  })

  it('参数模式允许省略 Token 且不执行令牌校验', () => {
    const publicBaseUrl = 'https://public-openlist.example.invalid'
    const r = runCli(['auth', 'login', '--base-url', publicBaseUrl], env)
    expect(r.code).toBe(0)
    expect(r.json.success).toBe(true)

    const cfg = JSON.parse(readFileSync(configPath(), 'utf-8'))
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
    expect(existsSync(configPath())).toBe(true)
    const cfg = JSON.parse(readFileSync(configPath(), 'utf-8'))
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

  it('logout 清除配置', () => {
    const r = runCli(['auth', 'logout'], env)
    expect(r.json.success).toBe(true)
    expect(r.json.operation).toBe('logout')

    expect(existsSync(configPath())).toBe(false)
  })

  it('logout 后 status 恢复未登录', () => {
    const r = runCli(['auth', 'status'], env)
    expect(r.json.success).toBe(false)
    expect(r.json.message).toContain('未登录')
  })
})
