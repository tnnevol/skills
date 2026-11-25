import type { Command } from 'commander'
import type { ChandaoClient } from '../client.js'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ChandaoError } from '../client.js'
import { printError, printSuccess } from '../output.js'
import { fail, getClient, requireOption } from './shared.js'

type DocSpaceType = 'product' | 'project' | 'team' | 'my'

const SPACES_PATH: Record<DocSpaceType, string> = {
  product: '/v2/doc/product/spaces',
  project: '/v2/doc/project/spaces',
  team: '/v2/doc/team/spaces',
  my: '/v2/doc/my/spaces',
}

const MARKDOWN_IMAGE_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
const HTML_IMAGE_RE = /<img[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi
const REMOTE_RE = /^(?:https?:)?\/\//i
const EXT_RE = /\.([a-z0-9]{1,8})$/i

interface DocPathOptions {
  type?: string
  objectId?: string
  space?: string
}

function assertType(type: string | undefined): DocSpaceType {
  if (type !== 'product' && type !== 'project' && type !== 'team' && type !== 'my')
    throw new Error('--type 必须是 product、project、team 或 my')
  return type
}

export function docLibsPath(type: DocSpaceType, opts: DocPathOptions): string {
  if (type === 'product' || type === 'project') {
    if (!opts.objectId)
      throw new Error(`--type ${type} 需要 --object-id`)
    return `${SPACES_PATH[type]}/${opts.objectId}/libs`
  }
  if (!opts.space)
    throw new Error(`--type ${type} 需要 --space <spaceID>`)
  return `${SPACES_PATH[type]}/${opts.space}/libs`
}

export function docListPath(type: DocSpaceType, opts: DocPathOptions, libID: string): string {
  return `${docLibsPath(type, opts)}/${libID}/docs`
}

function docGetPath(id: string): string {
  return `/v2/doc/docs/${id}`
}

function unsupportedDocApi(): never {
  throw new ChandaoError(
    '当前实例的文档 v2 接口返回空（禅道 22.1 未实现文档 API，需 22.5+）。'
    + '请升级禅道，或使用 Web 界面创建文档；v1 只能读取文档/文档库。',
    { kind: 'unsupported', version: 'v2' },
  )
}

function readContent(opts: Record<string, any>): string {
  if (opts.content && opts.contentFile)
    printError('--content 与 --content-file 只能二选一')
  if (opts.contentFile) {
    const path = resolve(String(opts.contentFile))
    if (!existsSync(path))
      printError(`内容文件不存在：${path}`)
    return readFileSync(path, 'utf-8')
  }
  if (typeof opts.content === 'string')
    return opts.content
  printError('需要 --content <markdown/html> 或 --content-file <path>')
}

function extractDoc(data: unknown): Record<string, any> | null {
  const record = data as Record<string, any> | null
  if (!record)
    return null
  if (record.doc && typeof record.doc === 'object')
    return record.doc
  if (record.data && typeof record.data === 'object')
    return extractDoc(record.data)
  if (record.id !== undefined)
    return record
  return null
}

export function collectImageSources(content: string): string[] {
  const sources = new Set<string>()
  const add = (source: string | undefined): void => {
    if (!source || REMOTE_RE.test(source) || source.startsWith('data:'))
      return
    if (source.startsWith('/') && !existsSync(resolve(source)))
      return
    if (source.includes('file-read-') || source.includes('fileID='))
      return
    sources.add(source)
  }
  MARKDOWN_IMAGE_RE.lastIndex = 0
  let md = MARKDOWN_IMAGE_RE.exec(content)
  while (md) {
    add(md[2])
    md = MARKDOWN_IMAGE_RE.exec(content)
  }
  HTML_IMAGE_RE.lastIndex = 0
  let html = HTML_IMAGE_RE.exec(content)
  while (html) {
    add(html[1])
    html = HTML_IMAGE_RE.exec(content)
  }
  return [...sources]
}

function extensionOf(name: string): string {
  return name.match(EXT_RE)?.[1]?.toLowerCase() ?? 'png'
}

/** 把内容里的本地图片上传到 doc 附件库，并替换成返回的 URL。 */
async function uploadLocalImages(
  client: ChandaoClient,
  docID: string | number,
  content: string,
): Promise<{ content: string, uploads: Array<Record<string, unknown>> }> {
  let next = content
  const uploads: Array<Record<string, unknown>> = []
  for (const source of collectImageSources(content)) {
    const filePath = resolve(source)
    if (!existsSync(filePath))
      throw new Error(`文档中的本地图片不存在：${source}`)
    const uploaded = await client.uploadFile('v2', filePath, { objectType: 'doc', objectID: docID }) as Record<string, any> | null
    if (!uploaded || (uploaded.id === undefined && !uploaded.url))
      throw new Error(`图片上传失败（未返回 fileID/url）：${source}`)
    const url = typeof uploaded.url === 'string' && uploaded.url
      ? uploaded.url
      : `/index.php?m=file&f=read&t=${extensionOf(source)}&fileID=${uploaded.id}`
    next = next.split(source).join(url)
    uploads.push({ source, fileID: uploaded.id ?? null, url })
  }
  return { content: next, uploads }
}

function docBody(opts: Record<string, any>, content: string): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: opts.title,
    content,
    contentType: opts.contentType || 'doc',
  }
  if (opts.module !== undefined)
    body.moduleID = Number(opts.module)
  return body
}

