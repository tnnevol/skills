# Anthony Fu's Skills

精选的 [Agent Skills](https://agentskills.io/home) 集合，反映了 [Anthony Fu](https://github.com/antfu) 的偏好、经验和最佳实践。

> 这是一个概念验证项目，欢迎反馈和贡献。

## 安装

```bash
pnpx skills add antfu/skills --skill='*'
```

或全局安装：

```bash
pnpx skills add antfu/skills --skill='*' -g
```

了解更多 CLI 用法：[skills](https://github.com/vercel-labs/skills)。

## 技能集合

Vite/Nuxt 生态系统的一站式解决方案。

### 手工维护的技能

| 技能 | 描述 |
|------|------|
| [antfu](skills/antfu) | Anthony Fu 对项目开发的偏好和最佳实践 |

### 从官方文档生成的技能

| 技能 | 描述 | 来源 |
|------|------|------|
| [vue](skills/vue) | Vue.js 核心 | [vuejs/docs](https://github.com/vuejs/docs) |
| [nuxt](skills/nuxt) | Nuxt 框架 | [nuxt/nuxt](https://github.com/nuxt/nuxt) |
| [pinia](skills/pinia) | Pinia 状态管理 | [vuejs/pinia](https://github.com/vuejs/pinia) |
| [vite](skills/vite) | Vite 构建工具 | [vitejs/vite](https://github.com/vitejs/vite) |
| [vitepress](skills/vitepress) | VitePress 静态站点生成器 | [vuejs/vitepress](https://github.com/vuejs/vitepress) |
| [vitest](skills/vitest) | Vitest 测试框架 | [vitest-dev/vitest](https://github.com/vitest-dev/vitest) |
| [unocss](skills/unocss) | UnoCSS 原子化 CSS | [unocss/unocss](https://github.com/unocss/unocss) |
| [pnpm](skills/pnpm) | pnpm 包管理器 | [pnpm/pnpm.io](https://github.com/pnpm/pnpm.io) |

### 同步的技能

| 技能 | 描述 | 来源 |
|------|------|------|
| [slidev](skills/slidev) | Slidev 演示文稿 | [slidevjs/slidev](https://github.com/slidevjs/slidev) |
| [tsdown](skills/tsdown) | tsdown 打包工具 | [rolldown/tsdown](https://github.com/rolldown/tsdown) |
| [turborepo](skills/turborepo) | Turborepo 单体仓库 | [vercel/turborepo](https://github.com/vercel/turborepo) |
| [vueuse-functions](skills/vueuse-functions) | VueUse 工具函数 | [vueuse/skills](https://github.com/vueuse/skills) |
| [vue-best-practices](skills/vue-best-practices) | Vue 3 最佳实践 | [vuejs-ai/skills](https://github.com/vuejs-ai/skills) |
| [vue-router-best-practices](skills/vue-router-best-practices) | Vue Router 最佳实践 | [vuejs-ai/skills](https://github.com/vuejs-ai/skills) |
| [vue-testing-best-practices](skills/vue-testing-best-practices) | Vue 测试最佳实践 | [vuejs-ai/skills](https://github.com/vuejs-ai/skills) |
| [web-design-guidelines](skills/web-design-guidelines) | 网页设计指南 | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |

## 自定义技能集合

1. Fork 本仓库
2. 安装依赖：`pnpm install`
3. 在 `meta.ts` 中配置你的项目
4. 运行 `pnpm start cleanup` 然后 `pnpm start init`
5. 运行 `pnpm start sync` 同步第三方技能

详见 [AGENTS.md](AGENTS.md)。

## 许可证

[MIT](LICENSE.md) 授权。