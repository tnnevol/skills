# `contact` — 联系指定 Agent

## Usage

```
/ding-agent contact <Agent名称> <消息内容> [--delivery=none|announce]
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `<Agent名称>` | string | Yes | - | Name of the target Agent |
| `<消息内容>` | string | Yes | - | Message content to send |
| `--delivery` | string | No | `none` | Delivery mode: `none` (no reply), `announce` (reply to current session) |

## Execution Flow

### 1. Match Agent

- Read `agents.list` from OpenClaw configuration.
- Match the user's input nickname against `identity.name` or `name`.
- Fuzzy matching is supported (contains keyword is sufficient).
- Example: input "demo1" → match entry where `name` contains "demo1".

### 2. Find Binding

- Read `bindings` from OpenClaw configuration.
- Find the corresponding `accountId` and `channel` for the matched `agentId`.
- Example: `demo-agent-1` → `demo-bot-1`, `dingtalk-connector`.

### 3. Compose Session Key

```
agent:<agentId>:<channel>:group:<当前群ID>:<当前发送者ID>
```

- The current group ID and sender ID are obtained from the inbound metadata.

### 4. Self-Contact Prevention

- Check if the resolved `agentId` matches the current agent's ID.
- **If yes** → **Refuse to send**, prompt: "你正在尝试联系自己，请确认目标 Agent 名称。"

### 5. Send Message

- Use `sessions_send` to the target session.
- **Success** → Return the Agent's reply.
- **Failure** → Prompt "需要在钉钉群中 @<Agent名称>".

## Examples

```
/ding-agent contact demo1 帮我检查一下 demo skill 的进度                    # 默认 delivery=none
/ding-agent contact demo1 帮我检查一下 demo skill 的进度 --delivery=none   # 显式指定不推送回复
/ding-agent contact demo1 帮我检查一下 demo skill 的进度 --delivery=announce  # 推送回复到当前会话
```

## Error Handling

| Error | User Message |
|-------|-------------|
| Agent not found | "未找到名为 'xxx' 的 Agent，可用：demo1、demo2..." |
| No binding found | "该 Agent 未绑定钉钉" |
| **Self-contact** | "你正在尝试联系自己，请确认目标 Agent 名称。" |
| `sessions_send` fails | "需要在钉钉群中 @demo1 才能联系" |
