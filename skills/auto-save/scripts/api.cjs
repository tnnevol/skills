#!/usr/bin/env node

'use strict';

// auto-save API unified caller
// Usage: node api.cjs <action> [args...]

const http = require('http');
const https = require('https');

const ACTIONS = {
  'add-task': addTask,
  'config': config,
  'update-config': updateConfig,
  'run-now': runNow,
  'suggestions': suggestions,
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

function getEnv() {
  const baseUrl = process.env.AUTO_SAVE_BASE_URL;
  const token = process.env.AUTO_SAVE_TOKEN;
  if (!baseUrl || !token) {
    console.error('[CONFIG_MISSING] AUTO_SAVE_BASE_URL and AUTO_SAVE_TOKEN are required');
    process.exit(1);
  }
  return { baseUrl, token };
}

function sanitizeToken(str, token) {
  if (!str || !token) return str;
  return str.replace(new RegExp(token, 'g'), '****');
}

function apiRequest(baseUrl, path, method, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {},
    };

    if (body) {
      const json = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(json);
    }

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: data.substring(0, 500) });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function addTask(args, env) {
  if (!args.name || !args.shareurl || !args.savepath) {
    console.error('Error: --name, --shareurl, and --savepath are required');
    process.exit(1);
  }

  const body = {
    taskname: args.name,
    shareurl: args.shareurl,
    savepath: args.savepath,
  };
  if (args.pattern) body.pattern = args.pattern;
  if (args.replace !== undefined) body.replace = args.replace;

  const result = await apiRequest(env.baseUrl, `/api/add_task?token=${env.token}`, 'POST', body);
  console.log(JSON.stringify(result.data, null, 2));
}

async function config(args, env) {
  const result = await apiRequest(env.baseUrl, `/data?token=${env.token}`, 'GET');
  console.log(JSON.stringify(result.data, null, 2));
}

async function updateConfig(args, env) {
  if (!args.field || args.value === undefined) {
    console.error('Error: --field and --value are required');
    process.exit(1);
  }
  const body = { [args.field]: args.value };
  const result = await apiRequest(env.baseUrl, `/update?token=${env.token}`, 'POST', body);
  console.log(JSON.stringify(result.data, null, 2));
}

async function runNow(args, env) {
  let body = undefined;
  if (args.tasklist) {
    body = {
      tasklist: [
        {
          taskname: args.tasklist,
          shareurl: '',
          savepath: '',
        },
      ],
    };
  } else if (args['quark-test']) {
    body = {
      quark_test: true,
      push_config: {
        QUARK_SIGN_NOTIFY: true,
      },
    };
  }
  // body = undefined means run all tasks
  const result = await apiRequest(env.baseUrl, `/run_script_now?token=${env.token}`, 'POST', body);
  console.log(JSON.stringify(result.data, null, 2));
}

async function suggestions(args, env) {
  if (!args.query) {
    console.error('Error: --query is required');
    process.exit(1);
  }
  const depth = args.depth || 1;
  const path = `/task_suggestions?q=${encodeURIComponent(args.query)}&d=${depth}&token=${env.token}`;
  const result = await apiRequest(env.baseUrl, path, 'GET');
  console.log(JSON.stringify(result.data, null, 2));
}

async function main() {
  const [action, ...rest] = process.argv.slice(2);

  if (!action || action === 'help') {
    console.log(`Usage: node api.cjs <action> [args...]

Actions:
  add-task       --name xxx --shareurl xxx --savepath xxx [--pattern xxx] [--replace xxx]
  config         
  update-config  --field xxx --value xxx
  run-now        [--tasklist xxx] [--quark-test]
  suggestions    --query xxx [--depth 1]
  help           Show this help`);
    return;
  }

  if (!ACTIONS[action]) {
    console.error(`Unknown action: ${action}`);
    console.log('Run `node api.cjs help` for usage');
    process.exit(1);
  }

  const env = getEnv();
  const args = parseArgs(rest);

  try {
    await ACTIONS[action](args, env);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
