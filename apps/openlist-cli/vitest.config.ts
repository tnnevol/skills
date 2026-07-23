import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // 加载 .env 中的环境变量（OPENLIST_BASE_URL / OPENLIST_TOKEN 等）
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/__tests__/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    // 测试针对编译后的 CLI，真实访问 OpenList，需要较长超时
    testTimeout: 30000,
    hookTimeout: 30000,
    // helpers.ts 不是测试文件
    fileParallelism: false,
  },
});
