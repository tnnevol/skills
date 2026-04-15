# ding-agent Help

## What is ding-agent?

A skill for quickly contacting other Agents within DingTalk group chats.

## FAQ

### Q: 支持哪些 Agent？

A: 取决于 OpenClaw 配置中 `agents.list` 里定义的 Agent。使用 `/ding-agent list-agents` 查看完整列表。

### Q: 如何查看当前会话信息？

A: 使用 `/ding-agent current-session`。

### Q: 如何查看某个 Agent 的会话列表？

A: 使用 `/ding-agent list-sessions <Agent名称>`。

### Q: 为什么联系不上 demo1？

A: 可能原因：

1. **demo1 在这个群没有独立会话** → 需要在钉钉群中 @demo1 触发创建会话
2. **demo1 会话已结束** → 重新 @demo1 激活

### Q: 可以在私聊中使用吗？

A: 可以，但 session key 格式不同：

```
agent:<agentId>:dingtalk-connector:direct:<用户ID>
```

### Q: 可以发送什么类型的消息？

A: 纯文本消息。如果需要 demo1 执行任务，请使用标准任务格式。

### Q: 什么是 delivery 模式？

A: delivery 模式控制目标 Agent 回复的处理方式：

| 模式 | 效果 |
|------|------|
| `none`（默认） | 不推送回复，避免回复循环 |
| `announce` | 回复推送到当前会话 |

使用方式：`/ding-agent contact demo1 消息内容 --delivery=none|announce`

## Related Resources

- [OpenClaw Documentation](https://docs.openclaw.ai)
- Session derivation rules: see `docs/setup.md`
