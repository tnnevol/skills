---
name: halo
description: >
  Assistant for Halo CMS (https://www.halo.run/). Use when the user types /halo commands or asks about Halo blog posts management, tags, categories, singlepages. Triggers: /halo help, /halo list, /halo create, /halo get, /halo update, /halo delete, /halo publish, /halo list-tags, /halo create-tag, /halo get-tag, /halo update-tag, /halo delete-tag, /halo list-categories, /halo create-category, /halo get-category, /halo update-category, /halo delete-category, /halo list-singlepages, /halo create-singlepage, /halo get-singlepage, /halo update-singlepage, /halo delete-singlepage, /halo publish-singlepage, /halo unpublish-singlepage, managing Halo blog posts, creating articles in Halo, listing tags, creating tags, updating tags, deleting tags, listing categories, creating categories, updating categories, deleting categories, listing singlepages, creating singlepages, updating singlepages, deleting singlepages.
---

# SKILL: halo

Halo ([halo.run](https://halo.run)) is a powerful open-source website building tool built with Spring Boot.
Use this skill to manage blog posts, tags, categories, and singlepages via the Halo RESTful API.

## 官方 API 站点

- [Halo API 参考](https://docs.halo.run/category/api-%E5%8F%82%E8%80%83)：官方 API 参考入口，包含服务端 API、界面 API 和 API 变更日志。

## Security Guidelines

1. **Never expose** the `HALO_PAT` (Personal Access Token) value in chat, files, code, or logs.
2. **All API calls** must go through `node scripts/halo.mjs` in this skill directory.
3. **Never read** `.env` files or echo credential values in conversation output.
4. Sensitive values in API responses are automatically sanitized.

## How to Execute

```
/halo list                          →  node scripts/halo.mjs list
/halo get my-post                   →  node scripts/halo.mjs get my-post
/halo create --title=标题 --content=内容  →  node scripts/halo.mjs create --title=标题 --content=内容
/halo list-tags                     →  node scripts/halo.mjs list-tags
/halo list-singlepages              →  node scripts/halo.mjs list-singlepages
```

## Scripts

- `scripts/halo.mjs` — CLI entry point
- `scripts/lib/post-actions.mjs` — post business logic (list/get/create/update/delete/publish/unpublish)
- `scripts/lib/tag-actions.mjs` — tag business logic (list/create/get/update/delete)
- `scripts/lib/category-actions.mjs` — category business logic (list/create/get/update/delete)
- `scripts/lib/singlepage-actions.mjs` — singlepage business logic (list/get/create/update/delete/publish/unpublish)
- `scripts/lib/client.mjs` — HTTP client (Extension API + Console API)
- `scripts/lib/config.mjs` — environment variable loading
- `scripts/lib/utils.mjs` — utilities (slugify, time formatting, link building)

## Core References

| Topic               | Description             | Reference                                              |
| ------------------- | ----------------------- | ------------------------------------------------------ |
| Posts Actions       | 文章操作指南及注意事项  | [posts-actions](references/posts-actions.md)           |
| Posts API           | 文章 API 参考及快照机制 | [posts-api](references/posts-api.md)                   |
| Tags Actions        | 标签操作指南及注意事项  | [tags-actions](references/tags-actions.md)             |
| Tags API            | 标签 API 参考           | [tags-api](references/tags-api.md)                     |
| Categories Actions  | 分类操作指南及注意事项  | [categories-actions](references/categories-actions.md) |
| Categories API      | 分类 API 参考           | [categories-api](references/categories-api.md)         |
| Singlepages Actions | 单页操作指南及注意事项  | [singlepage-actions](references/singlepage-actions.md) |
| Singlepages API     | 单页 API 参考及快照机制 | [singlepage-api](references/singlepage-api.md)         |
| Setup               | 环境配置说明            | [setup](references/setup.md)                           |

## Common Notes

- **Error Handling** — 401 → 认证失败, 403 → 无权限, 404 → 资源不存在, 409 → 版本冲突已重试
- **Optimistic Locking** — 更新操作需要 `metadata.version`，脚本自动获取最新版本并在 409 冲突时重试
- **metadata.name Rules** — ≤253 characters, only lowercase letters, digits, and hyphens. 自动生成 `{slug}-{timestamp}`
- **Slug Auto-generation** — CJK characters are preserved in slugs (Halo supports Unicode). Special characters are replaced with hyphens.
- **Search Tip** — When searching Halo documentation online, use `site:docs.halo.run` to avoid game-related content pollution.

## Environment Variables

```
HALO_BASE_URL=https://your-halo-instance.com
HALO_PAT=pat_your-personal-access-token
```

Loaded with priority: process env > skill `.env` > project root `.env`. See [setup](references/setup.md) for details.
