import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { runCli, requireEnv, uniqueName } from "./helpers.js";

// fs 高级命令：regex-rename / recursive-move / remove-empty-dirs
// 契约已对照 openlist apifox 文档核对，与 CLI 实现一致。
// 全部在 OPENLIST_TEST_DIR 沙箱内构造嵌套目录后真实测试，结束后清理。
const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, "../..");

function listNames(dir: string): string[] {
  const r = runCli(["fs", "list", dir, "--refresh"]);
  if (!r.json?.success) return [];
  return (r.json.data?.content ?? []).map((x: any) => x.name);
}

describe("fs 高级命令（regex-rename / recursive-move / remove-empty-dirs）", () => {
  let testDir: string;
  let workName: string;
  let workDir: string;
  let localFile: string;

  beforeAll(() => {
    requireEnv("OPENLIST_BASE_URL");
    requireEnv("OPENLIST_TOKEN");
    testDir = requireEnv("OPENLIST_TEST_DIR");
    workName = uniqueName("fs-adv");
    workDir = `${testDir}/${workName}`;

    localFile = join(projectRoot, `.tmp-fsadv-${workName}.txt`);
    writeFileSync(localFile, "openlist cli fs-advanced test\n", "utf-8");

    // 构造嵌套目录结构：a/1.txt、b/c/2.txt，另建空的 flat 作为聚合目标
    expect(runCli(["fs", "mkdir", `${workDir}/a`]).json.success).toBe(true);
    expect(runCli(["fs", "mkdir", `${workDir}/b/c`]).json.success).toBe(true);
    expect(runCli(["fs", "mkdir", `${workDir}/flat`]).json.success).toBe(true);
    expect(
      runCli(["fs", "put", localFile, `${workDir}/a/1.txt`]).json.success,
    ).toBe(true);
    expect(
      runCli(["fs", "put", localFile, `${workDir}/b/c/2.txt`]).json.success,
    ).toBe(true);
  });

  afterAll(() => {
    // 最大努力清理：递归删除工作目录
    runCli(["fs", "remove", "--dir", testDir, "--names", workName]);
    if (localFile && existsSync(localFile)) {
      rmSync(localFile, { force: true });
    }
  });

  it("recursive-move 将嵌套文件聚合（扁平化）到目标目录", () => {
    const r = runCli([
      "fs",
      "recursive-move",
      "--src-dir",
      workDir,
      "--dst-dir",
      `${workDir}/flat`,
    ]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.recursive-move");

    // 深层文件被提取到 flat 根下（扁平化）
    const names = listNames(`${workDir}/flat`);
    expect(names).toContain("1.txt");
    expect(names).toContain("2.txt");
  });

  it("remove-empty-dirs 删除空目录并保留非空目录", () => {
    const r = runCli(["fs", "remove-empty-dirs", workDir]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.remove-empty-dirs");

    // a、b 已因文件被移走而变空，应被删除；flat 含文件，应保留
    const names = listNames(workDir);
    expect(names).not.toContain("a");
    expect(names).not.toContain("b");
    expect(names).toContain("flat");
  });

  it("regex-rename 按正则+捕获组批量重命名", () => {
    // 准备一个匹配 IMG_(\d+) 的文件
    expect(
      runCli(["fs", "put", localFile, `${workDir}/flat/IMG_100.txt`]).json
        .success,
    ).toBe(true);

    const r = runCli([
      "fs",
      "regex-rename",
      "--src-dir",
      `${workDir}/flat`,
      "--src-name-regex",
      "IMG_(\\d+)",
      "--new-name-regex",
      "Photo_$1",
    ]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("fs.regex-rename");

    const names = listNames(`${workDir}/flat`);
    expect(names).toContain("Photo_100.txt");
    expect(names).not.toContain("IMG_100.txt");
  });
});
