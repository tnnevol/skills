---
title: 钉钉
name: ding
description: 在钉钉群聊中快速定位并联系其他代理（demo1、demo2 等）。
---

# 技能：钉钉

钉钉技能用于在群聊中快速定位并联系其他代理，例如 demo1、demo2 等。

## 使用方法

```
/ding <代理名称>
```

## 核心解析规则（禁止硬编码代理编号）

1. **匹配代理** — 从 OpenClaw 的 `agents.list` 配置中，将用户输入与 `identity.name` 匹配：
   - 输入“demo1” → 匹配包含“demo1”的 `name` 或 `identity.name` → 解析 `agentId`
   - 输入“demo2” → 匹配包含“demo2”的 `identity.name` → 解析 `agentId`

2. **查找绑定** — 从 `bindings` 中找到匹配 `agentId` 对应的 `accountId` 和 `channel`：
   - 例如 `agentId: "demo-agent-1"` → `accountId: "demo-bot-1"`，`channel: "dingtalk-connector"`

3. **组合会话键** — 根据当前会话信息生成：
   ```
   agent:<agentId>:<channel>:group:<当前群ID>
   ```

4. **尝试联系** — 使用 `sessions_send` 向目标会话发送消息，并设置 `timeoutSeconds: 60`：
   - 成功 → 返回结果
   - 超时（60 秒）→ 立即停止并报告：“<代理名称> 响应超时”
   - 失败 → 立即停止并报告：“发送失败”

## 安全规范

1. Do not hardcode `agentId`, `accountId`, or session keys into any file.
2. 所有代理解析必须在运行时根据 OpenClaw 配置动态完成。
3. 不要在面向用户的聊天输出中暴露内部会话信息（accountId、channel、会话键）。
4. **防止联系自身**：如果解析出的会话键属于当前代理（agentId 相同），拒绝发送并提示用户：“你正在尝试联系自己，请确认目标代理名称。”
5. 联系失败时，应使用清晰易懂的提示进行处理。

## 使用方法

1. **First invocation only** — read `${CLAUDE_SKILL_DIR}/docs/setup.md` for configuration and runtime detection.
2. 根据下方表格匹配操作。
3. 阅读对应文档，按详细步骤执行。
4. 没有参数或无法识别操作时，显示下方帮助表格。
5. 用户询问钉钉技能或命令用法时，阅读 `${CLAUDE_SKILL_DIR}/docs/help.md` 并遵循其中说明。

## 操作列表

| 操作 | 描述 | 详细说明 |
| -------- | ------------- | --------- |
| `send` | 发送消息给指定代理 | `docs/actions-contact.md` |
| `list` | 列出所有可用代理 | `docs/actions-query.md` |
| `info` | 显示当前会话信息 | `docs/actions-query.md` |
| `sessions` | 列出指定代理的会话 | `docs/actions-query.md` |
| `help` | 常见问题解答 | `docs/help.md` |

### `help`（或无参数）— 显示可用操作

| 操作 | 用法 | 描述 |
|--------|-------|-------------|
| `send` | `/ding send <代理名称> <消息>` | 发消息给指定代理 |
| `list` | `/ding list` | 列出在线代理 |
| `info` | `/ding info` | 当前会话信息 |
| `sessions` | `/ding sessions <代理名称>` | 查询指定代理的会话列表 |
| `help` | `/ding help <问题>` | 回答相关问题 |
