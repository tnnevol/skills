# 技能开发规范

本文档介绍技能的目录结构和开发规范，帮助开发者创建新的智能技能。

## 项目结构

```
.
├── skills/                     # 技能目录
│   └── {skill-name}/
│       ├── SKILL.md           # 技能索引和元数据
│       ├── docs/              # 技能文档（可选）
│       ├── references/        # 技能参考文件（可选）
│       └── scripts/           # 技能配套脚本（可选）
├── apps/                      # 独立应用目录（如命令行工具）
├── package.json
└── eslint.config.js
```

## SKILL.md 格式要求

每个技能必须在根目录包含一个 `SKILL.md` 文件，作为技能索引和元数据入口。

### Frontmatter 元数据

```markdown
---
name: {skill-name}
description: {简短描述}
metadata:
  author: Tnnevol
  version: "YYYY.MM.DD"
---
```

### 文件内容结构

```markdown
---
name: my-skill
description: 我的技能简短描述
metadata:
  author: Tnnevol
  version: "2026.07.31"
---

# 我的技能

技能功能的简要概述。

## 核心参考

| 主题    | 描述        | 参考文档                    |
| ------- | ----------- | -------------------------- |
| Topic A | 描述 A      | [topic-a](docs/topic-a.md) |
| Topic B | 描述 B      | [topic-b](docs/topic-b.md) |
```

## 目录结构规范

### `docs/` 或 `references/`

技能文档目录，存放具体的技能说明和使用指南。

- `docs/` — 面向用户的技能文档
- `references/` — 技能参考文件和详细说明

按主题组织文件，每个文件对应一个功能模块或操作类别。

### `scripts/`

技能配套脚本，用于与外部 API 交互等操作。

脚本应：
- 使用清晰的命名（如 `action-name.sh` 或 `action-name.js`）
- 包含必要的错误处理
- 支持通过环境变量接收配置

## 添加新技能

1. 在 `skills/` 下创建技能目录（kebab-case 命名）
2. 创建 `SKILL.md` 索引文件，包含 frontmatter 和概览
3. 在 `references/` 或 `docs/` 中添加具体的技能文档
4. 如有需要，在 `scripts/` 中添加配套脚本
5. 在 `README.md` 的技能列表中更新

## 编写指南

1. **面向代理** — 内容应为人工智能辅助开发场景提供实用信息
2. **简洁实用** — 聚焦使用模式和代码示例，去除冗余
3. **结构清晰** — 使用 SKILL.md 作为索引，按主题组织参考文件
4. **代码优先** — 提供可运行的代码示例

## 命名规范

- 技能目录使用 **kebab-case**（如 `my-skill-name`）
- 文件名使用 **kebab-case**（如 `api-reference.md`）
- 脚本文件使用 **kebab-case** 加扩展名（如 `fetch-data.sh`）
