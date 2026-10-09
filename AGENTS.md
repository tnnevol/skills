# Tnnevol Skills

[Agent Skills](https://agentskills.io/home) 合集，用于 AI 辅助开发。

## 项目结构

```
.
├── skills/                     # 技能目录
│   └── {skill-name}/
│       ├── SKILL.md           # 技能索引和元数据
│       ├── docs/              # 技能文档（可选）
│       ├── references/        # 技能参考文件（可选）
│       ├── GENERATION.md      # 文档源溯源记录（可选，见「文档源子模块」）
│       └── scripts/           # 技能配套脚本（可选）
├── sources/                    # 上游文档子模块（只读原材料，不对外发布）
│   └── {project}/
├── apps/                      # 独立应用目录（如 chandao-cli）
├── package.json
└── eslint.config.js
```

## 技能规范

每个技能必须包含以下文件：

### `SKILL.md`

技能索引文件，包含 frontmatter 元数据和技能概览。

```markdown
---
name: {skill-name}
description: {简短描述}
metadata:
  author: Tnnevol
  version: "YYYY.MM.DD"
---

# {Skill Name}

Brief description of what this skill covers.

## Core References

| Topic   | Description | Reference                  |
| ------- | ----------- | -------------------------- |
| Topic A | Description | [topic-a](docs/topic-a.md) |
```

### `references/`

技能文档目录或参考文件，存放具体的技能说明和使用指南。

### `scripts/`

技能配套脚本，用于与外部 API 交互等操作。

## 添加新技能

1. 在 `skills/` 下创建技能目录（kebab-case 命名）
2. 创建 `SKILL.md` 索引文件，包含 frontmatter 和概览
3. 在 `references/` 中添加具体的技能文档
4. 如有需要，在 `scripts/` 中添加配套脚本
5. 在 `README.md` 的技能列表中更新

## 编写指南

1. **面向 Agent** - 内容应为 AI 辅助开发场景提供实用信息
2. **简洁实用** - 聚焦使用模式和代码示例，去除冗余
3. **结构清晰** - 使用 SKILL.md 作为索引，按主题组织参考文件
4. **代码优先** - 提供可运行的代码示例

## 文档源子模块

借鉴 [antfu/skills](https://github.com/antfu/skills) 的模式：部分技能从上游开源项目的文档生成/提炼，上游仓库以 git submodule 形式挂在 `sources/{project}`，并固定在明确的 release tag 上。`sources/` 是只读原材料，不进入对外发布的技能内容。

### 约定

1. **子模块只放 `sources/`，技能只放 `skills/`**：下游通过 `pnpx skills add` 安装时不会检出子模块，技能必须是自包含的纯 markdown。
2. **锁定 release tag**：子模块指针固定在 `dsh-v*` 之类的 release tag，不跟 master；`GENERATION.md` 记录 tag、SHA、同步日期和技能版本。
3. **提炼而非复制**：参考文件按技能需求重写上游文档；语言范围在该技能内明确声明（如 dsh 仅简体中文）。
4. **eslint 已忽略 `**/sources/**`**；`sources/` 不加入 pnpm workspace packages。

### 当前子模块

| 子模块 | 上游 | 锁定 | 同步脚本 |
| ------ | ---- | ---- | -------- |
| `sources/dsh` | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)（sparse 检出 `docs/`） | `dsh-v0.2.0-rc.2` | `node scripts/sync-dsh.js` |

### 同步流程（dsh 示例）

首次 clone 后 `pnpm install` 经 `prepare`（scripts/prepare.js）自动浅初始化子模块并启用 docs/ sparse；CI 可用 `DSH_SKIP_PREPARE=1 pnpm install` 跳过。
1. `node scripts/sync-dsh.js` 查看当前锁定与上游新 tag
2. `node scripts/sync-dsh.js --pin <tag|latest>` 移动子模块指针
3. `cd sources/dsh && git log --oneline <旧sha>..<新sha> -- docs/` 圈定文档差异
4. 按差异改写 `skills/dsh/`，更新 `GENERATION.md` 与 SKILL.md 版本号
5. 子模块指针与技能改动**一并提交**
