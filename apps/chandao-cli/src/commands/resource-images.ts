import type { Command } from 'commander'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { printSuccess } from '../output.js'
import { extensionFor } from './attachment-utils.js'
import { fail, getClient, requireOption } from './shared.js'

const FILE_READ_RE = /file-read-(\d+)/g
const FILE_ID_RE = /[?&]fileID=(\d+)/g

type ImageResource = 'story' | 'bug' | 'task'

interface ResourceDef {
  name: ImageResource
  op: string
  entityKey: string
  htmlFields: string[]
  idField: string
  label: string
}

const RESOURCES: Record<ImageResource, ResourceDef> = {
  story: {
    name: 'story',
    op: 'story.get',
    entityKey: 'story',
    htmlFields: ['spec', 'verify'],
    idField: 'storyID',
    label: '需求',
  },
  bug: {
    name: 'bug',
    op: 'bug.get',
    entityKey: 'bug',
    htmlFields: ['steps'],
    idField: 'bugID',
    label: 'Bug',
  },
  task: {
    name: 'task',
    op: 'task.get',
    entityKey: 'task',
    htmlFields: ['desc'],
    idField: 'taskID',
    label: '任务',
  },
}

export function collectFileIDs(html: string): number[] {
  const ids = new Set<number>()
  for (const regex of [FILE_READ_RE, FILE_ID_RE]) {
    regex.lastIndex = 0
    let match = regex.exec(html)
    while (match) {
      const id = Number(match[1])
      if (Number.isInteger(id) && id > 0)
        ids.add(id)
      match = regex.exec(html)
    }
  }
  return [...ids]
}

function findEntity(data: unknown, key: string): Record<string, any> {
  const record = data as Record<string, any> | null
  if (!record)
    throw new Error('详情为空')
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

export function registerResourceImagesCommand(group: Command, resource: ImageResource): void {
  const def = RESOURCES[resource]
  const command = group
    .command('images')
    .description(`提取并下载${def.label}内容中的图片与附件（v1 files 接口）`)
    .requiredOption('--id <id>', `${def.label} ID`)
    .option('--dir <path>', `保存目录（默认 ./${resource}-<id>-files）`)
    .option('--force', '覆盖已存在文件')

  if (resource === 'story')
    command.option('--spec-version <n>', '按版本读取需求（仅 v2）')

  command.action(async (_options, cmd: Command) => {
    const opts = cmd.optsWithGlobals() as Record<string, any>
    requireOption(opts.id, `${resource} images 需要 --id`)
    const client = getClient(cmd)
    try {
      const args: Record<string, unknown> = { id: opts.id }
      if (resource === 'story' && opts.specVersion !== undefined)
        args.specVersion = opts.specVersion
      const result = await client.call(def.op, args)
      const entity = findEntity(result.data, def.entityKey)
      const html = def.htmlFields
        .map(field => entity[field])
        .filter((value): value is string => typeof value === 'string' && value.length > 0)
        .join('\n')
      const fileIDs = collectFileIDs(html)
      const dir = resolve(String(opts.dir || `${resource}-${opts.id}-files`))
      mkdirSync(dir, { recursive: true })

      const files: Array<Record<string, unknown>> = []
      for (const fileID of fileIDs) {
        const download = await client.downloadFile(fileID)
        const extension = extensionFor(download.contentType, download.contentDisposition)
        const output = join(dir, `file-${fileID}.${extension}`)
        if (existsSync(output) && !opts.force) {
          files.push({ fileID, output, skipped: true, bytes: download.body.length, contentType: download.contentType ?? null })
          continue
        }
        writeFileSync(output, download.body)
        files.push({ fileID, output, bytes: download.body.length, contentType: download.contentType ?? null, version: download.version })
      }

      printSuccess({
        resource,
        [def.idField]: Number(opts.id),
        entityVersion: entity.version ?? null,
        dir,
        count: files.length,
        files,
      }, `${resource}.images`)
    }
    catch (error) {
      fail(error)
    }
  })
}

export function registerStoryImagesCommand(story: Command): void {
  registerResourceImagesCommand(story, 'story')
}

export function registerBugImagesCommand(bug: Command): void {
  registerResourceImagesCommand(bug, 'bug')
}

export function registerTaskImagesCommand(task: Command): void {
  registerResourceImagesCommand(task, 'task')
}
