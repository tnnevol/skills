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
│       └── scripts/           # 技能配套脚本（可选）
├── apps/                      # 应用目录（如 halo-cli）
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
