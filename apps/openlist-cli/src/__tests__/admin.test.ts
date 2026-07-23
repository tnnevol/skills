import { describe, it, expect, beforeAll } from "vitest";
import { runCli, requireEnv } from "./helpers.js";

// admin 命令改为按资源子命令树（admin <资源> <操作>）。
// 测试仅覆盖只读操作（list/get/progress/driver 查询），
// 不测试 create/update/delete/enable/disable/save/reset-token/index-build 等
// 破坏性操作（会真实改动后台数据）。
describe("admin 命令（按资源子命令树）", () => {
  beforeAll(() => {
    requireEnv("OPENLIST_BASE_URL");
    requireEnv("OPENLIST_TOKEN");
  });

  it("user list 列出用户", () => {
    const r = runCli(["admin", "user", "list"]);
    expect(r.code).toBe(0);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("admin.user.list");
    expect(r.json.data).toBeDefined();
  });

  it("user get 获取指定用户", () => {
    // id=1 为默认 admin
    const r = runCli(["admin", "user", "get", "1"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("admin.user.get");
    expect(r.json.data).toHaveProperty("id");
  });

  it("storage list 列出存储", () => {
    const r = runCli(["admin", "storage", "list"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("admin.storage.list");
    expect(r.json.data).toBeDefined();
  });

  it("storage get 获取指定存储", () => {
    const r = runCli(["admin", "storage", "get", "1"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("admin.storage.get");
    expect(r.json.data).toHaveProperty("id");
  });

  it("meta list 列出元信息", () => {
    const r = runCli(["admin", "meta", "list"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("admin.meta.list");
    expect(r.json.data).toBeDefined();
  });

  it("setting list 列出设置", () => {
    const r = runCli(["admin", "setting", "list"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("admin.setting.list");
    expect(Array.isArray(r.json.data)).toBe(true);
  });

  it("setting get 按 key 获取设置", () => {
    // version 为内置设置项，按 key 查询（修正后不再用 id）
    const r = runCli(["admin", "setting", "get", "version"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("admin.setting.get");
    expect(r.json.data.key).toBe("version");
  });

  it("driver list 列出驱动模板", () => {
    const r = runCli(["admin", "driver", "list"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("admin.driver.list");
    expect(r.json.data).toBeDefined();
  });

  it("driver names 列出驱动名", () => {
    const r = runCli(["admin", "driver", "names"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("admin.driver.names");
    expect(Array.isArray(r.json.data)).toBe(true);
    expect(r.json.data.length).toBeGreaterThan(0);
  });

  it("driver info 获取指定驱动信息", () => {
    const r = runCli(["admin", "driver", "info", "SMB"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("admin.driver.info");
    expect(r.json.data).toBeDefined();
  });

  it("index progress 获取索引进度", () => {
    const r = runCli(["admin", "index", "progress"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("admin.index.progress");
    expect(r.json.data).toHaveProperty("is_done");
  });
});
