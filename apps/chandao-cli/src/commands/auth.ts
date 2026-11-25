import type { Command } from 'commander'
import type { Buffer } from 'node:buffer'
import type { ChandaoError } from '../client.js'
import type { ApiVersionPreference } from '../config.js'
import { env, stderr, stdin } from 'node:process'
import { createInterface } from 'node:readline/promises'
import { ChandaoClient } from '../client.js'
import {
  clearConfig,
  isValidBaseUrl,
  loadConfig,
  maskToken,
  normalizeApiVersion,
  normalizeBaseUrl,
  resolveConfig,
  saveConfig,
} from '../config.js'
import { printError, printSuccess } from '../output.js'

interface LoginOptions {
  baseUrl?: string
  account?: string
  password?: string
  apiVersion?: string
}

function hasInteractiveTerminal(): boolean {
  return stdin.isTTY === true && stderr.isTTY === true
}

async function promptText(label: string, validate: (value: string) => boolean, errorMessage: string): Promise<string> {
  while (true) {
    const readline = createInterface({ input: stdin, output: stderr, terminal: true })
    try {
      const answer = await readline.question(`${label}: `)
      const value = answer.trim()
      if (validate(value))
        return value
      stderr.write(`${errorMessage}\n`)
    }
    finally {
      readline.close()
    }
  }
}

