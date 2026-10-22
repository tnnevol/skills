/**
 * 文档源同步 CLI（submodule 与远程抓取两类来源通用）
 *
 * 一类是 sources/{project} 子模块：上游文档仓库以 submodule 形式挂在 sources/，
 * sparse 只检出文档目录，固定在明确的 release tag 上。
 * 另一类是远程抓取来源（站点不是 git 仓库），由技能自带脚本 + 状态文件同步，
 * 例如 skills/yonyou-doc。
 *
 * 技能内容（skills/{project}）依据快照手工维护，溯源记录见 skills/{project}/GENERATION.md。
 * 两类来源的清单分别见 SUBMODULES / REMOTE_SOURCES（新增时在此登记）。
 *
 * 用法：
 *   pnpm start check [project]            # 报告锁定状态与上游新 tag / 远程来源是否落后
 *   pnpm start sync <project> <tag|sha>   # 移动子模块指针到指定 release tag（sha 需完整 40 位）
 *   pnpm start sync <project> latest      # 移动到最新 release tag
 *
 * project 省略时 check 报告全部来源；sync 必须指定 project，远程来源会给出对应抓取命令。
 *
 * 本 CLI 只负责报告与移动子模块指针；技能参考文件的改写由 agent 按
 * AGENTS.md 的「文档源」指引完成。
 */
import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

interface SubmoduleConfig {
  /** 仓库内的子模块路径 */
  path: string
  /** sparse-checkout 只检出的文档目录（省略表示完整检出） */
  sparseDir: string
  /** git tag-l 的 glob 模式 */
  tagPattern: string
  /** release tag 的解析正则（用于版本排序与 latest 判定） */
  tagRe: RegExp
  /** 对应的技能目录 */
  skill: string
}

/** 子模块登记表 */
const SUBMODULES: Record<string, SubmoduleConfig> = {
  'dsh': {
    path: 'sources/dsh',
    sparseDir: 'docs',
    tagPattern: 'dsh-v*',
    tagRe: /^dsh-v(\d+)\.(\d+)\.(\d+)(?:-(alpha|rc|beta)\.(\d+))?$/,
    skill: 'skills/dsh',
  },
  'vitepress-mermaid-renderer': {
    path: 'sources/vitepress-mermaid-renderer',
    sparseDir: 'docs/content/zh',
    tagPattern: 'v*',
    tagRe: /^v(\d+)\.(\d+)\.(\d+)$/,
    skill: 'skills/vitepress-mermaid-renderer',
  },
  'midscenejs': {
    path: 'sources/midscenejs',
    sparseDir: 'apps/site/docs/zh',
    tagPattern: 'v*',
    tagRe: /^v(\d+)\.(\d+)\.(\d+)$/,
    skill: 'skills/midscenejs',
  },
}

const SHA_RE = /^[0-9a-f]{40}$/
const WS_RE = /\s+/
const STAGE_ORDER: Record<string, number> = { alpha: 0, beta: 1, rc: 2 }

/** 远程抓取来源（站点非 git 仓库，靠技能自带脚本同步） */
interface RemoteSource {
  /** 对应的技能目录 */
  skill: string
  /** 上游站点 */
  source: string
  /** 检查脚本（相对仓库根，支持 --check 时落后 exit 1） */
  script: string
  /** 检查参数 */
  checkArgs: string[]
  /** 同步命令提示 */
  syncHint: string
}

const REMOTE_SOURCES: Record<string, RemoteSource> = {
  'yonyou-doc': {
    skill: 'skills/yonyou-doc',
    source: 'https://developer.yonyou.com/docs',
    script: 'skills/yonyou-doc/scripts/sync_docs.py',
    checkArgs: ['--check'],
    syncHint: 'python3 skills/yonyou-doc/scripts/sync_docs.py',
  },
}

const ALL_SOURCES = [...Object.keys(SUBMODULES), ...Object.keys(REMOTE_SOURCES)]

function exec(cmd: string, cwd: string = root): string {
  return execSync(cmd, { cwd, encoding: 'utf-8' }).trim()
}

