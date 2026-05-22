#!/usr/bin/env node
/**
 * query-agents.cjs
 *
 * Handles query actions for ding-agent skill:
 *   list-agents    — List all available Agents from config
 *   current-session — Show current session information
 *   list-sessions   — List sessions for a specific Agent (requires agentId + sessions data via stdin)
 *
 * Usage:
 *   node query-agents.cjs list-agents
 *   node query-agents.cjs current-session <groupID> <senderID>
 *   node query-agents.cjs list-sessions <agentId>
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function getConfig() {
  const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
  const raw = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(raw);
}

function listAgents() {
  const config = getConfig();
  const agentsList = config.agents && config.agents.list ? config.agents.list : [];

  const result = agentsList.map(a => ({
    id: a.id || a.agentId,
    name: (a.identity && a.identity.name) || a.name || '(unknown)',
    emoji: (a.identity && a.identity.emoji) || '',
    workspace: a.workspace || ''
  }));

  console.log(JSON.stringify({ agents: result }, null, 2));
}

function currentSession(groupId, senderId) {
  const config = getConfig();
  const agentsList = config.agents && config.agents.list ? config.agents.list : [];
  const currentAgentId = process.env.OPENCLAW_AGENT_ID || 'unknown';

  const matchedAgent = agentsList.find(a => (a.id || a.agentId) === currentAgentId);
  const agentName = (matchedAgent && matchedAgent.identity && matchedAgent.identity.name) || currentAgentId;

  console.log(JSON.stringify({
    agentId: currentAgentId,
    agentName,
    channel: 'dingtalk-connector',
    groupId: groupId || null,
    senderId: senderId || null,
    sessionType: groupId ? 'group' : 'direct'
  }, null, 2));
}

function listSessions(agentId) {
  // This action requires sessions_list output to be piped via stdin
  // The script parses and filters the sessions by agentId
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    if (!input.trim()) {
      console.error(JSON.stringify({ error: 'No sessions data provided via stdin' }));
      process.exit(1);
    }

    let sessions;
    try {
      sessions = JSON.parse(input);
    } catch {
      console.error(JSON.stringify({ error: 'Invalid JSON input' }));
      process.exit(1);
    }

    const filtered = sessions.filter(s => {
      const key = s.key || s.sessionKey || '';
      return key.startsWith(`agent:${agentId}:`);
    });

    console.log(JSON.stringify({
      agentId,
      total: filtered.length,
      sessions: filtered.map(s => ({
        sessionKey: s.key || s.sessionKey,
        label: s.label || '',
        status: s.status || '',
        updatedAt: s.updatedAt || ''
      }))
    }, null, 2));
  });
}

function main() {
  const action = process.argv[2];

  switch (action) {
    case 'list-agents':
      listAgents();
      break;

    case 'current-session':
      currentSession(process.argv[3], process.argv[4]);
      break;

    case 'list-sessions':
      if (!process.argv[3]) {
        console.error(JSON.stringify({ error: '请提供 Agent ID' }));
        process.exit(1);
      }
      listSessions(process.argv[3]);
      break;

    default:
      console.log(`Usage: node query-agents.cjs <action> [args...]

Actions:
  list-agents                      List all available Agents
  current-session [groupID] [senderID]  Show current session info
  list-sessions <agentId>          List sessions for Agent (via stdin)
  help                             Show this help`);
  }
}

main();
