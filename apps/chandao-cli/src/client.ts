import type { ApiVersion, ApiVersionPreference, ResolvedConfig } from './config.js'
import type { OpDef } from './ops.js'
import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { request as undiciRequest } from 'undici'
import { OPS } from './ops.js'

const TRAILING_SLASHES = /\/+$/
const WHITESPACE_RE = /\s+/g
const HTML_TAG_RE = /<[^>]*>/g

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface CallResult {
  data: unknown
  version: ApiVersion
  /** auto 模式下首选版本不支持、实际退到另一版本时为 true */
  fallback: boolean
}

export interface ProbeResult {
  ok: boolean
  status?: number
  token?: string
  message?: string
}

export interface DetectResult {
  v1: ProbeResult
  v2: ProbeResult
  detected?: ApiVersion
}

export type ChandaoErrorKind = 'auth' | 'api' | 'network' | 'unsupported'

export class ChandaoError extends Error {
  status?: number
  data?: unknown
  kind: ChandaoErrorKind
  version?: ApiVersion

  constructor(message: string, options: { status?: number, data?: unknown, kind?: ChandaoErrorKind, version?: ApiVersion } = {}) {
    super(message)
    this.name = 'ChandaoError'
    this.status = options.status
    this.data = options.data
    this.kind = options.kind ?? 'api'
    this.version = options.version
  }
}

export function apiBaseUrl(baseUrl: string, version: ApiVersion): string {
  return `${baseUrl.replace(TRAILING_SLASHES, '')}/api.php/${version}`
}

export function apiVersions(op: OpDef): ApiVersion[] {
  const versions: ApiVersion[] = []
  if (op.v1)
    versions.push('v1')
  if (op.v2)
    versions.push('v2')
  return versions
}

/**
 * 选择实际使用的 API 版本。
 *
 * - preference=auto：优先 detectedVersion（登录探测结果，v2 优先），
 *   首选版本不支持该操作时自动退回另一个版本（fallback=true）。
 * - preference=v1/v2：强制使用；该版本未实现此操作时抛 unsupported。
 */
export function chooseVersion(
  op: OpDef,
  preference: ApiVersionPreference,
  detectedVersion?: ApiVersion,
): { version: ApiVersion, fallback: boolean } {
  const available = apiVersions(op)
  if (available.length === 0)
    throw new ChandaoError('该操作没有可用的 API 实现', { kind: 'unsupported' })

  if (preference === 'v1' || preference === 'v2') {
    if (!available.includes(preference)) {
      throw new ChandaoError(
        `操作在当前强制版本 ${preference} 上未提供（支持：${available.join(', ')}）。`
        + ` 可改用 --api-version ${available[0]} 或 auto。`,
        { kind: 'unsupported', version: preference },
      )
    }
    return { version: preference, fallback: false }
  }

  const preferred = detectedVersion ?? 'v2'
  if (available.includes(preferred))
    return { version: preferred, fallback: false }

  const other = preferred === 'v2' ? 'v1' : 'v2'
  return { version: other, fallback: true }
}

export class ChandaoClient {
  private config: ResolvedConfig

  constructor(config: ResolvedConfig) {
    this.config = config
  }

  get baseUrl(): string {
    return this.config.baseUrl
  }

  get preference(): ApiVersionPreference {
    return this.config.apiVersion
  }

  tokenFor(version: ApiVersion): string | undefined {
    return this.config.tokenOverride || this.config.tokens[version]
  }

  async requestRaw(
    version: ApiVersion,
    method: HttpMethod,
    path: string,
    body?: unknown,
    token?: string,
  ): Promise<{ status: number, data: unknown }> {
    const url = `${apiBaseUrl(this.config.baseUrl, version)}${path}`
    const headers: Record<string, string> = {}
    const activeToken = token ?? this.tokenFor(version)
    if (activeToken)
      headers.Token = activeToken
    if (body !== undefined)
      headers['Content-Type'] = 'application/json'

    let response
    try {
      response = await undiciRequest(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        bodyTimeout: 60_000,
        headersTimeout: 30_000,
      })
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new ChandaoError(`请求失败（${method} ${path}）：${message}`, { kind: 'network', version })
    }

