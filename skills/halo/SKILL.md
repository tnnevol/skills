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
2. **All API calls** must go through `npx -y @tnnevol/halo-cli` — never use `curl`, `wget`, `fetch`, or other HTTP clients directly.
3. **Never read** `.env` files or echo credential values in conversation output.
4. Sensitive values in API responses are automatically sanitized.

## How to Execute

Match the action from the table below.
If no arguments or unrecognized action, show the help table.

### Calling Convention

When the user types `/halo <action>`, execute via npm package:

```
/halo list  →  npx -y @tnnevol/halo-cli list
/halo get my-post  →  npx -y @tnnevol/halo-cli get my-post
/halo create --title=标题 --raw=内容  →  npx -y @tnnevol/halo-cli create --title=标题 --raw=内容
```

Alternatively, install globally: `npm install -g @tnnevol/halo-cli` then use `halo-cli <action>`.

## Actions

| Action | 用法 | 说明 |
|--------|------|------|
| `help` | `/halo help` | 显示帮助信息 |
| `list` | `/halo list [--limit=N] [--page=N] [--keyword=xxx]` | 列出文章 |
| `get` | `/halo get <name>` | 获取文章详情 |
| `create` | `/halo create --title=标题 --raw=内容 [--slug=xxx] [--publish] [--public]` | 创建文章（默认 PRIVATE + HTML 格式） |
| `update` | `/halo update <name> [--title=xxx] [--raw=xxx] [--content=xxx]` | 更新文章 |
| `delete` | `/halo delete <name>` | 删除文章 |
| `publish` | `/halo publish <name>` | 发布文章 |
| `unpublish` | `/halo unpublish <name>` | 取消发布 |

### Parameter Details

- `--raw`: Accepts Markdown content, which is converted to HTML using goldmark before sending to Halo API
- `--content`: Accepts pre-rendered HTML content, sent directly to Halo API without conversion
- `--publish`: Publish the article immediately after creation
- `--public`: Set visibility to PUBLIC (default is PRIVATE)

## ⚠️ Important Notes

1. **Console API vs Extension API** — create/publish/unpublish use **Console API** which triggers snapshot creation. list/get/update/delete use **Extension API**.
2. **Request Body Format** — Console API requires **nested format**, Extension API uses flat format.
3. **Optimistic Locking** — Updates require `metadata.version`. The binary auto-fetches the latest version before updating.
4. **metadata.name Rules** — ≤253 characters, only lowercase letters, digits, and hyphens. The `create` action auto-generates a valid slug from the title if `--slug` is not provided.
5. **Search Tip** — When searching Halo documentation online, use `site:docs.halo.run` to avoid game-related content pollution.
6. **Content Format** — Fixed to `rawType: HTML` (Halo only uses HTML format). Markdown content will be converted to HTML via goldmark.
7. **Visibility** — Default is `PRIVATE`. Use `--public` to set to PUBLIC.

## Environment Variables

```
HALO_BASE_URL=https://your-halo-instance.com
HALO_PAT=pat_your-personal-access-token
```

These are loaded from `.env` in the skill directory or project root. See `docs/setup.md` for details.
