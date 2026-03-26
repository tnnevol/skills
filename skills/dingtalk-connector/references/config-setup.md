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
- `enableMediaUpload`: 启用媒体上传功能
- `dmPolicy`: 私聊策略（open/pairing/allowlist）
- `groupPolicy`: 群聊策略（open/allowlist/disabled）
- `tools.docs`: 启用文档工具
- `tools.media`: 启用媒体工具

## 多账号配置

- `accounts`: 配置多个钉钉机器人账号
- 每个账号可独立配置 clientId、clientSecret 等参数
- 支持同时运行多个钉钉机器人实例

## 设置步骤

1. 在钉钉开放平台创建企业内部应用
2. 获取 AppKey 和 AppSecret
3. 在 OpenClaw 中配置钉钉连接器
4. 启用相应的 API 权限
5. （可选）配置多账号支持
6. （可选）配置会话策略和安全策略

## 关键要点

- 所有操作都需要有效的钉钉应用凭证
- 应用需要相应的 API 权限才能执行对应操作
- 配置信息需要妥善保管，避免泄露
- 钉钉应用需要发布后才能正常使用
- 多账号配置时，相同 clientId 只有列表中第一个启用的账号会建立连接