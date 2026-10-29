import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTestMemo, deleteMemoQuietly, requireEnv, runCli, uniqueTag } from './helpers.js'

describe('comment / reaction / relation / share', () => {
  let memoName: string
  let targetName: string

  beforeAll(() => {
    requireEnv('MEMOS_BASE_URL')
    requireEnv('MEMOS_ACCESS_TOKEN')
    memoName = createTestMemo(`交互测试宿主 ${uniqueTag('host')}`)
    targetName = createTestMemo(`交互测试目标 ${uniqueTag('target')}`)
  })

  afterAll(() => {
    deleteMemoQuietly(memoName)
    deleteMemoQuietly(targetName)
  })

  it('comment 增删改查', () => {
    const created = runCli(['comment', 'create', memoName, '--content', '一条测试评论'])
    expect(created.code).toBe(0)
    expect(created.json.operation).toBe('comment.create')
    const commentName = created.json.data.name

    const listed = runCli(['comment', 'list', memoName])
    expect(listed.code).toBe(0)
    expect(listed.json.data.memos.map((m: { name: string }) => m.name)).toContain(commentName)

    const updated = runCli(['comment', 'update', commentName, '--content', '更新后的评论'])
    expect(updated.code).toBe(0)
    expect(updated.json.data.content).toBe('更新后的评论')

    const deleted = runCli(['comment', 'delete', commentName])
    expect(deleted.code).toBe(0)
  })

  it('reaction 添加、列举、移除', () => {
    const added = runCli(['reaction', 'add', memoName, '👍'])
    expect(added.code).toBe(0)
    expect(added.json.operation).toBe('reaction.add')
    const reactionName = added.json.data.name

    const listed = runCli(['reaction', 'list', memoName])
    expect(listed.code).toBe(0)
    expect(listed.json.data.reactions.map((r: { reactionType: string }) => r.reactionType)).toContain('👍')

    const removed = runCli(['reaction', 'remove', memoName, reactionName])
    expect(removed.code).toBe(0)

    const after = runCli(['reaction', 'list', memoName])
    expect(after.json.data.reactions.map((r: { name: string }) => r.name)).not.toContain(reactionName)
  })

  it('relation 建立、列举、解除', () => {
    const added = runCli(['relation', 'add', memoName, targetName])
    expect(added.code).toBe(0)
    expect(added.json.operation).toBe('relation.add')
    const related = added.json.data.relations.map((r: { relatedMemo?: { name?: string } }) => r.relatedMemo?.name)
    expect(related).toContain(targetName)

    const listed = runCli(['relation', 'list', memoName])
    expect(listed.code).toBe(0)
    expect(listed.json.data.relations.length).toBeGreaterThan(0)

    const removed = runCli(['relation', 'remove', memoName, targetName])
    expect(removed.code).toBe(0)
    const remaining = removed.json.data.relations.map((r: { relatedMemo?: { name?: string } }) => r.relatedMemo?.name)
    expect(remaining).not.toContain(targetName)
  })

  it('relation 拒绝自关联', () => {
    const r = runCli(['relation', 'add', memoName, memoName])
    expect(r.code).toBe(1)
    expect(r.json.success).toBe(false)
  })

  it('share 创建、列举、删除', () => {
    const created = runCli(['share', 'create', memoName])
    expect(created.code).toBe(0)
    expect(created.json.operation).toBe('share.create')
    const shareName = created.json.data.name
    const token = created.json.data.shareToken
    expect(token).toBeTruthy()
    expect(created.json.data.url).toContain(token)

    const listed = runCli(['share', 'list', memoName])
    expect(listed.code).toBe(0)
    const names = listed.json.data.memoShares.map((s: { name: string }) => s.name)
    expect(names).toContain(shareName)

    const fetched = runCli(['share', 'get', token])
    expect(fetched.code).toBe(0)
    expect(fetched.json.data.name).toBe(memoName)

    const deleted = runCli(['share', 'delete', memoName, shareName])
    expect(deleted.code).toBe(0)

    const after = runCli(['share', 'list', memoName])
    expect(after.json.data.memoShares.map((s: { name: string }) => s.name)).not.toContain(shareName)
  })
})
