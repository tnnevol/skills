import { Command } from 'commander'
import { describe, expect, it } from 'vitest'
import { registerMemoCommand } from '../commands/memo.js'
import { DEFAULT_API_PATH, normalizeApiPath } from '../config.js'
import { normalizeName, shortId } from '../names.js'
import { withPagination } from '../output.js'
import { buildAttachmentPaths } from '../paths.js'

describe('names', () => {
  it('给纯 ID 补资源前缀', () => {
    expect(normalizeName('memos', 'abc123')).toBe('memos/abc123')
  })

  it('已有前缀时原样返回', () => {
    expect(normalizeName('memos', 'memos/abc123')).toBe('memos/abc123')
  })

  it('取多段名的最后一段', () => {
    expect(shortId('memos/abc/shares/xyz')).toBe('xyz')
    expect(shortId('memos/abc')).toBe('abc')
    expect(shortId('plain')).toBe('plain')
  })
})

describe('normalizeApiPath', () => {
  it('默认 /api/v1', () => {
    expect(normalizeApiPath(undefined)).toBe(DEFAULT_API_PATH)
    expect(normalizeApiPath('')).toBe(DEFAULT_API_PATH)
  })

  it('去尾斜杠并补前导斜杠', () => {
    expect(normalizeApiPath('/api/')).toBe('/api')
    expect(normalizeApiPath('api/v1/')).toBe('/api/v1')
  })
})

describe('buildAttachmentPaths', () => {
  const origin = 'https://memos.example.com'

  it('资源名已含 attachments 前缀，不再重复拼接', () => {
    const p = buildAttachmentPaths(origin, 'attachments/abc123', 'pic.png')
    expect(p.permanentPath).toBe('https://memos.example.com/file/attachments/abc123/pic.png')
    expect(p.relativePath).toBe('/file/attachments/abc123/pic.png')
  })

  it('相对路径不含 origin，供笔记正文使用', () => {
    const p = buildAttachmentPaths(origin, 'attachments/abc123', 'pic.png')
    expect(p.relativePath.startsWith('/file/')).toBe(true)
    expect(p.relativePath.includes('http')).toBe(false)
  })

  it('baseUrl 末尾多余的斜杠被去掉', () => {
    const p = buildAttachmentPaths('https://memos.example.com/', 'attachments/abc123', 'pic.png')
    expect(p.permanentPath).toBe('https://memos.example.com/file/attachments/abc123/pic.png')
  })
})

describe('withPagination', () => {
  it('有续页令牌时 hasMore 为 true', () => {
    const out = withPagination({ memos: [], nextPageToken: 'tok' }, 20)
    expect(out.pagination).toEqual({ pageSize: 20, nextPageToken: 'tok', hasMore: true })
  })

  it('无续页令牌时 hasMore 为 false', () => {
    const out = withPagination({ memos: [], nextPageToken: '' }, 20)
    expect(out.pagination.nextPageToken).toBeNull()
    expect(out.pagination.hasMore).toBe(false)
  })
})

describe('memo create 默认可见性', () => {
  it('默认 PROTECTED（对登录用户可见）', () => {
    const program = new Command()
    registerMemoCommand(program)
    const memo = program.commands.find(c => c.name() === 'memo')
    const create = memo?.commands.find(c => c.name() === 'create')
    const option = create?.options.find(o => o.long === '--visibility')
    expect(option?.defaultValue).toBe('PROTECTED')
  })
})
