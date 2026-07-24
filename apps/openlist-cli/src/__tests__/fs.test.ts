import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { runCli, requireEnv, uniqueName } from "./helpers.js";

// fs 命令使用 .env 中的 OPENLIST_TEST_DIR 作为真实读写沙箱，
// 每次运行创建唯一工作目录，测试结束后清理，避免污染其他数据。
const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, "../..");

describe("fs 命令（真实文件生命周期）", () => {
  let testDir: string;
  let workName: string;
  let workDir: string;
  let localFile: string;

  beforeAll(() => {
    requireEnv("OPENLIST_BASE_URL");
    requireEnv("OPENLIST_TOKEN");
    testDir = requireEnv("OPENLIST_TEST_DIR");
    workName = uniqueName();
    workDir = `${testDir}/${workName}`;

    // 准备本地待上传文件
    localFile = join(projectRoot, `.tmp-upload-${workName}.txt`);
    writeFileSync(localFile, "openlist cli unit test content\n", "utf-8");

    // 创建工作目录与子目录
    expect(runCli(["fs", "mkdir", workDir]).json.success).toBe(true);
    expect(runCli(["fs", "mkdir", `${workDir}/sub`]).json.success).toBe(true);
  });

  afterAll(() => {
    // 最大努力清理：递归删除工作目录
    runCli(["fs", "remove", "--dir", testDir, "--names", workName]);
    if (localFile && existsSync(localFile)) {
      rmSync(localFile, { force: true });
    }
  });

  it("list 测试根目录包含新建工作目录", () => {
    const r = runCli(["fs", "list", testDir]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.list");
    const names = (r.json.data.content ?? []).map((x: any) => x.name);
    expect(names).toContain(workName);
  });

  it("put 流式上传文件", () => {
    const r = runCli(["fs", "put", localFile, `${workDir}/a.txt`]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.put");
  });

  it("get 返回上传文件信息", () => {
    const r = runCli(["fs", "get", `${workDir}/a.txt`]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.get");
    expect(r.json.data.name).toBe("a.txt");
    expect(r.json.data.is_dir).toBe(false);
    expect(r.json.data.size).toBeGreaterThan(0);
  });

  it("list 工作目录包含上传文件", () => {
    const r = runCli(["fs", "list", workDir]);
    expect(r.json.success).toBe(true);
    const names = (r.json.data.content ?? []).map((x: any) => x.name);
    expect(names).toContain("a.txt");
    // 附带分页信息：总页数 = ceil(total / perPage)
    expect(r.json.pagination).toBeDefined();
    expect(r.json.pagination.perPage).toBe(30);
    expect(r.json.pagination.total).toBe(r.json.data.total);
    expect(r.json.pagination.totalPages).toBe(
      Math.ceil(r.json.data.total / 30),
    );
  });

  it("rename 重命名文件", () => {
    const r = runCli(["fs", "rename", `${workDir}/a.txt`, "renamed.txt"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.rename");
    // 确认重命名后文件存在
    const g = runCli(["fs", "get", `${workDir}/renamed.txt`]);
    expect(g.json.success).toBe(true);
  });

  it("copy 复制文件到子目录", () => {
    const r = runCli([
      "fs",
      "copy",
      "--src-dir",
      workDir,
      "--dst-dir",
      `${workDir}/sub`,
      "--names",
      "renamed.txt",
    ]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.copy");
  });

  it("move 移动文件到新目录", () => {
    // 移动到全新目录，避免与已存在文件冲突
    expect(runCli(["fs", "mkdir", `${workDir}/moved`]).json.success).toBe(true);
    const r = runCli([
      "fs",
      "move",
      "--src-dir",
      workDir,
      "--dst-dir",
      `${workDir}/moved`,
      "--names",
      "renamed.txt",
    ]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.move");
    const g = runCli(["fs", "get", `${workDir}/moved/renamed.txt`]);
    expect(g.json.success).toBe(true);
  });

  it("batch-rename 批量重命名", () => {
    const r = runCli([
      "fs",
      "batch-rename",
      "--src-dir",
      `${workDir}/sub`,
      "--rename-objects",
      JSON.stringify([{ src_name: "renamed.txt", new_name: "batch.txt" }]),
    ]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.batch-rename");
  });

  it("form 表单模式上传文件", () => {
    const r = runCli(["fs", "form", localFile, `${workDir}/form.txt`]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.form");
  });

  it("search 搜索命令返回成功", () => {
    // 搜索依赖索引，刚上传的文件可能未被索引，此处只校验命令成功
    const r = runCli(["fs", "search", "-k", "renamed", "-p", workDir]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.search");
    expect(r.json.data).toHaveProperty("content");
    // 附带分页信息：总页数 = ceil(total / perPage)
    expect(r.json.pagination).toBeDefined();
    expect(r.json.pagination.perPage).toBe(30);
    expect(r.json.pagination.total).toBe(r.json.data.total);
    expect(r.json.pagination.totalPages).toBe(
      Math.ceil(r.json.data.total / 30),
    );
  });

  it("dirs 获取目录树", () => {
    const r = runCli(["fs", "dirs", testDir]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.dirs");
  });

  it("remove 删除文件", () => {
    const r = runCli([
      "fs",
      "remove",
      "--dir",
      `${workDir}/moved`,
      "--names",
      "renamed.txt",
    ]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.remove");
  });
});
