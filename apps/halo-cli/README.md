# @tnnevol/halo-cli

Halo CMS 博客管理命令行工具。使用 Rust 编写，零运行时依赖。

## 特性

- 支持文章的列出、查看、创建、更新、删除
- 支持发布/取消发布文章
- Markdown 转 HTML（CommonMark，基于 pulldown-cmark）
- `.env` 文件和环境变量配置
- 跨平台：Linux、macOS（Intel + ARM）、Windows
- 零运行时依赖（纯原生二进制）

## 安装

### 全局安装

```bash
npm install -g @tnnevol/halo-cli
# 或
pnpm add -g @tnnevol/halo-cli

halo-cli help
```

### 临时使用（无需安装）

```bash
npx -y @tnnevol/halo-cli help
```

## 配置

使用前需要配置 Halo 站点地址和个人访问令牌（PAT）：

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

### 帮助

```bash
halo-cli help                         # 查看所有命令
halo-cli <command> --help             # 查看命令详细用法
halo-cli version                      # 查看版本号
```

### 文章管理

```bash
halo-cli list [--page N] [--limit N] [--keyword <关键词>]   # 列出文章
halo-cli get <name>                                         # 文章详情
halo-cli create --title <标题> --raw <内容> [--publish] [--public] [--slug <路径>]
halo-cli update <name> [--title <标题>] [--raw <内容>] [--slug <路径>] [--visible PUBLIC|PRIVATE] [--cover <URL>] [--pinned true|false]
halo-cli publish <name>                                     # 发布文章
halo-cli unpublish <name>                                   # 取消发布
halo-cli delete <name>                                      # 删除文章
```

使用 `halo-cli <command> --help` 查看完整参数。

## 开发

### 编译

需要 Rust 环境（推荐通过 [rustup](https://rustup.rs) 安装）：

```bash
make build-all          # 编译所有平台
make build:linux        # 仅编译 Linux
make build:macos        # 仅编译 macOS
make build:windows      # 仅编译 Windows
make clean              # 清理编译产物
make verify             # 验证编译结果
```

### 发布

```bash
pnpm run bump           # 交互式选择版本
pnpm run bump:patch     # 1.0.0 → 1.0.1
pnpm run bump:minor     # 1.0.0 → 1.1.0
pnpm run bump:major     # 1.0.0 → 2.0.0
```

推送 tag 后，CI/CD 自动编译四平台二进制并发布到 npm。

## 技术栈

- **Rust** — 核心 CLI（edition 2024）
- **clap** — CLI 参数解析
- **pulldown-cmark** — Markdown → HTML（CommonMark）
- **ureq** — HTTP 客户端（rustls TLS，轻量级）
- **serde / serde_json** — JSON 序列化
- **dotenvy** — `.env` 文件加载

## License

MIT
