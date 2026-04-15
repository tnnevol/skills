---
name: ding
description: 在钉钉群聊中快速定位并联系其他 Agent（demo1、demo2 等）。
---

# SKILL: ding-agent

ding-agent is a skill for quickly locating and contacting other Agents (demo1, demo2, etc.) within DingTalk group chats.

## Usage

```
/ding-agent <Agent名称>
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
5. If the user asks about ding-agent (what it is, how to use it) — read `${CLAUDE_SKILL_DIR}/docs/help.md` and follow the instructions there.

## Actions

| Action | Description | Details |
| -------- | ------------- | --------- |
| `contact` | Contact a specified Agent by name | `docs/actions-contact.md` |
| `list-agents` | List all available Agents from config | `docs/actions-query.md` |
| `current-session` | Show current session information | `docs/actions-query.md` |
| `list-sessions` | List sessions for a specific Agent | `docs/actions-query.md` |
| `help` | FAQ and help | `docs/help.md` |

### `help` (or no arguments) — Show available actions

| Action | Usage | Description |
| -------- | ------- | ------------- |
| `contact` | `/ding-agent contact <Agent名称> <message> [--delivery=none|announce]` | Contact a specified Agent by name |
| `list-agents` | `/ding-agent list-agents` | List all available Agents from config |
| `current-session` | `/ding-agent current-session` | Show current session information |
| `list-sessions` | `/ding-agent list-sessions <Agent名称>` | List sessions for a specific Agent |
| `help` | `/ding-agent help <question>` | Answer questions about ding-agent |
