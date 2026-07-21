import { Command } from "commander";
import { createClient } from "../client.js";
import { resolveConfig } from "../config.js";
import { handleApiResponse, printError } from "../output.js";

function getClient(cmd: Command) {
  const opts = cmd.optsWithGlobals();
  const config = resolveConfig({ baseUrl: opts.baseUrl, token: opts.token });
  return createClient(config);
}

const ADMIN_TYPES = [
  "user",
  "storage",
  "driver",
  "setting",
  "meta",
  "index",
] as const;

export function registerAdminCommand(program: Command): void {
  const admin = program
    .command("admin")
    .description("管理 OpenList 后台（用户、存储、驱动、设置、元数据、索引）");

  admin
    .command("list")
    .description("列出管理资源")
    .requiredOption("--type <type>", `资源类型: ${ADMIN_TYPES.join(", ")}`)
    .option("--page <page>", "页码", "1")
    .option("--per-page <perPage>", "每页数量", "20")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const type = options.type;

        if (!ADMIN_TYPES.includes(type)) {
          printError(
            `无效的资源类型: ${type}，可选: ${ADMIN_TYPES.join(", ")}`,
          );
          return;
        }

        const response = await client.get(
          `/api/admin/${type}/list?page=${options.page}&per_page=${options.perPage}`,
        );
        handleApiResponse(response, `admin.list(${type})`);
      } catch (error) {
        printError(error instanceof Error ? error.message : "列出资源失败");
      }
    });

  admin
    .command("get <id>")
    .description("获取资源详情")
    .requiredOption("--type <type>", `资源类型: ${ADMIN_TYPES.join(", ")}`)
    .action(async (id: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const type = options.type;

        if (!ADMIN_TYPES.includes(type)) {
          printError(`无效的资源类型: ${type}`);
          return;
        }

        const response = await client.get(`/api/admin/${type}/get?id=${id}`);
        handleApiResponse(response, `admin.get(${type})`);
      } catch (error) {
        printError(error instanceof Error ? error.message : "获取资源失败");
      }
    });

  admin
    .command("create")
    .description("创建资源")
    .requiredOption("--type <type>", `资源类型: ${ADMIN_TYPES.join(", ")}`)
    .option("--file <file>", "JSON 文件路径")
    .option("--data <data>", "JSON 数据字符串")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const type = options.type;

        if (!ADMIN_TYPES.includes(type)) {
          printError(`无效的资源类型: ${type}`);
          return;
        }

        let body: unknown = {};
        if (options.file) {
          const { readFileSync } = await import("node:fs");
          body = JSON.parse(readFileSync(options.file, "utf-8"));
        } else if (options.data) {
          body = JSON.parse(options.data);
        }

        const response = await client.post(`/api/admin/${type}/create`, body);
        handleApiResponse(response, `admin.create(${type})`);
      } catch (error) {
        printError(error instanceof Error ? error.message : "创建资源失败");
      }
    });

  admin
    .command("update <id>")
    .description("更新资源")
    .requiredOption("--type <type>", `资源类型: ${ADMIN_TYPES.join(", ")}`)
    .option("--file <file>", "JSON 文件路径")
    .option("--data <data>", "JSON 数据字符串")
    .action(async (id: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const type = options.type;

        if (!ADMIN_TYPES.includes(type)) {
          printError(`无效的资源类型: ${type}`);
          return;
        }

        let body: Record<string, unknown> = { id };
        if (options.file) {
          const { readFileSync } = await import("node:fs");
          body = { ...JSON.parse(readFileSync(options.file, "utf-8")), id };
        } else if (options.data) {
          body = { ...JSON.parse(options.data), id };
        }

        const response = await client.post(`/api/admin/${type}/update`, body);
        handleApiResponse(response, `admin.update(${type})`);
      } catch (error) {
        printError(error instanceof Error ? error.message : "更新资源失败");
      }
    });

  admin
    .command("delete <id>")
    .description("删除资源")
    .requiredOption("--type <type>", `资源类型: ${ADMIN_TYPES.join(", ")}`)
    .action(async (id: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const type = options.type;

        if (!ADMIN_TYPES.includes(type)) {
          printError(`无效的资源类型: ${type}`);
          return;
        }

        const response = await client.post(`/api/admin/${type}/delete`, { id });
        handleApiResponse(response, `admin.delete(${type})`);
      } catch (error) {
        printError(error instanceof Error ? error.message : "删除资源失败");
      }
    });

  // index 特殊子命令
  admin
    .command("index-build")
    .description("构建搜索索引")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/admin/index/build");
        handleApiResponse(response, "admin.index-build");
      } catch (error) {
        printError(error instanceof Error ? error.message : "构建索引失败");
      }
    });

  admin
    .command("index-stop")
    .description("停止索引构建")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/admin/index/stop");
        handleApiResponse(response, "admin.index-stop");
      } catch (error) {
        printError(error instanceof Error ? error.message : "停止索引失败");
      }
    });

  admin
    .command("index-clear")
    .description("清除搜索索引")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/admin/index/clear");
        handleApiResponse(response, "admin.index-clear");
      } catch (error) {
        printError(error instanceof Error ? error.message : "清除索引失败");
      }
    });

  admin
    .command("index-progress")
    .description("获取索引进度")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.get("/api/admin/index/progress");
        handleApiResponse(response, "admin.index-progress");
      } catch (error) {
        printError(error instanceof Error ? error.message : "获取索引进度失败");
      }
    });
}
