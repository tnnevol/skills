---
name: nuxt
description: 全栈 Vue 框架，支持 SSR、自动导入和基于文件的路由。在使用 Nuxt 应用、服务器路由、useFetch、中间件或混合渲染时使用。
metadata:
  author: Anthony Fu
  version: "2026.1.28"
  source: 从 https://github.com/nuxt/nuxt 生成，脚本位于 https://github.com/antfu/skills
---

Nuxt 是一个全栈 Vue 框架，提供服务器端渲染、基于文件的路由、自动导入和强大的模块系统。它使用 Nitro 作为其服务器引擎，可在 Node.js、无服务器和边缘平台上进行通用部署。

> 该技能基于 Nuxt 3.x，生成于 2026-01-28。

## 核心

| 主题 | 描述 | 参考 |
|-------|-------------|-----------|
| 目录结构 | 项目文件夹结构、约定、文件组织 | [core-directory-structure](references/core-directory-structure.md) |
| 配置 | nuxt.config.ts、app.config.ts、运行时配置、环境变量 | [core-config](references/core-config.md) |
| CLI 命令 | 开发服务器、构建、生成、预览和实用命令 | [core-cli](references/core-cli.md) |
| 路由 | 基于文件的路由、动态路由、导航、中间件、布局 | [core-routing](references/core-routing.md) |
| 数据获取 | useFetch、useAsyncData、$fetch、缓存、刷新 | [core-data-fetching](references/core-data-fetching.md) |
| 模块 | 创建和使用 Nuxt 模块、Nuxt Kit 工具 | [core-modules](references/core-modules.md) |
| 部署 | 基于 Nitro 的平台无关部署，支持 Vercel、Netlify、Cloudflare | [core-deployment](references/core-deployment.md) |

## 特性

| 主题 | 描述 | 参考 |
|-------|-------------|-----------|
| 组合式函数自动导入 | Vue API、Nuxt 组合式函数、自定义组合式函数、工具 | [features-composables](references/features-composables.md) |
| 组件自动导入 | 组件命名、懒加载、水合策略 | [features-components-autoimport](references/features-components-autoimport.md) |
| 内置组件 | NuxtLink、NuxtPage、NuxtLayout、ClientOnly 等 | [features-components](references/features-components.md) |
| 状态管理 | useState 组合式函数、SSR 友好状态、Pinia 集成 | [features-state](references/features-state.md) |
| 服务器路由 | API 路由、服务器中间件、Nitro 服务器引擎 | [features-server](references/features-server.md) |

## 渲染

| 主题 | 描述 | 参考 |
|-------|-------------|-----------|
| 渲染模式 | 通用（SSR）、客户端（SPA）、混合渲染、路由规则 | [rendering-modes](references/rendering-modes.md) |

## 最佳实践

| 主题 | 描述 | 参考 |
|-------|-------------|-----------|
| 数据获取模式 | 高效获取、缓存、并行请求、错误处理 | [best-practices-data-fetching](references/best-practices-data-fetching.md) |
| SSR 和水合 | 避免上下文泄漏、水合不匹配、组合式函数模式 | [best-practices-ssr](references/best-practices-ssr.md) |

## 高级

| 主题 | 描述 | 参考 |
|-------|-------------|-----------|
| 层 | 使用可重用层扩展应用程序 | [advanced-layers](references/advanced-layers.md) |
| 生命周期钩子 | 构建时、运行时和服务器钩子 | [advanced-hooks](references/advanced-hooks.md) |
| 模块创作 | 使用 Nuxt Kit 创建可发布的 Nuxt 模块 | [advanced-module-authoring](references/advanced-module-authoring.md) |