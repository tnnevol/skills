import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTestMemo, deleteMemoQuietly, requireEnv, runCli, uniqueTag } from './helpers.js'

describe('attachment / tag / space', () => {
  let memoName: string
  let tmpDir: string

  beforeAll(() => {
    requireEnv('MEMOS_BASE_URL')
    requireEnv('MEMOS_ACCESS_TOKEN')
    memoName = createTestMemo(`附件测试宿主 ${uniqueTag('attach')}`)
    tmpDir = mkdtempSync(join(tmpdir(), 'memos-cli-test-'))
  })

  afterAll(() => {
    deleteMemoQuietly(memoName)
    rmSync(tmpDir, { recursive: true, force: true })
  })

  it('attachment 上传、查询、改关联、删除', () => {
    const filePath = join(tmpDir, 'sample.txt')
    writeFileSync(filePath, 'hello memos cli\n', 'utf-8')

    const uploaded = runCli(['attachment', 'upload', filePath, '--memo', memoName])
    expect(uploaded.code).toBe(0)
    expect(uploaded.json.operation).toBe('attachment.upload')
    expect(uploaded.json.data.memo).toBe(memoName)
    expect(uploaded.json.data.permanentPath).toContain('/file/attachments/')
    const attachmentName = uploaded.json.data.name

    const got = runCli(['attachment', 'get', attachmentName])
    expect(got.code).toBe(0)
    expect(got.json.data.filename).toBe('sample.txt')

    const byMemo = runCli(['attachment', 'list-by-memo', memoName])
    expect(byMemo.code).toBe(0)
    expect(byMemo.json.data.attachments.map((a: { name: string }) => a.name)).toContain(attachmentName)

    const renamed = runCli(['attachment', 'update', attachmentName, '--filename', 'renamed.txt'])
    expect(renamed.code).toBe(0)
    expect(renamed.json.data.filename).toBe('renamed.txt')

    const deleted = runCli(['attachment', 'delete', attachmentName])
    expect(deleted.code).toBe(0)

    const missing = runCli(['attachment', 'get', attachmentName])
    expect(missing.code).toBe(1)
  })

  it('attachment batch-delete 支持多个 ID', () => {
    const names: string[] = []
    for (const fileName of ['a.txt', 'b.txt']) {
      const filePath = join(tmpDir, fileName)
      writeFileSync(filePath, fileName, 'utf-8')
      const uploaded = runCli(['attachment', 'upload', filePath, '--memo', memoName])
      expect(uploaded.code).toBe(0)
      names.push(uploaded.json.data.name)
    }

    const r = runCli(['attachment', 'batch-delete', ...names])
    expect(r.code).toBe(0)
    expect(r.json.data.count).toBe(2)
  })

  it('tag list 汇总标签并按次数排序', () => {
    const tag = uniqueTag('taglist')
    const extra = createTestMemo(`标签汇总 ${tag} #${tag}`)
    try {
      const r = runCli(['tag', 'list', '-n', '100', '--max-pages', '3'])
      expect(r.code).toBe(0)
      expect(r.json.operation).toBe('tag.list')
      expect(Array.isArray(r.json.data.tags)).toBe(true)
      expect(typeof r.json.data.total).toBe('number')
      expect(r.json.data.pagination).toHaveProperty('hasMore')
    }
    finally {
      deleteMemoQuietly(extra)
    }
  })

  it('tag memos 按标签列出笔记', () => {
    const tag = uniqueTag('tagmemos')
    const name = createTestMemo(`按标签查询 #${tag}`)
    try {
      const r = runCli(['tag', 'memos', tag, '-n', '20'])
      expect(r.code).toBe(0)
      expect(r.json.data.memos.map((m: { name: string }) => m.name)).toContain(name)
    }
    finally {
      deleteMemoQuietly(name)
    }
  })

  it('space 创建、更新、成员、邀请、删除', () => {
    const title = uniqueTag('space')
    const created = runCli(['space', 'create', '--title', title, '--emoji', '🧪'])
    expect(created.code).toBe(0)
    expect(created.json.operation).toBe('space.create')
    expect(created.json.data.title).toBe(title)
    const spaceName = created.json.data.name

    try {
      const got = runCli(['space', 'get', spaceName])
      expect(got.code).toBe(0)
      expect(got.json.data.name).toBe(spaceName)

      const updated = runCli(['space', 'update', spaceName, '--title', `${title}-v2`])
      expect(updated.code).toBe(0)
      expect(updated.json.data.title).toBe(`${title}-v2`)

      const members = runCli(['space', 'members', spaceName])
      expect(members.code).toBe(0)
      expect(Array.isArray(members.json.data.spaceMembers)).toBe(true)

      const invitations = runCli(['space', 'invitations', spaceName])
      expect(invitations.code).toBe(0)
      expect(Array.isArray(invitations.json.data.spaceInvitations)).toBe(true)
    }
    finally {
      const deleted = runCli(['space', 'delete', spaceName])
      expect(deleted.code).toBe(0)
    }
  })
})
