# ding-agent Setup

## No Environment Variables Required

This skill does not require any environment variables. All configuration is read dynamically from the OpenClaw main configuration.

## Configuration Source

Configuration is read from the OpenClaw main configuration (`openclaw.json`):

| Key | Description |
| --- | ----------- |
| `agents.list` | List of available agents (includes `identity.name`, `agentId`) |
| `bindings` | Agent-to-DingTalk account bindings (`agentId` → `accountId`, `channel`) |

## Runtime Detection

To detect the current configuration:

```bash
# Get agents configuration
openclaw config get agents.list
```

Or read the configuration directly at runtime.

## Action Mapping

| Action | Flow |
|--------|------|
| `contact` | Match Agent → Find Binding → Compose Session Key → Self-Check → `sessions_send` |
| `list-agents` | Read config → Parse `agents.list` → Output |
| `current-session` | Read metadata → Parse config → Output current session info |
| `list-sessions` | Match Agent → Call `sessions_list` → Filter by agentId → Output |

## Error Handling

| Error | User Message |
|-------|-------------|
| No matching agent found | "未找到匹配的 Agent，请确认名称是否正确" |
| No binding found | "该 Agent 未绑定钉钉账号" |
| **Self-contact** | "你正在尝试联系自己，请确认目标 Agent 名称。" |
| `sessions_send` fails | "需要在钉钉群中 @<Agent名称>" |
