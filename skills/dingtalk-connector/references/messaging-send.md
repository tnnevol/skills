---
name: messaging-send
description: 钉钉消息发送功能详解
---

# 消息发送

发送各类消息到钉钉用户或群组的功能。

## 支持的消息类型

- 文本消息
- Markdown 消息
- 图片消息
- 音频、视频等媒体消息
- 文件附件
- AI 卡片消息（支持流式响应）
- 富媒体消息

## 代码示例

```javascript
// 发送文本消息
await channel.send({
  to: "user_or_group_id",
  message: "Hello from OpenClaw!"
});

// 发送图片
await channel.send({
  to: "user_or_group_id", 
  media: "/path/to/image.jpg",
  caption: "图片说明"
});

// 发送文件
await channel.send({
  to: "user_or_group_id",
  filePath: "/path/to/file.pdf",
  caption: "文件说明"
});

// 主动发送消息（无需用户触发）
await channel.send({
  to: "user_or_group_id",
  message: "主动推送消息",
  proactive: true
});
```

## AI 卡片功能

- 支持 AI Card 流式响应，提供打字机效果
- 实时流式显示回复内容
- 支持 Markdown 格式内容
- 自动处理 Markdown 表格转换

## 媒体处理

- 自动上传本地图片到钉钉服务器
- 支持多种图片格式（JPEG、PNG、GIF、BMP、WEBP）
- 支持视频和音频文件上传
- 自动处理媒体文件大小限制

## 关键要点

- 需要有效的钉钉应用凭证
- 消息内容需要符合钉钉的安全规范
- 群聊和私聊的消息发送方式略有不同
- 支持主动推送消息（无需用户触发）
- AI 卡片提供更好的用户体验
- 媒体文件有大小限制（图片10MB，视频/文件20MB，音频2MB）