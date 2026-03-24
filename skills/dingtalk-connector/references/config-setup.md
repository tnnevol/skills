---
name: config-setup
description: 钉钉连接器配置要求
---

# 配置要求

钉钉连接器需要正确配置才能正常工作。

## 必需配置

- `clientId` (AppKey): 钉钉应用的 AppKey
- `clientSecret` (AppSecret): 钉钉应用的 AppSecret

## 可选配置

- `separateSessionByConversation`: 是否按会话类型分离（默认 true）
- `groupSessionScope`: 群聊会话范围（'group' 或 'group_sender'）
- `asyncMode`: 是否启用异步模式（默认 false）
- `ackText`: 异步模式下的确认消息文本

## 设置步骤

1. 在钉钉开放平台创建应用
2. 获取 AppKey 和 AppSecret
3. 在 OpenClaw 中配置钉钉连接器
4. 启用相应的 API 权限

## 关键要点

- 所有操作都需要有效的钉钉应用凭证
- 应用需要相应的 API 权限才能执行对应操作
- 配置信息需要妥善保管，避免泄露
- 钉钉应用需要发布后才能正常使用