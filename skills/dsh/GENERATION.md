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

1. `node scripts/sync-dsh.js` 查看当前锁定与上游新 tag。
2. `node scripts/sync-dsh.js --pin <tag>` 移动子模块指针（脚本会自动 `git add`）。
3. `cd sources/dsh && git log --oneline <旧sha>..<新sha> -- docs/` 圈定文档差异。
4. 按差异改写 `skills/dsh/SKILL.md` 与 `references/`，更新本文件的
   Pinned tag / Git SHA / Synced / Skill version。
5. 子模块指针与技能改动一并提交。
