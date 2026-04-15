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
  'search': suggestions,  // Alias for suggestions
  'detail': detail,
};

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = val;
    } else {
      args._.push(argv[i]);
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
  
  // Perform validity check on results
  if (result.data && result.data.data && Array.isArray(result.data.data)) {
    // Limit validation to first 5 results to avoid too many API calls
    const maxValidations = 5;
    const resultsToValidate = result.data.data.slice(0, maxValidations);
    
    // Validate each result concurrently
    const validatedResults = await Promise.all(resultsToValidate.map(async (item) => {
      try {
        const detailResult = await getShareDetail(item.shareurl, env);
        item.isValid = !!(detailResult.data && detailResult.data.share);
        if (detailResult.data) {
          item.title = detailResult.data.share?.title;
          item.size = detailResult.data.share?.size;
          item.all_file_num = detailResult.data.share?.all_file_num;
        }
      } catch (err) {
        item.isValid = false;
      }
      return item;
    }));
    
    // Sort: valid results first, then invalid ones
    const sortedResults = [...validatedResults.sort((a, b) => {
      if (a.isValid && !b.isValid) return -1;
      if (!a.isValid && b.isValid) return 1;
      return 0;
    }), ...result.data.data.slice(maxValidations)];
    
    // Mark invalid items
    for (const item of sortedResults) {
      if ('isValid' in item && !item.isValid) {
        item.status = '已失效';
      }
    }
    
    console.log(JSON.stringify(sortedResults, null, 2));
  } else {
    console.log(JSON.stringify(result.data, null, 2));
  }
}

async function getShareDetail(shareurl, env) {
  const body = {
    "shareurl": shareurl,
    "stoken": "",
    "task": {},
    "magic_regex": ""
  };
  
  // Get config to fill in task and magic_regex values
  try {
    const configResult = await apiRequest(env.baseUrl, `/data?token=${env.token}`, 'GET');
    if (configResult.data) {
      // Fill in task information from config
      body.magic_regex = configResult.data.magic_regex || "";
      
      // Look for matching task in config if available
      if (configResult.data.task_list && Array.isArray(configResult.data.task_list)) {
        const matchingTask = configResult.data.task_list.find(task => 
          task.shareurl === shareurl || 
          (task.taskname && shareurl.toLowerCase().includes(task.taskname.toLowerCase()))
        );
        if (matchingTask) {
          body.task = {
            ...matchingTask,
            addition: configResult.data.task_plugins_config_default || {},
            runweek: matchingTask.runweek || [1,2,3,4,5,6,7]
          };
        }
      }
      
      // Set default savepath if not already set
      if (!body.task.savepath) {
        body.task.savepath = "/media/";
      }
    }
  } catch (err) {
    // Config fetch failed, continue with minimal body
  }
  
  const result = await apiRequest(env.baseUrl, `/get_share_detail?token=${env.token}`, 'POST', body);
  return result;
}

async function detail(args, env) {
  if (!args._ || args._.length === 0) {
    console.error('Error: share URL is required');
    process.exit(1);
  }
  
  const shareurl = args._[0];
  const stoken = args.stoken || "";
  const savepath = args.savepath || "/media/";
  
  const body = {
    "shareurl": shareurl,
    "stoken": stoken,
    "task": {
      "savepath": savepath
    },
    "magic_regex": ""
  };
  
  // Get config to fill in additional values
  try {
    const configResult = await apiRequest(env.baseUrl, `/data?token=${env.token}`, 'GET');
    if (configResult.data) {
      body.magic_regex = configResult.data.magic_regex || "";
      
      // Look for matching task in config
      if (configResult.data.task_list && Array.isArray(configResult.data.task_list)) {
        const matchingTask = configResult.data.task_list.find(task => 
          task.shareurl === shareurl || 
          (task.taskname && shareurl.toLowerCase().includes(task.taskname.toLowerCase()))
        );
        if (matchingTask) {
          body.task = {
            ...matchingTask,
            savepath: savepath,
            addition: configResult.data.task_plugins_config_default || {},
            runweek: matchingTask.runweek || [1,2,3,4,5,6,7]
          };
        }
      }
    }
  } catch (err) {
    // Config fetch failed, continue with minimal body
  }
  
  const result = await apiRequest(env.baseUrl, `/get_share_detail?token=${env.token}`, 'POST', body);
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
  search         --query xxx [--depth 1] (alias for suggestions)
  detail         <share_url> [--stoken xxx] [--savepath xxx]
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
