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
}
