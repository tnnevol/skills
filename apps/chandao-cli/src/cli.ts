import type { Command } from 'commander'
import { createRequire } from 'node:module'
import { Command as Commander } from 'commander'
import { registerAuthCommand } from './commands/auth.js'
import { registerFileCommand } from './commands/file.js'
import { registerResourceCommands } from './commands/resources.js'
import { fail, getClient } from './commands/shared.js'
import { printSuccess, setPretty } from './output.js'

const require = createRequire(import.meta.url)
const { version } = require('../package.json') as { version: string }

const program = new Commander()

program
  .name('chandao-cli')
  .description('CLI for ZenTao (禅道) — 自动探测 v2/v1，可用 --api-version 强制版本')
  .version(version)
  .option('--base-url <url>', '禅道站点地址（或 env: CHANDAO_URL）')
  .option('--account <account>', '登录账号（或 env: CHANDAO_ACCOUNT）')
  .option('--token <token>', '临时覆盖当前 API 版本的 token（或 env: CHANDAO_TOKEN）')
  .option('--api-version <version>', 'auto | v1 | v2（默认读取登录配置，auto 优先 v2）')
  .option('--pretty', '美化 JSON 输出')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts()
    if (opts.pretty)
      setPretty(true)
  })

registerAuthCommand(program)
registerFileCommand(program)
registerResourceCommands(program)
registerApiCommand(program)

function registerApiCommand(program: Command): void {
  program
    .command('api <method> <path>')
    .description('直接调用任意接口，如：api GET /v1/products?page=1 或 api GET /v2/products')
    .option('--data <json>', '请求体 JSON')
    .option('--query <json>', '查询参数 JSON，会拼到 path 后')
    .action(async (method: string, rawPath: string, options: { data?: string, query?: string }, cmd: Command) => {
      const client = getClient(cmd)
      try {
        let path = rawPath
        if (options.query) {
          const query = JSON.parse(options.query) as Record<string, unknown>
          const search = new URLSearchParams()
          for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null && value !== '')
              search.append(key, String(value))
          }
          path += `${path.includes('?') ? '&' : '?'}${search.toString()}`
        }
        const body = options.data ? JSON.parse(options.data) : undefined
        const result = await client.requestDirect(
          method.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE',
          path,
          body,
        )
        printSuccess({ version: result.version, data: result.data }, 'api')
      }
      catch (error) {
        fail(error)
      }
    })
}

program.parse()
