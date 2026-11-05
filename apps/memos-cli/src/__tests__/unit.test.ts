import { describe, expect, it } from 'vitest'
import { shouldFallbackApiPath } from '../client.js'
import { API_PATH_FALLBACK, DEFAULT_API_PATH, normalizeApiPath, REMOVED_V1_HINT } from '../config.js'
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

describe('shouldFallbackApiPath', () => {
  const goneMessage = `${REMOVED_V1_HINT}. Use /api/... for REST`

  it('默认前缀遇到 410 且提示 v1 已移除时降级', () => {
    expect(shouldFallbackApiPath({
      httpStatus: 410,
      message: goneMessage,
      apiPath: DEFAULT_API_PATH,
      apiPathExplicit: false,
    })).toBe(true)
  })

  it('用户显式指定过 apiPath 时不覆盖', () => {
    expect(shouldFallbackApiPath({
      httpStatus: 410,
      message: goneMessage,
      apiPath: DEFAULT_API_PATH,
      apiPathExplicit: true,
    })).toBe(false)
  })

  it('已经在 /api 上时不重复降级', () => {
    expect(shouldFallbackApiPath({
      httpStatus: 410,
      message: goneMessage,
      apiPath: API_PATH_FALLBACK,
      apiPathExplicit: false,
    })).toBe(false)
  })

  it('404 不触发降级（资源可能真的不存在）', () => {
    expect(shouldFallbackApiPath({
      httpStatus: 404,
      message: goneMessage,
      apiPath: DEFAULT_API_PATH,
      apiPathExplicit: false,
    })).toBe(false)
  })

  it('410 但错误信息与 v1 移除无关时不降级', () => {
    expect(shouldFallbackApiPath({
      httpStatus: 410,
      message: 'some other gone reason',
      apiPath: DEFAULT_API_PATH,
      apiPathExplicit: false,
    })).toBe(false)
  })
})
