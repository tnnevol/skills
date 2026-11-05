import type { Command } from 'commander'
import type { Buffer } from 'node:buffer'
import { readFileSync, statSync } from 'node:fs'
import { createClient } from '../client.js'
import { resolveConfig } from '../config.js'
import { handleApiResponse, printError } from '../output.js'

/**
 * 分片上传（v4.2.9+），用于超出单次请求上限的大文件。
 *
 * **参数走 HTTP 头，不是 JSON body**（服务端 `server/handles/multipart.go`）：
 * - init：`File-Path`、`X-File-Size`，可选 `X-Chunk-Size`、`Overwrite`、`X-File-Md5`/`Sha1`/`Sha256`
 * - chunk：`X-Upload-Id`、`X-Chunk-Index`，body 为分片原始字节
 * - complete / abort：`X-Upload-Id`
 * - status：query `upload_id`，或 query `path` + `size`
 *
 * 需要实例开启 multipart（否则 403 `multipart upload is disabled`）。
 */
function getClient(cmd: Command) {
  const opts = cmd.optsWithGlobals()
  const config = resolveConfig({ baseUrl: opts.baseUrl, token: opts.token })
  return createClient(config)
}

interface MultipartInitData {
  upload_id?: string
  uploadId?: string
  session?: { upload_id?: string }
  [key: string]: unknown
}

/** 从 init/complete 的返回体里取出 upload_id（字段名随实现可能是 upload_id 或 uploadId）。 */
export function pickUploadId(data: unknown): string | undefined {
  if (!data || typeof data !== 'object')
    return undefined
  const d = data as Record<string, unknown>
  const direct = d.upload_id ?? d.uploadId
  if (typeof direct === 'string' && direct)
    return direct
  const session = d.session
  if (session && typeof session === 'object') {
    const nested = (session as Record<string, unknown>).upload_id ?? (session as Record<string, unknown>).uploadId
    if (typeof nested === 'string' && nested)
      return nested
  }
  return undefined
}

