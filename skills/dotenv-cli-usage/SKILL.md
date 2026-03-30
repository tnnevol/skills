---
name: dotenv-cli-usage
description: Automatically load .env.local files in npm scripts using dotenv-cli. Use when configuring development environments, test setups, or any scenario requiring environment variable management.
metadata:
  author: Tnnevol
  version: "2026.03.30"
---

## 📦 安装

```bash
# 安装为开发依赖
npm install -D dotenv-cli
# 或
pnpm add -D dotenv-cli
```

---

## 🚀 快速开始

### 方式 1：基本用法

```bash
# 加载 .env 文件并运行命令
dotenv -- npm start

# 加载指定的 .env 文件
dotenv -e .env.local -- npm start

# 加载多个 .env 文件（后面的覆盖前面的）
dotenv -e .env.example -e .env.local -- npm start
```

### 方式 2：修改 package.json scripts（推荐）

```json
{
  "scripts": {
    "start": "dotenv -e .env.local -- node dist/server.js",
    "dev": "dotenv -e .env.local -- ts-node src/server.ts",
    "test": "dotenv -e .env.local -- vitest run",
    "test:watch": "dotenv -e .env.local -- vitest",
    "test:coverage": "dotenv -e .env.local -- vitest run --coverage",
    "build": "tsc",
    "benchmark": "dotenv -e .env.local -- ts-node src/utils/benchmark.ts",
    "benchmark:run": "npm run build && dotenv -e .env.local -- node dist/utils/benchmark.js"
  }
}
```

**效果：**
- ✅ `npm start` 自动加载 `.env.local`
- ✅ `npm test` 自动加载 `.env.local`
- ✅ 无需手动 `export $(cat .env.local | xargs)`

---

## 📋 完整配置示例

### package.json

```json
{
  "name": "@tnnevol/auto-save-mcp",
  "version": "1.2.0",
  "scripts": {
    "build": "tsc",
    "start": "dotenv -e .env.local -- node dist/server.js",
    "dev": "dotenv -e .env.local -- ts-node src/server.ts",
    "test": "dotenv -e .env.local -- vitest run",
    "test:watch": "dotenv -e .env.local -- vitest",
    "test:coverage": "dotenv -e .env.local -- vitest run --coverage"
  },
  "devDependencies": {
    "dotenv-cli": "^11.0.0",
    "typescript": "^6.0.0",
    "ts-node": "^10.9.0",
    "vitest": "^4.1.2"
  }
}
```

### .env.local

```bash
# Auto-save Service Configuration (REQUIRED)
AUTO_SAVE_BASE_URL=http://localhost:5005
AUTO_SAVE_TOKEN=your-token-here

# MCP Server Configuration (OPTIONAL)
MCP_PORT=8080
```

### .gitignore

```gitignore
# 本地配置（不提交）
.env.local
.env.*.local

# 构建产物
dist/
node_modules/
```

---

## 🔧 高级用法

### 多环境支持

```json
{
  "scripts": {
    "dev": "dotenv -e .env.local -e .env.development -- ts-node src/server.ts",
    "test": "dotenv -e .env.local -e .env.test -- vitest run",
    "prod": "dotenv -e .env.production -- node dist/server.js"
  }
}
```

### Vitest 集成

**vitest.config.ts：**
```typescript
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  
  return {
    test: {
      environment: 'node',
      globals: true,
      include: ['tests/**/*.test.{ts,tsx}'],
      exclude: ['node_modules', 'dist'],
      setupFiles: ['./tests/setup.ts'],
    },
  };
});
```

**tests/setup.ts：**
```typescript
import { config } from 'dotenv';
config({ path: '.env.local' });
```

---

## 🎯 集成步骤

### 4 步完成集成

1. **安装 dotenv-cli**
   ```bash
   npm install -D dotenv-cli
   ```

2. **更新 package.json scripts**
   - 在所有需要环境变量的命令前添加 `dotenv -e .env.local --`

3. **验证配置**
   ```bash
   npm run dev
   npm test
   ```

4. **更新文档**
   - 在 README.md 中添加环境变量说明
   - 在 .env.example 中提供配置模板

---

## ⚠️ 注意事项

### 安全

- ✅ `.env.local` 必须加入 `.gitignore`
- ✅ 不要提交敏感信息（token、密码等）
- ✅ 提供 `.env.example` 作为配置模板

### 兼容性

- ✅ dotenv-cli 完全兼容 npm scripts
- ✅ 支持多环境文件（后面的覆盖前面的）
- ✅ 与 vitest、jest 等测试框架兼容

### 故障排查

**问题：** `dotenv: command not found`

**解决：**
```bash
# 确认安装
npm list dotenv-cli

# 重新安装
npm install -D dotenv-cli
```

**问题：** 环境变量未加载

**解决：**
```bash
# 检查 .env.local 文件路径
ls -la .env.local

# 手动测试
dotenv -e .env.local -- echo $VARIABLE_NAME
```

---

## 📝 任务清单

### 小钱需要做的

- [ ] 安装 dotenv-cli：`pnpm add -D dotenv-cli`
- [ ] 更新 package.json scripts
- [ ] 验证 `pnpm dev` 和 `pnpm test` 正常
- [ ] 检查 .gitignore 包含 `.env.local`
- [ ] 更新 README.md 添加使用说明

---

## 🔗 参考资源

- [dotenv-cli npm package](https://www.npmjs.com/package/dotenv-cli)
- [dotenv GitHub](https://github.com/motdotla/dotenv)
- [Vitest 配置指南](https://vitest.dev/config/)