    const text = await response.body.text()
    let data: unknown
    try {
      data = text ? JSON.parse(text) : null
    }
    catch {
      data = text
    }

    return { status: response.statusCode, data }
  }

  /** 下载二进制内容（附件/图片）；错误响应仍按 JSON 解析 message。 */
  async requestBytes(
    version: ApiVersion,
    method: HttpMethod,
    path: string,
    body?: unknown,
    token?: string,
  ): Promise<{ status: number, body: Buffer, contentType?: string, contentDisposition?: string }> {
    const url = `${apiBaseUrl(this.config.baseUrl, version)}${path}`
    const headers: Record<string, string> = {}
    const activeToken = token ?? this.tokenFor(version)
    if (activeToken)
      headers.Token = activeToken
    if (body !== undefined)
      headers['Content-Type'] = 'application/json'

    let response
    try {
      response = await undiciRequest(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        bodyTimeout: 60_000,
        headersTimeout: 30_000,
      })
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new ChandaoError(`请求失败（${method} ${path}）：${message}`, { kind: 'network', version })
    }

    const arrayBuffer = await response.body.arrayBuffer()
    const header = (name: string): string | undefined => {
      const value = response.headers[name]
      return Array.isArray(value) ? value[0] : value?.toString()
    }
    return {
      status: response.statusCode,
      body: Buffer.from(arrayBuffer),
      contentType: header('content-type'),
      contentDisposition: header('content-disposition'),
    }
  }

  /** 下载附件/图片（优先 v1 /files/{id}，v2 不提供二进制下载）。 */
  async downloadFile(id: string | number): Promise<{
    version: ApiVersion
    fallback: boolean
    body: Buffer
    contentType?: string
    contentDisposition?: string
  }> {
    const op = OPS['file.download']
    const { version, fallback } = chooseVersion(op, this.config.apiVersion, this.config.detectedVersion)
    const builder = op[version]
    if (!builder)
      throw new ChandaoError(`操作 file.download 在 ${version} 上没有实现`, { kind: 'unsupported', version })

    const call = builder({ id })
    const result = await this.requestBytes(version, call.method, call.path)
    if (result.status >= 400) {
      let message = `下载失败（HTTP ${result.status}）`
      try {
        const data = JSON.parse(result.body.toString('utf8')) as Record<string, unknown>
        if (typeof data.message === 'string')
          message = data.message
      }
      catch {}
      throw new ChandaoError(message, { kind: 'api', status: result.status, version })
    }
    if (result.contentType?.includes('json')) {
      let data: unknown
      try {
        data = JSON.parse(result.body.toString('utf8'))
      }
      catch {}
      this.assertSuccess(version, call.method, call.path, result.status, data)
      throw new ChandaoError('接口返回 JSON 而不是文件内容，无法下载', { kind: 'api', status: result.status, version })
    }
    return { version, fallback, body: result.body, contentType: result.contentType, contentDisposition: result.contentDisposition }
  }

  /** 读取站点版本（/?mode=getconfig，无需登录）。 */
  async getSiteVersion(): Promise<string | null> {
    const url = `${this.baseUrl.replace(TRAILING_SLASHES, '')}/?mode=getconfig`
    try {
      const response = await undiciRequest(url, { headersTimeout: 5_000, bodyTimeout: 5_000 })
      if (response.statusCode >= 400)
        return null
      const data = JSON.parse(await response.body.text()) as Record<string, unknown>
      return typeof data.version === 'string' ? data.version : null
    }
    catch {
      return null
    }
  }

  /** 用账号密码探测 v1/v2 登录可用性；v2 优先。 */
  static async probe(baseUrl: string, account: string, password: string): Promise<DetectResult> {
    const normalized = baseUrl.replace(TRAILING_SLASHES, '')

    const tryLogin = async (version: ApiVersion): Promise<ProbeResult> => {
      const path = version === 'v2' ? '/users/login' : '/tokens'
      try {
        const response = await undiciRequest(`${normalized}/api.php/${version}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account, password }),
          bodyTimeout: 20_000,
          headersTimeout: 10_000,
        })
        const text = await response.body.text()
        let data: Record<string, unknown> = {}
        try {
          data = text ? JSON.parse(text) : {}
        }
        catch {
          data = { raw: text }
        }

        const token = typeof data.token === 'string' ? data.token : undefined
        const status = response.statusCode
        const failed = status >= 400
          || data.status === 'fail'
          || data.result === 'fail'
          || Boolean(data.error)

        if (failed || !token) {
          const message = typeof data.message === 'string'
            ? data.message
            : typeof data.error === 'string'
              ? data.error
              : `HTTP ${status}`
          return { ok: false, status, message }
        }
        return { ok: true, status, token }
      }
      catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : String(error) }
      }
    }

    const [v2, v1] = await Promise.all([tryLogin('v2'), tryLogin('v1')])
    const detected: ApiVersion | undefined = v2.ok ? 'v2' : v1.ok ? 'v1' : undefined
    return { v1, v2, detected }
  }

  async call(opName: string, args: Record<string, unknown> = {}): Promise<CallResult> {
    const op = OPS[opName]
    if (!op)
      throw new ChandaoError(`未知操作：${opName}`, { kind: 'unsupported' })

    const { version, fallback } = chooseVersion(op, this.config.apiVersion, this.config.detectedVersion)
    const builder = op[version]
    if (!builder)
      throw new ChandaoError(`操作 ${opName} 在 ${version} 上没有实现`, { kind: 'unsupported', version })

    const call = builder(args)
    const { status, data } = await this.requestRaw(version, call.method, call.path, call.body)

    this.assertSuccess(version, call.method, call.path, status, data)
    return { data, version, fallback }
  }

  /** 直接请求（供 `api` 命令使用）：path 可自带 /v1 或 /v2 前缀。 */
  async requestDirect(
    method: HttpMethod,
    path: string,
    body?: unknown,
    versionOverride?: ApiVersion,
  ): Promise<{ data: unknown, version: ApiVersion }> {
    const hasV1 = path.startsWith('/v1/')
    const hasV2 = path.startsWith('/v2/')
    let version: ApiVersion
    let subpath = path

    if (versionOverride) {
      version = versionOverride
      if (hasV1 || hasV2)
        subpath = path.slice(3)
    }
    else if (hasV1 || hasV2) {
      version = hasV1 ? 'v1' : 'v2'
      subpath = path.slice(3)
    }
    else {
      version = this.config.apiVersion === 'auto'
        ? (this.config.detectedVersion ?? 'v2')
        : this.config.apiVersion
    }

    const { status, data } = await this.requestRaw(version, method, subpath, body)
    this.assertSuccess(version, method, subpath, status, data)
    return { data, version }
  }

  get detectedVersion(): ApiVersion | undefined {
    return this.config.detectedVersion
  }

  /** 当前生效版本：auto 时取探测结果（默认 v2），否则取强制值。 */
  get effectiveVersion(): ApiVersion {
    return this.config.apiVersion === 'auto'
      ? (this.config.detectedVersion ?? 'v2')
      : this.config.apiVersion
  }

  /**
   * 上传文件（multipart/form-data）。
   * - v2: 字段 `file`，可带 objectType/objectID 绑定对象；
   * - v1: 字段 `imgFile`（兼容禅道旧接口），不支持 objectType/objectID，仅支持 uid。
   */
  async uploadFile(
    version: ApiVersion,
    filePath: string,
    fields: { objectType?: string, objectID?: string | number, uid?: string } = {},
  ): Promise<unknown> {
    const token = this.tokenFor(version)
    if (!token)
      throw new ChandaoError(`没有 ${version} token，请先执行 auth login。`, { kind: 'auth', version })

    const buffer = readFileSync(filePath)
    const form = new FormData()
    const fieldName = version === 'v2' ? 'file' : 'imgFile'
    form.append(fieldName, new Blob([buffer]), basename(filePath))
    if (version === 'v2') {
      if (fields.objectType)
        form.append('objectType', fields.objectType)
      if (fields.objectID !== undefined)
        form.append('objectID', String(fields.objectID))
    }
    else if (fields.uid) {
      form.append('uid', fields.uid)
    }

    let response: Response
    try {
      response = await fetch(`${apiBaseUrl(this.config.baseUrl, version)}/files`, {
        method: 'POST',
        headers: { Token: token },
        body: form,
      })
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new ChandaoError(`上传失败（${filePath}）：${message}`, { kind: 'network', version })
    }

    const text = await response.text()
    let data: unknown
    try {
      data = text ? JSON.parse(text) : null
    }
    catch {
      data = text
    }
    this.assertSuccess(version, 'POST', '/files', response.status, data)
    return data
  }

  async getRaw(path: string, version: ApiVersion): Promise<unknown> {
    const { status, data } = await this.requestRaw(version, 'GET', path)
    this.assertSuccess(version, 'GET', path, status, data)
    return data
  }

  private assertSuccess(version: ApiVersion, method: HttpMethod, path: string, status: number, data: unknown): void {
    if (status === 401 || status === 403) {
      const serverMessage = extractMessage(data)
      const reason = version === 'v1'
        ? 'v1 会话凭证已失效（禅道 v1 token 本质是 session_id，会随会话过期）'
        : 'v2 token 无效或权限不足'
      const hint = version === 'v1'
        ? '请重新执行 `chandao-cli auth login`；如果只是 v1 功能不可用，可改用 v2 或重登后再试。'
        : '请重新执行 `chandao-cli auth login`，或检查账号角色/权限。'
      const server = serverMessage ? `；服务端返回：${serverMessage}` : ''
      throw new ChandaoError(
        `鉴权失败（HTTP ${status}）：${reason}${server}。${hint}`,
        { status, data, kind: 'auth', version },
      )
    }
    if (status >= 400) {
      const message = extractMessage(data) || `HTTP ${status}`
      throw new ChandaoError(`${method} ${path} 失败：${message}`, { status, data, kind: 'api', version })
    }

    if (version === 'v1') {
      if (data && typeof data === 'object' && 'error' in data && (data as Record<string, unknown>).error) {
        throw new ChandaoError(extractMessage(data) || '禅道返回错误', { status, data, kind: 'api', version })
      }
      return
    }

    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>
      if (record.status === 'fail' || record.result === 'fail')
        throw new ChandaoError(extractMessage(data) || '禅道返回错误', { status, data, kind: 'api', version })
    }
    if (typeof data === 'string') {
      const text = data.trim()
      // v2 未命中路由时 api.php 会返回 200 空响应，视为不可用
      if (text === '') {
        throw new ChandaoError(`路由不存在或返回空响应（${method} ${path}）`, { status, kind: 'api', version })
      }
      // 旧版禅道（如 18.x）的 v2 路由缺失时会返回 PHP Fatal error HTML，而不是 JSON
      const snippet = text.replace(HTML_TAG_RE, ' ').replace(WHITESPACE_RE, ' ').trim().slice(0, 160)
      throw new ChandaoError(
        `接口返回了非 JSON 响应（可能是该版本 API 未实现/损坏）：${snippet}`,
        { status, kind: 'api', version },
      )
    }
  }
}

function extractMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object')
    return typeof data === 'string' ? data : undefined
  const record = data as Record<string, unknown>
  const message = record.message ?? record.error ?? record.msg
  if (typeof message === 'string')
    return message
  if (message && typeof message === 'object')
    return JSON.stringify(message)
  return undefined
}