function execSafe(cmd: string, cwd: string = root): string | null {
  try {
    return exec(cmd, cwd)
  }
  catch {
    return null
  }
}

function fail(msg: string): never {
  console.error(`错误: ${msg}`)
  process.exit(1)
}

// ---- 上游 tag ----

function listRemoteTags(cfg: SubmoduleConfig): string[] {
  if (execSafe('git fetch --tags --quiet', cfg.path) === null)
    fail(`拉取上游 tag 失败（${cfg.path}），请检查网络`)
  return exec(`git tag -l '${cfg.tagPattern}'`, cfg.path).split('\n').filter(Boolean)
}

function rank(tag: string, re: RegExp): number[] | null {
  const m = re.exec(tag)
  if (!m)
    return null
  return [
    Number(m[1]),
    Number(m[2]),
    Number(m[3]),
    m[4] ? STAGE_ORDER[m[4]] ?? 0 : 3, // 正式版 > rc > beta > alpha
    m[5] ? Number(m[5]) : 0,
  ]
}

function sortTags(tags: string[], re: RegExp): string[] {
  return tags.sort((a, b) => {
    const ra = rank(a, re) ?? []
    const rb = rank(b, re) ?? []
    for (let i = 0; i < 5; i++) {
      if ((ra[i] ?? 0) !== (rb[i] ?? 0))
        return (rb[i] ?? 0) - (ra[i] ?? 0)
    }
    return 0
  })
}

function latestTag(tags: string[], re: RegExp): string | null {
  return sortTags(tags, re).find(t => rank(t, re) !== null) ?? null
}

// ---- 状态报告 ----

function recordedSha(cfg: SubmoduleConfig): string | null {
  const out = execSafe(`git ls-files -s ${cfg.path}`)
  return out ? out.split(WS_RE)[1] : null
}

function report(name: string, cfg: SubmoduleConfig): void {
  const sha = execSafe('git rev-parse HEAD', cfg.path)
  if (!sha) {
    console.log(`== ${name} (${cfg.path}) ==`)
    console.log('  子模块未初始化。运行: pnpm install 或 git submodule update --init\n')
    return
  }
  const describe = execSafe('git describe --tags --exact-match', cfg.path) || '(无 tag，游离提交)'
  const short = sha.slice(0, 7)

  console.log(`== ${name} (${cfg.path}) ==`)
  console.log(`  上游:       ${exec('git config --get remote.origin.url', cfg.path)}`)
  console.log(`  当前检出:   ${describe} (${sha})`)
  const idx = recordedSha(cfg)
  if (idx && idx !== sha)
    console.log(`  索引记录:   ${idx} —— 工作区指针与索引不一致，尚未提交/暂存`)
  else
    console.log(`  索引记录:   ${idx ?? '(未暂存)'} —— 已提交状态一致`)

  const tags = sortTags(listRemoteTags(cfg), cfg.tagRe)
  console.log('  上游 release tags (最近 10 个):')
  for (const t of tags.slice(0, 10)) {
    const mark = t === describe ? '  <- 当前锁定' : ''
    console.log(`    ${t}${mark}`)
  }
  console.log(`  差异对比:   cd ${cfg.path} && git log --oneline ${short}..<新tag> -- ${cfg.sparseDir}`)
  console.log(`  技能改写:   按仓库根 AGENTS.md 指引更新 ${cfg.skill}/ 与其 GENERATION.md\n`)
}

// ---- 远程抓取来源 ----

function runCapture(cmd: string): { code: number, out: string } {
  try {
    const out = execSync(cmd, { cwd: root, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] })
    return { code: 0, out }
  }
  catch (e) {
    const err = e as { status?: number, stdout?: string, stderr?: string }
    return { code: err.status ?? 1, out: `${err.stdout ?? ''}${err.stderr ?? ''}` }
  }
}

