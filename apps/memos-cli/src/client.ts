import type { MemosConfig } from './config.js'
import { request as undiciRequest } from 'undici'

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

export class MemosClient {
  private readonly baseUrl: string
  private readonly apiPath: string
  private readonly token?: string

  constructor(config: MemosConfig) {
    this.baseUrl = config.baseUrl
    this.apiPath = config.apiPath || '/api/v1'
    this.token = config.token
  }

  get origin(): string {
    return this.baseUrl
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
      throw new MemosClientError({
        httpStatus: 0,
        message: `请求失败: ${error instanceof Error ? error.message : '未知错误'}`,
      })
    }

    const text = await response.body.text()
    const payload = parseJson(text)
    const httpStatus = response.statusCode

    if (httpStatus >= 200 && httpStatus < 300) {
      return (payload ?? {}) as T
    }

    // gRPC-gateway 错误体：{ code, message, details }
    const status = payload as { code?: number, message?: string, details?: unknown[] } | undefined
    throw new MemosClientError({
      httpStatus,
      code: typeof status?.code === 'number' ? status.code : undefined,
      message: status?.message || text.slice(0, 500) || `HTTP ${httpStatus}`,
      details: status?.details,
    })
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
