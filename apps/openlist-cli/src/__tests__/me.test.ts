import { describe, it, expect, beforeAll } from "vitest";
import { runCli, requireEnv } from "./helpers.js";

// me 命令仅保留只读的 get（用户信息）。
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
});
