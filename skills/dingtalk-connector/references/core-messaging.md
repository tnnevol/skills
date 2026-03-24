---
name: core-messaging
description: 钉钉核心消息发送功能
---

# 核心消息发送

钉钉连接器的主要功能之一是发送消息到用户或群组。

## 功能特性

- 发送文本消息到用户或群组
- 发送图片、音频、视频等媒体消息
- 发送文件附件
- 主动推送消息（无需用户触发）

## 使用方法

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
```

## 关键要点

- 所有操作都需要有效的钉钉应用凭证
- 钉钉对 Markdown 表格有特殊处理，会自动转换为兼容格式
- 消息格式需要遵循钉钉的规范