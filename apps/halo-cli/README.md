# @tnnevol/halo-cli

Halo CMS 博客管理命令行工具。使用 Rust 编写 🦀

## 特性

- 列出、查看、创建、更新、删除博客文章
- 发布/取消发布文章
- Markdown 转 HTML（CommonMark，基于 pulldown-cmark）
- 跨平台：Linux、macOS（Intel + ARM）、Windows
- 零运行时依赖（纯原生二进制）

## 安装

### 全局安装

```bash
pnpm add -g @tnnevol/halo-cli
halo-cli list
```

### 临时使用（无需安装）

```bash
npx -y @tnnevol/halo-cli list
```

## 配置

使用前需要配置环境变量：

```bash
export HALO_BASE_URL=https://your-halo.com
export HALO_PAT=pat_xxx
```

或在项目目录创建 `.env` 文件：

```
HALO_BASE_URL=https://your-halo.com
HALO_PAT=pat_xxx
```

## 功能与使用

```bash
halo-cli list                         # 列出文章（默认20条）
halo-cli list --limit=10              # 每页10条
halo-cli list --keyword=关键词         # 关键词搜索
halo-cli get <name>                   # 获取文章详情
halo-cli create --title=标题 --raw=内容  # 创建文章（支持 Markdown）
halo-cli create --title=标题 --raw=内容 --publish  # 创建并发布
halo-cli update <name> --title=新标题   # 更新文章标题
halo-cli update <name> --raw=新内容     # 更新文章内容
halo-cli publish <name>               # 发布文章
halo-cli unpublish <name>             # 取消发布
halo-cli delete <name>                # 删除文章
halo-cli version                      # 查看版本号
```

## 开发

### 编译

```bash
pnpm run build          # 编译所有平台
pnpm run build:linux    # 仅编译 Linux
pnpm run build:macos    # 仅编译 macOS
pnpm run build:windows  # 仅编译 Windows
pnpm run clean          # 清理编译产物
pnpm run verify         # 验证编译结果
```

### 版本管理

使用 `bumpp` 工具管理版本号：

```bash
pnpm run bump           # 交互式选择版本
pnpm run bump:patch     # 1.0.0 → 1.0.1
pnpm run bump:minor     # 1.0.0 → 1.1.0
pnpm run bump:major     # 1.0.0 → 2.0.0
```

推送 tag 后，CI/CD 自动编译四平台二进制并发布到 npm。

## 技术栈

- **Rust** — 核心 CLI
- **pulldown-cmark** — Markdown → HTML（CommonMark）
- **ureq** — HTTP 客户端（rustls TLS）
- **clap** — CLI 参数解析

## License

MIT