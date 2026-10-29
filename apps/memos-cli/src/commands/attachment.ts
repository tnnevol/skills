import type { Command } from 'commander'
import { existsSync, readFileSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import { normalizeAttachmentName, normalizeMemoName, shortId } from '../names.js'
import { printSuccess, withPagination } from '../output.js'
import { clampPageSize } from './memo.js'
import { fail, getClient } from './shared.js'

interface AttachmentRecord {
  name: string
  filename?: string
  type?: string
  size?: string
  memo?: string
  externalLink?: string
  createTime?: string
  [key: string]: unknown
}

interface ListAttachmentsResponse {
  attachments?: AttachmentRecord[]
  nextPageToken?: string
}

export function registerAttachmentCommand(program: Command): void {
  const attachment = program.command('attachment').description('管理附件')

  attachment
    .command('list')
    .description('列出附件')
    .option('-n, --page-size <n>', '每页数量（1-1000，默认 50）', '50')
    .option('--page-token <token>', '续页令牌')
    .option('--filter <expr>', '过滤表达式，如 \'filename.contains("png")\'')
    .option('--order-by <expr>', '排序表达式')
    .action(async (options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const pageSize = clampPageSize(options.pageSize)
        const data = await client.get<ListAttachmentsResponse>('/attachments', {
          pageSize,
          pageToken: options.pageToken,
          filter: options.filter,
          orderBy: options.orderBy,
        })
        printSuccess(withPagination({ ...data, attachments: data.attachments ?? [] }, pageSize), 'attachment.list')
      }
      catch (error) {
        fail(error, '列出附件失败')
      }
    })

  attachment
    .command('get <attachment>')
    .description('获取附件详情')
    .action(async (attachmentArg: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const data = await client.get<AttachmentRecord>(`/${normalizeAttachmentName(attachmentArg)}`)
        printSuccess(data, 'attachment.get')
      }
      catch (error) {
        fail(error, '获取附件失败')
      }
    })

  attachment
    .command('list-by-memo <memo>')
    .description('列出某条笔记的附件')
    .option('-n, --page-size <n>', '每页数量（1-1000，默认 50）', '50')
    .option('--page-token <token>', '续页令牌')
    .action(async (memoArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const pageSize = clampPageSize(options.pageSize)
        const data = await client.get<ListAttachmentsResponse>(`/${normalizeMemoName(memoArg)}/attachments`, {
          pageSize,
          pageToken: options.pageToken,
        })
        printSuccess(withPagination({ ...data, attachments: data.attachments ?? [] }, pageSize), 'attachment.list-by-memo')
      }
      catch (error) {
        fail(error, '列出笔记附件失败')
      }
    })

  attachment
    .command('upload <file>')
    .description('上传附件（base64 内联上传，适合中小文件）')
    .option('--memo <memo>', '关联笔记（memos/xxx 或纯 ID）')
    .option('--filename <name>', '自定义文件名（默认取本地文件名）')
    .option('--type <mime>', 'MIME 类型（默认按扩展名推断）')
    .option('--attachment-id <id>', '自定义附件 ID')
    .action(async (file: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const filePath = resolve(file)
        if (!existsSync(filePath)) {
          throw new Error(`文件不存在: ${filePath}`)
        }

        const bytes = readFileSync(filePath)
        const filename = options.filename || basename(filePath)
        const body: Record<string, unknown> = {
          filename,
          content: bytes.toString('base64'),
          type: options.type || guessMimeType(filename),
        }
        if (options.memo) {
          body.memo = normalizeMemoName(options.memo)
        }

        const data = await client.post<AttachmentRecord>(
          '/attachments',
          body,
          options.attachmentId ? { attachmentId: options.attachmentId } : undefined,
        )

        const name = data?.name || ''
        printSuccess(
          {
            ...data,
            permanentPath: name ? `${client.origin}/file/attachments/${name}/${filename}` : null,
            sizeBytes: bytes.byteLength,
          },
          'attachment.upload',
        )
      }
      catch (error) {
        fail(error, '上传附件失败')
      }
    })

  attachment
    .command('update <attachment>')
    .description('更新附件（文件名 / 关联笔记）')
    .option('--filename <name>', '新文件名')
    .option('--memo <memo>', '重新关联的笔记（memos/xxx 或纯 ID）')
    .action(async (attachmentArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const body: Record<string, unknown> = {}
        const masks: string[] = []
        if (options.filename) {
          body.filename = options.filename
          masks.push('filename')
        }
        if (options.memo) {
          body.memo = normalizeMemoName(options.memo)
          masks.push('memo')
        }
        if (!masks.length) {
          throw new Error('至少需要 --filename 或 --memo')
        }
        const data = await client.patch<AttachmentRecord>(
          `/${normalizeAttachmentName(attachmentArg)}`,
          body,
          { updateMask: masks.join(',') },
        )
        printSuccess(data, 'attachment.update')
      }
      catch (error) {
        fail(error, '更新附件失败')
      }
    })

  attachment
    .command('delete <attachment>')
    .description('删除附件')
    .action(async (attachmentArg: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const name = normalizeAttachmentName(attachmentArg)
        await client.delete(`/${name}`)
        printSuccess({ deleted: name }, 'attachment.delete')
      }
      catch (error) {
        fail(error, '删除附件失败')
      }
    })

  attachment
    .command('batch-delete <attachments...>')
    .description('批量删除附件（接受 attachments/xxx 或纯 ID，可多个）')
    .action(async (attachmentArgs: string[], _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const names = attachmentArgs.map(arg => normalizeAttachmentName(arg))
        await client.post('/attachments:batchDelete', { names })
        printSuccess({ deleted: names, count: names.length }, 'attachment.batch-delete')
      }
      catch (error) {
        fail(error, '批量删除附件失败')
      }
    })

  attachment
    .command('set-memo <memo>')
    .description('设置笔记的附件列表（整体覆盖）')
    .option('-a, --attachments <names>', '逗号分隔的附件名（attachments/xxx 或纯 ID）', '')
    .action(async (memoArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const names = String(options.attachments)
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)
          .map(item => normalizeAttachmentName(item))
        const data = await client.patch(`/${normalizeMemoName(memoArg)}/attachments`, {
          attachments: names.map(name => ({ name })),
        })
        printSuccess({ ...(data as object), attachments: names }, 'attachment.set-memo')
      }
      catch (error) {
        fail(error, '设置笔记附件失败')
      }
    })
}

/** 常见扩展名 → MIME；未识别时退回 octet-stream（与服务端默认一致）。 */
function guessMimeType(filename: string): string {
  const ext = extname(filename).toLowerCase()
  const map: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.csv': 'text/csv',
    '.html': 'text/html',
    '.zip': 'application/zip',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.wav': 'audio/wav',
    '.mov': 'video/quicktime',
  }
  return map[ext] || 'application/octet-stream'
}

export { shortId }
