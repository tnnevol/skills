import type { Command } from 'commander'
import type { MemosClient } from '../client.js'
import { Buffer } from 'node:buffer'
import { normalizeMemoName, shortId, tagFilterExpr } from '../names.js'
import { printSuccess, withPagination } from '../output.js'
import { fail, getClient, isRequired } from './shared.js'

interface MemoRecord {
  name: string
  content: string
  visibility?: string
  tags?: string[]
  pinned?: boolean
  createTime?: string
  updateTime?: string
  [key: string]: unknown
}

interface ListMemosResponse {
  memos?: MemoRecord[]
  nextPageToken?: string
}

/** 列表输出瘦身：保留常用字段，避免大 note 刷屏；--full 时原样返回。 */
function shapeMemos(memos: MemoRecord[], full: boolean): MemoRecord[] {
  if (full) {
    return memos
  }
  return memos.map(memo => ({
    name: memo.name,
    content: memo.content,
    snippet: memo.snippet,
    visibility: memo.visibility,
    tags: memo.tags,
    pinned: memo.pinned,
    createTime: memo.createTime,
    updateTime: memo.updateTime,
    attachments: memo.attachments,
    relations: memo.relations,
    reactions: memo.reactions,
  })) as MemoRecord[]
}

export function registerMemoCommand(program: Command): void {
  const memo = program.command('memo').description('管理笔记')

  memo
    .command('list')
    .description('列出笔记')
    .option('-n, --page-size <n>', '每页数量（1-1000，默认 50）', '50')
    .option('--page-token <token>', '续页令牌（上一页返回的 pagination.nextPageToken）')
    .option('--state <state>', '笔记状态：NORMAL 或 ARCHIVED')
    .option('--order-by <expr>', '排序，如 "create_time desc"、"pinned desc, create_time desc"')
    .option('--filter <expr>', 'CEL 过滤表达式，如 \'content.contains("todo") && pinned == true\'（标签用 --tag）')
    .option('--tag <tag>', '按标签过滤（内部转成 tags == ["tag"] 的 filter）')
    .option('--show-deleted', '包含已删除的笔记')
    .option('--full', '返回完整字段（含 property/location 等）')
    .action(async (options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const pageSize = clampPageSize(options.pageSize)
        let filter: string | undefined = options.filter
        if (options.tag) {
          const tagFilter = tagFilterExpr(options.tag)
          filter = filter ? `(${filter}) && ${tagFilter}` : tagFilter
        }

        const data = await client.get<ListMemosResponse>('/memos', {
          pageSize,
          pageToken: options.pageToken,
          state: options.state,
          orderBy: options.orderBy,
          filter,
          showDeleted: options.showDeleted === true,
        })

        printSuccess(
          withPagination({ ...data, memos: shapeMemos(data.memos ?? [], options.full === true) }, pageSize),
          'memo.list',
        )
      }
      catch (error) {
        fail(error, '列出笔记失败')
      }
    })

  memo
    .command('get <memo>')
    .description('获取单条笔记（接受 memos/xxx 或纯 ID）')
    .action(async (memoArg: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const data = await client.get<MemoRecord>(`/${normalizeMemoName(memoArg)}`)
        printSuccess(data, 'memo.get')
      }
      catch (error) {
        fail(error, '获取笔记失败')
      }
    })

  memo
    .command('create')
    .description('创建笔记')
    .option('-c, --content <content>', '笔记内容（Markdown）；省略时从 stdin 读取')
    .option('--content-file <path>', '从文件读取笔记内容')
    .option('--visibility <visibility>', '可见性：PRIVATE | PROTECTED | PUBLIC', 'PRIVATE')
    .option('--memo-id <id>', '自定义笔记 ID')
    .option('--space <space>', '所属空间（spaces/xxx 或纯 ID）')
    .option('--pinned', '创建后置顶')
    .action(async (options, cmd: Command) => {
      try {
        const content = await resolveContent(options)
        const client = getClient(cmd)
        const body: Record<string, unknown> = {
          content,
          visibility: String(options.visibility).toUpperCase(),
        }
        if (options.pinned) {
          body.pinned = true
        }
        if (options.space) {
          body.space = options.space.includes('/') ? options.space : `spaces/${options.space}`
        }

        const data = await client.post<MemoRecord>(
          '/memos',
          body,
          options.memoId ? { memoId: options.memoId } : undefined,
        )
        printSuccess(data, 'memo.create')
      }
      catch (error) {
        fail(error, '创建笔记失败')
      }
    })

  memo
    .command('update <memo>')
    .description('更新笔记内容或可见性')
    .option('-c, --content <content>', '新的笔记内容；省略时从 stdin 读取')
    .option('--content-file <path>', '从文件读取新内容')
    .option('--visibility <visibility>', '可见性：PRIVATE | PROTECTED | PUBLIC')
    .action(async (memoArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const name = normalizeMemoName(memoArg)
        const body: Record<string, unknown> = {}
        const masks: string[] = []

        if (options.content !== undefined || options.contentFile) {
          body.content = await resolveContent(options)
          masks.push('content')
        }
        if (options.visibility) {
          body.visibility = String(options.visibility).toUpperCase()
          masks.push('visibility')
        }
        if (!masks.length) {
          isRequired(undefined, 'memo update <memo> --content "新内容" 或 --visibility PUBLIC')
        }

        const data = await client.patch<MemoRecord>(`/${name}`, body, { updateMask: masks.join(',') })
        printSuccess(data, 'memo.update')
      }
      catch (error) {
        fail(error, '更新笔记失败')
      }
    })

  memo
    .command('delete <memo>')
    .description('删除笔记')
    .option('--force', '强制删除（即使存在关联数据）')
    .action(async (memoArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        await client.delete(`/${normalizeMemoName(memoArg)}`, options.force ? { force: true } : undefined)
        printSuccess({ deleted: normalizeMemoName(memoArg) }, 'memo.delete')
      }
      catch (error) {
        fail(error, '删除笔记失败')
      }
    })

  memo
    .command('pin <memo>')
    .description('置顶笔记')
    .action(async (memoArg: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const data = await client.patch<MemoRecord>(`/${normalizeMemoName(memoArg)}`, { pinned: true }, { updateMask: 'pinned' })
        printSuccess(data, 'memo.pin')
      }
      catch (error) {
        fail(error, '置顶笔记失败')
      }
    })

  memo
    .command('unpin <memo>')
    .description('取消置顶')
    .action(async (memoArg: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const data = await client.patch<MemoRecord>(`/${normalizeMemoName(memoArg)}`, { pinned: false }, { updateMask: 'pinned' })
        printSuccess(data, 'memo.unpin')
      }
      catch (error) {
        fail(error, '取消置顶失败')
      }
    })
}

