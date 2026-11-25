import { Buffer } from 'node:buffer'
import { describe, expect, it } from 'vitest'
import { chooseVersion } from '../client.js'
import { collectImageSources, docLibsPath, docListPath } from '../commands/doc.js'
import { collectFileIDs } from '../commands/resource-images.js'
import { maskToken, normalizeApiVersion, normalizeBaseUrl } from '../config.js'
import { decodeKeychainSecret } from '../crypto.js'
import { actionOp, OPS } from '../ops.js'

describe('chooseVersion', () => {
  it('auto 优先 v2', () => {
    expect(chooseVersion(OPS['product.list'], 'auto', 'v2')).toEqual({ version: 'v2', fallback: false })
  })

  it('auto 首选 v2 但操作仅 v1 时回退 v1', () => {
    expect(chooseVersion(OPS['testtask.list'], 'auto', 'v2')).toEqual({ version: 'v1', fallback: true })
  })

  it('auto 未探测时默认按 v2 偏好', () => {
    expect(chooseVersion(OPS['product.list'], 'auto', undefined)).toEqual({ version: 'v2', fallback: false })
  })

  it('强制版本可用时直接使用', () => {
    expect(chooseVersion(OPS['product.list'], 'v1', 'v2')).toEqual({ version: 'v1', fallback: false })
  })

  it('强制版本不支持时抛错', () => {
    expect(() => chooseVersion(OPS['testtask.list'], 'v2', 'v2')).toThrow(/v2/)
  })
})

