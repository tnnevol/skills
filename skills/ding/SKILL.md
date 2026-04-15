---
name: ding
description: 在钉钉群聊中快速定位并联系其他 Agent（demo1、demo2 等）。
---

# SKILL: ding

ding is a skill for quickly locating and contacting other Agents (demo1, demo2, etc.) within DingTalk group chats.

## Usage

```
/ding <Agent名称>
```

## Core Resolution Rules (No Hardcoded agentId)

1. **Match Agent** — From the OpenClaw `agents.list` configuration, match the user's input against `identity.name`:
   - Input "demo1" → match `name` or `identity.name` containing "demo1" → resolve `agentId`
   - Input "demo2" → match `identity.name` containing "demo2" → resolve `agentId`

2. **Find Binding** — From `bindings`, find the `accountId` and `channel` for the matched `agentId`:
   - e.g., `agentId: "demo-agent-1"` → `accountId: "demo-bot-1"`, `channel: "dingtalk-connector"`

3. **Compose Session Key** — Derive from current session info:
   ```
   agent:<agentId>:<channel>:group:<当前群ID>:<当前发送者ID>
   ```

4. **Attempt Contact** — Use `sessions_send` to the target session:
   - Success → return result
   - Failure → prompt "需要在钉钉群中 @<Agent名称>"

## Security Guidelines

1. Do not hardcode `agentId`, `accountId`, or session keys into any file.
2. All agent resolution is done dynamically from the OpenClaw configuration at runtime.
3. Do not expose internal session details (accountId, channel, session key) in user-facing chat output.
4. **Self-contact prevention**: If the resolved session key belongs to the current agent (same agentId), refuse to send and prompt the user: "你正在尝试联系自己，请确认目标 Agent 名称。"
5. Contact failures are handled gracefully with user-friendly prompts.

## How to Execute

1. **First invocation only** — read `${CLAUDE_SKILL_DIR}/docs/setup.md` for configuration and runtime detection.
2. Match the action from the table below.
3. Read the corresponding doc file for detailed steps.
4. If no arguments or unrecognized action, show the help table below.
5. If the user asks about ding (what it is, how to use it) — read `${CLAUDE_SKILL_DIR}/docs/help.md` and follow the instructions there.

## Actions

| Action | Description | Details |
| -------- | ------------- | --------- |
| `send` | 发送消息给指定 Agent | `docs/actions-contact.md` |
| `list` | 列出所有可用 Agent | `docs/actions-query.md` |
| `info` | 显示当前会话信息 | `docs/actions-query.md` |
| `sessions` | 列出指定 Agent 的会话 | `docs/actions-query.md` |
| `help` | 常见问题解答 | `docs/help.md` |

### `help` (or no arguments) — Show available actions

| Action | Usage | Description |
|--------|-------|-------------|
| `send` | `/ding send <Agent名称> <消息>` | 发消息给指定 Agent |
| `list` | `/ding list` | 列出在线 Agent |
| `info` | `/ding info` | 当前会话信息 |
| `sessions` | `/ding sessions <Agent名称>` | 查某人的会话列表 |
| `help` | `/ding help <问题>` | 回答相关问题 |
