#!/usr/bin/env node
/**
 * contact-agent.cjs
 *
 * Contacts a target agent with delivery mode support.
 *
 * Usage:
 *   node contact-agent.cjs <Agent名称> <消息内容> [--delivery=none|announce]
 *
 * Output:
 *   Result of the contact attempt
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Import the resolve-session functionality
const resolveSessionPath = path.join(__dirname, 'resolve-session.cjs');
const resolveSessionModule = require(resolveSessionPath);

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const argStr = argv[i].substring(2);
      const delimiterIndex = argStr.indexOf('=');
      if (delimiterIndex > 0) {
        const key = argStr.substring(0, delimiterIndex);
        const value = argStr.substring(delimiterIndex + 1);
        args[key] = value;
      } else {
        const key = argStr;
        const nextArg = argv[i + 1];
        if (nextArg && !nextArg.startsWith('--')) {
          args[key] = nextArg;
          i++; // Skip next argument since we consumed it
        } else {
          args[key] = true;
        }
      }
    } else {
      args._.push(argv[i]);
    }
  }
  return args;
}

async function contactAgent(nickname, message, deliveryMode = 'none') {
  // Get current session context from environment or parameters
  const groupId = process.env.OPENCLAW_GROUP_ID || 'unknown';
  const senderId = process.env.OPENCLAW_SENDER_ID || 'unknown';

  // Resolve the target session
  const { spawnSync } = require('child_process');
  const result = spawnSync('node', [path.join(__dirname, 'resolve-session.cjs'), nickname, groupId, senderId], {
    encoding: 'utf8',
    timeout: 10000
  });

  if (result.status !== 0) {
    // Handle errors from resolve-session
    if (result.stderr) {
      try {
        const errorObj = JSON.parse(result.stderr);
        console.error(JSON.stringify(errorObj));
        process.exit(result.status);
      } catch {
        console.error(JSON.stringify({ error: result.stderr || 'Unknown error resolving session' }));
        process.exit(result.status);
      }
    } else {
      console.error(JSON.stringify({ error: 'Failed to resolve target session' }));
      process.exit(result.status);
    }
  }

  try {
    const sessionInfo = JSON.parse(result.stdout);
    
    // Create the session send object with delivery mode
    const sessionSendObj = {
      sessionKey: sessionInfo.sessionKey,
      message: message,
      delivery: {
        mode: deliveryMode
      }
    };

    // Instead of actually calling sessions_send here (which would require OpenClaw internals),
    // we simulate the call and output the intended behavior
    console.log(JSON.stringify({
      status: 'prepared',
      target: sessionInfo,
      message: message,
      delivery: {
        mode: deliveryMode
      },
      action: 'sessions_send would be called with delivery mode'
    }));
  } catch (e) {
    console.error(JSON.stringify({ error: 'Failed to parse session info', details: e.message }));
    process.exit(1);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args._.length < 2) {
    console.log(`Usage: node contact-agent.cjs <Agent名称> <消息内容> [--delivery=none|announce]

Parameters:
  <Agent名称>     目标 Agent 的名称
  <消息内容>      要发送的消息
  --delivery      传递模式 (默认: none)
                  none     - 不推送回复，避免回复循环
                  announce - 回复推送到当前会话

Examples:
  node contact-agent.cjs demo1 "检查进度"
  node contact-agent.cjs demo1 "检查进度" --delivery=none
  node contact-agent.cjs demo1 "检查进度" --delivery=announce`);
    return;
  }

  const [nickname, ...messageParts] = args._;
  const message = messageParts.join(' ');
  const deliveryMode = args.delivery || 'none';

  // Validate delivery mode
  if (!['none', 'announce'].includes(deliveryMode)) {
    console.error(JSON.stringify({ error: 'Invalid delivery mode. Must be "none" or "announce"' }));
    process.exit(1);
  }

  await contactAgent(nickname, message, deliveryMode);
}

main();