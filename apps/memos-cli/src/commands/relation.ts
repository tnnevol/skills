import type { Command } from 'commander'
import { normalizeMemoName } from '../names.js'
import { printSuccess, withPagination } from '../output.js'
import { clampPageSize } from './memo.js'
import { fail, getClient } from './shared.js'

interface MemoRelation {
  memo?: { name?: string }
  relatedMemo?: { name?: string }
  type?: string
}

interface ListRelationsResponse {
  relations?: MemoRelation[]
  nextPageToken?: string
}

const RELATION_TYPES = ['REFERENCE', 'COMMENT', 'PARENT'] as const

function normalizeRelation(relation: MemoRelation): MemoRelation {
  return {
    memo: { name: relation.memo?.name },
    relatedMemo: { name: relation.relatedMemo?.name },
    type: relation.type || 'REFERENCE',
  }
}

/** SetMemoRelations 是整体覆盖语义，增删都要先取全量再回写。 */
async function fetchRelations(client: ReturnType<typeof getClient>, memoName: string): Promise<MemoRelation[]> {
  const collected: MemoRelation[] = []
  let pageToken: string | undefined
  do {
    const data = await client.get<ListRelationsResponse>(`/${memoName}/relations`, {
      pageSize: 1000,
      pageToken,
    })
    collected.push(...(data.relations ?? []))
    pageToken = data.nextPageToken || undefined
  } while (pageToken)
  return collected
}

export function registerRelationCommand(program: Command): void {
  const relation = program.command('relation').description('管理笔记关联')

  relation
    .command('list <memo>')
    .description('列出笔记的关联')
    .option('-n, --page-size <n>', '每页数量（1-1000，默认 50）', '50')
    .option('--page-token <token>', '续页令牌')
    .action(async (memoArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const pageSize = clampPageSize(options.pageSize)
        const data = await client.get<ListRelationsResponse>(`/${normalizeMemoName(memoArg)}/relations`, {
          pageSize,
          pageToken: options.pageToken,
        })
        printSuccess(withPagination({ ...data, relations: data.relations ?? [] }, pageSize), 'relation.list')
      }
      catch (error) {
        fail(error, '列出关联失败')
      }
    })

  relation
    .command('add <memo> <related>')
    .description('建立笔记关联（默认 REFERENCE）')
    .option('--type <type>', `关联类型：${RELATION_TYPES.join(' | ')}`, 'REFERENCE')
    .action(async (memoArg: string, relatedArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const memoName = normalizeMemoName(memoArg)
        const relatedName = normalizeMemoName(relatedArg)
        const type = String(options.type).toUpperCase()

        if (memoName === relatedName) {
          throw new Error('不能把笔记关联到自身')
        }

        const existing = await fetchRelations(client, memoName)
        const duplicated = existing.some(
          rel => rel.relatedMemo?.name === relatedName && rel.type === type,
        )
        if (duplicated) {
          printSuccess({ relations: existing, changed: false, reason: '关联已存在' }, 'relation.add')
          return
        }

        const next = [...existing.map(normalizeRelation), normalizeRelation({ memo: { name: memoName }, relatedMemo: { name: relatedName }, type })]
        const data = await client.patch<ListRelationsResponse>(`/${memoName}/relations`, { relations: next })
        printSuccess({ ...data, relations: data.relations ?? next }, 'relation.add')
      }
      catch (error) {
        fail(error, '建立关联失败')
      }
    })

  relation
    .command('remove <memo> <related>')
    .description('解除笔记关联')
    .option('--type <type>', '只解除指定类型；省略则解除与目标笔记的全部关联')
    .action(async (memoArg: string, relatedArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const memoName = normalizeMemoName(memoArg)
        const relatedName = normalizeMemoName(relatedArg)
        const type = options.type ? String(options.type).toUpperCase() : undefined

        const existing = await fetchRelations(client, memoName)
        const next = existing.filter((rel) => {
          const sameTarget = rel.relatedMemo?.name === relatedName
          if (!sameTarget) {
            return true
          }
          return type ? rel.type !== type : false
        })

        if (next.length === existing.length) {
          printSuccess({ relations: existing, changed: false, reason: '未找到匹配的关联' }, 'relation.remove')
          return
        }

        const data = await client.patch<ListRelationsResponse>(
          `/${memoName}/relations`,
          { relations: next.map(normalizeRelation) },
        )
        printSuccess({ ...data, relations: data.relations ?? next }, 'relation.remove')
      }
      catch (error) {
        fail(error, '解除关联失败')
      }
    })
}
