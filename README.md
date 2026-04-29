# Tnnevol Skills

[Agent Skills](https://agentskills.io/home) 精选合集，用于 AI 辅助开发，附带工具使用文档。

> [!IMPORTANT]
> 本项目是一个从源码文档自动生成 Agent Skills 并同步更新的 PoC 项目。
> 技能在实际中的表现尚未充分测试，欢迎反馈和贡献。

## 安装

```bash
pnpx skills add tnnevol/skills --skill='*'
```

或全局安装所有技能：

```bash
pnpx skills add tnnevol/skills --skill='*' -g
```

了解更多 CLI 用法请参考 [skills](https://github.com/vercel-labs/skills)。

## 技能列表

如果你主要使用 Vite/Nuxt 生态，本合集旨在提供一站式资源。涵盖不同来源和不同范围的技能。

### 手动维护技能

> 主观偏好

由 Tnnevol 定制的常用工具、配置规范和最佳实践。

| Skill | Description |
|-------|-------------|
| [tnnevol](skills/tnnevol) | Tnnevol 的 app/library 项目偏好（eslint, pnpm, vitest, vue 等） |
| [autosave](skills/autosave) | 开源网盘自动保存服务 - 任务管理、配置、API - Tnnevol |
| [ding](skills/ding) | 钉钉群聊中快速联系其他 Agent（demo1、demo2 等） - Tnnevol |
| [dingtalk-connector](skills/dingtalk-connector) | 钉钉连接器完整功能集 - 发送消息、管理会话、操作文档、查询目录 - Tnnevol |
| [dotenv-cli-usage](skills/dotenv-cli-usage) | 使用 dotenv-cli 自动加载 .env.local 文件 - Tnnevol |
| [halo](skills/halo) | Halo CMS 博客管理 - 创建、查询、更新、删除、发布文章 - Tnnevol |
| [memos](skills/memos) | Memos 自建笔记工具 - CRUD + 标签 API - Tnnevol |

### 从官方文档生成

> 客观文档驱动，但偏向现代栈（TypeScript, ESM, Composition API 等）

从官方文档生成，并针对 Tnnevol 工作流微调。

| Skill | Description | Source |
|-------|-------------|--------|
| [vue](skills/vue) | Vue.js 核心 - 响应式、组件、组合式 API | [vuejs/docs](https://github.com/vuejs/docs) |
| [nuxt](skills/nuxt) | Nuxt 框架 - 文件系统路由、服务端路由、模块 | [nuxt/nuxt](https://github.com/nuxt/nuxt) |
| [pinia](skills/pinia) | Pinia - 直观的 Vue 类型安全状态管理 | [vuejs/pinia](https://github.com/vuejs/pinia) |
| [vite](skills/vite) | Vite 构建工具 - 配置、插件、SSR、库模式 | [vitejs/vite](https://github.com/vitejs/vite) |
| [vitepress](skills/vitepress) | VitePress - 基于 Vite 的静态站点生成器 | [vuejs/vitepress](https://github.com/vuejs/vitepress) |
| [vitest](skills/vitest) | Vitest - 基于 Vite 的单元测试框架 | [vitest-dev/vitest](https://github.com/vitest-dev/vitest) |
| [unocss](skills/unocss) | UnoCSS - 原子化 CSS 引擎 | [unocss/unocss](https://github.com/unocss/unocss) |
| [pnpm](skills/pnpm) | pnpm - 快速、节省磁盘空间的包管理器 | [pnpm/pnpm.io](https://github.com/pnpm/pnpm.io) |

### 引入技能

同步自外部仓库的自有技能。

| Skill | Description | Source |
|-------|-------------|--------|
| [slidev](skills/slidev) (官方) | Slidev - 面向开发者的演示文稿工具 | [slidevjs/slidev](https://github.com/slidevjs/slidev) |
| [tsdown](skills/tsdown) (官方) | tsdown - 基于 Rolldown 的 TypeScript 库打包工具 | [rolldown/tsdown](https://github.com/rolldown/tsdown) |
| [turborepo](skills/turborepo) (官方) | Turborepo - 高性能 Monorepo 构建系统 | [vercel/turborepo](https://github.com/vercel/turborepo) |
| [vueuse-functions](skills/vueuse-functions) (官方) | VueUse - 200+ Vue 组合式工具 | [vueuse/skills](https://github.com/vueuse/skills) |
| [vue-best-practices](skills/vue-best-practices) | Vue 3 + TypeScript 最佳实践 | [vuejs-ai/skills](https://github.com/vuejs-ai/skills) |
| [vue-router-best-practices](skills/vue-router-best-practices) | Vue Router 最佳实践 | [vuejs-ai/skills](https://github.com/vuejs-ai/skills) |
| [vue-testing-best-practices](skills/vue-testing-best-practices) | Vue 测试最佳实践 | [vuejs-ai/skills](https://github.com/vuejs-ai/skills) |
| [web-design-guidelines](skills/web-design-guidelines) | Web 界面设计指南 | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |

### 本合集的不同之处？

本合集使用 git submodule 直接引用源文档，提供更可靠的上下文，并让技能随上游变更保持最新。如果你主要使用 Vue/Vite/Nuxt，这里旨在提供一站式合集。

## 定制自己的 Skills

Fork 本项目即可创建你自己的技能合集。

1. Fork 或克隆本仓库
2. 安装依赖：`pnpm install`
3. 更新 `meta.ts` 中的项目和技能来源
4. 运行 `pnpm start cleanup` 清理现有 submodules 和 skills
5. 运行 `pnpm start init` 克隆 submodules
6. 运行 `pnpm start sync` 同步引入的技能
7. 让 Agent `生成 <项目> 的 skills`（建议一次生成一个以控制 token 用量）

详见 [AGENTS.md](AGENTS.md)。

## License

本仓库的技能及脚本均采用 [MIT](LICENSE.md) 许可证。

引入的第三方技能保留原始许可证 - 详见对应目录。

本仓库基于 [tnnevol/skills](https://github.com/tnnevol/skills) 创建。
