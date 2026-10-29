import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTestMemo, deleteMemoQuietly, requireEnv, runCli, uniqueTag } from './helpers.js'

describe('memo 命令', () => {
  const created: string[] = []

  beforeAll(() => {
    requireEnv('MEMOS_BASE_URL')
    requireEnv('MEMOS_ACCESS_TOKEN')
  })

  afterAll(() => {
    for (const name of created) {
      deleteMemoQuietly(name)
    }
  })

  it('create / get / update / delete 全链路', () => {
    const tag = uniqueTag('memo')
    const name = createTestMemo(`测试笔记 ${tag}`)
    created.push(name)

    expect(name).toMatch(/^memos\//)

    const got = runCli(['memo', 'get', name])
    expect(got.code).toBe(0)
    expect(got.json.operation).toBe('memo.get')
    expect(got.json.data.content).toContain(tag)

    const updated = runCli(['memo', 'update', name, '--content', `更新后的内容 ${tag}`])
    expect(updated.code).toBe(0)
    expect(updated.json.operation).toBe('memo.update')
    expect(updated.json.data.content).toBe(`更新后的内容 ${tag}`)

    const deleted = runCli(['memo', 'delete', name])
    expect(deleted.code).toBe(0)
    expect(deleted.json.operation).toBe('memo.delete')

    const missing = runCli(['memo', 'get', name])
    expect(missing.code).toBe(1)
    expect(missing.json.success).toBe(false)
    expect(missing.json.code).toBe(5)

    created.pop()
  })

  it('接受不带 memos/ 前缀的纯 ID', () => {
    const name = createTestMemo(`短 ID 测试 ${uniqueTag('shortid')}`)
    created.push(name)
    const shortId = name.split('/').pop() as string

    const got = runCli(['memo', 'get', shortId])
    expect(got.code).toBe(0)
    expect(got.json.data.name).toBe(name)
  })

  it('pin / unpin 切换置顶状态', () => {
    const name = createTestMemo(`置顶测试 ${uniqueTag('pin')}`)
    created.push(name)

    const pinned = runCli(['memo', 'pin', name])
    expect(pinned.code).toBe(0)
    expect(pinned.json.operation).toBe('memo.pin')
    expect(pinned.json.data.pinned).toBe(true)

    const unpinned = runCli(['memo', 'unpin', name])
    expect(unpinned.code).toBe(0)
    expect(unpinned.json.data.pinned).toBe(false)
  })

  it('list 支持 pageSize 与游标分页信息', () => {
    const r = runCli(['memo', 'list', '-n', '2'])
    expect(r.code).toBe(0)
    expect(r.json.operation).toBe('memo.list')
    expect(Array.isArray(r.json.data.memos)).toBe(true)
    expect(r.json.data.memos.length).toBeLessThanOrEqual(2)
    expect(r.json.data.pagination.pageSize).toBe(2)
    expect(r.json.data.pagination).toHaveProperty('hasMore')
  })

  it('list --tag 用 filter 过滤', () => {
    const tag = uniqueTag('tagfilter')
    const name = createTestMemo(`带标签笔记 #${tag}`)
    created.push(name)

    const r = runCli(['memo', 'list', '--tag', tag, '-n', '10'])
    expect(r.code).toBe(0)
    const names = r.json.data.memos.map((m: { name: string }) => m.name)
    expect(names).toContain(name)
  })

  it('create 缺内容时报错退出', () => {
    const r = runCli(['memo', 'create'], { MEMOS_ACCESS_TOKEN: process.env.MEMOS_ACCESS_TOKEN })
    expect(r.code).toBe(1)
    expect(r.json.success).toBe(false)
  })

  it('update 无更新项时报错退出', () => {
    const name = createTestMemo(`空更新测试 ${uniqueTag('noop')}`)
    created.push(name)

    const r = runCli(['memo', 'update', name])
    expect(r.code).toBe(1)
    expect(r.json.success).toBe(false)
  })
})
