#!/usr/bin/env node
// 文档源子模块同步脚本（sources/ 下所有子模块通用）
//
// sources/{project} 是上游文档仓库的子模块（sparse 只检出文档目录），
// 固定在明确的 release tag 上。技能内容（skills/{project}）依据该快照
// 手工维护，溯源记录见 skills/{project}/GENERATION.md。
//
// 子模块清单与配置见脚本内 SUBMODULES（新增子模块时在此登记）。
//
// 用法：
//   node scripts/sync-docs.js [project]                    # 报告当前锁定状态与上游新 tag
//   node scripts/sync-docs.js [project] --pin <tag|sha>    # 移动子模块指针（--pin latest 取最新 release tag）
//
// project 省略时报告全部子模块；--pin 必须指定 project。
// 兼容别名：sync-dsh.js 等价于 sync-docs.js dsh。
//
// 本脚本只负责移动和报告子模块指针；技能参考文件的改写由 agent 按
// AGENTS.md 的「文档源子模块」指引完成。

import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// 子模块登记表：sparseDir 为空表示完整检出
const SUBMODULES = {
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
}

const SHA_RE = /^[0-9a-f]{40}$/
const WS_RE = /\s+/

function exec(cmd, cwd = root) {
  return execSync(cmd, { cwd, encoding: 'utf-8' }).trim()
}

function execSafe(cmd, cwd = root) {
  try {
    return exec(cmd, cwd)
  }
  catch {
    return null
  }
}

function fail(msg) {
  console.error(`错误: ${msg}`)
  process.exit(1)
}

// ---- 上游 tag ----

function listRemoteTags(cfg) {
  if (execSafe('git fetch --tags --quiet', cfg.path) === null)
    fail(`拉取上游 tag 失败（${cfg.path}），请检查网络`)
  const out = exec(`git tag -l '${cfg.tagPattern}'`, cfg.path)
  return out.split('\n').filter(Boolean)
}

function rank(tag, re) {
  const m = re.exec(tag)
  if (!m)
    return null
  const stage = { alpha: 0, beta: 1, rc: 2 }
  return [
    Number(m[1]),
    Number(m[2]),
    Number(m[3]),
    m[4] ? stage[m[4]] : 3, // 正式版 > rc > beta > alpha
    m[5] ? Number(m[5]) : 0,
  ]
}

function sortTags(tags, re) {
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

function latestTag(tags, re) {
  const sorted = sortTags(tags, re)
  return sorted.find(t => rank(t, re)) ?? null
}

// ---- 状态报告 ----

function recordedSha(cfg) {
  const out = execSafe(`git ls-files -s ${cfg.path}`)
  return out ? out.split(WS_RE)[1] : null
}

function report(name, cfg) {
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
  console.log(`  差异对比:   cd ${cfg.path} && git log --oneline ${short}..<新tag> -- <sparseDir>`)
  console.log(`  技能改写:   按仓库根 AGENTS.md 指引更新 ${cfg.skill}/ 与其 GENERATION.md\n`)
}

// ---- 指针移动 ----

function pin(name, cfg, target) {
  const tags = listRemoteTags(cfg)
  let dest = target
  if (target === 'latest') {
    dest = latestTag(tags, cfg.tagRe)
    if (!dest)
      fail(`${name}: 未找到匹配 ${cfg.tagPattern} 的 release tag`)
    console.log(`latest -> ${dest}`)
  }
  else if (!tags.includes(target) && !SHA_RE.test(target)) {
    fail(`${name}: 未知 tag '${target}'。可先运行 node scripts/sync-docs.js ${name} 查看列表`)
  }

  const curSha = execSafe('git rev-parse HEAD', cfg.path)
  exec(`git fetch --depth 1 origin ${dest}`, cfg.path)
  exec(`git checkout --detach ${dest}`, cfg.path)
  const newSha = exec('git rev-parse HEAD', cfg.path)
  if (newSha === curSha) {
    console.log(`${name}: 已在 ${dest} (${newSha})，无需变更`)
    return
  }

  exec(`git add ${cfg.path}`)
  console.log(`${name}: 子模块指针 ${curSha.slice(0, 7)} -> ${newSha.slice(0, 7)} (${dest})`)
  console.log(`\n后续步骤:`)
  console.log(`  1. cd ${cfg.path} && git log --oneline ${curSha.slice(0, 7)}..${dest} -- <sparseDir>`)
  console.log(`  2. 按仓库根 AGENTS.md 指引更新 ${cfg.skill}/`)
  console.log(`  3. 更新 ${cfg.skill}/GENERATION.md 的 Pinned tag / Git SHA / Synced / Skill version`)
  console.log(`  4. 一并提交子模块指针与技能改动`)
}

// ---- 入口 ----

const argv = process.argv.slice(2)
const pinIdx = argv.indexOf('--pin')
// 只有存在 --pin 时，其后的值才是 pin 目标而非子模块名
const pinTarget = pinIdx !== -1 ? argv[pinIdx + 1] : undefined
const positional = argv.filter(a => a !== '--pin' && a !== pinTarget)

if (positional.length > 0 && !SUBMODULES[positional[0]])
  fail(`未知子模块 '${positional[0]}'。可用: ${Object.keys(SUBMODULES).join(', ')}`)

if (pinIdx !== -1) {
  const target = argv[pinIdx + 1]
  if (!target)
    fail('用法: node scripts/sync-docs.js <project> --pin <tag|sha|latest>')
  const name = positional[0] ?? fail('--pin 必须指定子模块名，如: node scripts/sync-docs.js dsh --pin latest')
  pin(name, SUBMODULES[name], target)
}
else {
  const names = positional[0] ? [positional[0]] : Object.keys(SUBMODULES)
  for (const name of names)
    report(name, SUBMODULES[name])
}
