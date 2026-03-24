---
name: core-sessions
description: 钉钉会话管理功能
---

# 会话管理

钉钉连接器提供完整的会话管理功能，确保多轮对话的上下文保持。

## 功能特性

- 多轮对话上下文保持
- 会话隔离（私聊/群聊独立）
- 手动会话重置（/new, /reset, /clear）
- 自动会话超时（30分钟无活动）

## 配置选项

- `separateSessionByConversation`: 是否按会话类型分离（默认 true）
- `groupSessionScope`: 群聊会话范围（'group' 或 'group_sender'）
- `asyncMode`: 是否启用异步模式（默认 false）
- `ackText`: 异步模式下的确认消息文本

## 关键要点

- 会话数据在内存中保持，重启后会丢失
- 支持多 Agent 路由，可将不同机器人连接到不同 Agent
- 会话路由基于钉钉用户 ID 或群组 ID