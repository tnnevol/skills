---
name: dingtalk-connector
description: 钉钉连接器完整功能集。提供发送消息、管理会话、操作文档、查询目录等功能
metadata:
  author: Anthony Fu
  version: "2026.3.24"
  source: Generated from dingtalk-openclaw-connector, scripts located at https://github.com/antfu/skills
---

> The skill is based on dingtalk-connector v1.0, generated at 2026-03-24.

钉钉连接器技能提供完整的钉钉集成能力，包括消息发送、会话管理、文档操作、目录查询等功能。

## Core References

| Topic | Description | Reference |
|-------|-------------|-----------|
| 消息发送 | 发送文本、媒体消息到用户或群组 | [core-messaging](references/core-messaging.md) |
| 会话管理 | 多轮对话上下文保持和隔离 | [core-sessions](references/core-sessions.md) |

## Features

### 消息与通信

| Topic | Description | Reference |
|-------|-------------|-----------|
| 消息发送 | 发送文本、图片、文件等各类消息 | [messaging-send](references/messaging-send.md) |
| 附件处理 | 接收并解析用户发送的文件 | [messaging-attachments](references/messaging-attachments.md) |

### 文档与知识库

| Topic | Description | Reference |
|-------|-------------|-----------|
| 文档操作 | 创建、读取、写入钉钉文档 | [docs-operations](references/docs-operations.md) |
| 知识库管理 | 管理钉钉知识库和文档结构 | [docs-knowledge-base](references/docs-knowledge-base.md) |

### 用户与目录

| Topic | Description | Reference |
|-------|-------------|-----------|
| 目录查询 | 查询钉钉用户和群组信息 | [directory-query](references/directory-query.md) |

### 配置与故障排除

| Topic | Description | Reference |
|-------|-------------|-----------|
| 配置要求 | 钉钉应用配置和认证要求 | [config-setup](references/config-setup.md) |
| 故障排除 | 常见问题及解决方案 | [troubleshooting](references/troubleshooting.md) |