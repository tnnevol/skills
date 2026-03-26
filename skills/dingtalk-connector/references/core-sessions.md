---
name: core-sessions
description: 钉钉会话管理功能
---

# 会话管理

钉钉连接器提供完整的会话管理功能，确保多轮对话的上下文保持。

## 功能特性

- 多轮对话上下文保持
- 会话隔离（私聊/群聊独立）
- 手动会话重置（/new, /reset, /clear, 新会话, 重新开始, 清空对话）
- 自动会话超时（由 OpenClaw Gateway 控制）
- 支持异步模式处理

## 会话隔离策略

- `separateSessionByConversation`: 是否按会话类型分离（默认 true）
  - 私聊与群聊分别维护会话
  - 不同群聊之间会话独立
- `groupSessionScope`: 群聊会话范围
  - 'group': 群内共享会话
  - 'group_sender': 群内每人独立会话

## 配置选项

- `separateSessionByConversation`: 是否按会话类型分离（默认 true）
- `groupSessionScope`: 群聊会话范围（'group' 或 'group_sender'）
- `sharedMemoryAcrossConversations`: 是否在不同会话间共享记忆（默认 false）
- `asyncMode`: 是否启用异步模式（默认 false）
- `ackText`: 异步模式下的确认消息文本

## 会话命令

- `/new`, `/reset`, `/clear`: 开始新会话
- `新会话`, `重新开始`, `清空对话`: 中文新会话命令

## 多 Agent 路由

- 支持多个钉钉机器人连接到不同的 Agent
- 每个 Agent 拥有独立的会话空间
- 实现会话隔离和专业化服务

## 关键要点

- 会话数据在内存中保持，重启后会丢失
- 支持多 Agent 路由，可将不同机器人连接到不同 Agent
- 会话路由基于钉钉用户 ID 或群组 ID
- 自动会话重置由 OpenClaw Gateway 的 session.reset.idleMinutes 配置控制
- 异步模式下消息会立即确认，后台处理并主动推送结果