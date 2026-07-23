import { describe, it, expect, beforeAll } from "vitest";
import { runCli, requireEnv } from "./helpers.js";

// admin 命令测试仅覆盖只读操作（list / get / index-progress）与参数校验，
// 不测试 create/update/delete/index-build 等破坏性或重负载操作。
describe("admin 命令", () => {
  beforeAll(() => {
    requireEnv("OPENLIST_BASE_URL");
    requireEnv("OPENLIST_TOKEN");
  });

  it.each(["user", "storage", "setting", "meta"])(
    "list --type %s 返回资源",
    (type) => {
      const r = runCli(["admin", "list", "--type", type]);
      expect(r.code).toBe(0);
      expect(r.json.success).toBe(true);
      expect(r.json.operation).toBe(`admin.list(${type})`);
      expect(r.json.data).toBeDefined();
    },
  );

  it("list 无效 --type 时本地校验报错", () => {
    const r = runCli(["admin", "list", "--type", "bogus"]);
    expect(r.json.success).toBe(false);
    expect(r.json.message).toContain("无效的资源类型");
  });

  it("get 返回指定用户详情", () => {
    // id=1 为默认 admin 用户
    const r = runCli(["admin", "get", "1", "--type", "user"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("admin.get(user)");
    expect(r.json.data).toHaveProperty("id");
  });

  it("index-progress 返回索引进度", () => {
    const r = runCli(["admin", "index-progress"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("admin.index-progress");
    expect(r.json.data).toHaveProperty("is_done");
  });
});
