import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFileSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { runCli, requireEnv, uniqueName } from "./helpers.js";

// fs 压缩包命令：archive-meta / archive-list / archive-decompress
// 契约已对照 openlist apifox + 真实服务端核对（decompress 用 {src_dir, name:[], dst_dir}，
// list 用 archive_path）。本地待上传文件生成到 temp/openlist 目录。
const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, "../..");
// workspace 根目录下的 temp/openlist 用于存放本地待上传产物
const localTempDir = resolve(projectRoot, "../..", "temp/openlist");

// CRC32（ZIP 需要）
function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    let c = (crc ^ buf[i]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// 纯 Node 构造一个最小合法 ZIP（stored/不压缩），避免依赖系统 zip 命令
function makeZip(entries: { name: string; data: string }[]): Buffer {
  const chunks: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const e of entries) {
    const nb = Buffer.from(e.name, "utf8");
    const d = Buffer.from(e.data);
    const crc = crc32(d);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(d.length, 18);
    lh.writeUInt32LE(d.length, 22);
    lh.writeUInt16LE(nb.length, 26);
    const localOffset = offset;
    chunks.push(lh, nb, d);
    offset += 30 + nb.length + d.length;
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(d.length, 20);
    ch.writeUInt32LE(d.length, 24);
    ch.writeUInt16LE(nb.length, 28);
    ch.writeUInt32LE(localOffset, 42);
    central.push(Buffer.concat([ch, nb]));
  }
  const cb = Buffer.concat(central);
  const centralOffset = offset;
  chunks.push(cb);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cb.length, 12);
  eocd.writeUInt32LE(centralOffset, 16);
  chunks.push(eocd);
  return Buffer.concat(chunks);
}

function listNames(dir: string): string[] {
  const r = runCli(["fs", "list", dir, "--refresh"]);
  if (!r.json?.success) return [];
  return (r.json.data?.content ?? []).map((x: any) => x.name);
}

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

describe("fs 压缩包命令（archive-meta / list / decompress）", () => {
  let testDir: string;
  let workName: string;
  let workDir: string;
  let zipRemote: string;
  let localZip: string;

  beforeAll(() => {
    requireEnv("OPENLIST_BASE_URL");
    requireEnv("OPENLIST_TOKEN");
    testDir = requireEnv("OPENLIST_TEST_DIR");
    workName = uniqueName("arc");
    workDir = `${testDir}/${workName}`;
    zipRemote = `${workDir}/test.zip`;

    // 本地 zip 生成到 temp/openlist
    if (!existsSync(localTempDir)) mkdirSync(localTempDir, { recursive: true });
    localZip = join(localTempDir, `.cli-test-${workName}.zip`);
    writeFileSync(
      localZip,
      makeZip([
        { name: "a.txt", data: "hello openlist\n" },
        { name: "docs/b.txt", data: "world\n" },
      ]),
    );

    // 沙箱内建工作目录 + 解压目标目录，并上传 zip
    expect(runCli(["fs", "mkdir", workDir]).json.success).toBe(true);
    expect(runCli(["fs", "mkdir", `${workDir}/out`]).json.success).toBe(true);
    expect(runCli(["fs", "put", localZip, zipRemote]).json.success).toBe(true);
  });

  afterAll(() => {
    runCli(["fs", "remove", "--dir", testDir, "--names", workName]);
    if (localZip && existsSync(localZip)) rmSync(localZip, { force: true });
  });

  it("archive-meta 获取压缩包元信息", () => {
    const r = runCli(["fs", "archive-meta", zipRemote]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.archive-meta");
    expect(r.json.data).toBeDefined();
  });

  it("archive-list 列出压缩包内容", () => {
    const r = runCli(["fs", "archive-list", "--path", zipRemote]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.archive-list");
    const names = (r.json.data?.content ?? []).map((x: any) => x.name);
    expect(names).toContain("a.txt");
  });

  it("archive-decompress 创建异步解压任务", () => {
    const r = runCli([
      "fs",
      "archive-decompress",
      "--path",
      zipRemote,
      "--dst-dir",
      `${workDir}/out`,
    ]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.archive-decompress");
    // 跨/同盘解压均为异步任务，返回 task 数组
    expect(Array.isArray(r.json.data.task)).toBe(true);
    expect(r.json.data.task.length).toBeGreaterThanOrEqual(1);
  });

  it("archive-decompress 解压产物最终落地目标目录（轮询）", async () => {
    const landed = await pollUntil(
      () => listNames(`${workDir}/out`).includes("a.txt"),
      60000,
    );
    expect(landed).toBe(true);
  }, 70000);
});
