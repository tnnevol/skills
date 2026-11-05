import type { Command } from 'commander'
import { readFileSync } from 'node:fs'
import { createClient } from '../client.js'
import { resolveConfig } from '../config.js'
import { handleApiResponse, handlePagedResponse, printError } from '../output.js'

/**
 * 后台媒体库管理（v4.2.9+，`/api/admin/media/*`）。
 *
 * 这些接口的请求体字段随版本变化较多，统一支持：
 * - 少量常用参数直接给（--path/--id 等）
 * - 复杂结构用 `--file` 传完整 JSON（原样转发）
 */
function getClient(cmd: Command) {
  const opts = cmd.optsWithGlobals()
  const config = resolveConfig({ baseUrl: opts.baseUrl, token: opts.token })
  return createClient(config)
}

function readBodyFile(path?: string): Record<string, unknown> {
  if (!path)
    return {}
  const parsed = JSON.parse(readFileSync(path, 'utf-8'))
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('--file 必须包含一个 JSON 对象')
  }
  return parsed as Record<string, unknown>
}

export function registerAdminMediaCommand(admin: Command): void {
  const media = admin.command('media').description('管理媒体库（扫描、刮削、条目、导出导入）')

  media.command('config-list')
    .description('列出媒体配置')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/admin/media/config/list'), 'admin.media.config-list')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '获取媒体配置失败')
      }
    })

  media.command('config-save')
    .description('保存媒体配置')
    .option('-f, --file <path>', '配置 JSON 文件')
    .option('-d, --data <json>', '配置 JSON 字符串')
    .action(async (options, cmd) => {
      try {
        const body = options.file ? readBodyFile(options.file) : JSON.parse(options.data || '{}')
        handleApiResponse(await getClient(cmd).post('/api/admin/media/config/save', body), 'admin.media.config-save')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '保存媒体配置失败')
      }
    })

  media.command('items')
    .description('列出媒体条目')
    .option('-p, --page <n>', '页码（默认 1）', '1')
    .option('-n, --per-page <n>', '每页数量（默认 30）', '30')
    .option('--keyword <kw>', '关键词')
    .option('--type <type>', '媒体类型')
    .action(async (options, cmd) => {
      try {
        const query: Record<string, unknown> = { page: Number(options.page), per_page: Number(options.perPage) }
        if (options.keyword)
          query.keyword = options.keyword
        if (options.type)
          query.type = options.type
        const response = await getClient(cmd).get('/api/admin/media/items', query)
        handlePagedResponse(response, 'admin.media.items', {
          page: Number(options.page),
          perPage: Number(options.perPage),
        })
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '列出媒体条目失败')
      }
    })

  media.command('item-update')
    .description('更新媒体条目')
    .option('-f, --file <path>', '条目 JSON 文件')
    .option('-d, --data <json>', '条目 JSON 字符串')
    .action(async (options, cmd) => {
      try {
        const body = options.file ? readBodyFile(options.file) : JSON.parse(options.data || '{}')
        handleApiResponse(await getClient(cmd).post('/api/admin/media/items/update', body), 'admin.media.item-update')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '更新媒体条目失败')
      }
    })

  media.command('item-delete')
    .description('删除媒体条目')
    .option('--id <id>', '条目 ID')
    .option('--ids <ids>', '多个 ID（逗号分隔）')
    .option('-f, --file <path>', '请求体 JSON 文件')
    .action(async (options, cmd) => {
      try {
        const body = readBodyFile(options.file)
        if (options.id)
          body.id = options.id
        if (options.ids)
          body.ids = options.ids.split(',').map((s: string) => s.trim())
        handleApiResponse(await getClient(cmd).post('/api/admin/media/items/delete', body), 'admin.media.item-delete')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '删除媒体条目失败')
      }
    })

  media.command('scan-start')
    .description('启动媒体扫描')
    .option('--paths <paths>', '扫描路径（逗号分隔）')
    .option('--full', '全量扫描')
    .action(async (options, cmd) => {
      try {
        const body: Record<string, unknown> = {}
        if (options.paths)
          body.paths = options.paths.split(',').map((s: string) => s.trim())
        if (options.full)
          body.full = true
        handleApiResponse(await getClient(cmd).post('/api/admin/media/scan/start', body), 'admin.media.scan-start')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '启动扫描失败')
      }
    })

  media.command('scan-progress')
    .description('查看媒体扫描进度')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/admin/media/scan/progress'), 'admin.media.scan-progress')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '获取扫描进度失败')
      }
    })

  media.command('scrape-start')
    .description('启动媒体刮削')
    .option('--ids <ids>', '指定条目 ID（逗号分隔，省略则全部）')
    .action(async (options, cmd) => {
      try {
        const body: Record<string, unknown> = {}
        if (options.ids)
          body.ids = options.ids.split(',').map((s: string) => s.trim())
        handleApiResponse(await getClient(cmd).post('/api/admin/media/scrape/start', body), 'admin.media.scrape-start')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '启动刮削失败')
      }
    })

  media.command('scrape-stats')
    .description('查看刮削统计')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/admin/media/scrape/stats'), 'admin.media.scrape-stats')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '获取刮削统计失败')
      }
    })

  media.command('clear')
    .description('清空媒体库数据')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).post('/api/admin/media/clear'), 'admin.media.clear')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '清空媒体库失败')
      }
    })

  media.command('clear-scrape')
    .description('清空刮削数据')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).post('/api/admin/media/clear_scrape'), 'admin.media.clear-scrape')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '清空刮削数据失败')
      }
    })

  media.command('delete-invalid')
    .description('删除无效媒体条目')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).post('/api/admin/media/delete_invalid'), 'admin.media.delete-invalid')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '删除无效条目失败')
      }
    })

  media.command('scan-paths')
    .description('列出扫描目录')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/admin/media/scan_paths'), 'admin.media.scan-paths')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '列出扫描目录失败')
      }
    })

  media.command('scan-path-create')
    .description('新建扫描目录')
    .requiredOption('--path <path>', '目录路径')
    .option('--name <name>', '名称')
    .action(async (options, cmd) => {
      try {
        const body: Record<string, unknown> = { path: options.path }
        if (options.name)
          body.name = options.name
        handleApiResponse(await getClient(cmd).post('/api/admin/media/scan_paths/create', body), 'admin.media.scan-path-create')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '新建扫描目录失败')
      }
    })

  media.command('scan-path-update')
    .description('更新扫描目录')
    .option('--id <id>', '目录 ID')
    .option('--path <path>', '目录路径')
    .option('--name <name>', '名称')
    .option('-f, --file <path>', '请求体 JSON 文件')
    .action(async (options, cmd) => {
      try {
        const body = readBodyFile(options.file)
        if (options.id)
          body.id = options.id
        if (options.path)
          body.path = options.path
        if (options.name)
          body.name = options.name
        handleApiResponse(await getClient(cmd).post('/api/admin/media/scan_paths/update', body), 'admin.media.scan-path-update')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '更新扫描目录失败')
      }
    })

  media.command('scan-path-delete <id>')
    .description('删除扫描目录')
    .action(async (id: string, _options, cmd) => {
      try {
        handleApiResponse(
          await getClient(cmd).post('/api/admin/media/scan_paths/delete', { id }),
          'admin.media.scan-path-delete',
        )
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '删除扫描目录失败')
      }
    })

  media.command('scan-path-clear')
    .description('清空扫描目录数据')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).post('/api/admin/media/scan_paths/clear'), 'admin.media.scan-path-clear')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '清空扫描目录失败')
      }
    })

  media.command('export')
    .description('导出媒体库数据')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/admin/media/export'), 'admin.media.export')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '导出媒体库失败')
      }
    })

  media.command('import')
    .description('导入媒体库数据')
    .option('-f, --file <path>', '导入数据 JSON 文件')
    .action(async (options, cmd) => {
      try {
        if (!options.file) {
          printError('需要 --file 指定导入数据')
          return
        }
        const body = readBodyFile(options.file)
        handleApiResponse(await getClient(cmd).post('/api/admin/media/import', body), 'admin.media.import')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '导入媒体库失败')
      }
    })

  media.command('strm-generate')
    .description('生成 STRM 文件')
    .option('--paths <paths>', '路径（逗号分隔）')
    .option('--output <dir>', '输出目录')
    .option('-f, --file <path>', '请求体 JSON 文件')
    .action(async (options, cmd) => {
      try {
        const body = readBodyFile(options.file)
        if (options.paths)
          body.paths = options.paths.split(',').map((s: string) => s.trim())
        if (options.output)
          body.output = options.output
        handleApiResponse(await getClient(cmd).post('/api/admin/media/strm/generate', body), 'admin.media.strm-generate')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '生成 STRM 失败')
      }
    })
}

