#!/usr/bin/env node
// 兼容别名：等价于 `node scripts/sync-docs.js dsh ...`
// dsh 是第一个接入文档源子模块机制的技能，保留此入口方便沿用旧习惯。
// 未显式指定子模块时默认 dsh；已指定（如 vitepress-mermaid-renderer）则透传。

import process from 'node:process'

const argv = process.argv.slice(2)
const KNOWN = new Set(['dsh', 'vitepress-mermaid-renderer'])
const hasProject = argv.length > 0 && !argv[0].startsWith('-') && KNOWN.has(argv[0])

if (!hasProject)
  argv.unshift('dsh')

process.argv = [process.argv[0], process.argv[1], ...argv]
await import('./sync-docs.js')
