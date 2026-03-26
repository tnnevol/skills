---
name: troubleshooting
description: 钉钉连接器故障排除
---

# 故障排除

常见问题及解决方案。

## 机器人不回复

**症状**: 机器人不回复消息

**解决方案**:
1. 检查插件状态：`openclaw plugins list`
2. 检查网关状态：`openclaw gateway status`
3. 查看日志：`openclaw logs --follow`
4. 确认应用已在钉钉开放平台发布

## HTTP 401 错误

**症状**: 错误信息显示 "401 Unauthorized"

**原因**: Gateway 认证失败

**解决方案**:
- 检查 `clientId` 和 `clientSecret` 配置是否正确
- 确保没有多余的空格或换行符
- 验证凭证在钉钉开放平台仍然有效

## Stream 连接 400 错误

**症状**: 日志显示 "Request failed with status code 400"

**常见原因**:

| 原因 | 解决方案 |
|------|----------|
| 应用未发布 | 前往钉钉开放平台 → 版本管理 → 发布 |
| 凭证错误 | 检查 `clientId`/`clientSecret` 是否有拼写错误或多余空格 |
| 非 Stream 模式 | 确认机器人配置为 Stream 模式（不是 Webhook） |
| IP 白名单限制 | 检查应用是否设置了 IP 白名单 |

## 版本兼容性问题

**症状**: 加载插件时出现版本不兼容错误

**解决方案**:
- 升级 OpenClaw 到最新版本
- 确保插件版本与 OpenClaw SDK 版本兼容

## 多账号重复连接

**症状**: 相同 clientId 的账号建立多个连接

**解决方案**:
- 插件会自动处理去重，同一 clientId 只有列表中第一个启用账号建立连接

## WebSocket 断连

**症状**: 长时间运行后连接断开

**解决方案**:
- 插件内置指数退避重连机制
- 检查网络连接稳定性
- 验证钉钉开放平台的连接状态

## 媒体文件处理失败

**症状**: 图片、音频、视频等媒体文件无法正常处理

**解决方案**:
- 检查媒体文件大小是否超出限制
- 验证 `enableMediaUpload` 配置项
- 确认 oapi 令牌有效性

## 会话管理问题

**症状**: 会话混乱或无法正确隔离

**解决方案**:
- 检查 `separateSessionByConversation` 配置
- 验证 `groupSessionScope` 设置
- 确认 `sharedMemoryAcrossConversations` 配置

## 文档 API 失败

**症状**: 钉钉文档操作失败

**解决方案**:
- 确认文档 API 权限已开启
- 验证空间 ID 和节点 ID 的有效性
- 检查操作员 ID（operatorId）是否为有效的 unionId

## 配置验证

**验证步骤**:

1. **检查应用状态**:
   - 登录 [钉钉开放平台](https://open-dev.dingtalk.com/)
   - 确认应用已发布
   - 确认机器人已启用且为 Stream 模式

2. **重新发布应用**:
   - 修改任何配置后，必须点击 **保存** → **发布**

3. **检查日志**:
   - `openclaw logs --follow` 查看实时日志
   - 关注错误信息和警告