export function clampPageSize(value: string | number | undefined, fallback = 50): number {
  const parsed = Number.parseInt(String(value ?? fallback), 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }
  return Math.min(parsed, 1000)
}

/** 内容来源：--content > --content-file > stdin（管道输入）。 */
async function resolveContent(options: { content?: string, contentFile?: string }): Promise<string> {
  if (options.content !== undefined) {
    return options.content
  }
  if (options.contentFile) {
    const { readFileSync } = await import('node:fs')
    return readFileSync(options.contentFile, 'utf-8')
  }

  const { stdin } = await import('node:process')
  if (stdin.isTTY) {
    isRequired(undefined, 'memo create --content "内容"（或通过管道/--content-file 传入）')
  }

  const chunks: Buffer[] = []
  for await (const chunk of stdin) {
    chunks.push(chunk as Buffer)
  }
  const content = Buffer.concat(chunks).toString('utf-8').trim()
  if (!content) {
    isRequired(undefined, 'memo create --content "内容"（stdin 为空）')
  }
  return content
}

/** 供其它命令复用：取一条笔记，判断是否存在。 */
export async function getMemoOrFail(client: MemosClient, memoArg: string): Promise<MemoRecord> {
  const name = normalizeMemoName(memoArg)
  return client.get<MemoRecord>(`/${name}`)
}

export { shortId }
