import type { Command } from 'commander'
import type { Buffer } from 'node:buffer'
import type { MemosConfig } from '../config.js'
import { env, stderr, stdin } from 'node:process'
import { createInterface } from 'node:readline/promises'
import { createClient } from '../client.js'
import { clearConfig, loadConfig, normalizeApiPath, resolveConfig, saveConfig } from '../config.js'
import { printError, printSuccess } from '../output.js'

interface LoginOptions {
  baseUrl?: string
  token?: string
  apiPath?: string
}

const TRAILING_SLASHES = /\/+$/

class LoginValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LoginValidationError'
  }
}

function hasInteractiveTerminal(): boolean {
  return stdin.isTTY === true && stderr.isTTY === true
}

async function promptText(
  label: string,
  defaultValue: string | undefined,
  validate: (value: string) => boolean,
  errorMessage: string,
): Promise<string> {
  while (true) {
    const readline = createInterface({ input: stdin, output: stderr, terminal: true })
    try {
      const suffix = defaultValue ? ` [${defaultValue}]` : ''
      const answer = await readline.question(`${label}${suffix}: `)
      const value = answer.trim() || defaultValue || ''
      if (validate(value)) {
        return value
      }
      stderr.write(`${errorMessage}\n`)
    }
    finally {
      readline.close()
    }
  }
}

function promptSecret(label: string, defaultValue?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let value = ''
    let settled = false
    const previousRawMode = stdin.isRaw ?? false
    let onData: (chunk: Buffer | string) => void

    const cleanup = (error?: Error): void => {
      if (settled) {
        return
      }
      settled = true
      stdin.off('data', onData)
      if (stdin.isTTY) {
        stdin.setRawMode(previousRawMode)
      }
      stdin.pause()
      stderr.write('\n')
      if (error) {
        reject(error)
      }
      else {
        resolve(value.trim() || defaultValue || '')
      }
    }

    onData = (chunk: Buffer | string): void => {
      for (const character of chunk.toString()) {
        if (character === '\u0003' || character === '\u0004') {
          cleanup(new Error('已取消登录'))
          return
        }
        if (character === '\r' || character === '\n') {
          cleanup()
          return
        }
        if (character === '\u007F' || character === '\b') {
          value = value.slice(0, -1)
          continue
        }
        value += character
      }
    }

    const suffix = defaultValue ? ' [已配置]' : ''
    stderr.write(`${label}${suffix}: `)
    stdin.setEncoding('utf8')
    stdin.setRawMode(true)
    stdin.resume()
    stdin.on('data', onData)
  })
}

function isValidBaseUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname)
  }
  catch {
    return false
  }
}

/** 用 /auth/me 校验地址与令牌是否可用。 */
async function validateCredentials(config: MemosConfig): Promise<{ valid: boolean, message?: string, httpStatus?: number }> {
  try {
    const me = await createClient(config).get<{ user?: { username?: string } }>('/auth/me')
    if (me?.user?.username) {
      return { valid: true }
    }
    return { valid: false, message: '令牌无效：/auth/me 未返回用户信息' }
  }
  catch (error) {
    const message = error instanceof Error ? error.message : '令牌校验失败'
    return { valid: false, message }
  }
}

export function registerAuthCommand(program: Command): void {
  const auth = program.command('auth').description('登录、退出登录、查看当前账号')

  auth
    .command('login')
    .description('登录 Memos 并保存配置')
    .option('--base-url <url>', 'Memos 服务地址（如 https://memos.example.com）')
    .option('--token <token>', '访问令牌（在 Memos 设置 → Access tokens 生成）')
    .option('--api-path <path>', 'API 路径前缀，默认 /api/v1（v0.32+ 用 /api）')
    .action(async (_options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as LoginOptions
      const fileConfig = loadConfig()
      const configuredBaseUrl = fileConfig?.baseUrl?.trim() || ''
      let baseUrl = (opts.baseUrl || env.MEMOS_BASE_URL || configuredBaseUrl).trim().replace(TRAILING_SLASHES, '')
      let token = opts.token || env.MEMOS_ACCESS_TOKEN || fileConfig?.token || ''
      const apiPath = normalizeApiPath(opts.apiPath || env.MEMOS_API_PATH || fileConfig?.apiPath)

      try {
        if (!hasInteractiveTerminal()) {
          if (!baseUrl) {
            throw new Error('缺少登录参数。非交互模式至少需要提供 --base-url 或 MEMOS_BASE_URL。')
          }
          if (!token) {
            throw new Error('缺少访问令牌。非交互模式需要提供 --token 或 MEMOS_ACCESS_TOKEN。')
          }
          const check = await validateCredentials({ baseUrl, token, apiPath })
          if (!check.valid) {
            throw new LoginValidationError(check.message || '访问令牌无效')
          }
          saveConfig({ baseUrl, token, apiPath })
          printSuccess({ baseUrl, apiPath, verified: true }, 'auth.login')
          return
        }

        baseUrl = await promptText(
          'Memos 服务地址',
          baseUrl,
          isValidBaseUrl,
          '服务地址格式无效，请输入完整的 http:// 或 https:// 地址。',
        )

        // 地址变更时丢弃配置文件里的旧令牌，避免拿错令牌去校验
        if (configuredBaseUrl && baseUrl !== configuredBaseUrl) {
          token = opts.token || env.MEMOS_ACCESS_TOKEN || ''
        }

        let tokenDefault = token || undefined
        while (true) {
          token = (await promptSecret('访问令牌（输入时不显示）', tokenDefault)).trim()
          if (!token) {
            stderr.write('访问令牌不能为空。\n')
            continue
          }

          const check = await validateCredentials({ baseUrl, token, apiPath })
          if (check.valid) {
            break
          }
          stderr.write(`${check.message || '访问令牌无效'}，请重新输入。\n`)
          tokenDefault = undefined
        }

        saveConfig({ baseUrl, token, apiPath })
        printSuccess({ baseUrl, apiPath, verified: true }, 'auth.login')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '登录失败')
      }
    })

  auth
    .command('logout')
    .description('退出登录并清除本地配置')
    .action(() => {
      clearConfig()
      printSuccess(null, 'auth.logout')
    })

  auth
    .command('status')
    .description('查看当前登录状态')
    .action(async () => {
      const fileConfig = loadConfig()
      const config = resolveConfig({})
      try {
        const me = await createClient(config).get<{ user?: { username?: string, displayName?: string, role?: string } }>('/auth/me')
        printSuccess(
          {
            loggedIn: true,
            source: fileConfig ? 'config' : 'env',
            baseUrl: config.baseUrl,
            apiPath: config.apiPath,
            user: me?.user ?? null,
          },
          'auth.status',
        )
      }
      catch (error) {
        printSuccess(
          {
            loggedIn: false,
            baseUrl: config.baseUrl,
            apiPath: config.apiPath,
            error: error instanceof Error ? error.message : '校验失败',
          },
          'auth.status',
        )
      }
    })
}
