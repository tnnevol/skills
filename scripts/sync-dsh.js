#!/usr/bin/env node
// dsh 技能文档源同步脚本
//
// sources/dsh 是 deepseek-ai/deepseek-harness 的子模块（sparse 只检出 docs/），
// 固定在某个 dsh-v* release tag 上。技能内容（skills/dsh）依据该快照手工维护。
//
// 用法：
//   node scripts/sync-dsh.js            # 报告当前锁定状态与上游新 tag
//   node scripts/sync-dsh.js --pin <tag|sha>  # 把子模块移动到指定 tag/sha（--pin latest 取最新 release tag）
//
// 本脚本只负责移动和报告子模块指针；技能参考文件的改写由 agent 按
// AGENTS.md 的 dsh 生成指引完成。

import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const sub = 'sources/dsh'
const SEMVER_RE = /^dsh-v(\d+)\.(\d+)\.(\d+)(?:-(alpha|rc|beta)\.(\d+))?$/
const WS_RE = /\s+/
const SHA_RE = /^[0-9a-f]{40}$/

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

// ---- 环境检查 ----

const sha = execSafe('git rev-parse HEAD', sub)
if (!sha) {
  fail(`子模块 ${sub} 未初始化。请先执行: git submodule update --init`)
}

const sparse = execSafe('git config core.sparseCheckout', sub)
if (sparse !== 'true') {
  console.log('提示: 子模块未启用 sparse-checkout（完整检出）。如需瘦身:')
  console.log('  cd sources/dsh && git sparse-checkout init --cone && git sparse-checkout set docs')
}

// ---- 当前锁定状态 ----

function currentPin() {
  const describe = execSafe('git describe --tags --exact-match', sub)
  const short = execSafe('git rev-parse --short HEAD', sub)
  return { sha, describe: describe || '(无 tag，游离提交)', short }
}

function recordedSha() {
  // git 索引中记录的子模块指针（即已提交/已暂存的锁定版本）
  const out = execSafe('git ls-files -s sources/dsh')
  return out ? out.split(WS_RE)[1] : null
}

// ---- 上游 tag ----

function listRemoteTags() {
  execSafe('git fetch --tags --quiet', sub) === null && fail('拉取上游 tag 失败，请检查网络')
  const out = exec('git tag -l \'dsh-v*\'', sub)
  return out.split('\n').filter(Boolean)
}

function rank(tag) {
  const m = SEMVER_RE.exec(tag)
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

function latestTag(tags) {
  const ranked = tags.map(t => [rank(t), t]).filter(([r]) => r).sort((a, b) => {
    for (let i = 0; i < a[0].length; i++) {
      if (a[0][i] !== b[0][i])
        return b[0][i] - a[0][i]
    }
    return 0
  })
  return ranked[0]?.[1] ?? null
}

// ---- 动作 ----

function report() {
  const cur = currentPin()
  console.log('== dsh 文档源状态 ==')
  console.log(`子模块:     ${sub} -> https://github.com/deepseek-ai/deepseek-harness (docs/, sparse)`)
  console.log(`当前检出:   ${cur.describe} (${cur.sha})`)
  const idx = recordedSha()
  if (idx && idx !== cur.sha) {
    console.log(`索引记录:   ${idx} —— 工作区指针与索引不一致，尚未提交/暂存`)
  }
  else {
    console.log(`索引记录:   ${idx ?? '(未暂存)'} —— 已提交状态一致`)
  }

  console.log('\n上游 release tags (最近 10 个):')
  const tags = listRemoteTags().sort((a, b) => {
    const ra = rank(a) ?? []
    const rb = rank(b) ?? []
    for (let i = 0; i < 5; i++) {
      if ((ra[i] ?? 0) !== (rb[i] ?? 0))
        return (rb[i] ?? 0) - (ra[i] ?? 0)
    }
    return 0
  })
  for (const t of tags.slice(0, 10)) {
    const mark = t === cur.describe ? '  <- 当前锁定' : ''
    console.log(`  ${t}${mark}`)
  }
  console.log(`\n同步操作: 对比差异 cd sources/dsh && git log --oneline ${cur.short}..<新tag> -- docs/`)
  console.log('技能改写: 阅读仓库根 AGENTS.md 的 dsh 生成指引，按差异更新 skills/dsh/')
}

function pin(target) {
  const tags = listRemoteTags()
  let dest = target
  if (target === 'latest') {
    dest = latestTag(tags)
    if (!dest)
      fail('未找到任何 dsh-v* tag')
    console.log(`latest -> ${dest}`)
  }
  else if (!tags.includes(target) && !SHA_RE.test(target)) {
    fail(`未知 tag '${target}'。可先运行 node scripts/sync-dsh.js 查看列表`)
  }

  const cur = currentPin()
  exec(`git fetch --depth 1 origin ${dest}`, sub)
  exec(`git checkout --detach ${dest}`, sub)
  const newSha = exec('git rev-parse HEAD', sub)
  if (newSha === cur.sha) {
    console.log(`已在 ${dest} (${newSha})，无需变更`)
    return
  }

  exec(`git add ${sub}`)
  console.log(`子模块指针: ${cur.short} -> ${newSha.slice(0, 7)} (${dest})`)
  console.log('\n后续步骤:')
  console.log(`  1. cd sources/dsh && git log --oneline ${cur.short}..${dest} -- docs/   # 查看文档差异`)
  console.log('  2. 按仓库根 AGENTS.md 的 dsh 生成指引更新 skills/dsh/')
  console.log(`  3. 更新 skills/dsh/GENERATION.md 的锁定版本与日期`)
  console.log('  4. 一并提交子模块指针与技能改动')
}

// ---- 入口 ----

const argv = process.argv.slice(2)
if (argv[0] === '--pin') {
  if (!argv[1])
    fail('用法: node scripts/sync-dsh.js --pin <tag|sha|latest>')
  pin(argv[1])
}
else if (argv.length === 0) {
  report()
}
else {
  fail('用法: node scripts/sync-dsh.js [--pin <tag|sha|latest>]')
}
