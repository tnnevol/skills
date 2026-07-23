import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runCli, requireEnv } from "./helpers.js";

// share 命令测试完整生命周期：create -> get -> list -> update -> disable -> enable -> delete
// 使用 .env 中的 OPENLIST_TEST_DIR 作为被分享路径，结束后删除分享。
describe("share 命令（真实分享生命周期）", () => {
  let testDir: string;
  let shareId: string | undefined;

  beforeAll(() => {
    requireEnv("OPENLIST_BASE_URL");
    requireEnv("OPENLIST_TOKEN");
    testDir = requireEnv("OPENLIST_TEST_DIR");
  });

  afterAll(() => {
    // 最大努力清理：删除测试期间创建的分享
    if (shareId) {
      runCli(["share", "delete", shareId]);
    }
  });

  it("create 创建分享并返回 id", () => {
    const r = runCli(["share", "create", "--path", testDir]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("share.create");
    expect(r.json.data.id).toBeTruthy();
    expect(r.json.data.files).toContain(testDir);
    shareId = r.json.data.id;
  });

  it("create --expires 设置过期时间（服务端字段 expires）", () => {
    const expires = "2099-01-01T00:00:00Z";
    const r = runCli([
      "share",
      "create",
      "--path",
      testDir,
      "--expires",
      expires,
    ]);
    expect(r.json.success).toBe(true);
    // expires 真实生效（非文档的 expiration）
    expect(r.json.data.expires).toBeTruthy();
    expect(String(r.json.data.expires)).toContain("2099");
    // 立即删除该独立分享，避免干扰生命周期用例
    runCli(["share", "delete", r.json.data.id]);
  });

  it("get 返回分享详情", () => {
    expect(shareId).toBeTruthy();
    const r = runCli(["share", "get", shareId!]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("share.get");
    expect(r.json.data.id).toBe(shareId);
  });

  it("list 列表包含新建分享", () => {
    const r = runCli(["share", "list"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("share.list");
    const ids = (r.json.data.content ?? []).map((x: any) => x.id);
    expect(ids).toContain(shareId);
  });

  it("update 更新分享密码", () => {
    expect(shareId).toBeTruthy();
    const r = runCli([
      "share",
      "update",
      shareId!,
      "--path",
      testDir,
      "--password",
      "unit-test-pwd",
    ]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("share.update");
    expect(r.json.data.pwd).toBe("unit-test-pwd");
  });

  it("disable 禁用分享", () => {
    const r = runCli(["share", "disable", shareId!]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("share.disable");
  });

  it("enable 启用分享", () => {
    const r = runCli(["share", "enable", shareId!]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("share.enable");
  });

  it("delete 删除分享", () => {
    const r = runCli(["share", "delete", shareId!]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("share.delete");
    shareId = undefined; // 已删除，afterAll 无需重复
  });
});
