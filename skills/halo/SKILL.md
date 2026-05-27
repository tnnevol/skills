---
name: halo
description: >
  Assistant for Halo CMS (https://www.halo.run/). Use when the user types /halo commands or asks about Halo blog posts management. Triggers: /halo help, /halo list, /halo create, /halo get, /halo update, /halo delete, /halo publish, managing Halo blog posts, creating articles in Halo.
---

# SKILL: halo

Halo ([halo.run](https://halo.run)) is a powerful open-source website building tool built with Spring Boot.
Use this skill to manage blog posts via the Halo RESTful API — list, view, create, update, delete, and publish articles.

## Security Guidelines

1. **Never expose** the `HALO_PAT` (Personal Access Token) value in chat, files, code, or logs.
2. **All API calls** must go through `node scripts/halo.mjs` in this skill directory.
3. **Never read** `.env` files or echo credential values in conversation output.
4. Sensitive values in API responses are automatically sanitized.

## How to Execute

When the user types `/halo <action>`, execute via Node.js script:

```
/halo list                          →  node scripts/halo.mjs list
/halo get my-post                   →  node scripts/halo.mjs get my-post
/halo create --title=标题 --content=内容  →  node scripts/halo.mjs create --title=标题 --content=内容
```

All API calls go through the JS scripts in `scripts/` directory:
- `scripts/halo.mjs` — CLI entry point
- `scripts/lib/client.mjs` — HTTP client (Extension API + Console API)
- `scripts/lib/config.mjs` — environment variable loading
- `scripts/lib/actions.mjs` — business logic (list/get/create/update/delete/publish/unpublish)
- `scripts/lib/utils.mjs` — utilities (slugify, time formatting, link building)

## Actions

| Action | 用法 | 说明 |
|--------|------|------|
| `help` | `/halo help` | 显示帮助信息 |
| `list` | `/halo list [--limit=N] [--page=N] [--keyword=xxx]` | 列出文章 |
| `get` | `/halo get <name>` | 获取文章详情 |
| `create` | `/halo create --title=标题 --content=内容 [--slug=xxx] [--publish] [--public]` | 创建文章（默认 PRIVATE，HTML 格式） |
| `update` | `/halo update <name> [--title=xxx] [--content=xxx] [--content-file=xxx]` | 更新文章 |
| `delete` | `/halo delete <name>` | 删除文章 |
| `publish` | `/halo publish <name>` | 发布文章 |
| `unpublish` | `/halo unpublish <name>` | 取消发布 |

### Parameter Details

- `--content`: HTML content, sent directly to Halo API without conversion
- `--content-file`: local HTML file path, content is read and sent as `--content`
- `--publish`: Publish the article immediately after creation
- `--public`: Set visibility to PUBLIC (default is PRIVATE)

### Agent 意图

- **文章内容必须使用 HTML**：Agent 在创建或更新文章时，`--content` 参数**必须输出 HTML 内容**，禁止使用 Markdown。示例：`<h2>标题</h2><p>正文</p><ul><li>列表项</li></ul>`
- **禁止 Markdown 语法**：不得使用 `# 标题`、`**粗体**`、`- 列表项` 等 Markdown 语法。应使用 `<h2>标题</h2>`、`<strong>粗体</strong>`、`<ul><li>列表项</li></ul>` 等 HTML 标签

## ⚠️ Important Notes

1. **Console API vs Extension API** — create/publish/unpublish use **Console API** which triggers snapshot creation. list/get/update/delete use **Extension API**.
2. **Request Body Format** — Console API create requires **nested format** (`{ post: {...}, content: { raw, rawType } }`). Extension API update uses flat Post object.
3. **Optimistic Locking** — Updates require `metadata.version`. The script auto-fetches the latest version and retries on 409 conflict.
4. **metadata.name Rules** — ≤253 characters, only lowercase letters, digits, and hyphens. The `create` action auto-generates a name as `{slug}-{timestamp}`.
5. **Search Tip** — When searching Halo documentation online, use `site:docs.halo.run` to avoid game-related content pollution.
6. **Visibility** — Default is `PRIVATE`. Use `--public` to set to PUBLIC.
7. **Slug Auto-generation** — CJK characters are preserved in slugs (Halo supports Unicode). Special characters are replaced with hyphens.
8. **Error Handling** — The script provides localized error messages: 401 → 认证失败, 403 → 无权限, 404 → 资源不存在, 409 → 版本冲突已重试.

## Environment Variables

```
HALO_BASE_URL=https://your-halo-instance.com
HALO_PAT=pat_your-personal-access-token
```

These are loaded with priority order: process environment variables > skill directory `.env` > project root `.env`. See `references/setup.md` for details.
