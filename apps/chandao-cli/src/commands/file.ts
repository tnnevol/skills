import type { Command } from 'commander'
import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { printError, printSuccess } from '../output.js'
import { extensionFor } from './attachment-utils.js'
import { fail, getClient, requireOption, runOperation } from './shared.js'

export function registerFileCommand(program: Command): void {
  const file = program.command('file').description('附件上传与查询')

  file
    .command('upload')
    .description('上传附件；v2 可绑定对象，v1 仅返回 fileID/url')
    .requiredOption('--file <path>', '本地文件路径')
    .option('--object-type <type>', '对象类型：story | bug | task | testcase | doc（仅 v2）')
    .option('--object-id <id>', '对象 ID（仅 v2）')
    .option('--uid <uid>', '编辑器会话 uid（仅 v1，可选）')
    .action(async (_options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as Record<string, any>
      if (!existsSync(opts.file))
        printError(`文件不存在：${opts.file}`)

      const client = getClient(cmd)
      const bound = Boolean(opts.objectType && opts.objectId !== undefined)
      const version = client.preference === 'auto'
        ? (bound ? client.effectiveVersion : (client.tokenFor('v1') ? 'v1' : client.effectiveVersion))
        : client.preference

      if (version === 'v2' && !bound)
        printError('v2 上传必须提供 --object-type 与 --object-id（禅道在缺少时会返回空响应）；也可以加 --api-version v1 单独上传文件。')

      try {
        const data = await client.uploadFile(version, opts.file, {
          objectType: opts.objectType,
          objectID: opts.objectId,
          uid: opts.uid,
        }) as Record<string, any> | null

        if (!data || data.id === undefined)
          printError('上传未返回 fileID：v2 需要 --object-type/--object-id；v1 请确认接口版本与文件格式。')

        const payload: Record<string, unknown> = {
          version,
          associated: version === 'v2' && bound,
          data,
        }
        if (version === 'v1' && opts.objectType)
          payload.note = 'v1 上传不支持 objectType/objectID（只返回文件地址）；如需绑定对象请用 --api-version v2。'
        printSuccess(payload, 'file.upload')
      }
      catch (error) {
        fail(error)
      }
    })

  file
    .command('download')
    .description('下载附件/图片二进制（v1 /files/{id}；v2 仅元数据）')
    .requiredOption('--id <id>', '文件 ID')
    .option('--output <path>', '保存路径（默认 ./file-<id>.<ext>）')
    .option('--force', '覆盖已存在文件')
    .action(async (_options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as Record<string, any>
      requireOption(opts.id, 'file download 需要 --id')
      const client = getClient(cmd)
      try {
        const result = await client.downloadFile(opts.id)
        const defaultName = `file-${opts.id}.${extensionFor(result.contentType, result.contentDisposition)}`
        const output = resolve(String(opts.output || defaultName))
        if (existsSync(output) && !opts.force)
          printError(`文件已存在：${output}（加 --force 覆盖）`)
        writeFileSync(output, result.body)
        printSuccess({
          version: result.version,
          fileID: opts.id,
          output,
          bytes: result.body.length,
          contentType: result.contentType ?? null,
          fallback: result.fallback,
        }, 'file.download')
      }
      catch (error) {
        fail(error)
      }
    })

  const get = file.command('get').description('查询附件信息（v2 元数据）')
  get.option('--id <id>', '文件 ID')
  get.action(async (_options, cmd: Command) => {
    const opts = cmd.optsWithGlobals() as Record<string, any>
    requireOption(opts.id, 'file get 需要 --id')
    await runOperation(cmd, 'file.get', opts)
  })
}
