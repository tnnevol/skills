# Generation Info

skills/vitepress-mermaid-renderer 的参考文件依据 `sources/vitepress-mermaid-renderer`
（sametcn99/vitepress-mermaid-renderer 子模块，sparse 检出 `docs/content/zh`）
的快照轻改写（去除上游站点自身的 Bun 配置叙述、调整个别措辞），正文以原文为主。

- **Source:** `sources/vitepress-mermaid-renderer`
- **Pinned tag:** `v1.2.2`
- **Git SHA:** `61cc3ba41e0285caa7b7131de14e8bb30c4a7bbc`
- **Synced:** 2026-10-09
- **Skill version:** `1.0.0`
- **语言范围:** 仅简体中文（`docs/content/zh`）。上游英文/土耳其语页面不纳入本技能。

## 与历史快照的关系

本技能最初的参考文件按 2026-09-24 的 `main` 快照整理（旧
`references/SOURCE.md` 记录）；经逐文件比对，内容与上游 `v1.2.2` tag
（2026-09-11）一致，故溯源基准收敛到该 tag。

## 同步流程

首次 clone 后 `pnpm install` 会通过 `prepare` 脚本自动初始化子模块
（浅克隆 + 仅检出 `docs/content/zh`）；也可手动执行
`git submodule update --init sources/vitepress-mermaid-renderer`。

1. `node scripts/sync-docs.js` 查看当前锁定与上游新 tag。
2. `node scripts/sync-docs.js --pin <tag>` 移动子模块指针（脚本会自动 `git add`）。
3. `cd sources/vitepress-mermaid-renderer && git log --oneline <旧sha>..<新sha> -- docs/` 圈定文档差异。
4. 按差异轻改写 `skills/vitepress-mermaid-renderer/references/`，更新本文件的
   Pinned tag / Git SHA / Synced / Skill version。
5. 子模块指针与技能改动一并提交。
