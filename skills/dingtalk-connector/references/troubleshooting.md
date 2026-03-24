---
name: troubleshooting
description: 钉钉连接器故障排除
---

# 故障排除

常见问题及解决方案。

## 机器人不回复

- 检查插件状态: `openclaw plugins list`
- 检查网关状态: `openclaw gateway status`  
- 查看日志: `openclaw logs --follow`
- 确认应用已在钉钉开放平台发布

## HTTP 401 错误

- 确认 clientId/clientSecret 正确
- 检查 Gateway 认证配置
- 升级到最新版本

## Stream 连接 400 错误

- 确认应用已发布
- 检查凭证是否有拼写错误
- 确认机器人配置为 Stream 模式（非 Webhook）
- 检查 IP 白名单设置

## 权限问题

- 检查应用是否具有所需的 API 权限
- 确认用户有相应操作权限
- 检查企业安全策略设置

## 关键要点

- 日志是解决问题的重要依据
- 钉钉应用需要正确发布才能接收消息
- 网络连接问题可能导致通信失败
- 定期检查凭证的有效性