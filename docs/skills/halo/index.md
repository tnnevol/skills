---
title: 博客管理
description: 通过脚本安全管理博客文章、标签、分类和独立页面。
---

# 技能：博客管理

Halo（[halo.run](https://halo.run)）是一款基于 Spring Boot 构建的开源网站管理工具。
使用本技能可以通过 Halo 接口管理文章、标签、分类和独立页面。

## 官方 API 站点

- [Halo API 参考](https://docs.halo.run/category/api-%E5%8F%82%E8%80%83)：官方 API 参考入口，包含服务端 API、界面 API 和 API 变更日志。

## 安全规范

1. **Never expose** the `HALO_PAT` (Personal Access Token) value in chat, files, code, or logs.
2. **All API calls** must go through `node scripts/halo.mjs` in this skill directory.
3. **Never read** `.env` files or echo credential values in conversation output.
4. 接口响应中的敏感值会自动清理。

## 使用方法

```
/halo list                          →  node scripts/halo.mjs list
/halo get my-post                   →  node scripts/halo.mjs get my-post
/halo create --title=标题 --content=内容  →  node scripts/halo.mjs create --title=标题 --content=内容
/halo list-tags                     →  node scripts/halo.mjs list-tags
/halo list-singlepages              →  node scripts/halo.mjs list-singlepages
```

## 脚本说明

- `scripts/halo.mjs` — 命令行入口
- `scripts/lib/post-actions.mjs` — 文章业务逻辑（查询/获取/创建/更新/删除/发布/取消发布）
- `scripts/lib/tag-actions.mjs` — 标签业务逻辑（查询/创建/获取/更新/删除）
- `scripts/lib/category-actions.mjs` — 分类业务逻辑（查询/创建/获取/更新/删除）
- `scripts/lib/singlepage-actions.mjs` — 独立页面业务逻辑（查询/创建/获取/更新/删除/发布/取消发布）
- `scripts/lib/client.mjs` — 网络客户端（扩展接口与控制台接口）
- `scripts/lib/config.mjs` — 加载环境变量
- `scripts/lib/utils.mjs` — 工具函数（生成别名、格式化时间、构建链接）

## 核心参考

| 主题                | 描述                    | 参考文档                                               |
| ------------------- | ----------------------- | ------------------------------------------------------ |
| 文章操作            | 文章操作指南及注意事项  | [文章操作文档](references/posts-actions.md)             |
| 文章接口            | 文章接口参考及快照机制  | [文章接口文档](references/posts-api.md)                 |
| 标签操作            | 标签操作指南及注意事项  | [标签操作文档](references/tags-actions.md)              |
| 标签接口            | 标签接口参考            | [标签接口文档](references/tags-api.md)                 |
| 分类操作            | 分类操作指南及注意事项  | [分类操作文档](references/categories-actions.md)        |
| 分类接口            | 分类接口参考            | [分类接口文档](references/categories-api.md)            |
| 单页操作            | 单页操作指南及注意事项  | [单页操作文档](references/singlepage-actions.md)        |
| 单页接口            | 单页接口参考及快照机制  | [单页接口文档](references/singlepage-api.md)            |
| 环境配置            | 环境配置说明            | [环境配置文档](references/setup.md)                    |

## 常见说明

- **错误处理** — 401 → 认证失败，403 → 无权限，404 → 资源不存在，409 → 版本冲突并自动重试
- **乐观锁** — 更新操作需要 `metadata.version`，脚本会自动获取最新版本，并在 409 冲突时重试
- **metadata.name 规则** — 长度不超过 253 个字符，只能使用小写字母、数字和连字符；自动生成 `{slug}-{timestamp}`
- **别名自动生成** — 中文字符会保留在别名中（Halo 支持 Unicode），特殊字符会替换为连字符。
- **搜索提示** — 在线搜索 Halo 文档时使用 `site:docs.halo.run`，避免混入游戏相关内容。

## 环境变量

```
HALO_BASE_URL=https://your-halo-instance.com
HALO_PAT=pat_your-personal-access-token
```

Loaded with priority: process env > skill `.env` > project root `.env`. See [setup](references/setup.md) for details.
