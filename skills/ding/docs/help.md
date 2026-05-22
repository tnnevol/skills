# ding Help

## What is ding?

A skill for quickly contacting other Agents within DingTalk group chats.

## FAQ

### Q: 支持哪些 Agent？

A: 取决于 OpenClaw 配置中 `agents.list` 里定义的 Agent。使用 `/ding list` 查看完整列表。

### Q: 如何查看当前会话信息？

A: 使用 `/ding info`。

### Q: 如何查看某个 Agent 的会话列表？

A: 使用 `/ding sessions <Agent名称>`。

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

### Q: 联系不上某个 Agent 怎么办？

A: 可能原因：

1. **该 Agent 在这个群没有独立会话** → 需要在钉钉群中 @该Agent 触发创建会话
2. **该 Agent 会话已结束** → 重新 @该Agent 激活

## Related Resources

- [OpenClaw Documentation](https://docs.openclaw.ai)
- Session derivation rules: see `docs/setup.md`
