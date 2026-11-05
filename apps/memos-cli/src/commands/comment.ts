import type { Command } from 'commander'
import { Buffer } from 'node:buffer'
import { normalizeMemoName } from '../names.js'
import { printSuccess, withPagination } from '../output.js'
import { clampPageSize } from './memo.js'
import { fail, getClient } from './shared.js'

interface CommentRecord {
  name: string
  content: string
  creator?: string
  createTime?: string
  visibility?: string
  [key: string]: unknown
}

interface ListCommentsResponse {
  memos?: CommentRecord[]
  nextPageToken?: string
}

export function registerCommentCommand(program: Command): void {
  const comment = program.command('comment').description('管理笔记评论')

  comment
    .command('list <memo>')
    .description('列出某条笔记的评论')
    .option('-n, --page-size <n>', '每页数量（1-1000，默认 50）', '50')
    .option('--page-token <token>', '续页令牌')
    .option('--order-by <expr>', '排序表达式')
    .action(async (memoArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const pageSize = clampPageSize(options.pageSize)
        const data = await client.get<ListCommentsResponse>(`/${normalizeMemoName(memoArg)}/comments`, {
          pageSize,
          pageToken: options.pageToken,
          orderBy: options.orderBy,
        })
        printSuccess(withPagination({ ...data, memos: data.memos ?? [] }, pageSize), 'comment.list')
      }
      catch (error) {
        fail(error, '列出评论失败')
      }
    })

  comment
    .command('create <memo>')
    .description('给笔记添加评论')
    .option('-c, --content <content>', '评论内容；省略时从 stdin 读取')
    .option('--content-file <path>', '从文件读取评论内容')
    .option('--visibility <visibility>', '可见性：PRIVATE | PROTECTED | PUBLIC', 'PRIVATE')
    .option('--comment-id <id>', '自定义评论 ID')
    .action(async (memoArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const content = await resolveText(options)
        const data = await client.post<CommentRecord>(
          `/${normalizeMemoName(memoArg)}/comments`,
          { content, visibility: String(options.visibility).toUpperCase() },
          options.commentId ? { commentId: options.commentId } : undefined,
        )
        printSuccess(data, 'comment.create')
      }
      catch (error) {
        fail(error, '添加评论失败')
      }
    })

  comment
    .command('update <comment>')
    .description('更新评论内容（评论本身也是一条 memo）')
    .option('-c, --content <content>', '新评论内容；省略时从 stdin 读取')
    .option('--content-file <path>', '从文件读取新内容')
    .option('--visibility <visibility>', '可见性：PRIVATE | PROTECTED | PUBLIC')
    .action(async (commentArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const body: Record<string, unknown> = {}
        const masks: string[] = []
        if (options.content !== undefined || options.contentFile) {
          body.content = await resolveText(options)
          masks.push('content')
        }
        if (options.visibility) {
          body.visibility = String(options.visibility).toUpperCase()
          masks.push('visibility')
        }
        if (!masks.length) {
          throw new Error('至少需要 --content 或 --visibility')
        }
        const data = await client.patch<CommentRecord>(
          `/${normalizeMemoName(commentArg)}`,
          body,
          { updateMask: masks.join(',') },
        )
        printSuccess(data, 'comment.update')
      }
      catch (error) {
        fail(error, '更新评论失败')
      }
    })

  comment
    .command('delete <comment>')
    .description('删除评论（评论本身也是一条 memo）')
    .action(async (commentArg: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        await client.delete(`/${normalizeMemoName(commentArg)}`)
        printSuccess({ deleted: normalizeMemoName(commentArg) }, 'comment.delete')
      }
      catch (error) {
        fail(error, '删除评论失败')
      }
    })
}

async function resolveText(options: { content?: string, contentFile?: string }): Promise<string> {
  if (options.content !== undefined) {
    return options.content
  }
  if (options.contentFile) {
    const { readFileSync } = await import('node:fs')
    return readFileSync(options.contentFile, 'utf-8')
  }

  const { stdin } = await import('node:process')
  if (stdin.isTTY) {
    throw new Error('缺少评论内容，请用 --content 指定（或通过管道/--content-file 传入）')
  }
  const chunks: Buffer[] = []
  for await (const chunk of stdin) {
    chunks.push(chunk as Buffer)
  }
  const content = Buffer.concat(chunks).toString('utf-8').trim()
  if (!content) {
    throw new Error('评论内容为空')
  }
  return content
}
