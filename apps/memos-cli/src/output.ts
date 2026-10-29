import process from 'node:process'

let prettyMode = false

export function setPretty(pretty: boolean): void {
  prettyMode = pretty
}

export function printResult(data: unknown): void {
  process.stdout.write(`${JSON.stringify(data, null, prettyMode ? 2 : undefined)}\n`)
}

export function printSuccess(data: unknown, operation?: string): void {
  const result: Record<string, unknown> = {
    success: true,
  }

  if (operation) {
    result.operation = operation
  }

  result.data = data
  printResult(result)
}

export interface PrintErrorOptions {
  /** 业务/协议错误码（gRPC-gateway Status.code 或 HTTP 状态码） */
  code?: number | string
  httpStatus?: number
  details?: unknown[]
  exitCode?: number
}

export function printError(message: string, options: PrintErrorOptions = {}): void {
  const result: Record<string, unknown> = {
    success: false,
    message,
  }

  if (options.code !== undefined) {
    result.code = options.code
  }
  if (options.httpStatus !== undefined) {
    result.httpStatus = options.httpStatus
  }
  if (options.details?.length) {
    result.details = options.details
  }

  console.error(JSON.stringify(result))
  process.exit(options.exitCode ?? 1)
}

interface Paged {
  nextPageToken?: string
}

/** Memos 列表接口用 pageToken 游标分页，输出附带续页信息。 */
export function withPagination<T extends Paged>(data: T, pageSize: number): T & {
  pagination: { pageSize: number, nextPageToken: string | null, hasMore: boolean }
} {
  const nextPageToken = data.nextPageToken || ''
  return {
    ...data,
    pagination: {
      pageSize,
      nextPageToken: nextPageToken || null,
      hasMore: Boolean(nextPageToken),
    },
  }
}
