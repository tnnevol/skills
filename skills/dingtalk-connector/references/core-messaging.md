---
name: core-messaging
description: 钉钉核心消息发送功能
---

# 核心消息发送

钉钉连接器的主要功能之一是发送消息到用户或群组。

## 功能特性

- 发送文本消息到用户或群组
- 发送 Markdown 消息，支持复杂格式
- 发送图片、音频、视频等媒体消息
- 发送文件附件
- AI 卡片流式响应（支持打字机效果）
- 主动推送消息（无需用户触发）
- 消息处理进度反馈（自动添加"思考中"表情）

## 代码示例

```javascript
// 发送文本消息
await channel.send({
  to: "user_or_group_id",
  message: "Hello from OpenClaw!"
});

// 发送 Markdown 消息
await channel.send({
  to: "user_or_group_id", 
  message: "# 标题\n**粗体**\n- 列表项"
});

// 发送图片
await channel.send({
  to: "user_or_group_id", 
  media: "/path/to/image.jpg",
  caption: "图片说明"
});

// AI 卡片流式响应
// 当使用 AI 模型回复时，自动启用卡片模式
```

## 消息处理功能

- 自动 Markdown 表格转换（确保钉钉兼容性）
- 消息内容规范化处理
- 支持消息去重机制
- 消息队列管理（繁忙时即时排队反馈）

## 媒体处理

- 自动上传本地图片到钉钉服务器
- 支持多种媒体格式（图片、音频、视频、文档）
- 媒体文件大小限制检查
- 自动媒体格式适配

## 关键要点

- 所有操作都需要有效的钉钉应用凭证
- 钉钉对 Markdown 表格有特殊处理，会自动转换为兼容格式
- 消息格式需要遵循钉钉的规范
- AI 卡片提供更好的用户体验和流式响应
- 支持消息处理进度反馈（"思考中"表情）
- 消息队列机制确保高并发下的处理顺序