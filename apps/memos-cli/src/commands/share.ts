import type { Command } from 'commander'
import { normalizeMemoName, shortId } from '../names.js'
import { printSuccess } from '../output.js'
import { fail, getClient } from './shared.js'

interface MemoShare {
  name: string
  createTime?: string
  expireTime?: string
}

interface ListSharesResponse {
  /** 服务端字段名是 memoShares（不是 shares），见 ListMemoSharesResponse */
  memoShares?: MemoShare[]
}

export function registerShareCommand(program: Command): void {
  const share = program.command('share').description('管理笔记分享链接')

  share
    .command('list <memo>')
    .description('列出笔记的分享链接')
    .action(async (memoArg: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const data = await client.get<ListSharesResponse>(`/${normalizeMemoName(memoArg)}/shares`)
        printSuccess({ memoShares: data.memoShares ?? [] }, 'share.list')
      }
      catch (error) {
        fail(error, '列出分享失败')
      }
    })

  share
    .command('create <memo>')
    .description('创建分享链接')
    .option('--expire-time <rfc3339>', '过期时间（RFC3339，如 2027-01-01T00:00:00Z）')
    .action(async (memoArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const body: Record<string, unknown> = {}
        if (options.expireTime) {
          body.expireTime = options.expireTime
        }
        const data = await client.post<MemoShare>(`/${normalizeMemoName(memoArg)}/shares`, body)
        const token = shortId(data?.name || '')
        printSuccess(
          {
            ...data,
            shareToken: token || null,
            url: token ? `${client.origin}/memos/shares/${token}` : null,
          },
          'share.create',
        )
      }
      catch (error) {
        fail(error, '创建分享失败')
      }
    })

  share
    .command('delete <memo> <share>')
    .description('撤销分享链接（share 用 share list 返回的 name，或纯 ID）')
    .action(async (memoArg: string, shareArg: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const memoName = normalizeMemoName(memoArg)
        const shareName = shareArg.includes('/') ? shareArg : `${memoName}/shares/${shareArg}`
        await client.delete(`/${shareName}`)
        printSuccess({ deleted: shareName }, 'share.delete')
      }
      catch (error) {
        fail(error, '撤销分享失败')
      }
    })

  share
    .command('get <token>')
    .description('通过分享 token 获取公开笔记（匿名可用）')
    .action(async (token: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const data = await client.get(`/shares/${token}/memo`)
        printSuccess(data, 'share.get')
      }
      catch (error) {
        fail(error, '获取分享内容失败')
      }
    })
}
