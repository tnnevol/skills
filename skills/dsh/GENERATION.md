# Generation Info

skills/dsh 的参考文件依据 `sources/dsh`（deepseek-ai/deepseek-harness 子模块，
sparse 检出 `docs/`）的快照手工提炼维护，不复制原文。

- **Source:** `sources/dsh`
- **Pinned tag:** `dsh-v0.2.0-rc.2`
- **Git SHA:** `639ed015397290b3745d163aafe02ffee4aa3f84`
- **Synced:** 2026-10-09
- **Skill version:** `1.0.5`
- **语言范围:** 仅简体中文（`*.zh.md`）。上游英文页与 `.i18n.yaml` 配对文件不纳入本技能。

## 同步流程

首次 clone 后 `pnpm install` 会通过 `prepare` 脚本自动初始化子模块
（浅克隆 + 仅检出 `docs/`）；也可手动执行 `git submodule update --init sources/dsh`。

1. `pnpm start check dsh` 查看当前锁定与上游新 tag。
2. `pnpm start sync dsh <tag|latest>` 移动子模块指针（脚本会自动 `git add`；
   注意 latest 会立即移动指针，非幂等预览）。
3. `cd sources/dsh && git log --oneline <旧sha>..<新sha> -- docs/` 圈定文档差异。
4. 按差异改写 `skills/dsh/SKILL.md` 与 `references/`，更新本文件的
   Pinned tag / Git SHA / Synced / Skill version。
5. 子模块指针与技能改动一并提交。
