import type { MemosConfig } from './config.js'
import { request as undiciRequest } from 'undici'
import { API_PATH_FALLBACK, DEFAULT_API_PATH, REMOVED_V1_HINT } from './config.js'

export interface MemosApiError {
  /** HTTP 状态码 */
  httpStatus: number
  /** gRPC-gateway 状态码（Status.code），如 3 = INVALID_ARGUMENT、5 = NOT_FOUND */
  code?: number
  message: string
  details?: unknown[]
}

export class MemosClientError extends Error {
  constructor(readonly apiError: MemosApiError) {
    super(apiError.message)
    this.name = 'MemosClientError'
  }
}

/**
 * 是否应该换前缀重试。
 *
 * 只在「用户没显式指定 apiPath」+「当前用的是默认 /api/v1」+「服务端返回 410 且提示 v1 已移除」时为真。
 * 显式配置永不覆盖；404 也不触发（404 可能是资源真的不存在）。
 */
export function shouldFallbackApiPath(opts: {
  httpStatus: number
  message: string
  apiPath: string
  apiPathExplicit: boolean
}): boolean {
  if (opts.apiPathExplicit) {
    return false
  }
  if (opts.apiPath !== DEFAULT_API_PATH) {
    return false
  }
  if (opts.httpStatus !== 410) {
    return false
  }
  return opts.message.includes(REMOVED_V1_HINT)
}

export class MemosClient {
  private readonly baseUrl: string
  private apiPath: string
  private readonly token?: string
  private readonly apiPathExplicit: boolean

  constructor(config: MemosConfig) {
    this.baseUrl = config.baseUrl
    this.apiPath = config.apiPath || DEFAULT_API_PATH
    this.apiPathExplicit = config.apiPathExplicit === true
    this.token = config.token
  }

  get origin(): string {
    return this.baseUrl
  }

  /** 当前生效的 API 前缀（自动降级后会变）。 */
  get currentApiPath(): string {
    return this.apiPath
  }

  /** 拼接带 API 前缀的路径，入参为 `/memos` 之类的前缀相对路径。 */
  url(path: string, query?: Record<string, string | number | boolean | undefined>): string {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query || {})) {
      if (value === undefined || value === '' || value === false) {
        continue
      }
      params.set(key, String(value))
    }
    const search = params.toString()
    return `${this.baseUrl}${this.apiPath}${path}${search ? `?${search}` : ''}`
  }

  async request<T = unknown>(
    method: string,
    path: string,
    options: {
      query?: Record<string, string | number | boolean | undefined>
      body?: unknown
    } = {},
  ): Promise<T> {
    const result = await this.send<T>(method, path, options)

    // 26.10 起 /api/v1 被移除并返回 410；默认前缀下自动换 /api 重试一次
    if (
      result.error
      && shouldFallbackApiPath({
        httpStatus: result.error.apiError.httpStatus,
        message: result.error.apiError.message,
        apiPath: this.apiPath,
        apiPathExplicit: this.apiPathExplicit,
      })
    ) {
      this.apiPath = API_PATH_FALLBACK
      const retried = await this.send<T>(method, path, options)
      if (retried.error) {
        throw retried.error
      }
      return retried.data as T
    }

    if (result.error) {
      throw result.error
    }
    return result.data as T
  }

  private async send<T>(
    method: string,
    path: string,
    options: {
      query?: Record<string, string | number | boolean | undefined>
      body?: unknown
    },
  ): Promise<{ data?: T, error?: MemosClientError }> {
    const url = this.url(path, options.query)

    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json'
    }

    let response
    try {
      response = await undiciRequest(url, {
        method: method.toUpperCase(),
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      })
    }
    catch (error) {
      return {
        error: new MemosClientError({
          httpStatus: 0,
          message: `请求失败: ${error instanceof Error ? error.message : '未知错误'}`,
        }),
      }
    }

    const text = await response.body.text()
    const payload = parseJson(text)
    const httpStatus = response.statusCode

    if (httpStatus >= 200 && httpStatus < 300) {
      return { data: (payload ?? {}) as T }
    }

    // gRPC-gateway 错误体：{ code, message, details }
    const status = payload as { code?: number, message?: string, details?: unknown[] } | undefined
    return {
      error: new MemosClientError({
        httpStatus,
        code: typeof status?.code === 'number' ? status.code : undefined,
        message: status?.message || text.slice(0, 500) || `HTTP ${httpStatus}`,
        details: status?.details,
      }),
    }
  }

  get<T = unknown>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>('GET', path, { query })
  }

  post<T = unknown>(path: string, body?: unknown, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>('POST', path, { body: body ?? {}, query })
  }

  patch<T = unknown>(path: string, body?: unknown, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>('PATCH', path, { body: body ?? {}, query })
  }

  delete<T = unknown>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>('DELETE', path, { query })
  }
}

function parseJson(text: string): unknown {
  if (!text) {
    return undefined
  }
  try {
    return JSON.parse(text)
  }
  catch {
    return undefined
  }
}

export function createClient(config: MemosConfig): MemosClient {
  return new MemosClient(config)
}
