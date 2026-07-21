import { Command } from "commander";
import { createClient } from "../client.js";
import { loadConfig, saveConfig, clearConfig } from "../config.js";
import { printSuccess, printError, handleApiResponse } from "../output.js";

interface LoginOptions {
  baseUrl?: string;
  token?: string;
  username?: string;
  password?: string;
}

export function registerAuthCommand(program: Command): void {
  const auth = program
    .command("auth")
    .description("登录、退出登录、查看当前账号");

  auth
    .command("login")
    .description("登录 OpenList 并保存配置")
    .option("-u, --username <username>", "用户名")
    .option("-p, --password <password>", "密码")
    .option("--base-url <url>", "OpenList 服务地址")
    .option("--token <token>", "直接设置 API Token")
    .action(async (options: LoginOptions) => {
      try {
        // 如果直接提供了 token 和 base-url，直接保存
        if (options.token && options.baseUrl) {
          saveConfig({
            baseUrl: options.baseUrl,
            token: options.token,
          });
          printSuccess({ baseUrl: options.baseUrl }, "login");
          return;
        }

        // 使用用户名密码登录
        if (!options.username || !options.password) {
          printError(
            "请提供 --username 和 --password，或 --base-url 和 --token",
          );
          return;
        }

        if (!options.baseUrl) {
          printError("请提供 --base-url");
          return;
        }

        const client = createClient({ baseUrl: options.baseUrl, token: "" });
        const response = await client.post<{ token: string }>(
          "/api/auth/login",
          {
            username: options.username,
            password: options.password,
          },
        );

        if (response.code === 200 && response.data?.token) {
          saveConfig({
            baseUrl: options.baseUrl,
            token: response.data.token,
          });
          printSuccess({ baseUrl: options.baseUrl }, "login");
        } else {
          handleApiResponse(response, "login");
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : "登录失败");
      }
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
          printError("未登录，请先运行 `openlist auth login`");
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
