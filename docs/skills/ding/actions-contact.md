# `send` — 发送消息给指定 Agent

## Usage

```
/ding send <Agent名称> <消息内容>
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `<Agent名称>` | string | Yes | - | 目标 Agent 名称 |
| `<消息内容>` | string | Yes | - | 消息内容 |
| `timeoutSeconds` | number | No | `60` | 等待目标会话响应的超时时间（秒） |

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
agent:<agentId>:<channel>:group:<当前群ID>
```

- The current group ID is obtained from the inbound metadata.

### 4. Self-Contact Prevention

- Check if the resolved `agentId` matches the current agent's ID.
- **If yes** → **Refuse to send**, prompt: "你正在尝试联系自己，请确认目标 Agent 名称。"

### 5. Send Message

- Use `sessions_send` to the target session:
  - `sessionKey`: composed session key from step 3
  - `message`: the user's message content
  - `timeoutSeconds`: **60**（防止长时间阻塞，超时立即停止并回报）
- **Success** → Return the Agent's reply.
- **Timeout** → 立即停止，回报："<Agent名称> 响应超时"。
- **Failure** → 立即停止，回报："发送失败"。

## Examples

```
/ding send 小钱 帮我检查一下 demo skill 的进度
/ding send 小张 帮我看看网络配置
```

## Error Handling

| Error | User Message |
|-------|-------------|
| Agent not found | "未找到名为 'xxx' 的 Agent，可用：demo1、demo2..." |
| No binding found | "该 Agent 未绑定钉钉" |
| **Self-contact** | "你正在尝试联系自己，请确认目标 Agent 名称。" |
| `sessions_send` **timeout** (60s) | "<Agent名称> 响应超时，立即停止" |
| `sessions_send` fails | "发送失败，立即停止" |
