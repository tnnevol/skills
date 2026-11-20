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
  code?: number | string
  httpStatus?: number
  version?: string
  details?: unknown
  exitCode?: number
}

export function printError(message: string, options: PrintErrorOptions = {}): never {
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
  if (options.version) {
    result.version = options.version
  }
  if (options.details !== undefined) {
    result.details = options.details
  }

  process.stderr.write(`${JSON.stringify(result)}\n`)
  process.exit(options.exitCode ?? 1)
}
