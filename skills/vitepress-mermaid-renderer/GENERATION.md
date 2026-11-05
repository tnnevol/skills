# Generation Info

skills/vitepress-mermaid-renderer 的参考文件依据 `sources/vitepress-mermaid-renderer`
（sametcn99/vitepress-mermaid-renderer 子模块，sparse 检出 `docs/content/zh`）
的快照轻改写（去除上游站点自身的 Bun 配置叙述、调整个别措辞），正文以原文为主。

- **Source:** `sources/vitepress-mermaid-renderer`
- **Pinned tag:** `v1.2.3`
- **Git SHA:** `5b2556adf16dceae3918e458cc5a2e2965694f58`
- **Synced:** 2026-11-05
- **Skill version:** `1.0.1`
- **语言范围:** 仅简体中文（`docs/content/zh`）。上游英文/土耳其语页面不纳入本技能。

## v1.2.3 同步记录（2026-11-05）

从 `v1.2.2` 同步到 `v1.2.3`，上游只有一个提交（`5b2556a change license MIT`）。

- **`docs/content/zh` 零差异**：`git diff v1.2.2..v1.2.3 -- docs/content/zh` 为空，参考文件内容不需改写。
- **许可证变更**：项目许可证由 `GPL-3.0-only` 改为 `MIT`（`package.json` 的 `license` 字段变化，仓库内多份 GPL LICENSE 副本删除）。用户侧使用与再分发限制放宽；技能正文未提及许可证，故无需改口，仅在此记录。
- **版本号变更**：`package.json` 的 `version` 由 `1.2.2` 改为 `1.2.3`。技能正文中的快照引用同步改为 `v1.2.3`。

## 与历史快照的关系

本技能最初的参考文件按 2026-09-24 的 `main` 快照整理（旧
`references/SOURCE.md` 记录）；经逐文件比对，内容与上游 `v1.2.2` tag
（2026-09-11）一致，故溯源基准收敛到该 tag。`v1.2.3` 的中文文档与
`v1.2.2` 完全一致，本次同步不改变参考文件内容。

## 同步流程

首次 clone 后 `pnpm install` 会通过 `prepare` 脚本自动初始化子模块
（浅克隆 + 仅检出 `docs/content/zh`）；也可手动执行
`git submodule update --init sources/vitepress-mermaid-renderer`。

1. `pnpm start check vitepress-mermaid-renderer` 查看当前锁定与上游新 tag。
2. `pnpm start sync vitepress-mermaid-renderer <tag|latest>` 移动子模块指针
   （脚本会自动 `git add`；注意 latest 会立即移动指针，非幂等预览）。
3. `cd sources/vitepress-mermaid-renderer && git log --oneline <旧sha>..<新sha> -- docs/` 圈定文档差异。
4. 按差异轻改写 `skills/vitepress-mermaid-renderer/references/`，更新本文件的
   Pinned tag / Git SHA / Synced / Skill version。
5. 子模块指针与技能改动一并提交。