describe('ops builders', () => {
  it('product.list 的 v1/v2 分页参数不同', () => {
    const v1 = OPS['product.list'].v1!({ page: 2, limit: 10 })
    const v2 = OPS['product.list'].v2!({ page: 2, limit: 10 })
    expect(v1.path).toContain('page=2')
    expect(v1.path).toContain('limit=10')
    expect(v2.path).toContain('pageID=2')
    expect(v2.path).toContain('recPerPage=10')
  })

  it('story.list 按过滤条件选择路径', () => {
    expect(OPS['story.list'].v2!({ product: 1 }).path).toMatch(/^\/products\/1\/stories/)
    expect(OPS['story.list'].v2!({ project: 2 }).path).toMatch(/^\/projects\/2\/stories/)
    expect(OPS['story.list'].v2!({}).path).toMatch(/^\/stories/)
  })

  it('task.create v2 使用 executionID，v1 走执行子路径', () => {
    const v2 = OPS['task.create'].v2!({ name: 't', execution: 9 })
    expect(v2.path).toBe('/tasks')
    expect(v2.body).toMatchObject({ name: 't', executionID: 9 })

    const v1 = OPS['task.create'].v1!({ name: 't', execution: 9 })
    expect(v1.path).toBe('/executions/9/tasks')
    expect(v1.body).not.toHaveProperty('executionID')
  })

  it('bug.resolve v1 用 POST，v2 用 PUT', () => {
    const args = { id: 3, resolution: 'fixed' }
    expect(OPS['bug.resolve'].v1!(args)).toMatchObject({ method: 'POST', path: '/bugs/3/resolve' })
    expect(OPS['bug.resolve'].v2!(args)).toMatchObject({ method: 'PUT', path: '/bugs/3/resolve' })
  })

  it('用户创建 v1 带 group，v2 仅基础字段', () => {
    const args = { account: 'u', password: 'p', realname: 'n', group: '1,2', role: 'po' }
    expect(OPS['user.create'].v1!(args).body).toMatchObject({ group: '1,2', role: 'po' })
    expect(OPS['user.create'].v2!(args).body).toEqual({ account: 'u', password: 'p', realname: 'n' })
  })

  it('v1 创建补默认值：需求 pri/category/branch', () => {
    const body = OPS['story.create'].v1!({ product: 1, title: 't' }).body as Record<string, unknown>
    expect(body).toMatchObject({ pri: 3, category: 'feature', branch: 0 })
  })

  it('v1 用例 steps 转对象数组，bug 默认 type', () => {
    const steps = OPS['testcase.create'].v1!({ product: 1, title: 'c', steps: '[{"step":"a","expect":"b"}]' }).body as Record<string, any>
    expect(steps.steps).toEqual([{ desc: 'a', expect: 'b', type: 'step' }])
    const bug = OPS['bug.create'].v1!({ product: 1, title: 'b' }).body as Record<string, any>
    expect(bug.type).toBe('codeerror')
  })

  it('story 仅 v2 支持指定版本；testcase v1/v2 都支持', () => {
    expect(OPS['story.get'].v2!({ id: 1, specVersion: 2 }).path).toBe('/stories/1?version=2')
    expect(OPS['testcase.get'].v2!({ id: 3, specVersion: 1 }).path).toBe('/testcases/3?version=1')
    expect(OPS['testcase.get'].v1!({ id: 3, specVersion: 1 }).path).toBe('/testcases/3?version=1')
    expect(() => OPS['story.get'].v1!({ id: 1, specVersion: 1 })).toThrow(/v1/)
  })

  it('story images 能从 HTML 中去重提取 fileID', () => {
    const html = '<img src="file-read-10.png"><img src="x/file-read-11.png"><a href="?m=file&f=read&fileID=10">a</a>'
    expect(collectFileIDs(html)).toEqual([10, 11])
  })

  it('doc 路径拼接与图片提取', () => {
    expect(docLibsPath('product', { objectId: '1' })).toBe('/v2/doc/product/spaces/1/libs')
    expect(docListPath('project', { objectId: '2' }, '3')).toBe('/v2/doc/project/spaces/2/libs/3/docs')
    expect(docLibsPath('team', { space: '5' })).toBe('/v2/doc/team/spaces/5/libs')
    expect(collectImageSources('![a](./a.png) <img src="./b.png"> ![](https://x/y.png)')).toEqual(['./a.png', './b.png'])
  })

  it('group/dept 同时提供 v1 与 v2 映射', () => {
    expect(OPS['group.list'].v1!({}).path).toBe('/groups')
    expect(OPS['group.list'].v2!({}).path).toBe('/groups')
    expect(OPS['dept.list'].v2!({}).path).toBe('/depts')
    expect(OPS['dept.get'].v2!({ id: 1 }).path).toBe('/depts/1')
  })

  it('file.get 仅 v2，auto 在 v1 环境下回退 v2', () => {
    expect(OPS['file.get'].v1).toBeUndefined()
    expect(chooseVersion(OPS['file.get'], 'auto', 'v1')).toEqual({ version: 'v2', fallback: true })
    expect(() => chooseVersion(OPS['file.get'], 'v1', 'v1')).toThrow(/v1/)
    expect(OPS['file.download'].v2).toBeUndefined()
    expect(chooseVersion(OPS['file.download'], 'auto', 'v2')).toEqual({ version: 'v1', fallback: true })
  })

  it('actionOp 拼接资源动作', () => {
    expect(actionOp('task', 'finish')).toBe('task.finish')
  })
})

describe('crypto helpers', () => {
  it('macOS keychain 的 hex 编码私钥可还原为 PEM', () => {
    const pem = '-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----\n'
    const hex = Buffer.from(pem).toString('hex')
    expect(decodeKeychainSecret(hex)?.trim()).toBe(pem.trim())
    expect(decodeKeychainSecret(pem)?.trim()).toBe(pem.trim())
    expect(decodeKeychainSecret(null)).toBeNull()
  })
})

describe('config helpers', () => {
  it('normalizeBaseUrl 去掉 /api.php 与尾部斜杠', () => {
    expect(normalizeBaseUrl('http://192.168.0.19:8890/api.php')).toBe('http://192.168.0.19:8890')
    expect(normalizeBaseUrl('http://192.168.0.19:8890/api.php/v2/')).toBe('http://192.168.0.19:8890')
    expect(normalizeBaseUrl('https://host/zentao/')).toBe('https://host/zentao')
  })

  it('normalizeApiVersion 只接受 v1/v2', () => {
    expect(normalizeApiVersion('v1')).toBe('v1')
    expect(normalizeApiVersion('v2')).toBe('v2')
    expect(normalizeApiVersion('whatever')).toBe('auto')
    expect(normalizeApiVersion(undefined)).toBe('auto')
  })

  it('maskToken 脱敏', () => {
    expect(maskToken('abcdefghijklmnop')).toBe('abcd***mnop')
    expect(maskToken(undefined)).toBeNull()
  })
})
