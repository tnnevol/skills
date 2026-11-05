import type { Command } from 'commander'
import { createClient } from '../client.js'
import { resolveConfig } from '../config.js'
import { handleApiResponse, printError } from '../output.js'

/** 当前账号的接口凭证与 SSH 公钥（v4.2.9+）。 */
function getClient(cmd: Command) {
  const opts = cmd.optsWithGlobals()
  const config = resolveConfig({ baseUrl: opts.baseUrl, token: opts.token })
  return createClient(config)
}

export function registerAppkeyCommand(program: Command): void {
  const appkey = program.command('appkey').description('管理媒体接口凭证（App Key）')

  appkey.command('list')
    .description('列出接口凭证')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/me/appkey/list'), 'appkey.list')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '列出凭证失败')
      }
    })

  appkey.command('create')
    .description('创建接口凭证')
    .option('--name <name>', '凭证名称')
    .action(async (options, cmd) => {
      try {
        handleApiResponse(
          await getClient(cmd).post('/api/me/appkey/create', { name: options.name ?? '' }),
          'appkey.create',
        )
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '创建凭证失败')
      }
    })

  appkey.command('delete <id>')
    .description('删除接口凭证')
    .action(async (id: string, _options, cmd) => {
      try {
        // 服务端用 query 取 id（server/handles/media_extra.go: c.Query("id")）
        handleApiResponse(
          await getClient(cmd).post('/api/me/appkey/delete', undefined, undefined, { id }),
          'appkey.delete',
        )
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '删除凭证失败')
      }
    })
}

export function registerPublicCommand(program: Command): void {
  const pub = program.command('public').description('公开信息（无需登录）')

  pub.command('settings')
    .description('获取站点公开设置（含实例版本）')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/public/settings'), 'public.settings')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '获取站点设置失败')
      }
    })

  pub.command('init-status')
    .description('查询实例是否已初始化')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/public/init_status'), 'public.init-status')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '查询初始化状态失败')
      }
    })

  pub.command('offline-tools')
    .description('列出可用的离线下载工具')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/public/offline_download_tools'), 'public.offline-tools')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '获取离线下载工具失败')
      }
    })

  pub.command('archive-extensions')
    .description('列出支持的压缩包扩展名')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/public/archive_extensions'), 'public.archive-extensions')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '获取压缩扩展名失败')
      }
    })
}
