import { Command } from "commander";
import { createClient } from "../client.js";
import { resolveConfig } from "../config.js";
import { handleApiResponse, printError } from "../output.js";

function getClient(cmd: Command) {
  const opts = cmd.optsWithGlobals();
  const config = resolveConfig({ baseUrl: opts.baseUrl, token: opts.token });
  return createClient(config);
}

export function registerShareCommand(program: Command): void {
  const share = program.command("share").description("管理文件分享");

  share
    .command("list")
    .description("列出所有分享")
    .option("--page <page>", "页码", "1")
    .option("--per-page <perPage>", "每页数量", "20")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/share/list", {
          page: parseInt(options.page),
          per_page: parseInt(options.perPage),
        });
        handleApiResponse(response, "share.list");
      } catch (error) {
        printError(error instanceof Error ? error.message : "列出分享失败");
      }
    });

  share
    .command("get <id>")
    .description("获取分享详情")
    .action(async (id: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.get(`/api/share/get?id=${id}`);
        handleApiResponse(response, "share.get");
      } catch (error) {
        printError(error instanceof Error ? error.message : "获取分享失败");
      }
    });

  share
    .command("create")
    .description("创建文件分享")
    .requiredOption("--path <paths>", "文件路径（逗号分隔可多个）")
    .option("--password <password>", "分享密码")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/share/create", {
          files: options.path.split(","),
          pwd: options.password || "",
        });
        handleApiResponse(response, "share.create");
      } catch (error) {
        printError(error instanceof Error ? error.message : "创建分享失败");
      }
    });

  share
    .command("update <id>")
    .description("更新分享")
    .requiredOption("--path <paths>", "文件路径（逗号分隔可多个）")
    .option("--password <password>", "新密码")
    .action(async (id: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/share/update", {
          id,
          files: options.path.split(","),
          pwd: options.password || "",
        });
        handleApiResponse(response, "share.update");
      } catch (error) {
        printError(error instanceof Error ? error.message : "更新分享失败");
      }
    });

  share
    .command("delete <id>")
    .description("删除分享")
    .action(async (id: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post(
          `/api/share/delete?id=${encodeURIComponent(id)}`,
        );
        handleApiResponse(response, "share.delete");
      } catch (error) {
        printError(error instanceof Error ? error.message : "删除分享失败");
      }
    });

  share
    .command("enable <id>")
    .description("启用分享")
    .action(async (id: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/share/enable", { id });
        handleApiResponse(response, "share.enable");
      } catch (error) {
        printError(error instanceof Error ? error.message : "启用分享失败");
      }
    });

  share
    .command("disable <id>")
    .description("禁用分享")
    .action(async (id: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/share/disable", { id });
        handleApiResponse(response, "share.disable");
      } catch (error) {
        printError(error instanceof Error ? error.message : "禁用分享失败");
      }
    });
}
