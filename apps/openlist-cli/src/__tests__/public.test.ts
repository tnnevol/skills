import { describe, it, expect, beforeAll } from "vitest";
import { runCli, requireEnv } from "./helpers.js";

// public 命令读取公开信息，仅需 base-url + token（真实环境）。
describe("public 命令", () => {
  beforeAll(() => {
    requireEnv("OPENLIST_BASE_URL");
    requireEnv("OPENLIST_TOKEN");
  });

  it("settings 返回公开设置", () => {
    const r = runCli(["public", "settings"]);
    expect(r.code).toBe(0);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("public.settings");
    expect(r.json.data).toBeTypeOf("object");
    // 公开设置中通常包含站点标题等字段
    expect(r.json.data).toHaveProperty("site_title");
  });

  it("offline-download-tools 返回可用工具列表", () => {
    const r = runCli(["public", "offline-download-tools"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("public.offline-download-tools");
    expect(Array.isArray(r.json.data)).toBe(true);
  });

  it("archive-extensions 返回支持的压缩格式", () => {
    const r = runCli(["public", "archive-extensions"]);
    expect(r.json.success).toBe(true);
    expect(r.json.operation).toBe("public.archive-extensions");
    expect(r.json.data).toBeDefined();
  });
});
