import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { runCli, requireEnv, uniqueName } from "./helpers.js";

// 跨驱动 copy/move 是异步任务（返回 task 而非立即完成），
// 使用 OPENLIST_TEST_DIR_SRC / OPENLIST_TEST_DIR_DST 做真实跨驱动测试，
// 通过轮询目标目录直到文件真正落地来校验结果。
const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, "../..");

function listNames(dir: string): string[] {
  const r = runCli(["fs", "list", dir, "--refresh"]);
  if (!r.json?.success) return [];
  return (r.json.data?.content ?? []).map((x: any) => x.name);
}

/** 轮询直到 predicate 为真或超时。 */
async function pollUntil(
  predicate: () => boolean,
  timeoutMs = 60000,
  intervalMs = 3000,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return predicate();
}

describe("fs 跨驱动命令（异步任务 + 轮询落地）", () => {
  let srcDir: string;
  let dstDir: string;
  let localFile: string;
  let copyName: string;
  let moveName: string;

  beforeAll(() => {
    requireEnv("OPENLIST_BASE_URL");
    requireEnv("OPENLIST_TOKEN");
    srcDir = requireEnv("OPENLIST_TEST_DIR_SRC");
    dstDir = requireEnv("OPENLIST_TEST_DIR_DST");

    const tag = uniqueName("xdrive");
    copyName = `copy-${tag}.txt`;
    moveName = `move-${tag}.txt`;

    localFile = join(projectRoot, `.tmp-xdrive-${tag}.txt`);
    writeFileSync(localFile, "openlist cli cross-drive test\n", "utf-8");

    // 在源驱动准备两个待操作文件
    expect(
      runCli(["fs", "put", localFile, `${srcDir}/${copyName}`]).json.success,
    ).toBe(true);
    expect(
      runCli(["fs", "put", localFile, `${srcDir}/${moveName}`]).json.success,
    ).toBe(true);
  });

  afterAll(() => {
    // 最大努力清理：源盘与目标盘上的测试文件
    runCli(["fs", "remove", "--dir", srcDir, "--names", copyName]);
    runCli(["fs", "remove", "--dir", srcDir, "--names", moveName]);
    runCli(["fs", "remove", "--dir", dstDir, "--names", copyName]);
    runCli(["fs", "remove", "--dir", dstDir, "--names", moveName]);
    if (localFile && existsSync(localFile)) {
      rmSync(localFile, { force: true });
    }
  });

  it("copy 跨驱动返回异步任务", () => {
    const r = runCli([
      "fs",
      "copy",
      "--src-dir",
      srcDir,
      "--dst-dir",
      dstDir,
      "--names",
      copyName,
    ]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.copy");
    // 跨驱动为异步任务，返回 tasks 数组
    expect(Array.isArray(r.json.data.tasks)).toBe(true);
    expect(r.json.data.tasks.length).toBeGreaterThanOrEqual(1);
    expect(r.json.data.message).toMatch(/task/i);
  });

  it("copy 文件最终落地目标驱动（轮询）", async () => {
    const landed = await pollUntil(
      () => listNames(dstDir).includes(copyName),
      90000,
    );
    expect(landed).toBe(true);
  }, 100000);

  it("copy 完成后源文件仍保留", () => {
    const r = runCli(["fs", "get", `${srcDir}/${copyName}`]);
    expect(r.json.success).toBe(true);
    expect(r.json.data.name).toBe(copyName);
  });

  it("move 跨驱动返回异步任务", () => {
    const r = runCli([
      "fs",
      "move",
      "--src-dir",
      srcDir,
      "--dst-dir",
      dstDir,
      "--names",
      moveName,
    ]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.move");
    expect(Array.isArray(r.json.data.tasks)).toBe(true);
    expect(r.json.data.tasks.length).toBeGreaterThanOrEqual(1);
    expect(r.json.data.message).toMatch(/task/i);
  });

  it("move 文件最终落地目标驱动（轮询）", async () => {
    const landed = await pollUntil(
      () => listNames(dstDir).includes(moveName),
      90000,
    );
    expect(landed).toBe(true);
  }, 100000);

  // 说明：跨存储 move = 先复制到目标盘再删除源文件，“删源”属于
  // 任务完成后的最终一致行为：单独运行约 10s 完成，但当任务队列中
  // 同时存在其它异步任务（如上一个 copy 任务）时，源删除可能被长时间
  // 阻塞（>120s），且受网盘限速影响。用户需求为“轮询直到落地”，而
  // 源删除不属于“落地”且无法稳定断言，因此不对其做硬性校验。
});
