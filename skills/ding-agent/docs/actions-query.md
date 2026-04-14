# Actions: list-agents, current-session, list-sessions

## `list-agents` — 列出所有可用 Agent

**功能：** 读取 OpenClaw 配置中的 `agents.list`，输出可用 Agent 列表

**使用方式：**
```
/ding-agent list-agents
```

**执行流程：**
1. 读取 `~/.openclaw/openclaw.json`
2. 解析 `agents.list`
3. 输出每个 Agent 的 `id`、`identity.name`、`identity.emoji`、`workspace`

**输出示例：**
```json
{
  "agents": [
    { "id": "demo-agent-1", "name": "demo1", "emoji": "💻", "workspace": "~/.openclaw/workspace-coding" },
    { "id": "demo-agent-2", "name": "demo2", "emoji": "🌐", "workspace": "~/.openclaw/workspace-network" }
  ]
}
```

---

## `current-session` — 获取当前会话信息

**功能：** 从 inbound metadata 中提取当前会话信息

**使用方式：**
```
/ding-agent current-session
```

**输出内容：**
- 当前会话的 `group ID`（群聊）或 `direct`（私聊）
- 当前 `agentId`
- 当前 `channel`
- 当前 `sender ID`

---

## `list-sessions` — 获取指定 Agent 的会话列表

**功能：** 列出指定 Agent 的所有可见会话

**使用方式：**
```
/ding-agent list-sessions <Agent名称>
```

**执行流程：**
1. 匹配 Agent 昵称 → 得到 `agentId`
2. 使用 `sessions_list` 获取该 Agent 的会话
3. 输出会话列表（session key、label、status、updatedAt）

**输出示例：**
```json
{
  "agentId": "demo-agent-1",
  "sessions": [
    { "sessionKey": "...", "label": "auto-save-mcp", "status": "running" },
    { "sessionKey": "...", "label": "memos-skills", "status": "done" }
  ]
}
```
