import { Command } from "commander";
import { setPretty } from "./output.js";
import { registerAuthCommand } from "./commands/auth.js";
import { registerFsCommand } from "./commands/fs.js";
import { registerShareCommand } from "./commands/share.js";
import { registerMeCommand } from "./commands/me.js";
import { registerAdminCommand } from "./commands/admin.js";
import { registerPublicCommand } from "./commands/public.js";

const program = new Command();

program
  .name("openlist")
  .description("CLI for OpenList - A modern file list program")
  .version("0.1.0")
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
