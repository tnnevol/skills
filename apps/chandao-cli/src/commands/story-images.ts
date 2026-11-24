import type { Command } from 'commander'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { printSuccess } from '../output.js'
import { extensionFor } from './attachment-utils.js'
import { fail, getClient, requireOption } from './shared.js'

const FILE_READ_RE = /file-read-(\d+)/g
const FILE_ID_RE = /[?&]fileID=(\d+)/g

function findStory(data: unknown): Record<string, any> {
  const record = data as Record<string, any> | null
  if (!record)
    throw new Error('需求详情为空')
  if (record.story && typeof record.story === 'object')
    return record.story
  if (record.data && typeof record.data === 'object') {
    const inner = record.data as Record<string, any>
    if (inner.story && typeof inner.story === 'object')
      return inner.story
    return inner
  }
  return record
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

export function registerStoryImagesCommand(story: Command): void {
  story
    .command('images')
    .description('提取并下载需求正文/验收标准中的图片与附件（v1 files 接口）')
    .requiredOption('--id <id>', '需求 ID')
    .option('--spec-version <n>', '按版本读取需求（仅 v2）')
    .option('--dir <path>', '保存目录（默认 ./story-<id>-files）')
    .option('--force', '覆盖已存在文件')
    .action(async (_options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as Record<string, any>
      requireOption(opts.id, 'story images 需要 --id')
      const client = getClient(cmd)
      try {
        const result = await client.call('story.get', { id: opts.id, specVersion: opts.specVersion })
        const story = findStory(result.data)
        const html = [story.spec, story.verify].filter((value): value is string => typeof value === 'string' && value.length > 0).join('\n')
        const fileIDs = collectFileIDs(html)
        const dir = resolve(String(opts.dir || `story-${opts.id}-files`))
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
          storyID: Number(opts.id),
          storyVersion: story.version ?? null,
          dir,
          count: files.length,
          files,
        }, 'story.images')
      }
      catch (error) {
        fail(error)
      }
    })
}