export function registerAdminScanCommand(admin: Command): void {
  const scan = admin.command('scan').description('管理手动扫描任务')

  scan.command('start')
    .description('启动扫描')
    .option('--path <path>', '限定扫描路径')
    .action(async (options, cmd) => {
      try {
        const body = options.path ? { path: options.path } : {}
        handleApiResponse(await getClient(cmd).post('/api/admin/scan/start', body), 'admin.scan.start')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '启动扫描失败')
      }
    })

  scan.command('stop')
    .description('停止扫描')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).post('/api/admin/scan/stop'), 'admin.scan.stop')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '停止扫描失败')
      }
    })

  scan.command('progress')
    .description('查看扫描进度')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/admin/scan/progress'), 'admin.scan.progress')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '查看扫描进度失败')
      }
    })
}

export function registerAdminTranscodeCommand(admin: Command): void {
  const tc = admin.command('transcode').description('管理转码任务与工作节点')

  tc.command('jobs')
    .description('列出转码任务')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/admin/transcode/jobs'), 'admin.transcode.jobs')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '列出转码任务失败')
      }
    })

  tc.command('workers')
    .description('列出转码工作节点')
    .action(async (_options, cmd) => {
      try {
        handleApiResponse(await getClient(cmd).get('/api/admin/transcode/workers'), 'admin.transcode.workers')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '列出工作节点失败')
      }
    })

  tc.command('cancel <jobId>')
    .description('取消转码任务')
    .action(async (jobId: string, _options, cmd) => {
      try {
        handleApiResponse(
          await getClient(cmd).post('/api/admin/transcode/cancel', { job_id: jobId }),
          'admin.transcode.cancel',
        )
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '取消转码任务失败')
      }
    })
}
