import { createRequire } from "node:module";
import { Command } from "commander";
import { setPretty } from "./output.js";
import { registerAuthCommand } from "./commands/auth.js";
import { registerFsCommand } from "./commands/fs.js";
import { registerShareCommand } from "./commands/share.js";
import { registerMeCommand } from "./commands/me.js";
import { registerAdminCommand } from "./commands/admin.js";
import { registerPublicCommand } from "./commands/public.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

const program = new Command();

program
  .name("openlist-cli")
  .description("CLI for OpenList - A modern file list program")
  .version(version)
  .option("--base-url <url>", "OpenList 服务地址（或 env: OPENLIST_BASE_URL）")
  .option("--token <token>", "API Token（或 env: OPENLIST_TOKEN）")
  .option("--pretty", "美化 JSON 输出")
  .hook("preAction", (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.pretty) {
      setPretty(true);
    }
  });

// 注册所有命令
registerAuthCommand(program);
registerFsCommand(program);
registerShareCommand(program);
registerMeCommand(program);
registerAdminCommand(program);
registerPublicCommand(program);

program.parse();
