import { Command } from "commander";
import { createClient } from "../client.js";
import { loadConfig, saveConfig, clearConfig } from "../config.js";
import { printSuccess, printError } from "../output.js";

interface LoginOptions {
  baseUrl?: string;
  token?: string;
}

export function registerAuthCommand(program: Command): void {
  const auth = program
    .command("auth")
    .description("登录、退出登录、查看当前账号");

  auth
    .command("login")
    .description("登录 OpenList 并保存配置")
    .requiredOption("--base-url <url>", "OpenList 服务地址")
    .requiredOption("--token <token>", "API Token")
    .action((options: LoginOptions) => {
      saveConfig({
        baseUrl: options.baseUrl!,
        token: options.token!,
      });
      printSuccess({ baseUrl: options.baseUrl }, "login");
    });

  auth
    .command("logout")
    .description("退出登录并清除本地配置")
    .action(() => {
      clearConfig();
      printSuccess(null, "logout");
    });

  auth
    .command("status")
    .description("查看当前登录状态")
    .action(async () => {
      try {
        const config = loadConfig();
        if (!config) {
          printError("未登录，请先运行 `openlist-cli auth login`");
          return;
        }

        const client = createClient(config);
        const response = await client.get("/api/me");

        if (response.code === 200) {
          printSuccess(
            {
              loggedIn: true,
              baseUrl: config.baseUrl,
              user: response.data,
            },
            "status",
          );
        } else {
          printSuccess(
            {
              loggedIn: false,
              baseUrl: config.baseUrl,
              error: response.message,
            },
            "status",
          );
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : "获取状态失败");
      }
    });
}
