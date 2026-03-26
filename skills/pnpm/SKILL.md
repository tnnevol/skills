---
name: pnpm
description: Node.js 包管理器，具有严格的依赖解析。在运行 pnpm 特定命令、配置工作区或使用目录、补丁或覆盖管理依赖项时使用。
metadata:
  author: Anthony Fu (Modified by Tnnevol)
  version: "2026.1.28"
  source: 从 https://github.com/pnpm/pnpm 生成，脚本位于 https://github.com/antfu/skills
---

pnpm 是一个快速、磁盘空间高效的包管理器。它使用内容可寻址存储来消除机器上所有项目中的包重复，节省大量磁盘空间。pnpm 默认强制执行严格的依赖解析，防止幻影依赖。配置最好放在 `pnpm-workspace.yaml` 中以进行 pnpm 特定设置。

**重要：** 使用 pnpm 项目时，代理应检查 `pnpm-workspace.yaml` 和 `.npmrc` 文件以了解工作区结构和配置。在 CI 环境中始终使用 `--frozen-lockfile`。

> 该技能基于 pnpm 10.x，生成于 2026-01-28。

## 核心

| 主题 | 描述 | 参考 |
|-------|-------------|-----------|
| CLI 命令 | 安装、添加、删除、更新、运行、exec、dlx 和工作区命令 | [core-cli](references/core-cli.md) |
| 配置 | pnpm-workspace.yaml、.npmrc 设置和 package.json 字段 | [core-config](references/core-config.md) |
| 工作区 | 带有过滤、工作区协议和共享锁文件的 Monorepo 支持 | [core-workspaces](references/core-workspaces.md) |
| 存储 | 内容可寻址存储、硬链接和磁盘效率 | [core-store](references/core-store.md) |

## 特性

| 主题 | 描述 | 参考 |
|-------|-------------|-----------|
| 目录 | 工作区的集中依赖版本管理 | [features-catalogs](references/features-catalogs.md) |
| 覆盖 | 强制特定版本的依赖项，包括传递依赖项 | [features-overrides](references/features-overrides.md) |
| 补丁 | 使用自定义修复修改第三方包 | [features-patches](references/features-patches.md) |
| 别名 | 使用 npm: 协议安装具有自定义名称的包 | [features-aliases](references/features-aliases.md) |
| 钩子 | 使用 .pnpmfile.cjs 钩子自定义解析 | [features-hooks](references/features-hooks.md) |
| 同级依赖 | 自动安装、严格模式和依赖规则 | [features-peer-deps](references/features-peer-deps.md) |

## 最佳实践

| 主题 | 描述 | 参考 |
|-------|-------------|-----------|
| CI/CD 设置 | GitHub Actions、GitLab CI、Docker 和缓存策略 | [best-practices-ci](references/best-practices-ci.md) |
| 迁移 | 从 npm/Yarn 迁移、处理幻影依赖、Monorepo 迁移 | [best-practices-migration](references/best-practices-migration.md) |
| 性能 | 安装优化、存储缓存、工作区并行化 | [best-practices-performance](references/best-practices-performance.md) |