# @tnnevol/halo-cli

Halo CMS 博客管理命令行工具。使用 Rust 编写，零运行时依赖。

## 特性

- 列出、查看、创建、更新、删除博客文章
- 发布/取消发布文章
- Markdown 转 HTML（CommonMark，基于 pulldown-cmark）
- 支持 `.env` 文件和环境变量配置
- 跨平台：Linux、macOS（Intel + ARM）、Windows
- 零运行时依赖（纯原生二进制）

## 安装

### 全局安装

```bash
npm install -g @tnnevol/halo-cli
# 或
pnpm add -g @tnnevol/halo-cli

halo-cli list
```

### 临时使用（无需安装）

```bash
npx -y @tnnevol/halo-cli list
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

### 列出文章

```bash
halo-cli list                         # 列出文章（默认第1页，每页20条）
halo-cli list --page=2                # 查看第2页
halo-cli list --limit=10              # 每页10条
halo-cli list --keyword=关键词         # 关键词搜索
```

### 查看文章

```bash
halo-cli get <name>                   # 根据文章名称获取详情
```

### 创建文章

```bash
halo-cli create --title=标题 --raw=内容        # 创建文章（Markdown 自动转 HTML）
halo-cli create --title=标题 --raw=内容 --publish  # 创建并发布
halo-cli create --title=标题 --raw=内容 --public   # 创建为公开文章（默认为私有）
halo-cli create --title=标题 --slug=自定义路径    # 自定义 URL slug
```

### 更新文章

```bash
halo-cli update <name> --title=新标题           # 更新标题
halo-cli update <name> --raw=新内容             # 更新内容（Markdown 自动转 HTML）
halo-cli update <name> --content=新内容          # 更新内容（直接传 HTML）
halo-cli update <name> --slug=新路径             # 更新 URL slug
halo-cli update <name> --visible=PUBLIC          # 更新可见性
halo-cli update <name> --cover=https://...       # 更新封面图
halo-cli update <name> --pinned=true             # 设置置顶
```

### 发布/取消发布

```bash
halo-cli publish <name>                 # 发布文章
halo-cli unpublish <name>               # 取消发布
```

### 删除文章

```bash
halo-cli delete <name>                  # 删除文章
```

### 其他

```bash
halo-cli version                        # 查看版本号
halo-cli --help                         # 查看帮助
```

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
