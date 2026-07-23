import { describe, it, expect, beforeAll } from "vitest";
import { runCli, requireEnv } from "./helpers.js";

// me 命令管理当前用户。测试仅覆盖只读操作（get / sshkey-list），
// 避免 update 修改真实账号密码。
describe("me 命令", () => {
  beforeAll(() => {
    requireEnv("OPENLIST_BASE_URL");
    requireEnv("OPENLIST_TOKEN");
  });

  it("get 返回当前用户信息", () => {
    const r = runCli(["me", "get"]);
    expect(r.code).toBe(0);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("me.get");
    expect(r.json.data).toBeDefined();
    expect(typeof r.json.data.username).toBe("string");
    expect(r.json.data).toHaveProperty("id");
  });

  it("sshkey-list 返回 SSH 公钥列表", () => {
    const r = runCli(["me", "sshkey-list"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("me.sshkey-list");
    // data 可能为 null 或数组，只要请求成功即视为通过
  });
});
