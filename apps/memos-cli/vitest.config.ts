import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // 测试凭据来自外部环境变量；仓库内不放置任何 .env 或凭据文件
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    // 测试针对编译后的 CLI，真实访问 Memos，需要较长超时
    testTimeout: 30000,
    hookTimeout: 30000,
    // helpers.ts 不是测试文件
    fileParallelism: false,
  },
})
