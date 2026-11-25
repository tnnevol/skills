import type { Command } from 'commander'
import { ChandaoClient, ChandaoError } from '../client.js'
import { resolveConfig } from '../config.js'
import { UPDATE_MERGE_FIELDS } from '../ops.js'
import { printError, printSuccess } from '../output.js'

export function getClient(cmd: Command): ChandaoClient {
  const opts = cmd.optsWithGlobals() as {
    baseUrl?: string
    account?: string
    token?: string
    apiVersion?: string
  }
  return new ChandaoClient(resolveConfig({
    baseUrl: opts.baseUrl,
    account: opts.account,
    token: opts.token,
    apiVersion: opts.apiVersion,
  }))
}

export function fail(error: unknown, fallbackMessage = '操作失败'): never {
  if (error instanceof ChandaoError) {
    printError(error.message, {
      httpStatus: error.status,
      version: error.version,
      details: error.kind === 'api' || error.kind === 'auth' ? error.data : undefined,
    })
  }
  printError(error instanceof Error ? error.message : fallbackMessage)
}

export async function runOperation(
  cmd: Command,
  operation: string,
  args: Record<string, unknown>,
): Promise<void> {
  const client = getClient(cmd)
  try {
    const result = await client.call(operation, args)
    if (operation.endsWith('.get') && result.data === null) {
      printError(`未找到资源（${operation}）`, { version: result.version })
    }
    const payload: Record<string, unknown> = {
      version: result.version,
      data: result.data,
    }
    if (args.specVersion !== undefined)
      payload.requestedVersion = Number(args.specVersion)
    if (result.fallback)
      payload.fallback = true
    printSuccess(payload, operation)
  }
  catch (error) {
    fail(error)
  }
}

function extractEntity(data: unknown, key: string): Record<string, unknown> {
  if (data && typeof data === 'object') {
    const record = data as Record<string, any>
    if (record[key] && typeof record[key] === 'object')
      return record[key]
    if (record.data && typeof record.data === 'object') {
      const inner = record.data as Record<string, any>
      if (inner[key] && typeof inner[key] === 'object')
        return inner[key]
      return inner
    }
    return record
  }
  throw new Error('无法解析详情响应')
}

/**
 * 更新前先 GET 当前值，把未显式提供的字段回填，避免禅道 PUT 把缺失字段重置为默认值。
 */
export async function runUpdate(
  cmd: Command,
  resource: string,
  entityKey: string,
  args: Record<string, any>,
): Promise<void> {
  const client = getClient(cmd)
  try {
    const current = await client.call(`${resource}.get`, { id: args.id })
    const entity = extractEntity(current.data, entityKey)
    const merged: Record<string, unknown> = { ...args }
    for (const field of UPDATE_MERGE_FIELDS[resource] ?? []) {
      if (merged[field] === undefined && entity[field] !== undefined)
        merged[field] = entity[field]
    }
    const result = await client.call(`${resource}.update`, merged)
    printSuccess({
      version: result.version,
      fallback: result.fallback || undefined,
      data: result.data,
    }, `${resource}.update`)
  }
  catch (error) {
    if (
      resource === 'story'
      && error instanceof ChandaoError
      && error.version === 'v1'
      && error.message.includes('PUT /stories')
    ) {
      printError(
        `${error.message}。旧版 v1 的 story update 可能不可用，请改用 \`story change --reviewer <账号> --spec ...\` 提交变更（会生成新版本/评审）。`,
        { httpStatus: error.status, version: error.version },
      )
    }
    fail(error)
  }
}

export function requireOption(value: unknown, message: string): void {
  if (value === undefined || value === null || value === '') {
    printError(message)
  }
}
