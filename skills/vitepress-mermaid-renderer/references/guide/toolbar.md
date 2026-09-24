---
sidebarDepth: 2
---

# 工具栏自定义

内置工具栏会在支持拖拽的图表表面周围提供缩放、重置、全屏、下载和复制控件。

## Desktop、mobile 和 fullscreen

```typescript
mermaidRenderer.setToolbar({
  showLanguageLabel: true,
  downloadFormat: 'svg',
  fullscreenMode: 'browser',
  desktop: {
    zoomIn: 'enabled',
    zoomOut: 'enabled',
    resetView: 'enabled',
    toggleToolbar: 'enabled',
    collapsed: 'expanded',
    download: 'enabled',
    positions: { vertical: 'top', horizontal: 'right' },
  },
  mobile: {
    zoomIn: 'disabled',
    zoomOut: 'disabled',
    resetView: 'enabled',
    copyCode: 'enabled',
    toggleToolbar: 'enabled',
    collapsed: 'collapsed',
    positions: { vertical: 'bottom', horizontal: 'left' },
  },
  fullscreen: {
    zoomLevel: 'enabled',
    toggleFullscreen: 'enabled',
  },
});
```

- `fullscreenMode` 控制全屏体验：`browser` 使用原生 Fullscreen API，`dialog`
  打开页面内 modal overlay。
- **Desktop** 可以展示全部控件，因为鼠标和键盘交互空间更充足。
- **Mobile** 通常隐藏缩放按钮，保留重置和复制操作。
- **Fullscreen** 可以单独管理缩放比例显示和焦点友好的控件。

## 折叠工具栏

`toggleToolbar`
按钮默认处于禁用状态，因此现有布局的外观不会改变。按显示模式启用它后，读者可以折叠其他工具栏控件：

```typescript
mermaidRenderer.setToolbar({
  desktop: {
    toggleToolbar: 'enabled',
    collapsed: 'expanded', // 'expanded'（默认）| 'collapsed'
  },
  mobile: {
    toggleToolbar: 'enabled',
    collapsed: 'collapsed',
  },
});
```

折叠状态在每个图表实例内独立保存，不会在页面刷新或导航时持久化。当模式设置为
`collapsed`
时，初始只显示折叠按钮；如果禁用了折叠按钮，工具栏会保持展开，以确保其他控件仍然可用。

## 定位工具栏

`positions` 支持 `vertical: top|bottom` 和
`horizontal: left|right`。你可以把控件放到不会遮挡关键图表内容的角落。

## 可访问性建议

- 如果希望保留图表旁边原始的 VitePress `mermaid` 可见标签，请保持
  `showLanguageLabel` 开启。图表包装器自身的 `role="img"` 和 `aria-label`
  与此设置无关。
- 每个图表包装器具有 `role="img"` 和 `aria-label`，屏幕阅读器会播报图表用途。
- 图表获得焦点时（`tabindex="0"`），键盘用户可以缩放（`+`/`-`）、重置（`0`）、平移（方向键）和切换全屏（`f`）。
- 视觉隐藏的状态播报器会朗读"正在加载图表…"和"图表已加载"状态。
- 启用后，折叠按钮会提供 `aria-expanded` 和
  `aria-controls`，辅助技术可以播报工具栏状态。
- 错误容器使用 `role="alert"`，屏幕阅读器会立即播报渲染失败。
- `prefers-reduced-motion`
  设置会被自动遵守；对请求减少动画的用户，所有动画和过渡效果将被禁用。
- 每个断点都保留 `resetView`，可以在缩放或拖拽后提供可靠的恢复路径。
- 移动端不要堆叠过多按钮；使用 `positions` 将控件移离图表密集区域。

完整类型见[配置类型](./types.md)。
