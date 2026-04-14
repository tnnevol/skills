#!/usr/bin/env node
/**
 * resolve-session.cjs
 *
 * Dynamically resolves a target session key from an Agent nickname.
 *
 * Usage:
 *   node resolve-session.cjs <Agent昵称> <群ID> <发送者ID>
 *
 * Output:
 *   JSON with sessionKey, agentId, accountId, channel (or error)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function main() {
  const nickname = process.argv[2];
  const groupId = process.argv[3];
  const senderId = process.argv[4];

  if (!nickname) {
    console.error(JSON.stringify({ error: '请提供 Agent 昵称' }));
    process.exit(1);
  }

  if (!groupId || !senderId) {
    console.error(JSON.stringify({ error: '请提供群 ID 和发送者 ID' }));
    process.exit(1);
  }

  // 1. Read OpenClaw config
  const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');

  let config;
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(raw);
  } catch (e) {
    console.error(JSON.stringify({ error: '无法读取 OpenClaw 配置: ' + e.message }));
    process.exit(1);
  }

  const agentsList = config.agents && config.agents.list ? config.agents.list : [];
  const bindings = config.bindings || [];

  // 2. Match Agent by nickname
  let matchedAgent = null;
  for (const agent of agentsList) {
    const name = (agent.identity && agent.identity.name) || agent.name || '';
    if (name.includes(nickname)) {
      matchedAgent = agent;
      break;
    }
  }

  if (!matchedAgent) {
    const availableNames = agentsList.map(a => (a.identity && a.identity.name) || a.name || '(unknown)');
    console.error(JSON.stringify({
      error: `未找到名为 '${nickname}' 的 Agent`,
      available: availableNames
    }));
    process.exit(1);
  }

  const agentId = matchedAgent.agentId || matchedAgent.id;

  // Self-contact prevention
  const currentAgentId = process.env.OPENCLAW_AGENT_ID || '';
  if (currentAgentId && agentId === currentAgentId) {
    console.error(JSON.stringify({
      error: '你正在尝试联系自己，请确认目标 Agent 名称',
      targetAgentId: agentId
    }));
    process.exit(2);
  }

  // 3. Find Binding
  let matchedBinding = null;
  for (const binding of bindings) {
    if (binding.agentId === agentId) {
      matchedBinding = binding;
      break;
    }
  }

  if (!matchedBinding) {
    console.error(JSON.stringify({
      error: `Agent '${nickname}' (agentId: ${agentId}) 未绑定钉钉账号`
    }));
    process.exit(1);
  }

  // Binding may have accountId/channel at top level or nested in 'match'
  const accountId = matchedBinding.accountId || (matchedBinding.match && matchedBinding.match.accountId);
  const channel = matchedBinding.channel || (matchedBinding.match && matchedBinding.match.channel);

  // 4. Compose Session Key
  const sessionKey = `agent:${agentId}:${channel}:group:${groupId}:${senderId}`;

  // 5. Output
  console.log(JSON.stringify({
    sessionKey,
    agentId,
    accountId,
    channel
  }));
}

main();
