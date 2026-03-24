---
name: messaging-send
description: 钉钉消息发送功能详解
---

# 消息发送

发送各类消息到钉钉用户或群组的功能。

## 支持的消息类型

- 文本消息
- 图片消息
- 音频、视频等媒体消息
- 文件附件
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
```

## 关键要点

- 需要有效的钉钉应用凭证
- 消息内容需要符合钉钉的安全规范
- 群聊和私聊的消息发送方式略有不同
- 支持主动推送消息（无需用户触发）