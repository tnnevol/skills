#!/usr/bin/env node
// 仓库准备脚本（pnpm install 后自动执行）
//
// 1. 安装 git 钩子（simple-git-hooks）
// 2. 初始化 sources/ 下的文档源子模块：
//    - 浅克隆（--depth 1）避免拉取上游全部历史
//    - 检出索引锁定的 commit（不跟分支）
//    - 启用 sparse-checkout 仅检出 docs/，跳过上游源码
//
// CI 或不需要子模块的环境可跳过: DSH_SKIP_PREPARE=1 pnpm install

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// 各子模块只检出的文档目录（与 scripts/sync-docs.js SUBMODULES 保持一致）
const SPARSE_DIRS = {
  'sources/dsh': 'docs',
  'sources/vitepress-mermaid-renderer': 'docs/content/zh',
}

function exec(cmd, cwd = root) {
  return execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'inherit'] }).trim()
}

function execSafe(cmd, cwd = root) {
  try {
    return exec(cmd, cwd)
  }
  catch {
    return null
  }
}

if (process.env.DSH_SKIP_PREPARE) {
  console.log('[prepare] DSH_SKIP_PREPARE=1，跳过钩子与子模块初始化')
  process.exit(0)
}

// 1. git 钩子（幂等；无 .git 时如 CI tarball 场景自动跳过）
if (existsSync(join(root, '.git'))) {
  execSafe('npx simple-git-hooks')
    ? console.log('[prepare] git 钩子已安装')
    : console.log('[prepare] git 钩子安装失败（非致命，可手动运行 npx simple-git-hooks）')
}

// 2. 文档源子模块
const hasSubmodules = existsSync(join(root, '.gitmodules'))
if (!hasSubmodules) {
  console.log('[prepare] 无 .gitmodules，跳过子模块初始化')
  process.exit(0)
}

if (!existsSync(join(root, '.git'))) {
  console.log('[prepare] 无 .git 目录，跳过子模块初始化')
  process.exit(0)
}

// 已全部初始化则直接退出（幂等，不产生网络请求）
const uninitialized = execSafe('git submodule status')
  ?.split('\n')
  .filter(line => line.startsWith('-')) ?? []

if (uninitialized.length === 0) {
  console.log('[prepare] 子模块已就绪')
  process.exit(0)
}

console.log(`[prepare] 初始化子模块（浅克隆 + sparse）: ${uninitialized.length} 个`)
for (const line of uninitialized) {
  // 行格式: -<sha> <path> (<describe>)；前缀 '-' 表示未初始化
  const path = line.slice(1).trim().split(/\s+/)[1]
  if (!path)
    continue

  // 浅克隆锁定 commit；克隆失败的子模块（网络等）不阻塞 install
  if (execSafe(`git submodule update --init --depth 1 ${path}`) === null) {
    console.log(`[prepare] ${path} 初始化失败（非致命；稍后可运行 git submodule update --init ${path}）`)
    continue
  }
  // 只保留文档目录，丢掉上游源码（sparseDir 见 scripts/sync-docs.js SUBMODULES）
  const sparseDir = SPARSE_DIRS[path]
  if (sparseDir && execSafe('git sparse-checkout init --cone', join(root, path)) !== null) {
    exec(`git sparse-checkout set ${sparseDir}`, join(root, path))
    console.log(`[prepare] ${path} 就绪（sparse: ${sparseDir}）`)
  }
  else {
    console.log(`[prepare] ${path} 就绪`)
  }
}
