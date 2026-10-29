import { describe, expect, it } from 'vitest'
import { DEFAULT_API_PATH, normalizeApiPath } from '../config.js'
import { normalizeName, shortId } from '../names.js'
import { withPagination } from '../output.js'

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
