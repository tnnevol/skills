import type { Command } from 'commander'
import { normalizeSpaceName } from '../names.js'
import { printSuccess, withPagination } from '../output.js'
import { clampPageSize } from './memo.js'
import { fail, getClient } from './shared.js'

interface SpaceRecord {
  name: string
  title?: string
  description?: string
  currentUserRole?: string
  memberCount?: number
  [key: string]: unknown
}

interface ListSpacesResponse {
  spaces?: SpaceRecord[]
  nextPageToken?: string
}

interface SpaceMemberRecord {
  name: string
  user?: string
  role?: string
}

interface SpaceInvitationRecord {
  name: string
  invitee?: string
  role?: string
}

export function registerSpaceCommand(program: Command): void {
  const space = program.command('space').description('管理空间（Space）')

  space
    .command('list')
    .description('列出当前用户可见的空间')
    .option('-n, --page-size <n>', '每页数量（1-1000，默认 50）', '50')
    .option('--page-token <token>', '续页令牌')
    .action(async (options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const pageSize = clampPageSize(options.pageSize)
        const data = await client.get<ListSpacesResponse>('/spaces', {
          pageSize,
          pageToken: options.pageToken,
        })
        printSuccess(withPagination({ ...data, spaces: data.spaces ?? [] }, pageSize), 'space.list')
      }
      catch (error) {
        fail(error, '列出空间失败')
      }
    })

  space
    .command('get <space>')
    .description('获取空间详情')
    .action(async (spaceArg: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const data = await client.get<SpaceRecord>(`/${normalizeSpaceName(spaceArg)}`)
        printSuccess(data, 'space.get')
      }
      catch (error) {
        fail(error, '获取空间失败')
      }
    })

  space
    .command('create')
    .description('创建空间')
    .requiredOption('--title <title>', '空间标题')
    .option('--description <text>', '空间描述')
    .option('--emoji <emoji>', '空间图标 emoji')
    .option('--lucide <name>', '空间图标 lucide 名称')
    .option('--space-id <id>', '自定义空间 ID')
    .action(async (options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const body: Record<string, unknown> = { title: options.title }
        if (options.description) {
          body.description = options.description
        }
        if (options.emoji || options.lucide) {
          body.icon = {
            ...(options.emoji ? { emoji: options.emoji } : {}),
            ...(options.lucide ? { lucide: options.lucide } : {}),
          }
        }
        const data = await client.post<SpaceRecord>(
          '/spaces',
          body,
          options.spaceId ? { spaceId: options.spaceId } : undefined,
        )
        printSuccess(data, 'space.create')
      }
      catch (error) {
        fail(error, '创建空间失败')
      }
    })

  space
    .command('update <space>')
    .description('更新空间标题/描述/图标')
    .option('--title <title>', '新标题')
    .option('--description <text>', '新描述')
    .option('--emoji <emoji>', '新图标 emoji')
    .option('--lucide <name>', '新图标 lucide 名称')
    .action(async (spaceArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const body: Record<string, unknown> = {}
        const masks: string[] = []
        if (options.title) {
          body.title = options.title
          masks.push('title')
        }
        if (options.description !== undefined) {
          body.description = options.description
          masks.push('description')
        }
        if (options.emoji || options.lucide) {
          body.icon = {
            ...(options.emoji ? { emoji: options.emoji } : {}),
            ...(options.lucide ? { lucide: options.lucide } : {}),
          }
          masks.push('icon')
        }
        if (!masks.length) {
          throw new Error('至少需要一个更新项：--title / --description / --emoji / --lucide')
        }
        const data = await client.patch<SpaceRecord>(
          `/${normalizeSpaceName(spaceArg)}`,
          body,
          { updateMask: masks.join(',') },
        )
        printSuccess(data, 'space.update')
      }
      catch (error) {
        fail(error, '更新空间失败')
      }
    })

  space
    .command('delete <space>')
    .description('删除空间')
    .action(async (spaceArg: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const name = normalizeSpaceName(spaceArg)
        await client.delete(`/${name}`)
        printSuccess({ deleted: name }, 'space.delete')
      }
      catch (error) {
        fail(error, '删除空间失败')
      }
    })

  // --- 成员 ---

  space
    .command('members <space>')
    .description('列出空间成员')
    .option('-n, --page-size <n>', '每页数量（1-1000，默认 50）', '50')
    .option('--page-token <token>', '续页令牌')
    .action(async (spaceArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const pageSize = clampPageSize(options.pageSize)
        const data = await client.get<{ spaceMembers?: SpaceMemberRecord[], nextPageToken?: string }>(
          `/${normalizeSpaceName(spaceArg)}/members`,
          { pageSize, pageToken: options.pageToken },
        )
        printSuccess(
          withPagination({ ...data, spaceMembers: data.spaceMembers ?? [] }, pageSize),
          'space.members',
        )
      }
      catch (error) {
        fail(error, '列出空间成员失败')
      }
    })

  space
    .command('member-update <space> <member>')
    .description('修改空间成员角色')
    .requiredOption('--role <role>', '新角色：OWNER | ADMIN | MEMBER 等（以实例枚举为准）')
    .action(async (spaceArg: string, memberArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const spaceName = normalizeSpaceName(spaceArg)
        const memberName = memberArg.includes('/') ? memberArg : `${spaceName}/members/${memberArg}`
        const data = await client.patch<SpaceMemberRecord>(
          `/${memberName}`,
          { role: String(options.role).toUpperCase() },
          { updateMask: 'role' },
        )
        printSuccess(data, 'space.member-update')
      }
      catch (error) {
        fail(error, '修改空间成员失败')
      }
    })

  space
    .command('member-remove <space> <member>')
    .description('移除空间成员')
    .action(async (spaceArg: string, memberArg: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const spaceName = normalizeSpaceName(spaceArg)
        const memberName = memberArg.includes('/') ? memberArg : `${spaceName}/members/${memberArg}`
        await client.delete(`/${memberName}`)
        printSuccess({ removed: memberName }, 'space.member-remove')
      }
      catch (error) {
        fail(error, '移除空间成员失败')
      }
    })

  // --- 邀请 ---

  space
    .command('invitations <space>')
    .description('列出空间邀请')
    .option('-n, --page-size <n>', '每页数量（1-1000，默认 50）', '50')
    .option('--page-token <token>', '续页令牌')
    .action(async (spaceArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const pageSize = clampPageSize(options.pageSize)
        const data = await client.get<{ spaceInvitations?: SpaceInvitationRecord[], nextPageToken?: string }>(
          `/${normalizeSpaceName(spaceArg)}/invitations`,
          { pageSize, pageToken: options.pageToken },
        )
        printSuccess(
          withPagination({ ...data, spaceInvitations: data.spaceInvitations ?? [] }, pageSize),
          'space.invitations',
        )
      }
      catch (error) {
        fail(error, '列出空间邀请失败')
      }
    })

  space
    .command('invite <space>')
    .description('邀请用户加入空间')
    .requiredOption('--invitee <user>', '被邀请用户（users/xxx 或纯用户名）')
    .option('--role <role>', '邀请角色，默认 MEMBER', 'MEMBER')
    .option('--invitation-id <id>', '自定义邀请 ID')
    .action(async (spaceArg: string, options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const invitee = options.invitee.includes('/') ? options.invitee : `users/${options.invitee}`
        const data = await client.post<SpaceInvitationRecord>(
          `/${normalizeSpaceName(spaceArg)}/invitations`,
          { invitee, role: String(options.role).toUpperCase() },
          options.invitationId ? { invitationId: options.invitationId } : undefined,
        )
        printSuccess(data, 'space.invite')
      }
      catch (error) {
        fail(error, '邀请用户失败')
      }
    })

  space
    .command('invitation-revoke <space> <invitation>')
    .description('撤销空间邀请')
    .action(async (spaceArg: string, invitationArg: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const spaceName = normalizeSpaceName(spaceArg)
        const invitationName = invitationArg.includes('/')
          ? invitationArg
          : `${spaceName}/invitations/${invitationArg}`
        await client.delete(`/${invitationName}`)
        printSuccess({ revoked: invitationName }, 'space.invitation-revoke')
      }
      catch (error) {
        fail(error, '撤销邀请失败')
      }
    })

  space
    .command('invitation-accept <space> <invitation>')
    .description('接受空间邀请')
    .action(async (spaceArg: string, invitationArg: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const spaceName = normalizeSpaceName(spaceArg)
        const invitationName = invitationArg.includes('/')
          ? invitationArg
          : `${spaceName}/invitations/${invitationArg}`
        const data = await client.post(`/${invitationName}:accept`, {})
        printSuccess(data ?? { accepted: invitationName }, 'space.invitation-accept')
      }
      catch (error) {
        fail(error, '接受邀请失败')
      }
    })

  space
    .command('invitation-decline <space> <invitation>')
    .description('拒绝空间邀请')
    .action(async (spaceArg: string, invitationArg: string, _options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const spaceName = normalizeSpaceName(spaceArg)
        const invitationName = invitationArg.includes('/')
          ? invitationArg
          : `${spaceName}/invitations/${invitationArg}`
        const data = await client.post(`/${invitationName}:decline`, {})
        printSuccess(data ?? { declined: invitationName }, 'space.invitation-decline')
      }
      catch (error) {
        fail(error, '拒绝邀请失败')
      }
    })
}
