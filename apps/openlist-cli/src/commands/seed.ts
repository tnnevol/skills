import type { Command } from 'commander'
import { readFileSync } from 'node:fs'
import { createClient } from '../client.js'
import { resolveConfig } from '../config.js'
import { handleApiResponse, printError } from '../output.js'

/**
 * 种子（BT/磁力）相关（v4.2.9+）。
 *
 * 服务端请求体字段较多且多为可选，统一支持两种输入：
 * 直接传少量关键参数，或用 `--file` 传完整请求体（原样转发给服务端）。
 */
const DASHES = /-/g

function getClient(cmd: Command) {
  const opts = cmd.optsWithGlobals()
  const config = resolveConfig({ baseUrl: opts.baseUrl, token: opts.token })
  return createClient(config)
}

/** 读取 `--file` 的完整请求体；与命令行参数合并（命令行优先）。 */
function readBodyFile(path?: string): Record<string, unknown> {
  if (!path)
    return {}
  const parsed = JSON.parse(readFileSync(path, 'utf-8'))
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('--file 必须包含一个 JSON 对象')
  }
  return parsed as Record<string, unknown>
}

/** 用 --seed-data / --seed-file 组装 seed_data 字段。 */
function seedDataPayload(options: { seedData?: string, seedFile?: string }): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  if (options.seedFile) {
    body.seed_data = readFileSync(options.seedFile, 'utf-8')
  }
  else if (options.seedData) {
    body.seed_data = options.seedData
  }
  return body
}

