import type { Command } from 'commander'
import { tagFilterExpr } from '../names.js'
import { printSuccess, withPagination } from '../output.js'
import { clampPageSize } from './memo.js'
import { fail, getClient } from './shared.js'

const LEADING_HASH_RE = /^#/

interface MemoRecord {
  content?: string
  tags?: string[]
  name?: string
}

interface ListMemosResponse {
  memos?: MemoRecord[]
  nextPageToken?: string
}

export function registerTagCommand(program: Command): void {
  const tag = program.command('tag').description('查看标签与标签使用情况')

  tag
    .command('list')
    .description('汇总标签（扫描笔记内容里的 #标签，并按出现次数排序）')
    .option('-n, --page-size <n>', '每次拉取的笔记数量（1-1000，默认 200）', '200')
    .option('--max-pages <n>', '最多拉取页数，默认 10（避免全量扫描）', '10')
    .option('--filter <expr>', '笔记过滤表达式')
    .action(async (options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const pageSize = clampPageSize(options.pageSize, 200)
        const maxPages = Math.max(1, Number.parseInt(String(options.maxPages ?? 10), 10) || 10)

        const counts = new Map<string, number>()
        let scanned = 0
        let pageToken: string | undefined
        let pages = 0

        while (pages < maxPages) {
          const data: ListMemosResponse = await client.get<ListMemosResponse>('/memos', {
            pageSize,
            pageToken,
            filter: options.filter,
          })
          const memos = data.memos ?? []
          scanned += memos.length
          pages += 1

          for (const memo of memos) {
            for (const raw of memo.tags ?? []) {
              const name = String(raw).replace(LEADING_HASH_RE, '')
              if (!name) {
                continue
              }
              counts.set(name, (counts.get(name) ?? 0) + 1)
            }
          }

          pageToken = data.nextPageToken || undefined
          if (!pageToken || memos.length === 0) {
            break
          }
        }

        const tags = Array.from(counts.entries(), ([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

        printSuccess(
          {
            tags,
            total: tags.length,
            scanned,
            pages,
            truncated: Boolean(pageToken),
            pagination: {
              pageSize,
              nextPageToken: pageToken || null,
              hasMore: Boolean(pageToken),
            },
          },
          'tag.list',
        )
      }
      catch (error) {
        fail(error, '汇总标签失败')
      }
    })

  tag
    .command('memos <tag>')
    .description('列出带某个标签的笔记')
    .option('-n, --page-size <n>', '每页数量（1-1000，默认 50）', '50')
    .option('--page-token <token>', '续页令牌')
    .option('--full', '返回完整笔记字段')
    .action(async (tagArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const pageSize = clampPageSize(options.pageSize)
        const data = await client.get<ListMemosResponse>('/memos', {
          pageSize,
          pageToken: options.pageToken,
          filter: tagFilterExpr(tagArg),
        })
        printSuccess(
          withPagination({ ...data, memos: data.memos ?? [] }, pageSize),
          'tag.memos',
        )
      }
      catch (error) {
        fail(error, '按标签列笔记失败')
      }
    })
}
