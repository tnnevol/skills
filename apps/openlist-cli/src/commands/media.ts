import type { Command } from 'commander'
import { createClient } from '../client.js'
import { resolveConfig } from '../config.js'
import { handleApiResponse, handlePagedResponse, printError } from '../output.js'

/**
 * 媒体库（v4.2.9+）。
 *
 * 服务端 `/api/fs/media/*` 依赖实例启用媒体库并完成扫描；未启用时返回 404/空列表，
 * 这里不做前端兜底，原样透出服务端结果。
 */
function getClient(cmd: Command) {
  const opts = cmd.optsWithGlobals()
  const config = resolveConfig({ baseUrl: opts.baseUrl, token: opts.token })
  return createClient(config)
}

interface PagedOptions {
  page: string
  perPage: string
}

function pagedQuery(options: PagedOptions, extra: Record<string, unknown> = {}) {
  return {
    page: Number(options.page),
    per_page: Number(options.perPage),
    ...extra,
  }
}

export function registerMediaCommand(program: Command): void {
  const media = program.command('media').description('浏览媒体库（相册、收藏、播放进度）')

  media.command('albums')
    .description('列出相册')
    .option('-p, --page <n>', '页码（默认 1）', '1')
    .option('-n, --per-page <n>', '每页数量（默认 30）', '30')
    .action(async (options, cmd) => {
      try {
        const response = await getClient(cmd).get('/api/fs/media/albums', pagedQuery(options))
        handlePagedResponse(response, 'media.albums', { page: Number(options.page), perPage: Number(options.perPage) })
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '列出相册失败')
      }
    })

  media.command('album <id>')
    .description('获取相册详情')
    .action(async (id: string, _options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/fs/media/album', { id }), 'media.album')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '获取相册失败')
      }
    })

  media.command('list')
    .description('列出媒体条目')
    .option('-p, --page <n>', '页码（默认 1）', '1')
    .option('-n, --per-page <n>', '每页数量（默认 30）', '30')
    .option('--path <path>', '限定目录')
    .option('--type <type>', '媒体类型（image/video/audio）')
    .action(async (options, cmd) => {
      try {
        const extra: Record<string, unknown> = {}
        if (options.path)
          extra.path = options.path
        if (options.type)
          extra.type = options.type
        const response = await getClient(cmd).get('/api/fs/media/list', pagedQuery(options, extra))
        handlePagedResponse(response, 'media.list', { page: Number(options.page), perPage: Number(options.perPage) })
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '列出媒体失败')
      }
    })

  media.command('item <id>')
    .description('获取媒体条目详情')
    .action(async (id: string, _options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get(`/api/fs/media/item/${id}`), 'media.item')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '获取媒体条目失败')
      }
    })

  media.command('folders')
    .description('列出媒体所在目录')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/fs/media/folders'), 'media.folders')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '列出媒体目录失败')
      }
    })

  media.command('favorites')
    .description('列出收藏')
    .option('-p, --page <n>', '页码（默认 1）', '1')
    .option('-n, --per-page <n>', '每页数量（默认 30）', '30')
    .action(async (options, cmd) => {
      try {
        const response = await getClient(cmd).get('/api/fs/media/favorites', pagedQuery(options))
        handlePagedResponse(response, 'media.favorites', { page: Number(options.page), perPage: Number(options.perPage) })
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '列出收藏失败')
      }
    })

  media.command('favorite <id>')
    .description('收藏或取消收藏（切换）')
    .option('--off', '取消收藏')
    .action(async (id: string, options, cmd) => {
      try {
        const body = { id, favorite: !options.off }
        handleApiResponse(await getClient(cmd).post('/api/fs/media/favorite', body), 'media.favorite')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '设置收藏失败')
      }
    })

  media.command('progress')
    .description('查询播放进度')
    .option('--id <id>', '媒体条目 ID')
    .action(async (options, cmd) => {
      try {
        const query = options.id ? { id: options.id } : {}
        handleApiResponse(await getClient(cmd).get('/api/fs/media/progress', query), 'media.progress')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '查询播放进度失败')
      }
    })

  media.command('set-progress <id> <position>')
    .description('上报播放进度（秒）')
    .option('--duration <n>', '媒体总时长（秒）')
    .action(async (id: string, position: string, options, cmd) => {
      try {
        const body: Record<string, unknown> = { id, position: Number(position) }
        if (options.duration)
          body.duration = Number(options.duration)
        handleApiResponse(await getClient(cmd).post('/api/fs/media/progress', body), 'media.set-progress')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '上报播放进度失败')
      }
    })

  media.command('resume')
    .description('列出可续播的媒体')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/fs/media/resume'), 'media.resume')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '列出续播列表失败')
      }
    })

  media.command('annotations')
    .description('查询批注')
    .option('--id <id>', '媒体条目 ID')
    .action(async (options, cmd) => {
      try {
        const query = options.id ? { id: options.id } : {}
        handleApiResponse(await getClient(cmd).get('/api/fs/media/annotations', query), 'media.annotations')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '查询批注失败')
      }
    })

  media.command('set-annotations <id>')
    .description('写入批注（JSON 数组，或用 --file 传完整请求体）')
    .option('-c, --content <json>', '批注 JSON 数组')
    .option('-f, --file <path>', '从文件读取完整请求体')
    .action(async (id: string, options, cmd) => {
      try {
        const { readFileSync } = await import('node:fs')
        let body: Record<string, unknown>
        if (options.file) {
          body = JSON.parse(readFileSync(options.file, 'utf-8'))
        }
        else {
          body = { id, annotations: options.content ? JSON.parse(options.content) : [] }
        }
        handleApiResponse(await getClient(cmd).post('/api/fs/media/annotations', body), 'media.set-annotations')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '写入批注失败')
      }
    })

  media.command('scan-paths')
    .description('列出媒体扫描目录')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/fs/media/scan_paths'), 'media.scan-paths')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '列出扫描目录失败')
      }
    })

  media.command('strm')
    .description('查询 STRM 信息')
    .option('--id <id>', '媒体条目 ID')
    .action(async (options, cmd) => {
      try {
        const query = options.id ? { id: options.id } : {}
        handleApiResponse(await getClient(cmd).get('/api/fs/media/strm', query), 'media.strm')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '查询 STRM 失败')
      }
    })

  media.command('stream-url')
    .description('获取媒体流地址')
    .requiredOption('--id <id>', '媒体条目 ID')
    .action(async (options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/fs/media/stream_url', { id: options.id }), 'media.stream-url')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '获取播放地址失败')
      }
    })

  media.command('userdata')
    .description('查询媒体用户数据（收藏、进度等）')
    .option('--id <id>', '媒体条目 ID')
    .action(async (options, cmd) => {
      try {
        const query = options.id ? { id: options.id } : {}
        handleApiResponse(await getClient(cmd).get('/api/fs/media/userdata', query), 'media.userdata')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '查询用户数据失败')
      }
    })
}
