---
name: dingtalk-document
description: 钉钉知识库和文档管理操作。提供创建知识库、查询知识库列表、新建文档/文件夹、读取/写入文档正文内容、管理成员权限等功能
metadata:
  author: Anthony Fu
  version: "2026.3.24"
  source: Generated from dingtalk-document connector, scripts located at https://github.com/antfu/skills
---

> The skill is based on dingtalk-document v1.0, generated at 2026-03-24.

钉钉文档技能提供完整的钉钉知识库和文档操作能力，包括知识库管理、文档创建读写、成员权限管理等功能。

## Core References

| Topic | Description | Reference |
|-------|-------------|-----------|
| 核心概念 | 知识库、节点、文档标识等基本概念 | [core-concepts](references/core-concepts.md) |
| 工作流程 | 文档操作的标准工作流程 | [core-workflow](references/core-workflow.md) |

## Features

### 知识库管理

| Topic | Description | Reference |
|-------|-------------|-----------|
| 查询知识库 | 列出和查询知识库信息 | [workspace-query](references/workspace-query.md) |
| 知识库配置 | 配置和管理知识库访问参数 | [workspace-config](references/workspace-config.md) |

### 文档操作

| Topic | Description | Reference |
|-------|-------------|-----------|
| 文档创建 | 创建新文档和文件夹 | [document-create](references/document-create.md) |
| 文档读取 | 读取文档内容 | [document-read](references/document-read.md) |
| 文档写入 | 覆盖或追加写入文档内容 | [document-write](references/document-write.md) |
| 文档管理 | 删除和管理文档 | [document-management](references/document-management.md) |

### 权限与成员

| Topic | Description | Reference |
|-------|-------------|-----------|
| 成员管理 | 添加、更新、移除文档成员 | [member-management](references/member-management.md) |
| 权限控制 | 管理文档成员权限 | [permission-control](references/permission-control.md) |

### 工具与辅助

| Topic | Description | Reference |
|-------|-------------|-----------|
| 辅助脚本 | dt_helper.sh 脚本使用方法 | [helper-scripts](references/helper-scripts.md) |
| API 参考 | 详细 API 调用参考 | [api-reference](references/api-reference.md) |