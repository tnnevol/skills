import { Command } from "commander";
import { createClient } from "../client.js";
import { resolveConfig } from "../config.js";
import { handleApiResponse, printError } from "../output.js";

function getClient(cmd: Command) {
  const opts = cmd.optsWithGlobals();
  const config = resolveConfig({ baseUrl: opts.baseUrl, token: opts.token });
  return createClient(config);
}

function errMsg(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

// 读取 --file / --data 作为 JSON 请求体
async function readBody(options: {
  file?: string;
  data?: string;
}): Promise<unknown> {
  if (options.file) {
    const { readFileSync } = await import("node:fs");
    return JSON.parse(readFileSync(options.file, "utf-8"));
  }
  if (options.data) return JSON.parse(options.data);
  return {};
}

const q = (v: string) => encodeURIComponent(v);

// 通用 CRUD（user / storage / meta 共用：list / get / create / update / delete）
// 说明（经真实服务端核验）：get 用 ?id= 查询；delete 用 ?id= 查询；
// create/update 用 body（update 将 id 合并进 body，服务端按结构体的 ID 字段读取）。
function addCrud(group: Command, resource: string): void {
  group
    .command("list")
    .description("列出资源")
    .option("--page <page>", "页码", "1")
    .option("--per-page <perPage>", "每页数量", "20")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const res = await client.get(
          `/api/admin/${resource}/list?page=${options.page}&per_page=${options.perPage}`,
        );
        handleApiResponse(res, `admin.${resource}.list`);
      } catch (error) {
        printError(errMsg(error, "列出资源失败"));
      }
    });

  group
    .command("get <id>")
    .description("获取资源详情")
    .action(async (id: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const res = await client.get(`/api/admin/${resource}/get?id=${q(id)}`);
        handleApiResponse(res, `admin.${resource}.get`);
      } catch (error) {
        printError(errMsg(error, "获取资源失败"));
      }
    });

  group
    .command("create")
    .description("创建资源")
    .option("--file <file>", "JSON 文件路径")
    .option("--data <data>", "JSON 数据字符串")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const body = await readBody(options);
        const res = await client.post(`/api/admin/${resource}/create`, body);
        handleApiResponse(res, `admin.${resource}.create`);
      } catch (error) {
        printError(errMsg(error, "创建资源失败"));
      }
    });

  group
    .command("update <id>")
    .description("更新资源")
    .option("--file <file>", "JSON 文件路径")
    .option("--data <data>", "JSON 数据字符串")
    .action(async (id: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const base = (await readBody(options)) as Record<string, unknown>;
        const res = await client.post(`/api/admin/${resource}/update`, {
          ...base,
          id: Number(id),
        });
        handleApiResponse(res, `admin.${resource}.update`);
      } catch (error) {
        printError(errMsg(error, "更新资源失败"));
      }
    });

  group
    .command("delete <id>")
    .description("删除资源")
    .action(async (id: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const res = await client.post(
          `/api/admin/${resource}/delete?id=${q(id)}`,
        );
        handleApiResponse(res, `admin.${resource}.delete`);
      } catch (error) {
        printError(errMsg(error, "删除资源失败"));
      }
    });
}

function registerUser(admin: Command): void {
  const user = admin.command("user").description("管理用户");
  addCrud(user, "user");
}

function registerStorage(admin: Command): void {
  const storage = admin.command("storage").description("管理存储");
  addCrud(storage, "storage");

  storage
    .command("enable <id>")
    .description("启用存储")
    .action(async (id: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const res = await client.post(`/api/admin/storage/enable?id=${q(id)}`);
        handleApiResponse(res, "admin.storage.enable");
      } catch (error) {
        printError(errMsg(error, "启用存储失败"));
      }
    });

  storage
    .command("disable <id>")
    .description("禁用存储")
    .action(async (id: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const res = await client.post(`/api/admin/storage/disable?id=${q(id)}`);
        handleApiResponse(res, "admin.storage.disable");
      } catch (error) {
        printError(errMsg(error, "禁用存储失败"));
      }
    });

  storage
    .command("load-all")
    .description("重新加载所有存储")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const res = await client.post("/api/admin/storage/load_all");
        handleApiResponse(res, "admin.storage.load-all");
      } catch (error) {
        printError(errMsg(error, "重载存储失败"));
      }
    });
}

function registerMeta(admin: Command): void {
  const meta = admin.command("meta").description("管理元信息");
  addCrud(meta, "meta");
}

