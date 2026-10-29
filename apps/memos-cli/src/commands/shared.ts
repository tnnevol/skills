import type { Command } from 'commander'
import type { MemosClient } from '../client.js'
import { createClient, MemosClientError } from '../client.js'
import { resolveConfig } from '../config.js'
import { printError } from '../output.js'

/** 从命令（含全局选项）解析配置并创建客户端。 */
export function getClient(cmd: Command): MemosClient {
  const opts = cmd.optsWithGlobals() as {
    baseUrl?: string
    token?: string
    apiPath?: string
  }
  return createClient(
    resolveConfig({
      baseUrl: opts.baseUrl,
      token: opts.token,
      apiPath: opts.apiPath,
    }),
  )
}

/** 统一错误出口：把 API 错误转成结构化 JSON（stderr + 非零退出）。 */
export function fail(error: unknown, fallbackMessage: string): never {
  if (error instanceof MemosClientError) {
    printError(error.apiError.message, {
      code: error.apiError.code,
      httpStatus: error.apiError.httpStatus || undefined,
      details: error.apiError.details,
    })
  }

  printError(error instanceof Error ? error.message : fallbackMessage)
}

export function isRequired(value: string | undefined, usage: string): string {
  if (!value || !value.trim()) {
    printError(`缺少必填参数。用法: ${usage}`)
  }
  return value
}
