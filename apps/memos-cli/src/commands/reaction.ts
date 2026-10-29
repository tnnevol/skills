import type { Command } from 'commander'
import { normalizeMemoName } from '../names.js'
import { printSuccess, withPagination } from '../output.js'
import { clampPageSize } from './memo.js'
import { fail, getClient } from './shared.js'

interface ReactionRecord {
  name: string
  reactionType: string
  creator?: string
  createTime?: string
}

interface ListReactionsResponse {
  reactions?: ReactionRecord[]
  nextPageToken?: string
}

export function registerReactionCommand(program: Command): void {
  const reaction = program.command('reaction').description('管理笔记表情回应')

  reaction
    .command('list <memo>')
    .description('列出笔记的表情回应')
    .option('-n, --page-size <n>', '每页数量（1-1000，默认 50）', '50')
    .option('--page-token <token>', '续页令牌')
    .action(async (memoArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const pageSize = clampPageSize(options.pageSize)
        const data = await client.get<ListReactionsResponse>(`/${normalizeMemoName(memoArg)}/reactions`, {
          pageSize,
          pageToken: options.pageToken,
        })
        printSuccess(withPagination({ ...data, reactions: data.reactions ?? [] }, pageSize), 'reaction.list')
      }
      catch (error) {
        fail(error, '列出表情失败')
      }
    })

  reaction
    .command('add <memo> <emoji>')
    .description('给笔记添加表情（同表情已存在时为覆盖更新）')
    .action(async (memoArg: string, emoji: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const name = normalizeMemoName(memoArg)
        const data = await client.post<ReactionRecord>(`/${name}/reactions`, {
          reaction: {
            reactionType: emoji,
            contentId: name,
          },
        })
        printSuccess(data, 'reaction.add')
      }
      catch (error) {
        fail(error, '添加表情失败')
      }
    })

  reaction
    .command('remove <memo> <reaction>')
    .description('移除表情（reaction 用 reaction list 返回的 name，或纯 ID）')
    .action(async (memoArg: string, reactionArg: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const name = normalizeMemoName(memoArg)
        const reactionName = reactionArg.includes('/') ? reactionArg : `${name}/reactions/${reactionArg}`
        await client.delete(`/${reactionName}`)
        printSuccess({ removed: reactionName }, 'reaction.remove')
      }
      catch (error) {
        fail(error, '移除表情失败')
      }
    })
}
