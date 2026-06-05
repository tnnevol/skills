#!/usr/bin/env node

import { loadConfig } from "./lib/config.mjs";
import { createClients, HaloError } from "./lib/client.mjs";
import {
  executeAction,
  getCommandHelp,
  getCommandSpecificHelp,
} from "./lib/command-router.mjs";

function parseArgs(argv) {
  const args = argv.slice(2);
  const action = args[0];
  const name = args[1] && !args[1].startsWith("--") ? args[1] : null;

  const opts = { name };

  // Check if this is a "<command> help" pattern
  const isHelpPattern = name === "help" || name === "--help" || name === "-h";

  for (let i = isHelpPattern ? 2 : name ? 2 : 1; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--")) continue;

    const eqIdx = arg.indexOf("=");
    if (eqIdx === -1) {
      const key = arg.slice(2);
      opts[key] = true;
    } else {
      const key = arg.slice(2, eqIdx);
      const value = arg.slice(eqIdx + 1);
      if (key === "page" || key === "limit") {
        opts[key] = parseInt(value, 10);
      } else if (key === "public") {
        opts.public = value === "true" || value === "";
      } else if (key === "categories" || key === "tags") {
        opts[key] = value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        opts[key] = value;
      }
    }
  }

  // For "<command> help" pattern, set action to the command and mark as help
  if (isHelpPattern && action) {
    return { action: "help", opts: { name: action } };
  }

  return { action, opts };
}

function generateUsage() {
  const commands = getCommandHelp();

  let usage = "用法: halo <action> [name] [options]\n\n";
  usage += "Actions:\n";

  for (const cmd of commands) {
    usage += `  ${cmd.usage.padEnd(65)} ${cmd.description}\n`;
  }

  usage += "\n使用 'halo <command> help' 查看具体命令的帮助信息\n";

  return usage;
}

async function main() {
  const { action, opts } = parseArgs(process.argv);

  // Handle help commands
  if (action === "help" || action === "--help" || action === "-h") {
    // If a command name is provided, show specific help
    if (opts.name) {
      const specificHelp = getCommandSpecificHelp(opts.name);
      if (specificHelp) {
        console.log(specificHelp);
      } else {
        console.error(`❌ 未知命令: ${opts.name}\n\n${generateUsage()}`);
        process.exit(1);
      }
    } else {
      console.log(generateUsage());
    }
    return;
  }

  if (!action) {
    console.log(generateUsage());
    return;
  }

  let config;
  try {
    config = loadConfig();
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }

  const clients = createClients(config);

  try {
    const result = await executeAction(clients, action, opts);
    console.log(result);
  } catch (err) {
    if (err instanceof HaloError) {
      console.error(`❌ ${err.message}`);
    } else {
      console.error(`❌ 执行出错: ${err.message}`);
    }
    process.exit(1);
  }
}

main();