function promptSecret(label: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let value = ''
    let settled = false
    const previousRawMode = stdin.isRaw ?? false
    let onData: (chunk: Buffer | string) => void

    const cleanup = (error?: Error): void => {
      if (settled)
        return
      settled = true
      stdin.off('data', onData)
      if (stdin.isTTY)
        stdin.setRawMode(previousRawMode)
      stdin.pause()
      stderr.write('\n')
      if (error)
        reject(error)
      else
        resolve(value)
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

export function registerAuthCommand(program: Command): void {
  const auth = program.command('auth').description('登录、退出登录、查看/切换 API 版本')

  auth
    .command('login')
    .description('登录禅道：自动探测 v2/v1，可持久化两套 token')
    .option('--base-url <url>', '禅道站点地址（或 env: CHANDAO_URL），可带 /api.php')
    .option('--account <account>', '账号（或 env: CHANDAO_ACCOUNT）')
    .option('--password <password>', '密码（或 env: CHANDAO_PASSWORD；不建议写进 shell 历史）')
    .option('--api-version <version>', 'auto | v1 | v2（默认 auto，优先 v2）')
    .action(async (_options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as LoginOptions
      const fileConfig = loadConfig()

      // 已存在有效配置时，以配置为准；环境变量只在没有配置时作为回退。
      let baseUrl = (opts.baseUrl || fileConfig?.baseUrl || env.CHANDAO_URL || '').trim()
      let account = (opts.account || fileConfig?.account || env.CHANDAO_ACCOUNT || '').trim()
      let password = opts.password || env.CHANDAO_PASSWORD || ''

      try {
        if (!hasInteractiveTerminal()) {
          if (!baseUrl || !account || !password) {
            throw new Error('非交互模式需要提供 --base-url、--account、--password（或对应环境变量）。')
          }
        }
        else {
          if (!baseUrl)
            baseUrl = await promptText('禅道地址（如 http://192.168.0.19:8890）', isValidBaseUrl, '地址需为 http(s) URL')
          if (!account)
            account = await promptText('账号', value => value.length > 0, '账号不能为空')
          if (!password)
            password = await promptSecret('密码')
        }

        baseUrl = normalizeBaseUrl(baseUrl)
        if (!isValidBaseUrl(baseUrl))
          throw new Error(`无效的禅道地址：${baseUrl}`)

        const preference: ApiVersionPreference = normalizeApiVersion(
          opts.apiVersion || fileConfig?.apiVersion,
        )

        let probe = await ChandaoClient.probe(baseUrl, account, password)
        let subpathDetected = false
        if (!probe.detected) {
          // 常见部署：根域名 200，但禅道在 /zentao 子目录
          const parsed = new URL(baseUrl)
          if (parsed.pathname === '/' || parsed.pathname === '') {
            for (const suffix of ['/zentao', '/pms']) {
              const candidate = normalizeBaseUrl(baseUrl + suffix)
              const retry = await ChandaoClient.probe(candidate, account, password)
              if (retry.detected) {
                baseUrl = candidate
                probe = retry
                subpathDetected = true
                break
              }
            }
          }
        }
        if (!probe.detected) {
          const details = [
            `v2: ${probe.v2.ok ? 'ok' : probe.v2.message || 'failed'}`,
            `v1: ${probe.v1.ok ? 'ok' : probe.v1.message || 'failed'}`,
          ].join('；')
          throw new Error(`登录失败，v1/v2 均不可用（${details}）。若站点部署在子路径，请把子路径一起作为 --base-url。`)
        }
        if (preference === 'v1' && !probe.v1.ok)
          throw new Error(`强制 v1，但 v1 登录失败：${probe.v1.message || 'unknown'}`)
        if (preference === 'v2' && !probe.v2.ok)
          throw new Error(`强制 v2，但 v2 登录失败：${probe.v2.message || 'unknown'}`)

        saveConfig({
          baseUrl,
          account,
          apiVersion: preference,
          detectedVersion: probe.detected,
          tokenV1: probe.v1.token,
          tokenV2: probe.v2.token,
          updatedAt: new Date().toISOString(),
        })

        printSuccess({
          baseUrl,
          account,
          source: {
            baseUrl: opts.baseUrl ? 'cli' : (fileConfig?.baseUrl ? 'config' : 'env'),
            account: opts.account ? 'cli' : (fileConfig?.account ? 'config' : 'env'),
          },
          apiVersion: preference,
          detectedVersion: probe.detected,
          subpathDetected,
          login: {
            v1: probe.v1.ok,
            v2: probe.v2.ok,
          },
          tokens: {
            v1: maskToken(probe.v1.token),
            v2: maskToken(probe.v2.token),
          },
        }, 'auth.login')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '登录失败')
      }
    })

  auth
    .command('status')
    .description('查看当前登录配置与可用版本')
    .option('--verify', '用当前版本实际请求一次产品列表验证 token')
    .action(async (options: { verify?: boolean }, _cmd: Command) => {
      const config = loadConfig()
      if (!config) {
        printError('尚未登录。请运行 `chandao-cli auth login`。')
      }

      const effective = config.apiVersion === 'auto'
        ? (config.detectedVersion ?? 'v2')
        : config.apiVersion

      const payload: Record<string, unknown> = {
        baseUrl: config.baseUrl,
        account: config.account ?? null,
        apiVersion: config.apiVersion,
        detectedVersion: config.detectedVersion ?? null,
        effectiveVersion: effective,
        tokens: {
          v1: maskToken(config.tokenV1),
          v2: maskToken(config.tokenV2),
        },
        updatedAt: config.updatedAt ?? null,
      }

      if (options.verify) {
        const check = async (version: 'v1' | 'v2'): Promise<Record<string, unknown>> => {
          const token = version === 'v1' ? config.tokenV1 : config.tokenV2
          if (!token)
            return { ok: false, version, message: `未保存 ${version} token` }
          try {
            const client = new ChandaoClient(resolveConfig({ apiVersion: version }))
            const result = await client.call('product.list', { limit: 1 })
            return { ok: true, version: result.version, fallback: Boolean(result.fallback) }
          }
          catch (error) {
            const err = error as ChandaoError
            return {
              ok: false,
              version,
              ...(err.status !== undefined ? { status: err.status } : {}),
              message: error instanceof Error ? error.message : String(error),
            }
          }
        }

        const [v1, v2] = await Promise.all([check('v1'), check('v2')])
        const effectiveResult = effective === 'v1' ? v1 : v2
        payload.verify = {
          ok: Boolean(effectiveResult.ok),
          version: effective,
          fallback: Boolean(effectiveResult.fallback),
          effective,
          v1,
          v2,
        }
      }

      printSuccess(payload, 'auth.status')
    })

  auth
    .command('use <version>')
    .description('切换 API 版本偏好：auto | v1 | v2')
    .action((version: string) => {
      if (!['auto', 'v1', 'v2'].includes(version)) {
        printError('版本只能是 auto、v1 或 v2')
      }
      const config = loadConfig()
      if (!config) {
        printError('尚未登录。请运行 `chandao-cli auth login`。')
      }
      if (version === 'v1' && !config.tokenV1)
        printError('当前没有 v1 token，请重新执行 auth login 以同时获取 v1/v2 token。')
      if (version === 'v2' && !config.tokenV2)
        printError('当前没有 v2 token，请重新执行 auth login 以同时获取 v1/v2 token。')

      saveConfig({ ...config, apiVersion: version as ApiVersionPreference, updatedAt: new Date().toISOString() })
      printSuccess({ apiVersion: version }, 'auth.use')
    })

  auth
    .command('logout')
    .description('清除本地登录配置')
    .action(() => {
      clearConfig()
      const envKeys = ['CHANDAO_URL', 'CHANDAO_ACCOUNT', 'CHANDAO_TOKEN', 'CHANDAO_TOKEN_V1', 'CHANDAO_TOKEN_V2']
        .filter(key => Boolean(env[key]))
      if (envKeys.length > 0) {
        printSuccess({
          loggedOut: true,
          envFallback: envKeys,
          hint: '本机仍设置了 CHANDAO_* 环境变量，后续命令会回退使用它们；如需完全退出，请同时 unset 这些变量。',
        }, 'auth.logout')
        return
      }
      printSuccess({ loggedOut: true }, 'auth.logout')
    })
}
