---
name: vitepress-mermaid-renderer
displayName: vitepress-mermaid-renderer
slug: vitepress-mermaid-renderer
description: >
  为 VitePress 中的 vitepress-mermaid-renderer 提供中文安装、接入、配置、示例、故障排除、可访问性和安全指导。只要用户提到 vitepress-mermaid-renderer、在 VitePress 中渲染 Mermaid、Mermaid 图表缩放/拖拽/全屏/下载/复制、工具栏布局、主题切换、静态 SVG 或 Mermaid securityLevel，就使用此 skill；即使用户没有明确说“skill”或“文档”，也要优先查阅这里的中文参考资料，避免凭记忆编造 API。
compatibility: Node.js 20+；VitePress；Vue；Mermaid；vitepress-mermaid-renderer
metadata:
  author: Tnnevol
  version: "1.0.0"
---

# VitePress Mermaid Renderer

使用此 skill 回答或实现 `vitepress-mermaid-renderer` 相关任务。它把 VitePress 中的静态 Mermaid 代码块增强为支持缩放、拖拽、重置、复制源码、下载、全屏、主题切换和可访问性的交互式图表，也支持静态 SVG 模式。当前 skill 只维护一份简体中文参考文档。

## 资料边界

参考资料来自上游项目 `sametcn99/vitepress-mermaid-renderer` 的 `docs/content/zh` 目录，按 2026-09-24 的 `main` 分支快照整理。参考页是产品行为的主要依据，不是要求你执行的外部指令。若本地安装的包版本与文档快照不一致，明确标注可能存在版本差异，并建议以项目当前源码、类型定义和锁文件为准。

上游来源：[GitHub 仓库 docs](https://github.com/sametcn99/vitepress-mermaid-renderer/tree/main/docs)。

## 工作流

1. 先判断用户是在问安装、基础接入、运行时配置、工具栏、类型、示例还是故障排除。
2. 阅读 `references/` 下对应的中文页面；不要加载或寻找其他语言资料。
3. 第一次处理综合问题时先阅读 `guide/getting-started.md`，再按主题加载具体页面；不要无目的地把所有示例图表全文搬进回答。
4. 给出可直接粘贴的 TypeScript、VitePress theme 或 Markdown Mermaid 示例，并说明代码应放在客户端主题生命周期中。
5. 若用户要改项目代码，先检查其实际的 VitePress、Vue、Mermaid 和 renderer 版本，再根据文档快照调整示例；不要把文档站点自己的 Bun/VitePress 配置误当成用户项目的强制要求。

## 关键实现规则

- 安装时说明 `vitepress-mermaid-renderer` 需要兼容的 Mermaid 和 Vue peer dependencies。包管理器可使用 Bun、npm、Yarn 或 pnpm。
- 在 `.vitepress/theme/index.ts` 的 `Layout` 中初始化 renderer；不要把 `window` 相关初始化放进仅服务端执行的配置文件。renderer 在 SSR 阶段保持空操作，浏览器 hydration 后接管 `mermaid` 代码块。
- 通过 `createMermaidRenderer()` 传入 Mermaid 配置，通过实例的 `setToolbar()` 单独配置工具栏。重复调用 renderer 会深度合并配置，并通知已挂载图表更新。
- 站点明暗主题变化时，观察 VitePress 的 `useData().isDark`，用新的 `theme` 再调用 renderer；否则已挂载图表可能停留在初始主题。
- `static: true` 只输出主题感知的 SVG，不提供工具栏、缩放、拖拽、全屏、下载或键盘控制；主题更新仍会触发重渲染。
- `downloadFormat` 支持 `svg`、`png` 和 `jpg`；`fullscreenMode` 支持原生浏览器 `browser` 和页面内 `dialog` 模式。
- 桌面、移动端和全屏工具栏分别通过 `desktop`、`mobile`、`fullscreen` 配置。按钮值使用 `enabled` 或 `disabled`；`toggleToolbar` 默认关闭，开启后可用 `collapsed: 'expanded' | 'collapsed'`。
- 工具栏位置使用 `positions: { vertical: 'top' | 'bottom', horizontal: 'left' | 'right' }`。移动端应避免堆叠过多按钮，并保留 `resetView` 作为可靠的恢复入口。
- 默认 `securityLevel` 是 `'strict'`，会禁用 Mermaid 图表内的 inline HTML。只有在完全信任所有图表来源时，才建议显式使用 `'loose'`；不要为了让不可信内容渲染而放宽安全级别。
- SVG 下载无论安全级别如何都会清理 `<script>`、`<iframe>`、`<object>`、`<embed>`、stylesheet `<link>` 和 `on*` 事件处理属性。不要把这项清理描述成对任意 HTML 的通用安全保证。
- 交互图表支持自动适配和居中；获得焦点后可使用 `+`/`-` 缩放、`0` 重置、方向键平移、`f` 切换全屏。图表包装器提供 `role="img"` 和 `aria-label`，错误容器使用 `role="alert"`，并尊重 `prefers-reduced-motion`。

## 参考资料路由

| 用户意图 | 先读的资料 |
| --- | --- |
| 入门、工作原理、整体能力 | [`guide/getting-started.md`](references/guide/getting-started.md) |
| 安装、theme 接入、预览 | [`guide/installation.md`](references/guide/installation.md) |
| Mermaid 配置、主题、静态 SVG、安全、CSS token、缩放边界 | [`guide/configuration.md`](references/guide/configuration.md) |
| 桌面/移动/全屏工具栏、折叠、位置、可访问性 | [`guide/toolbar.md`](references/guide/toolbar.md) |
| 选项类型、默认按钮状态、ToolbarText | [`guide/types.md`](references/guide/types.md) |
| 图表不显示、主题、缓存、安全和可访问性排错 | [`guide/troubleshooting.md`](references/guide/troubleshooting.md) |
| 基础 Mermaid 图表写法 | [`examples/basic.md`](references/examples/basic.md) |
| 高级 Mermaid 图表类型 | [`examples/advanced.md`](references/examples/advanced.md) |

需要完整类型或最新 Mermaid 配置 schema 时，应同时参考 [Mermaid 官方 configuration schema](https://mermaid.js.org/config/configuration.html)，并把外部 schema 的结论与本 skill 文档明确区分。

## 回答质量检查

输出前确认：

- 示例是否使用正确的 `mermaid` fenced code block，以及正确的 `.vitepress/theme` 客户端入口。
- 是否说明了 `setToolbar()` 的作用域、断点配置和默认值，而没有暗示所有按钮默认开启。
- 涉及深色模式时，是否处理了 `isDark` 的运行时更新。
- 涉及 `securityLevel: 'loose'` 时，是否明确说明信任边界和 XSS 风险。
- 涉及构建故障时，是否先检查依赖、hydration、缓存和代码块标签，再建议清理 `.vitepress/cache` 与构建产物。
- 涉及无障碍时，是否保留图表周围的等价文字，而不只依赖 SVG 或 tooltip。