export function registerMultipartCommand(program: Command): void {
  const mp = program.command('multipart').description('分片上传大文件（init / chunk / complete / abort / status）')

  mp.command('init')
    .description('初始化分片上传，返回 upload_id')
    .requiredOption('--path <remote>', '远端目标路径（含文件名）')
    .requiredOption('--size <bytes>', '文件总大小（字节）')
    .option('--chunk-size <bytes>', '分片大小（字节）')
    .option('--sha256 <hash>', '文件 SHA256')
    .option('--md5 <hash>', '文件 MD5')
    .option('--sha1 <hash>', '文件 SHA1')
    .option('--no-overwrite', '目标已存在时失败（默认覆盖）')
    .option('--content-type <mime>', 'MIME 类型')
    .action(async (options, cmd) => {
      try {
        const headers: Record<string, string> = {
          'File-Path': encodeURIComponent(options.path),
          'X-File-Size': String(Number(options.size)),
        }
        if (options.chunkSize)
          headers['X-Chunk-Size'] = String(Number(options.chunkSize))
        if (options.sha256)
          headers['X-File-Sha256'] = options.sha256
        if (options.md5)
          headers['X-File-Md5'] = options.md5
        if (options.sha1)
          headers['X-File-Sha1'] = options.sha1
        if (options.overwrite === false)
          headers.Overwrite = 'false'
        if (options.contentType)
          headers['Content-Type'] = options.contentType
        const response = await getClient(cmd).post('/api/fs/multipart/init', undefined, headers)
        handleApiResponse(response, 'multipart.init')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '初始化分片上传失败')
      }
    })

  mp.command('chunk')
    .description('上传单个分片（--file 为分片文件）')
    .requiredOption('--upload-id <id>', '上传会话 ID')
    .requiredOption('--index <n>', '分片序号（从 0 开始）')
    .requiredOption('--file <path>', '分片文件路径')
    .action(async (options, cmd) => {
      try {
        const data = readFileSync(options.file)
        const headers: Record<string, string> = {
          'X-Upload-Id': options.uploadId,
          'X-Chunk-Index': String(Number(options.index)),
          'Content-Type': 'application/octet-stream',
        }
        handleApiResponse(
          await getClient(cmd).put('/api/fs/multipart/chunk', data, headers),
          'multipart.chunk',
        )
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '上传分片失败')
      }
    })

  mp.command('complete')
    .description('完成分片上传')
    .requiredOption('--upload-id <id>', '上传会话 ID')
    .action(async (options, cmd) => {
      try {
        handleApiResponse(
          await getClient(cmd).post('/api/fs/multipart/complete', undefined, { 'X-Upload-Id': options.uploadId }),
          'multipart.complete',
        )
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '完成分片上传失败')
      }
    })

  mp.command('abort')
    .description('中止分片上传')
    .requiredOption('--upload-id <id>', '上传会话 ID')
    .action(async (options, cmd) => {
      try {
        handleApiResponse(
          await getClient(cmd).post('/api/fs/multipart/abort', undefined, { 'X-Upload-Id': options.uploadId }),
          'multipart.abort',
        )
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '中止分片上传失败')
      }
    })

  mp.command('status')
    .description('查询分片上传进度（按 upload_id，或 path+size）')
    .option('--upload-id <id>', '上传会话 ID')
    .option('--path <remote>', '远端路径（与 --size 搭配，用于恢复中断的上传）')
    .option('--size <bytes>', '文件大小（与 --path 搭配）')
    .action(async (options, cmd) => {
      try {
        const query: Record<string, unknown> = {}
        if (options.uploadId) {
          query.upload_id = options.uploadId
        }
        else if (options.path !== undefined && options.size !== undefined) {
          query.path = options.path
          query.size = Number(options.size)
        }
        else {
          printError('需要 --upload-id，或同时提供 --path 与 --size')
          return
        }
        handleApiResponse(await getClient(cmd).get('/api/fs/multipart/status', query), 'multipart.status')
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '查询上传进度失败')
      }
    })

  mp.command('upload <local> <remote>')
    .description('一键分片上传本地文件（init → chunk → complete）')
    .option('--chunk-size <bytes>', '分片大小（默认 5MiB）', String(5 * 1024 * 1024))
    .option('--no-overwrite', '目标已存在时失败')
    .action(async (local: string, remote: string, options, cmd) => {
      try {
        const client = getClient(cmd)
        const size = statSync(local).size
        const chunkSize = Number(options.chunkSize)

        const initHeaders: Record<string, string> = {
          'File-Path': encodeURIComponent(remote),
          'X-File-Size': String(size),
          'X-Chunk-Size': String(chunkSize),
        }
        if (options.overwrite === false)
          initHeaders.Overwrite = 'false'

        const initRes = await client.post<MultipartInitData>('/api/fs/multipart/init', undefined, initHeaders)
        if (initRes.code !== 200) {
          printError(initRes.message || '初始化失败', initRes.code)
          return
        }
        const uploadId = pickUploadId(initRes.data)
        if (!uploadId) {
          printError('初始化未返回 upload_id')
          return
        }

        const buffer = readFileSync(local)
        const total = Math.ceil(size / chunkSize)
        for (let index = 0; index < total; index++) {
          const slice = buffer.subarray(index * chunkSize, Math.min((index + 1) * chunkSize, size))
          const res = await client.put('/api/fs/multipart/chunk', slice as Buffer, {
            'X-Upload-Id': uploadId,
            'X-Chunk-Index': String(index),
            'Content-Type': 'application/octet-stream',
          })
          if (res.code !== 200) {
            printError(`分片 ${index}/${total} 上传失败: ${res.message}（可用 multipart abort --upload-id ${uploadId} 清理）`, res.code)
            return
          }
        }

        handleApiResponse(
          await client.post('/api/fs/multipart/complete', undefined, { 'X-Upload-Id': uploadId }),
          'multipart.upload',
        )
      }
      catch (error) {
        printError(error instanceof Error ? error.message : '分片上传失败')
      }
    })
}

/** 供单测使用：把远端路径编码进 File-Path 头。 */
export function encodeFilePathHeader(remotePath: string): string {
  return encodeURIComponent(remotePath)
}
