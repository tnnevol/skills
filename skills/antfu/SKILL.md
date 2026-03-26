---
name: antfu
description: Anthony Fu's opinionated tooling and conventions for JavaScript/TypeScript projects (Modified by Tnnevol). Use when setting up new projects, configuring ESLint/Prettier alternatives, monorepos, library publishing, or when the user mentions Anthony Fu's preferences.
metadata:
  author: Anthony Fu (Modified by Tnnevol)
  version: "2026.02.03"
---

## 编码实践

### 代码组织

- **单一职责**: 每个源文件应具有明确、专注的作用域/目的
- **拆分大文件**: 当文件变得过大或处理过多关注点时拆分文件
- **类型分离**: 始终将类型和接口分离到 `types.ts` 或 `types/*.ts` 中
- **常量提取**: 将常量移到专用的 `constants.ts` 文件中

### 运行时环境

- **首选同构代码**: 编写可在 Node、浏览器和 worker 中运行的运行时无关代码
- **明确运行时指标**: 当代码特定于环境时，在文件顶部添加注释：

```ts
// @env node
// @env browser
```

### TypeScript

- **显式返回类型**: 可能时显式声明返回类型
- **避免复杂内联类型**: 将复杂类型提取到专用的 `type` 或 `interface` 声明中

### 注释

- **避免不必要的注释**: 代码应自解释
- **解释"为什么"而非"怎么样"**: 注释应描述原因或意图，而非代码的作用

### 测试 (Vitest)

- 测试文件: `foo.ts` → `foo.test.ts` (同一目录)
- 使用 `describe`/`it` API (而非 `test`)
- 使用 `toMatchSnapshot` 处理复杂输出
- 对语言特定快照使用带显式路径的 `toMatchFileSnapshot`

---

## 工具选择

### @antfu/ni 命令

| 命令 | 描述 |
|---------|-------------|
| `ni` | 安装依赖 |
| `ni <pkg>` / `ni -D <pkg>` | 添加依赖 / 开发依赖 |
| `nr <script>` | 运行脚本 |
| `nu` | 升级依赖 |
| `nun <pkg>` | 卸载依赖 |
| `nci` | 清理安装 (`pnpm i --frozen-lockfile`) |
| `nlx <pkg>` | 执行包 (`npx`) |

### TypeScript 配置

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

### ESLint 设置

```js
// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu()
```


完成任务时，运行 `pnpm run lint --fix` 来格式化代码并修复编码风格。

有关详细配置选项：[antfu-eslint-config](references/antfu-eslint-config.md)

### Git 钩子

```json
{
  "simple-git-hooks": {
    "pre-commit": "pnpm i --frozen-lockfile --ignore-scripts --offline && npx lint-staged"
  },
  "lint-staged": { "*": "eslint --fix" },
  "scripts": {
    "prepare": "npx simple-git-hooks"
  }
}
```

### pnpm 目录

在 `pnpm-workspace.yaml` 中使用命名目录进行版本管理：

| 目录 | 用途 |
|---------|---------|
| `prod` | 生产依赖 |
| `inlined` | 打包器内联依赖 |
| `dev` | 开发工具（linter、打包器、测试） |
| `frontend` | 前端库 |

避免使用默认目录。可根据项目需求调整目录名称。

---

## 参考资料

| 主题 | 描述 | 参考 |
|-------|-------------|-----------|
| ESLint 配置 | 框架支持、格式化器、规则覆盖、VS Code 设置 | [antfu-eslint-config](references/antfu-eslint-config.md) |
| 项目设置 | .gitignore、GitHub Actions、VS Code 扩展 | [setting-up](references/setting-up.md) |
| 应用开发 | Vue/Nuxt/UnoCSS 约定和模式 | [app-development](references/app-development.md) |
| 库开发 | tsdown 打包、纯 ESM 发布 | [library-development](references/library-development.md) |
| Monorepo | pnpm 工作区、集中别名、Turborepo | [monorepo](references/monorepo.md) |