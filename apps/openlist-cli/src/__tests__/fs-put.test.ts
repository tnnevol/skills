import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFileSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { runCli, requireEnv, uniqueName } from "./helpers.js";

// fs put 各参数场景（对应 /api/fs/put 文档 header：
// File-Path / As-Task / Overwrite / Last-Modified / X-File-Md5/Sha1/Sha256）。
// 本地待上传文件生成到 temp/openlist。
const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, "../..");
const localTempDir = resolve(projectRoot, "../..", "temp/openlist");

const CONTENT = "openlist cli put-params test\n";

function listNames(dir: string): string[] {
  const r = runCli(["fs", "list", dir, "--refresh"]);
  if (!r.json?.success) return [];
  return (r.json.data?.content ?? []).map((x: any) => x.name);
}

async function pollUntil(
  predicate: () => boolean,
  timeoutMs = 30000,
  intervalMs = 3000,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return predicate();
}

describe("fs put 参数场景", () => {
  let testDir: string;
  let workName: string;
  let workDir: string;
  let localFile: string;
  let md5 = "";
  let sha1 = "";
  let sha256 = "";
  let size = 0;

  beforeAll(() => {
    requireEnv("OPENLIST_BASE_URL");
    requireEnv("OPENLIST_TOKEN");
    testDir = requireEnv("OPENLIST_TEST_DIR");
    workName = uniqueName("put");
    workDir = `${testDir}/${workName}`;

    if (!existsSync(localTempDir)) mkdirSync(localTempDir, { recursive: true });
    localFile = join(localTempDir, `.cli-put-${workName}.txt`);
    const buf = Buffer.from(CONTENT);
    writeFileSync(localFile, buf);
    md5 = createHash("md5").update(buf).digest("hex");
    sha1 = createHash("sha1").update(buf).digest("hex");
    sha256 = createHash("sha256").update(buf).digest("hex");
    size = buf.length;

    expect(runCli(["fs", "mkdir", workDir]).json.success).toBe(true);
  });

  afterAll(() => {
    runCli(["fs", "remove", "--dir", testDir, "--names", workName]);
    if (localFile && existsSync(localFile)) rmSync(localFile, { force: true });
  });

  it("--overwrite true 允许覆盖（重复上传同名文件）", () => {
    // 首次上传作为种子
    const first = runCli([
      "fs",
      "put",
      localFile,
      `${workDir}/basic.txt`,
      "--overwrite",
      "true",
    ]);
    expect(first.json.success).toBe(true);
    expect(first.json.operation).toBe("fs.put");

    // 再次上传同名，--overwrite true 应覆盖成功
    const second = runCli([
      "fs",
      "put",
      localFile,
      `${workDir}/basic.txt`,
      "--overwrite",
      "true",
    ]);
    expect(second.json.success).toBe(true);

    // 校验文件确实存在且大小正确
    const g = runCli(["fs", "get", `${workDir}/basic.txt`]);
    expect(g.json.success).toBe(true);
    expect(g.json.data.is_dir).toBe(false);
    expect(g.json.data.size).toBe(size);
  });

  it("--overwrite false 拒绝覆盖已存在文件", () => {
    const r = runCli([
      "fs",
      "put",
      localFile,
      `${workDir}/basic.txt`,
      "--overwrite",
      "false",
    ]);
    // Overwrite 头生效：服务端返回 file exists / 403
    expect(r.json.success).toBe(false);
    expect(r.json.code).toBe(403);
    expect(r.json.message).toContain("exists");
  });

  it("--as-task 后台任务上传（返回 task 并最终落地）", async () => {
    const r = runCli([
      "fs",
      "put",
      localFile,
      `${workDir}/astask.txt`,
      "--as-task",
    ]);
    expect(r.json.success).toBe(true);
    // As-Task 头生效：响应包含后台任务对象
    expect(r.json.data).toBeDefined();
    expect(r.json.data.task).toBeDefined();
    expect(r.json.data.task.id).toBeTruthy();

    const landed = await pollUntil(() =>
      listNames(workDir).includes("astask.txt"),
    );
    expect(landed).toBe(true);
  }, 40000);

  it("--md5 校验和头被接受", () => {
    const r = runCli([
      "fs",
      "put",
      localFile,
      `${workDir}/md5.txt`,
      "--md5",
      md5,
    ]);
    expect(r.json.success).toBe(true);
  });

  it("--sha1 与 --sha256 校验和头被接受", () => {
    const r = runCli([
      "fs",
      "put",
      localFile,
      `${workDir}/hash.txt`,
      "--sha1",
      sha1,
      "--sha256",
      sha256,
    ]);
    expect(r.json.success).toBe(true);
  });

  it("--last-modified 头被接受", () => {
    const r = runCli([
      "fs",
      "put",
      localFile,
      `${workDir}/lm.txt`,
      "--last-modified",
      "1700000000000",
    ]);
    expect(r.json.success).toBe(true);
  });

  it("组合多个头上传（overwrite + 校验和 + last-modified）", () => {
    const r = runCli([
      "fs",
      "put",
      localFile,
      `${workDir}/combo.txt`,
      "--overwrite",
      "true",
      "--md5",
      md5,
      "--sha256",
      sha256,
      "--last-modified",
      "1700000000000",
    ]);
    expect(r.json.success).toBe(true);
    const g = runCli(["fs", "get", `${workDir}/combo.txt`]);
    expect(g.json.success).toBe(true);
    expect(g.json.data.size).toBe(size);
  });
});
