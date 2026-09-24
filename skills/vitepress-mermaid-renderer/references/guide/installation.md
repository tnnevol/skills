---
sidebarDepth: 2
---

# 安装与设置

本章会安装 `vitepress-mermaid-renderer`，将它接入 `.vitepress` 主题，并确认 Mermaid 图表可以使用交互式工具栏控件。

## 选择包管理器

可以使用项目现有的包管理器：

```bash [bun]
bun add vitepress-mermaid-renderer
```

```bash [npm]
npm install vitepress-mermaid-renderer
```

```bash [yarn]
yarn add vitepress-mermaid-renderer
```

```bash [pnpm]
pnpm add vitepress-mermaid-renderer
```

Mermaid 和 Vue 是 peer dependencies，VitePress 项目需要提供兼容版本。源文档示例使用 Mermaid `^11.16.1`、由 VitePress 提供的 Vue，以及 VitePress `^1.6.4`；接入其他版本时应以当前项目锁文件和类型定义为准。

## 在 `.vitepress/theme` 中接入 renderer

创建或编辑 `.vitepress/theme/index.ts`，在客户端 `Layout` 中初始化 renderer：

```typescript
import { h, nextTick, watch } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { useData } from 'vitepress';
import { createMermaidRenderer } from 'vitepress-mermaid-renderer';

export default {
  extends: DefaultTheme,
  Layout: () => {
    const { isDark } = useData();

    const initMermaid = () => {
      const mermaidRenderer = createMermaidRenderer({
        theme: isDark.value ? 'dark' : 'forest',
      });

      mermaidRenderer.setToolbar({
        showLanguageLabel: false,
        downloadFormat: 'svg',
        fullscreenMode: 'browser',
        desktop: {
          copyCode: 'enabled',
          toggleFullscreen: 'enabled',
          resetView: 'enabled',
          zoomOut: 'enabled',
          zoomIn: 'enabled',
          zoomLevel: 'enabled',
          download: 'enabled',
        },
      });
    };

    nextTick(() => initMermaid());

    watch(
      () => isDark.value,
      () => initMermaid(),
    );

    return h(DefaultTheme.Layout);
  },
} satisfies Theme;
```

renderer 在服务端渲染期间保持空操作。浏览器完成 hydration 后，它会接管标记为 `mermaid` 的代码块。

## 基础检查

- Mermaid 代码块必须使用 `mermaid` 语言标签。
- renderer 初始化应放在客户端 VitePress theme 中，而不是 server-only 配置文件中。
- 明暗主题切换时重新调用 renderer，使已挂载图表使用新的 Mermaid 主题。