export function registerSeedCommand(program: Command): void {
  const seed = program.command('seed').description('种子文件解析、生成与转换（PT/BT）')

  seed.command('capabilities')
    .description('查询种子能力与容量估算')
    .option('--path <path>', '单个路径')
    .option('--paths <paths>', '路径列表（逗号分隔）')
    .option('--file <file>', '完整请求体 JSON 文件')
    .action(async (options, cmd) => {
      try {
        const body = readBodyFile(options.file)
        if (options.path)
          body.path = options.path
        if (options.paths)
          body.paths = options.paths.split(',').map((s: string) => s.trim())
        handleApiResponse(await getClient(cmd).post('/api/fs/seed/capabilities', body), 'seed.capabilities')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '查询种子能力失败')
      }
    })

  seed.command('parse')
    .description('解析种子文件')
    .option('--seed-data <data>', '种子内容（字符串）')
    .option('--seed-file <path>', '从本地文件读取种子')
    .option('--format <format>', '种子格式')
    .option('--file-name <name>', '文件名')
    .option('--file <file>', '完整请求体 JSON 文件')
    .action(async (options, cmd) => {
      try {
        const body = { ...readBodyFile(options.file), ...seedDataPayload(options) }
        if (options.format)
          body.format = options.format
        if (options.fileName)
          body.file_name = options.fileName
        handleApiResponse(await getClient(cmd).post('/api/fs/seed/parse', body), 'seed.parse')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '解析种子失败')
      }
    })

  seed.command('upload-parse <path>')
    .description('上传种子文件并解析')
    .option('--target <path>', '目标目录')
    .option('--file <file>', '完整请求体 JSON 文件')
    .action(async (path: string, options, cmd) => {
      try {
        const body = { ...readBodyFile(options.file), path }
        if (options.target)
          body.target = options.target
        handleApiResponse(await getClient(cmd).post('/api/fs/seed/upload_parse', body), 'seed.upload-parse')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '上传解析失败')
      }
    })

  seed.command('generate')
    .description('为目录生成种子')
    .requiredOption('--paths <paths>', '路径列表（逗号分隔）')
    .option('--format <format>', '单个格式（如 v1）')
    .option('--formats <formats>', '多个格式（逗号分隔）')
    .option('--name <name>', '种子名称')
    .option('--comment <text>', '备注')
    .option('--piece-size <n>', '分块大小（字节）')
    .option('--save-path <path>', '保存路径')
    .option('--file <file>', '完整请求体 JSON 文件')
    .action(async (options, cmd) => {
      try {
        const body = { ...readBodyFile(options.file), paths: options.paths.split(',').map((s: string) => s.trim()) }
        if (options.format)
          body.format = options.format
        if (options.formats)
          body.formats = options.formats.split(',').map((s: string) => s.trim())
        if (options.name)
          body.name = options.name
        if (options.comment)
          body.comment = options.comment
        if (options.pieceSize)
          body.piece_size = Number(options.pieceSize)
        if (options.savePath)
          body.save_path = options.savePath
        handleApiResponse(await getClient(cmd).post('/api/fs/seed/generate', body), 'seed.generate')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '生成种子失败')
      }
    })

  seed.command('convert')
    .description('转换种子容器格式')
    .requiredOption('--target-format <format>', '目标格式')
    .option('--seed-data <data>', '种子内容')
    .option('--seed-file <path>', '从本地文件读取种子')
    .option('--path <path>', '目标路径')
    .option('--file <file>', '完整请求体 JSON 文件')
    .action(async (options, cmd) => {
      try {
        const body = { ...readBodyFile(options.file), ...seedDataPayload(options), target_format: options.targetFormat }
        if (options.path)
          body.path = options.path
        handleApiResponse(await getClient(cmd).post('/api/fs/seed/convert', body), 'seed.convert')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '转换种子失败')
      }
    })

  seed.command('diagnose')
    .description('诊断种子文件')
    .option('--seed-data <data>', '种子内容')
    .option('--seed-file <path>', '从本地文件读取种子')
    .option('--file <file>', '完整请求体 JSON 文件')
    .action(async (options, cmd) => {
      try {
        const body = { ...readBodyFile(options.file), ...seedDataPayload(options) }
        handleApiResponse(await getClient(cmd).post('/api/fs/seed/diagnose', body), 'seed.diagnose')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '诊断种子失败')
      }
    })

  seed.command('update')
    .description('更新种子元信息')
    .option('--seed-data <data>', '种子内容')
    .option('--seed-file <path>', '从本地文件读取种子')
    .option('--comment <text>', '备注')
    .option('--trackers <list>', 'tracker 列表（逗号分隔）')
    .option('--output-path <path>', '输出路径')
    .option('--piece-size <n>', '分块大小')
    .option('--file <file>', '完整请求体 JSON 文件')
    .action(async (options, cmd) => {
      try {
        const body = { ...readBodyFile(options.file), ...seedDataPayload(options) }
        if (options.comment !== undefined)
          body.comment = options.comment
        if (options.trackers)
          body.trackers = options.trackers.split(',').map((s: string) => s.trim())
        if (options.outputPath)
          body.output_path = options.outputPath
        if (options.pieceSize)
          body.piece_size = Number(options.pieceSize)
        handleApiResponse(await getClient(cmd).post('/api/fs/seed/update', body), 'seed.update')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '更新种子失败')
      }
    })

  seed.command('update-channels')
    .description('替换种子的公开频道元数据')
    .requiredOption('--channels <json>', 'channels JSON 数组')
    .option('--seed-data <data>', '种子内容')
    .option('--seed-file <path>', '从本地文件读取种子')
    .option('--file <file>', '完整请求体 JSON 文件')
    .action(async (options, cmd) => {
      try {
        const body = { ...readBodyFile(options.file), ...seedDataPayload(options) }
        body.channels = JSON.parse(options.channels)
        handleApiResponse(await getClient(cmd).post('/api/fs/seed/update_channels', body), 'seed.update-channels')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '更新频道失败')
      }
    })

  // quick_save / rapid_upload / offline_download 在服务端是同一实现，参数一致
  for (const [name, op] of [
    ['quick-save', 'seed.quick-save'],
    ['rapid-upload', 'seed.rapid-upload'],
    ['offline-download', 'seed.offline-download'],
  ] as const) {
    seed.command(name)
      .description('保存种子到指定目录（服务端同一实现）')
      .requiredOption('--path <path>', '目标目录')
      .option('--seed-data <data>', '种子内容')
      .option('--seed-file <path>', '从本地文件读取种子')
      .option('--files <files>', '文件列表（逗号分隔）')
      .option('--tool <tool>', '下载工具')
      .option('--delete-policy <policy>', '删除策略')
      .option('--transit-path <path>', '中转目录')
      .option('--overwrite', '覆盖已有文件')
      .option('--file <file>', '完整请求体 JSON 文件')
      .action(async (options, cmd) => {
        try {
          const body = { ...readBodyFile(options.file), ...seedDataPayload(options), path: options.path }
          if (options.files)
            body.files = options.files.split(',').map((s: string) => s.trim())
          if (options.tool)
            body.tool = options.tool
          if (options.deletePolicy)
            body.delete_policy = options.deletePolicy
          if (options.transitPath)
            body.transit_path = options.transitPath
          if (options.overwrite)
            body.overwrite = true
          handleApiResponse(await getClient(cmd).post(`/api/fs/seed/${name.replace(DASHES, '_')}`, body), op)
        }
        catch (error) {
          printError(error instanceof Error ? error.message : '保存种子失败')
        }
      })
  }
}
