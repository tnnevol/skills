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

function hasInteractiveTerminal(): boolean {
  return stdin.isTTY === true && stderr.isTTY === true
}

async function promptText(label: string, defaultValue?: string): Promise<string> {
  const readline = createInterface({
    input: stdin,
    output: stderr,
    terminal: true,
  })

  try {
    const suffix = defaultValue ? ` [${defaultValue}]` : ''
    const answer = await readline.question(`${label}${suffix}: `)
    return answer.trim() || defaultValue || ''
  }
  finally {
    readline.close()
  }
}

function promptSecret(label: string): Promise<string> {
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
      stderr.write('\n')
      if (error) {
        reject(error)
      }
      else {
        resolve(value.trim())
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

    stderr.write(`${label}: `)
    stdin.setEncoding('utf8')
    stdin.setRawMode(true)
    stdin.resume()
    stdin.on('data', onData)
  })
}

async function resolveLoginOptions(
  options: LoginOptions,
): Promise<{ baseUrl: string, token: string }> {
  let baseUrl = options.baseUrl?.trim() || env.OPENLIST_BASE_URL || ''
  let token = options.token?.trim() || env.OPENLIST_TOKEN || ''

  if (baseUrl && token && !options.interactive) {
    return { baseUrl, token }
  }

  if (!hasInteractiveTerminal()) {
    throw new Error(
      '缺少登录参数。交互式登录需要真实终端，请提供 --base-url 和 --token，或使用 OPENLIST_BASE_URL 和 OPENLIST_TOKEN。',
    )
  }

  if (!baseUrl) {
    baseUrl = await promptText('OpenList 服务地址', loadConfig()?.baseUrl)
  }
  if (!token) {
    token = await promptSecret('API Token（输入时不显示）')
  }

  if (!baseUrl || !token) {
    throw new Error('服务地址和 API Token 不能为空')
  }

  return { baseUrl, token }
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
        const credentials = await resolveLoginOptions(opts)
        const client = createClient(credentials)
        const response = await client.get('/api/me')
        if (response.code !== 200) {
          printError(response.message || 'API Token 无效', response.code)
          return
        }

        saveConfig(credentials)
        printSuccess({ baseUrl: credentials.baseUrl }, 'login')
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
