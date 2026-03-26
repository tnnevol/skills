---
name: advanced-config
description: 钉钉连接器高级配置选项
---

# 高级配置

钉钉连接器提供多种高级配置选项，支持多账号、异步模式、会话策略等高级功能。

## 多账号支持

- `accounts`: 配置多个钉钉机器人账号，每个账号可独立配置
- 支持同一插件实例连接多个机器人
- 每个账号独立管理会话和权限

## 异步模式

- `asyncMode`: 启用异步模式（默认 false）
- `ackText`: 异步模式下的确认消息文本（默认 "🫡 任务已接收，处理中..."）
- 立即回执用户消息，后台处理任务，然后主动推送最终结果

## 会话管理策略

- `separateSessionByConversation`: 按会话类型分离（默认 true）
- `groupSessionScope`: 群聊会话范围（'group' 或 'group_sender'）
- `sharedMemoryAcrossConversations`: 不同会话间共享记忆（默认 false）

## 消息处理选项

- `enableMediaUpload`: 启用媒体上传功能
- `mediaMaxMb`: 媒体文件大小限制
- `typingIndicator`: 启用打字指示器
- `resolveSenderNames`: 解析发送者姓名

## 工具权限控制

- `tools.docs`: 控制文档工具的可用性
- `tools.media`: 控制媒体工具的可用性
- `groups[].tools.allow/deny`: 群组级别工具访问控制

## 安全策略

- `dmPolicy`: 私聊策略（open/pairing/allowlist）
- `groupPolicy`: 群聊策略（open/allowlist/disabled）
- `allowFrom/groupAllowFrom`: 允许的用户列表
- `requireMention`: 群聊中是否需要提及机器人

## 性能与限制

- `historyLimit`: 消息历史记录限制
- `textChunkLimit`: 文本分块大小限制（默认 2000）
- `typingIndicator`: 启用打字指示器