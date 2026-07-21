import { Command } from "commander";
import { createClient } from "../client.js";
import { resolveConfig } from "../config.js";
import { handleApiResponse, printError } from "../output.js";

function getClient(cmd: Command) {
  const opts = cmd.optsWithGlobals();
  const config = resolveConfig({ baseUrl: opts.baseUrl, token: opts.token });
  return createClient(config);
}

export function registerPublicCommand(program: Command): void {
  const pub = program.command("public").description("查看公开信息");

  pub
    .command("settings")
    .description("获取公开设置")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.get("/api/public/settings");
        handleApiResponse(response, "public.settings");
      } catch (error) {
        printError(error instanceof Error ? error.message : "获取设置失败");
      }
    });

  pub
    .command("offline-download-tools")
    .description("获取可用的离线下载工具")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.get("/api/public/offline_download_tools");
        handleApiResponse(response, "public.offline-download-tools");
      } catch (error) {
        printError(
          error instanceof Error ? error.message : "获取离线下载工具失败",
        );
      }
    });

  pub
    .command("archive-extensions")
    .description("获取支持的压缩格式")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.get("/api/public/archive_extensions");
        handleApiResponse(response, "public.archive-extensions");
      } catch (error) {
        printError(error instanceof Error ? error.message : "获取压缩格式失败");
      }
    });
}