export function registerDocCommand(program: Command): void {
  const doc = program.command('doc').description('文档：v1 只读；v2 创建/修改（需禅道 22.5+）')

  doc
    .command('spaces')
    .description('列出 v2 文档空间（22.5+）')
    .option('--type <type>', 'product | project | team | my', 'product')
    .action(async (_options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as Record<string, any>
      try {
        const type = assertType(opts.type)
        const result = await getClient(cmd).requestDirect('GET', SPACES_PATH[type])
        if (result.data === null)
          unsupportedDocApi()
        printSuccess({ type, version: 'v2', data: result.data }, 'doc.spaces')
      }
      catch (error) {
        fail(error)
      }
    })

  doc
    .command('libs')
    .description('列出文档库；v1 回退 /doclibs，v2 用空间路径')
    .option('--type <type>', 'product | project | team | my', 'product')
    .option('--object-id <id>', '产品/项目 ID')
    .option('--space <id>', '团队/我的空间 ID')
    .action(async (_options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as Record<string, any>
      const client = getClient(cmd)
      try {
        const type = assertType(opts.type)
        // v2 文档 API 不可用时回退 v1 文档库读取（22.1）
        if (client.effectiveVersion === 'v1' || ((type === 'my' || type === 'team') && opts.objectId)) {
          const v1Type = type === 'my' ? 'mine' : type === 'team' ? 'custom' : type
          const query = new URLSearchParams({ type: v1Type })
          if (opts.objectId)
            query.set('objectID', String(opts.objectId))
          const result = await client.requestDirect('GET', `/v1/doclibs?${query}`)
          printSuccess({ type, version: 'v1', data: result.data }, 'doc.libs')
          return
        }
        const path = docLibsPath(type, opts)
        const result = await client.requestDirect('GET', path)
        if (result.data === null && client.tokenFor('v1')) {
          const v1Type = type === 'my' ? 'mine' : type === 'team' ? 'custom' : type
          const query = new URLSearchParams({ type: v1Type })
          if (opts.objectId)
            query.set('objectID', String(opts.objectId))
          const fallback = await client.requestDirect('GET', `/v1/doclibs?${query}`)
          printSuccess({ type, version: 'v1', fallback: true, data: fallback.data }, 'doc.libs')
          return
        }
        if (result.data === null)
          unsupportedDocApi()
        printSuccess({ type, version: 'v2', data: result.data }, 'doc.libs')
      }
      catch (error) {
        fail(error)
      }
    })

  doc
    .command('list')
    .description('列出文档库下的文档')
    .requiredOption('--lib <id>', '文档库 ID')
    .option('--type <type>', 'product | project | team | my（v2 需要）')
    .option('--object-id <id>', '产品/项目 ID')
    .option('--space <id>', '团队/我的空间 ID')
    .action(async (_options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as Record<string, any>
      const client = getClient(cmd)
      try {
        requireOption(opts.lib, 'doc list 需要 --lib')
        if (client.effectiveVersion === 'v1' || !opts.type) {
          const result = await client.requestDirect('GET', `/v1/docs?lib=${opts.lib}`)
          printSuccess({ version: 'v1', data: result.data }, 'doc.list')
          return
        }
        const type = assertType(opts.type)
        const result = await client.requestDirect('GET', docListPath(type, opts, String(opts.lib)))
        if (result.data === null && client.tokenFor('v1')) {
          const fallback = await client.requestDirect('GET', `/v1/docs?lib=${opts.lib}`)
          printSuccess({ version: 'v1', fallback: true, data: fallback.data }, 'doc.list')
          return
        }
        if (result.data === null)
          unsupportedDocApi()
        printSuccess({ version: 'v2', data: result.data }, 'doc.list')
      }
      catch (error) {
        fail(error)
      }
    })

  doc
    .command('get')
    .description('获取文档详情')
    .requiredOption('--id <id>', '文档 ID')
    .action(async (_options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as Record<string, any>
      const client = getClient(cmd)
      try {
        requireOption(opts.id, 'doc get 需要 --id')
        if (client.effectiveVersion === 'v1') {
          const result = await client.requestDirect('GET', `/v1/doc/${opts.id}`)
          printSuccess({ version: 'v1', data: result.data }, 'doc.get')
          return
        }
        const result = await client.requestDirect('GET', docGetPath(opts.id))
        if (result.data === null && client.tokenFor('v1')) {
          const fallback = await client.requestDirect('GET', `/v1/doc/${opts.id}`)
          printSuccess({ version: 'v1', fallback: true, data: fallback.data }, 'doc.get')
          return
        }
        if (result.data === null)
          unsupportedDocApi()
        printSuccess({ version: 'v2', data: result.data }, 'doc.get')
      }
      catch (error) {
        fail(error)
      }
    })

  doc
    .command('create')
    .description('创建文档（v2，需 22.5+；content-type=doc 时按 Markdown 转 HTML）')
    .requiredOption('--type <type>', 'product | project | team | my')
    .requiredOption('--lib <id>', '文档库 ID')
    .requiredOption('--title <title>', '文档标题')
    .option('--object-id <id>', '产品/项目 ID')
    .option('--space <id>', '团队/我的空间 ID')
    .option('--content <text>', '文档正文（Markdown 或 HTML）')
    .option('--content-file <path>', '从文件读取正文')
    .option('--content-type <type>', 'doc（Markdown→HTML，推荐）| html（原样 HTML）', 'doc')
    .option('--module <id>', '所属文档目录 ID')
    .action(async (_options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as Record<string, any>
      const client = getClient(cmd)
      try {
        requireOption(opts.title, 'doc create 需要 --title')
        const type = assertType(opts.type)
        if (client.effectiveVersion === 'v1')
          printError('v1 没有文档创建接口；文档创建需要 v2（禅道 22.5+），或使用 Web 界面。')
        const content = readContent(opts)
        const path = docListPath(type, opts, String(opts.lib))
        const created = await client.requestDirect('POST', path, docBody(opts, content), 'v2')
        const entity = extractDoc(created.data)
        if (!entity || entity.id === undefined)
          unsupportedDocApi()
        const { content: finalContent, uploads } = await uploadLocalImages(client, entity.id, content)
        if (uploads.length > 0) {
          await client.requestDirect('PUT', docGetPath(String(entity.id)), docBody(opts, finalContent), 'v2')
          entity.content = finalContent
        }
        printSuccess({
          version: 'v2',
          contentType: opts.contentType || 'doc',
          doc: entity,
          uploads,
        }, 'doc.create')
      }
      catch (error) {
        fail(error)
      }
    })

  doc
    .command('update')
    .description('修改文档（v2，需 22.5+；本地图片自动上传到文档附件库）')
    .requiredOption('--id <id>', '文档 ID')
    .option('--title <title>', '新标题')
    .option('--content <text>', '新正文（Markdown 或 HTML）')
    .option('--content-file <path>', '从文件读取新正文')
    .option('--content-type <type>', 'doc（Markdown→HTML，推荐）| html（原样 HTML）')
    .option('--module <id>', '所属文档目录 ID')
    .action(async (_options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as Record<string, any>
      const client = getClient(cmd)
      try {
        requireOption(opts.id, 'doc update 需要 --id')
        if (client.effectiveVersion === 'v1')
          printError('v1 没有文档修改接口；文档修改需要 v2（禅道 22.5+），或使用 Web 界面。')
        const current = await client.requestDirect('GET', docGetPath(String(opts.id)), undefined, 'v2')
        const entity = extractDoc(current.data)
        if (!entity)
          unsupportedDocApi()
        const content = (opts.content || opts.contentFile) ? readContent(opts) : String(entity.content ?? '')
        if (!content)
          printError('需要 --content 或 --content-file（当前文档详情没有可复用正文）')
        const title = opts.title || String(entity.title ?? '')
        const body = docBody({ ...opts, title }, content)
        // 未显式指定时保留原文档格式，避免 html 文档被误转成 doc
        body.contentType = opts.contentType || entity.contentType || 'doc'
        const { content: finalContent, uploads } = await uploadLocalImages(client, opts.id, content)
        body.content = finalContent
        const updated = await client.requestDirect('PUT', docGetPath(String(opts.id)), body, 'v2')
        printSuccess({ version: 'v2', doc: extractDoc(updated.data) ?? { id: opts.id }, uploads }, 'doc.update')
      }
      catch (error) {
        fail(error)
      }
    })

  doc
    .command('delete')
    .description('删除文档（v2，需 22.5+）')
    .requiredOption('--id <id>', '文档 ID')
    .option('--yes', '确认删除')
    .action(async (_options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as Record<string, any>
      const client = getClient(cmd)
      try {
        requireOption(opts.id, 'doc delete 需要 --id')
        if (!opts.yes)
          printError('删除需要显式加 --yes')
        if (client.effectiveVersion === 'v1')
          printError('v1 没有文档删除接口；v2 需禅道 22.5+，或使用 Web 界面。')
        const result = await client.requestDirect('DELETE', docGetPath(String(opts.id)), undefined, 'v2')
        printSuccess({ version: 'v2', id: Number(opts.id), data: result.data }, 'doc.delete')
      }
      catch (error) {
        fail(error)
      }
    })
}
