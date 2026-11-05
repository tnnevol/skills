import { describe, expect, it } from 'vitest'
import { buildQueryPath } from '../client.js'
import { encodeFilePathHeader, pickUploadId } from '../commands/multipart.js'

describe('buildQueryPath', () => {
  it('无参数时原样返回', () => {
    expect(buildQueryPath('/api/me')).toBe('/api/me')
    expect(buildQueryPath('/api/me', {})).toBe('/api/me')
  })

  it('拼接查询参数', () => {
    expect(buildQueryPath('/api/fs/list', { path: '/a', page: 1 })).toBe('/api/fs/list?path=%2Fa&page=1')
  })

  it('跳过 undefined / null / 空串', () => {
    expect(buildQueryPath('/api/x', { a: undefined, b: null, c: '', d: 1 })).toBe('/api/x?d=1')
  })

  it('数组展开为重复同名键', () => {
    expect(buildQueryPath('/api/x', { ids: ['1', '2'] })).toBe('/api/x?ids=1&ids=2')
  })
})

describe('pickUploadId', () => {
  it('识别 upload_id', () => {
    expect(pickUploadId({ upload_id: 'abc' })).toBe('abc')
  })

  it('识别 uploadId 驼峰形式', () => {
    expect(pickUploadId({ uploadId: 'xyz' })).toBe('xyz')
  })

  it('识别嵌套 session 中的 upload_id', () => {
    expect(pickUploadId({ session: { upload_id: 'nested' } })).toBe('nested')
  })

  it('缺失时返回 undefined', () => {
    expect(pickUploadId({})).toBeUndefined()
    expect(pickUploadId(null)).toBeUndefined()
    expect(pickUploadId('str')).toBeUndefined()
  })
})

describe('encodeFilePathHeader', () => {
  it('对含中文与空格的路径做 URL 编码', () => {
    expect(encodeFilePathHeader('/电影/流浪地球 2.mkv')).toBe(
      '%2F%E7%94%B5%E5%BD%B1%2F%E6%B5%81%E6%B5%AA%E5%9C%B0%E7%90%83%202.mkv',
    )
  })

  it('普通 ASCII 路径只编码斜杠', () => {
    expect(encodeFilePathHeader('/a/b.txt')).toBe('%2Fa%2Fb.txt')
  })
})
