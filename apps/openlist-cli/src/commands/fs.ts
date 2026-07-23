import { Command } from "commander";
import { createClient } from "../client.js";
import { resolveConfig } from "../config.js";
import { handleApiResponse, printError } from "../output.js";

function getClient(cmd: Command) {
  const opts = cmd.optsWithGlobals();
  const config = resolveConfig({ baseUrl: opts.baseUrl, token: opts.token });
  return createClient(config);
}

export function registerFsCommand(program: Command): void {
  const fs = program.command("fs").description("管理文件和目录");

  fs.command("list <path>")
    .description("列出目录内容")
    .option("-p, --password <password>", "目录密码")
    .option("--page <page>", "页码", "1")
    .option("--per-page <perPage>", "每页数量", "20")
    .option("--refresh", "强制刷新")
    .action(async (path: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/fs/list", {
          path,
          password: options.password || "",
          page: parseInt(options.page),
          per_page: parseInt(options.perPage),
          refresh: options.refresh || false,
        });
        handleApiResponse(response, "fs.list");
      } catch (error) {
        printError(error instanceof Error ? error.message : "列出目录失败");
      }
    });

  fs.command("get <path>")
    .description("获取文件或目录信息")
    .option("-p, --password <password>", "目录密码")
    .action(async (path: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/fs/get", {
          path,
          password: options.password || "",
        });
        handleApiResponse(response, "fs.get");
      } catch (error) {
        printError(error instanceof Error ? error.message : "获取信息失败");
      }
    });

  fs.command("search")
    .description("搜索文件和目录")
    .requiredOption("-k, --keywords <keywords>", "搜索关键词")
    .option("-p, --parent <parent>", "父目录路径", "/")
    .option("--scope <scope>", "搜索类型: 0=全部 1=文件夹 2=文件", "0")
    .option("--page <page>", "页码", "1")
    .option("--per-page <perPage>", "每页数量", "20")
    .option("-P, --password <password>", "目录密码", "")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/fs/search", {
          parent: options.parent,
          keywords: options.keywords,
          scope: parseInt(options.scope),
          page: parseInt(options.page),
          per_page: parseInt(options.perPage),
          password: options.password,
        });
        handleApiResponse(response, "fs.search");
      } catch (error) {
        printError(error instanceof Error ? error.message : "搜索失败");
      }
    });

  fs.command("dirs <path>")
    .description("获取目录树")
    .action(async (path: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/fs/dirs", { path });
        handleApiResponse(response, "fs.dirs");
      } catch (error) {
        printError(error instanceof Error ? error.message : "获取目录树失败");
      }
    });

  fs.command("mkdir <path>")
    .description("创建目录")
    .action(async (path: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/fs/mkdir", { path });
        handleApiResponse(response, "fs.mkdir");
      } catch (error) {
        printError(error instanceof Error ? error.message : "创建目录失败");
      }
    });

  fs.command("rename <path> <name>")
    .description("重命名文件或目录")
    .action(async (path: string, name: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/fs/rename", { path, name });
        handleApiResponse(response, "fs.rename");
      } catch (error) {
        printError(error instanceof Error ? error.message : "重命名失败");
      }
    });

  fs.command("move")
    .description("移动文件或目录")
    .requiredOption("--src-dir <srcDir>", "源目录")
    .requiredOption("--dst-dir <dstDir>", "目标目录")
    .requiredOption("--names <names>", "文件名列表（逗号分隔）")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/fs/move", {
          src_dir: options.srcDir,
          dst_dir: options.dstDir,
          names: options.names.split(","),
        });
        handleApiResponse(response, "fs.move");
      } catch (error) {
        printError(error instanceof Error ? error.message : "移动失败");
      }
    });

  fs.command("copy")
    .description("复制文件或目录")
    .requiredOption("--src-dir <srcDir>", "源目录")
    .requiredOption("--dst-dir <dstDir>", "目标目录")
    .requiredOption("--names <names>", "文件名列表（逗号分隔）")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/fs/copy", {
          src_dir: options.srcDir,
          dst_dir: options.dstDir,
          names: options.names.split(","),
        });
        handleApiResponse(response, "fs.copy");
      } catch (error) {
        printError(error instanceof Error ? error.message : "复制失败");
      }
    });

  fs.command("remove")
    .description("删除文件或目录")
    .requiredOption("--dir <dir>", "所在目录")
    .requiredOption("--names <names>", "文件名列表（逗号分隔）")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/fs/remove", {
          dir: options.dir,
          names: options.names.split(","),
        });
        handleApiResponse(response, "fs.remove");
      } catch (error) {
        printError(error instanceof Error ? error.message : "删除失败");
      }
    });

  fs.command("put <local> <remote>")
    .description("上传文件（流式）")
    .action(async (local: string, remote: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const { readFileSync } = await import("node:fs");
        const content = readFileSync(local);

        const opts = cmd.optsWithGlobals();
        const config = resolveConfig({
          baseUrl: opts.baseUrl,
          token: opts.token,
        });
        const { request } = await import("undici");
        const response = await request(`${config.baseUrl}/api/fs/put`, {
          method: "PUT",
          headers: {
            Authorization: config.token,
            "File-Path": encodeURIComponent(remote),
            "Content-Type": "application/octet-stream",
          },
          body: content,
        });

        const body =
          (await response.body.json()) as import("../client.js").ApiResponse;
        handleApiResponse(body, "fs.put");
      } catch (error) {
        printError(error instanceof Error ? error.message : "上传失败");
      }
    });

  // Phase 3 扩展命令
  fs.command("form <local> <remote>")
    .description("上传文件（表单模式）")
    .action(async (local: string, remote: string, options, cmd) => {
      try {
        const { readFileSync } = await import("node:fs");
        const opts = cmd.optsWithGlobals();
        const config = resolveConfig({
          baseUrl: opts.baseUrl,
          token: opts.token,
        });
        const { request } = await import("undici");
        const content = readFileSync(local);

        const boundary = "----OpenListCLI" + Date.now();
        const fileName = local.split("/").pop() || "file";
        const body = [
          `--${boundary}\r\n`,
          `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`,
          `Content-Type: application/octet-stream\r\n\r\n`,
        ].join("");
        const end = `\r\n--${boundary}--\r\n`;
        const bodyBuffer = Buffer.concat([
          Buffer.from(body),
          content,
          Buffer.from(end),
        ]);

        const response = await request(`${config.baseUrl}/api/fs/form`, {
          method: "PUT",
          headers: {
            Authorization: config.token,
            "File-Path": encodeURIComponent(remote),
            "Content-Type": `multipart/form-data; boundary=${boundary}`,
          },
          body: bodyBuffer,
        });

        const responseBody =
          (await response.body.json()) as import("../client.js").ApiResponse;
        handleApiResponse(responseBody, "fs.form");
      } catch (error) {
        printError(error instanceof Error ? error.message : "上传失败");
      }
    });

  fs.command("batch-rename")
    .description("批量重命名")
    .requiredOption("--src-dir <srcDir>", "源目录")
    .requiredOption("--rename-objects <json>", "重命名规则 JSON")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const renameObjects = JSON.parse(options.renameObjects);
        const response = await client.post("/api/fs/batch_rename", {
          src_dir: options.srcDir,
          rename_objects: renameObjects,
        });
        handleApiResponse(response, "fs.batch-rename");
      } catch (error) {
        printError(error instanceof Error ? error.message : "批量重命名失败");
      }
    });

  fs.command("regex-rename")
    .description("正则批量重命名")
    .requiredOption("--src-dir <srcDir>", "源目录")
    .requiredOption("--src-name-regex <regex>", "源文件名正则表达式")
    .requiredOption("--new-name-regex <regex>", "新文件名正则表达式")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/fs/regex_rename", {
          src_dir: options.srcDir,
          src_name_regex: options.srcNameRegex,
          new_name_regex: options.newNameRegex,
        });
        handleApiResponse(response, "fs.regex-rename");
      } catch (error) {
        printError(error instanceof Error ? error.message : "正则重命名失败");
      }
    });

  fs.command("recursive-move")
    .description("递归移动")
    .requiredOption("--src-dir <srcDir>", "源目录")
    .requiredOption("--dst-dir <dstDir>", "目标目录")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/fs/recursive_move", {
          src_dir: options.srcDir,
          dst_dir: options.dstDir,
        });
        handleApiResponse(response, "fs.recursive-move");
      } catch (error) {
        printError(error instanceof Error ? error.message : "递归移动失败");
      }
    });

  fs.command("remove-empty-dirs <path>")
    .description("删除空目录")
    .action(async (path: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/fs/remove_empty_directory", {
          src_dir: path,
        });
        handleApiResponse(response, "fs.remove-empty-dirs");
      } catch (error) {
        printError(error instanceof Error ? error.message : "删除空目录失败");
      }
    });

  fs.command("archive-decompress")
    .description("解压压缩包")
    .requiredOption("--path <path>", "压缩包完整路径")
    .requiredOption("--dst-dir <dstDir>", "解压目标目录")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        // 文档标注 name 为 string，但服务端实际要求 []string（ArchiveDecompressReq.Names）
        const p = options.path as string;
        const idx = p.lastIndexOf("/");
        const srcDir = idx >= 0 ? p.slice(0, idx) || "/" : "/";
        const name = idx >= 0 ? p.slice(idx + 1) : p;
        const response = await client.post("/api/fs/archive/decompress", {
          src_dir: srcDir,
          name: [name],
          dst_dir: options.dstDir,
        });
        handleApiResponse(response, "fs.archive-decompress");
      } catch (error) {
        printError(error instanceof Error ? error.message : "解压失败");
      }
    });

  fs.command("archive-meta <path>")
    .description("获取压缩包元信息")
    .action(async (path: string, options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/fs/archive/meta", { path });
        handleApiResponse(response, "fs.archive-meta");
      } catch (error) {
        printError(
          error instanceof Error ? error.message : "获取压缩包信息失败",
        );
      }
    });

  fs.command("archive-list")
    .description("列出压缩包内容")
    .requiredOption("--path <path>", "压缩包路径")
    .option("--inner-path <innerPath>", "内部路径", "/")
    .action(async (options, cmd) => {
      try {
        const client = getClient(cmd);
        const response = await client.post("/api/fs/archive/list", {
          path: options.path,
          archive_path: options.innerPath,
        });
        handleApiResponse(response, "fs.archive-list");
      } catch (error) {
        printError(
          error instanceof Error ? error.message : "列出压缩包内容失败",
        );
      }
    });
}