function reportRemote(name: string, cfg: RemoteSource): number {
  console.log(`== ${name} (${cfg.skill}) ==`)
  console.log(`  来源:       ${cfg.source}`)
  console.log(`  同步方式:   ${cfg.syncHint}`)
  const py = process.env.PYTHON ?? 'python3'
  const { code, out } = runCapture(`${py} ${cfg.script} ${cfg.checkArgs.join(' ')}`)
  for (const line of out.trim().split('\n').filter(Boolean))
    console.log(`  ${line}`)
  if (code === 0)
    console.log('  结论:       本地快照与线上一致')
  else if (code === 1)
    console.log('  结论:       线上有更新，需要重新同步并改写技能')
  else
    console.log(`  结论:       检查失败（exit ${code}），确认 python3 可用且网络正常`)
  console.log('')
  return code
}

// ---- 指针移动 ----

function sync(name: string, cfg: SubmoduleConfig, target: string): void {
  const tags = listRemoteTags(cfg)
  let dest = target
  if (target === 'latest') {
    dest = latestTag(tags, cfg.tagRe) ?? fail(`${name}: 未找到匹配 ${cfg.tagPattern} 的 release tag`)
    console.log(`latest -> ${dest}`)
  }
  else if (!tags.includes(target) && !SHA_RE.test(target)) {
    fail(`${name}: 未知 tag '${target}'。可先运行 pnpm start check ${name} 查看列表`)
  }

  const curSha = execSafe('git rev-parse HEAD', cfg.path) ?? fail(`${name}: 子模块未初始化`)
  exec(`git fetch --depth 1 origin ${dest}`, cfg.path)
  exec(`git checkout --detach ${dest}`, cfg.path)
  const newSha = exec('git rev-parse HEAD', cfg.path)
  if (newSha === curSha) {
    console.log(`${name}: 已在 ${dest} (${newSha})，无需变更`)
    return
  }

  exec(`git add ${cfg.path}`)
  console.log(`${name}: 子模块指针 ${curSha.slice(0, 7)} -> ${newSha.slice(0, 7)} (${dest})`)
  console.log('\n后续步骤:')
  console.log(`  1. cd ${cfg.path} && git log --oneline ${curSha.slice(0, 7)}..${dest} -- ${cfg.sparseDir}`)
  console.log(`  2. 按仓库根 AGENTS.md 指引更新 ${cfg.skill}/`)
  console.log(`  3. 更新 ${cfg.skill}/GENERATION.md 的 Pinned tag / Git SHA / Synced / Skill version`)
  console.log('  4. 一并提交子模块指针与技能改动')
}

// ---- 入口 ----

function main(): void {
  const [command, ...args] = process.argv.slice(2)

  if (command === 'check') {
    const target = args[0]
    if (target && SUBMODULES[target]) {
      report(target, SUBMODULES[target])
      return
    }
    if (target && REMOTE_SOURCES[target]) {
      const code = reportRemote(target, REMOTE_SOURCES[target])
      if (code === 1)
        process.exitCode = 1
      return
    }
    if (target)
      fail(`未知来源 '${target}'。可用: ${ALL_SOURCES.join(', ')}`)

    for (const name of Object.keys(SUBMODULES))
      report(name, SUBMODULES[name])
    for (const name of Object.keys(REMOTE_SOURCES)) {
      if (reportRemote(name, REMOTE_SOURCES[name]) === 1)
        process.exitCode = 1
    }
    return
  }

  if (command === 'sync') {
    const [name, target] = args
    if (!name || (!SUBMODULES[name] && !REMOTE_SOURCES[name]))
      fail(`用法: pnpm start sync <project> <tag|sha|latest>。可用: ${ALL_SOURCES.join(', ')}`)
    if (REMOTE_SOURCES[name]) {
      console.log(`${name} 不是 git 子模块，请直接运行抓取脚本：\n  ${REMOTE_SOURCES[name].syncHint}`)
      return
    }
    if (!target)
      fail('缺少目标: pnpm start sync <project> <tag|sha|latest>')
    sync(name, SUBMODULES[name], target)
    return
  }

  fail('用法: pnpm start check [project] | pnpm start sync <project> <tag|sha|latest>')
}

main()