function registerSetting(admin: Command): void {
  const setting = admin.command("setting").description("管理设置");

  setting
    .command("list")
    .description("列出设置")
    .option("--group <group>", "按分组过滤")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const path = options.group
          ? `/api/admin/setting/list?group=${q(options.group)}`
          : "/api/admin/setting/list";
        const res = await client.get(path);
        handleApiResponse(res, "admin.setting.list");
      } catch (error) {
        printError(errMsg(error, "列出设置失败"));
      }
    });

  setting
    .command("get <key>")
    .description("按 key 获取设置")
    .action(async (key: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const res = await client.get(`/api/admin/setting/get?key=${q(key)}`);
        handleApiResponse(res, "admin.setting.get");
      } catch (error) {
        printError(errMsg(error, "获取设置失败"));
      }
    });

  setting
    .command("save")
    .description("保存设置（JSON 数组）")
    .option("--file <file>", "JSON 文件路径")
    .option("--data <data>", "JSON 数据字符串")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const body = await readBody(options);
        const res = await client.post("/api/admin/setting/save", body);
        handleApiResponse(res, "admin.setting.save");
      } catch (error) {
        printError(errMsg(error, "保存设置失败"));
      }
    });

  setting
    .command("delete <key>")
    .description("按 key 删除设置")
    .action(async (key: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const res = await client.post(
          `/api/admin/setting/delete?key=${q(key)}`,
        );
        handleApiResponse(res, "admin.setting.delete");
      } catch (error) {
        printError(errMsg(error, "删除设置失败"));
      }
    });

  setting
    .command("reset-token")
    .description("重置令牌")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const res = await client.post("/api/admin/setting/reset_token");
        handleApiResponse(res, "admin.setting.reset-token");
      } catch (error) {
        printError(errMsg(error, "重置令牌失败"));
      }
    });
}

function registerDriver(admin: Command): void {
  const driver = admin.command("driver").description("查询驱动信息");

  driver
    .command("list")
    .description("列出所有驱动配置模板")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const res = await client.get("/api/admin/driver/list");
        handleApiResponse(res, "admin.driver.list");
      } catch (error) {
        printError(errMsg(error, "列出驱动失败"));
      }
    });

  driver
    .command("names")
    .description("列出驱动名列表")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const res = await client.get("/api/admin/driver/names");
        handleApiResponse(res, "admin.driver.names");
      } catch (error) {
        printError(errMsg(error, "列出驱动名失败"));
      }
    });

  driver
    .command("info <name>")
    .description("获取指定驱动信息")
    .action(async (name: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const res = await client.get(
          `/api/admin/driver/info?driver=${q(name)}`,
        );
        handleApiResponse(res, "admin.driver.info");
      } catch (error) {
        printError(errMsg(error, "获取驱动信息失败"));
      }
    });
}

function registerIndex(admin: Command): void {
  const index = admin.command("index").description("管理搜索索引");

  index
    .command("build")
    .description("构建搜索索引")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const res = await client.post("/api/admin/index/build");
        handleApiResponse(res, "admin.index.build");
      } catch (error) {
        printError(errMsg(error, "构建索引失败"));
      }
    });

  index
    .command("stop")
    .description("停止索引构建")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const res = await client.post("/api/admin/index/stop");
        handleApiResponse(res, "admin.index.stop");
      } catch (error) {
        printError(errMsg(error, "停止索引失败"));
      }
    });

  index
    .command("clear")
    .description("清除搜索索引")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const res = await client.post("/api/admin/index/clear");
        handleApiResponse(res, "admin.index.clear");
      } catch (error) {
        printError(errMsg(error, "清除索引失败"));
      }
    });

  index
    .command("progress")
    .description("获取索引进度")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const res = await client.get("/api/admin/index/progress");
        handleApiResponse(res, "admin.index.progress");
      } catch (error) {
        printError(errMsg(error, "获取索引进度失败"));
      }
    });

  index
    .command("update")
    .description("更新索引（指定路径）")
    .option("--paths <paths>", "路径列表（逗号分隔）")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const body = options.paths
          ? { paths: (options.paths as string).split(",") }
          : {};
        const res = await client.post("/api/admin/index/update", body);
        handleApiResponse(res, "admin.index.update");
      } catch (error) {
        printError(errMsg(error, "更新索引失败"));
      }
    });
}

export function registerAdminCommand(program: Command): void {
  const admin = program
    .command("admin")
    .description("管理 OpenList 后台（用户、存储、元信息、设置、驱动、索引）");

  registerUser(admin);
  registerStorage(admin);
  registerMeta(admin);
  registerSetting(admin);
  registerDriver(admin);
  registerIndex(admin);
}
