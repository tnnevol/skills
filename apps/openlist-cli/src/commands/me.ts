import { Command } from "commander";
import { createClient } from "../client.js";
import { resolveConfig } from "../config.js";
import { handleApiResponse, printError } from "../output.js";

function getClient(cmd: Command) {
  const opts = cmd.optsWithGlobals();
  const config = resolveConfig({ baseUrl: opts.baseUrl, token: opts.token });
  return createClient(config);
}

export function registerMeCommand(program: Command): void {
  const me = program.command("me").description("管理当前用户信息");

  me.command("get")
    .description("获取当前用户信息")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.get("/api/me");
        handleApiResponse(response, "me.get");
      } catch (error) {
        printError(error instanceof Error ? error.message : "获取用户信息失败");
      }
    });

  me.command("update")
    .description("更新当前用户信息")
    .option("--username <username>", "新用户名")
    .option("--password <password>", "新密码")
    .option("--sso-id <ssoId>", "SSO ID")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const body: Record<string, string> = {};
        if (options.username) body.username = options.username;
        if (options.password) body.password = options.password;
        if (options.ssoId) body.sso_id = options.ssoId;

        const response = await client.post("/api/me/update", body);
        handleApiResponse(response, "me.update");
      } catch (error) {
        printError(error instanceof Error ? error.message : "更新用户信息失败");
      }
    });

  me.command("sshkey-list")
    .description("列出 SSH 公钥")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.get("/api/me/sshkey/list");
        handleApiResponse(response, "me.sshkey-list");
      } catch (error) {
        printError(
          error instanceof Error ? error.message : "列出 SSH 公钥失败",
        );
      }
    });

  me.command("sshkey-add")
    .description("添加 SSH 公钥")
    .requiredOption("--title <title>", "公钥标题")
    .requiredOption("--key <key>", "公钥内容")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/me/sshkey/add", {
          title: options.title,
          key: options.key,
        });
        handleApiResponse(response, "me.sshkey-add");
      } catch (error) {
        printError(
          error instanceof Error ? error.message : "添加 SSH 公钥失败",
        );
      }
    });

  me.command("sshkey-delete")
    .description("删除 SSH 公钥")
    .requiredOption("--id <id>", "公钥 ID")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/me/sshkey/delete", {
          id: options.id,
        });
        handleApiResponse(response, "me.sshkey-delete");
      } catch (error) {
        printError(
          error instanceof Error ? error.message : "删除 SSH 公钥失败",
        );
      }
    });
}
