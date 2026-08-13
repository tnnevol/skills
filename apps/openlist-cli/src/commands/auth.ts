import type { Command } from 'commander'
import type { Buffer } from 'node:buffer'
import { env, stderr, stdin } from 'node:process'
import { createInterface } from 'node:readline/promises'
import { createClient } from '../client.js'
import { clearConfig, loadConfig, saveConfig } from '../config.js'
import { printError, printSuccess } from '../output.js'

interface LoginOptions {
  baseUrl?: string
  token?: string
  interactive?: boolean
}

interface LoginCredentials {
  baseUrl: string
  token?: string
}

const TRAILING_SLASHES = /\/+$/

type TokenValidator = (credentials: LoginCredentials) => Promise<{
  valid: boolean
  message?: string
  code?: number
}>

class LoginValidationError extends Error {
  constructor(
    message: string,
    readonly code?: number,
  ) {
    super(message)
    this.name = 'LoginValidationError'
  }
}

export interface LoginPromptDependencies {
  isInteractive?: boolean
  promptText?: typeof promptText
  promptConfirm?: typeof promptConfirm
  promptSecret?: typeof promptSecret
}

function hasInteractiveTerminal(): boolean {
  return stdin.isTTY === true && stderr.isTTY === true
}

async function promptConfirm(label: string): Promise<boolean> {
  while (true) {
    const readline = createInterface({
      input: stdin,
      output: stderr,
      terminal: true,
    })

    try {
      const answer = await readline.question(`${label} [y/N]: `)
      const normalized = answer.trim().toLowerCase()
      if (!normalized) {
        return false
      }
      if (normalized === 'y') {
        return true
      }
      if (normalized === 'n') {
        return false
      }
      stderr.write('请输入 y 或 n。\n')
    }
    finally {
      readline.close()
    }
  }
}

async function promptText(
  label: string,
  defaultValue: string | undefined,
  validate: (value: string) => boolean,
  errorMessage: string,
): Promise<string> {
  while (true) {
    const readline = createInterface({
      input: stdin,
      output: stderr,
      terminal: true,
    })

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

function promptSecretOnce(label: string, defaultValue?: string): Promise<string> {
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

async function promptSecret(label: string, defaultValue?: string): Promise<string> {
  return promptSecretOnce(label, defaultValue)
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

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(TRAILING_SLASHES, '').toLowerCase()
}

export async function resolveLoginOptions(
  options: LoginOptions,
  validateToken?: TokenValidator,
  dependencies: LoginPromptDependencies = {},
): Promise<LoginCredentials> {
  const fileConfig = loadConfig()
  const configuredBaseUrl = fileConfig?.baseUrl?.trim() || ''
  const configuredToken = fileConfig?.token?.trim() || ''
  let baseUrl = options.baseUrl?.trim() || env.OPENLIST_BASE_URL || configuredBaseUrl
  let token = options.token?.trim() || env.OPENLIST_TOKEN || configuredToken
  const tokenFromConfig = !options.token?.trim() && !env.OPENLIST_TOKEN?.trim() && Boolean(configuredToken)

  const clearStaleConfiguredToken = (): void => {
    if (
      tokenFromConfig
      && configuredBaseUrl
      && normalizeBaseUrl(baseUrl) !== normalizeBaseUrl(configuredBaseUrl)
    ) {
      token = undefined
    }
  }

  clearStaleConfiguredToken()

  const interactive = dependencies.isInteractive ?? hasInteractiveTerminal()
  const askText = dependencies.promptText ?? promptText
  const askConfirm = dependencies.promptConfirm ?? promptConfirm
  const askSecret = dependencies.promptSecret ?? promptSecret

  if (!interactive) {
    if (!baseUrl) {
      throw new Error('缺少登录参数。非交互模式至少需要提供 --base-url 或 OPENLIST_BASE_URL。')
    }
    return { baseUrl, token: token || undefined }
  }

  baseUrl = await askText(
    'OpenList 服务地址',
    baseUrl,
    isValidBaseUrl,
    '服务地址格式无效，请输入完整的 http:// 或 https:// 地址。',
  )

  clearStaleConfiguredToken()

  const allowAnonymous = await askConfirm('服务是否允许无 Token 访问')
  if (allowAnonymous) {
    return { baseUrl }
  }

  let tokenDefault = token
  while (true) {
    token = (await askSecret('API Token（输入时不显示）', tokenDefault)).trim() || undefined
    const credentials = { baseUrl, token }
    if (!validateToken) {
      return credentials
    }

    const result = await validateToken(credentials)
    if (result.valid) {
      return credentials
    }

    if (!token) {
      throw new LoginValidationError(
        result.message || 'API Token 无效',
        result.code,
      )
    }

    stderr.write(`${result.message || 'API Token 无效'}，请重新输入。\n`)
    tokenDefault = undefined
  }
}

export function registerAuthCommand(program: Command): void {
  const auth = program
    .command('auth')
    .description('登录、退出登录、查看当前账号')

  auth
    .command('login')
    .description('登录 OpenList 并保存配置')
    .option('--base-url <url>', 'OpenList 服务地址')
    .option('--token <token>', 'API Token')
    .option('-i, --interactive', '使用终端交互式补充缺少的登录信息')
    .action(async (_options: LoginOptions, cmd: Command) => {
      // --base-url / --token 与全局选项同名，需通过 optsWithGlobals 读取
      const opts = cmd.optsWithGlobals() as LoginOptions
      try {
        const interactive = hasInteractiveTerminal()
        const credentials = await resolveLoginOptions(
          opts,
          interactive
            ? async (loginCredentials) => {
              const response = await createClient(loginCredentials).get('/api/me')
              return {
                valid: response.code === 200,
                message: response.message || 'API Token 无效',
                code: response.code,
              }
            }
            : undefined,
        )
        if (!interactive && credentials.token) {
          const response = await createClient(credentials).get('/api/me')
          if (response.code !== 200) {
            printError(response.message || 'API Token 无效', response.code)
            return
          }
        }

        saveConfig(credentials)
        printSuccess({ baseUrl: credentials.baseUrl }, 'login')
      }
      catch (error) {
        if (error instanceof LoginValidationError) {
          printError(error.message, error.code)
          return
        }
        printError(error instanceof Error ? error.message : '登录失败')
      }
    })

  auth
    .command('logout')
    .description('退出登录并清除本地配置')
    .action(() => {
      clearConfig()
      printSuccess(null, 'logout')
    })

  auth
    .command('status')
    .description('查看当前登录状态')
    .action(async () => {
      try {
        const config = loadConfig()
        if (!config) {
          printError('未登录，请先运行 `openlist-cli auth login`')
          return
        }

        const client = createClient(config)
        const response = await client.get('/api/me')

        if (response.code === 200) {
          printSuccess(
            {
              loggedIn: true,
              baseUrl: config.baseUrl,
              user: response.data,
            },
            'status',
          )
        }
        else {
          printSuccess(
            {
              loggedIn: false,
              baseUrl: config.baseUrl,
              error: response.message,
            },
            'status',
          )
        }
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '获取状态失败')
      }
    })
}
