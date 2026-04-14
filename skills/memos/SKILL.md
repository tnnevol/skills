---
name: memos
description: Assistant for Memos (https://github.com/usememos/memos), an open-source self-hosted memo/note tool. Use when the user asks about Memos, creating/listing/updating/deleting memos, managing tags, or securely interacting with a Memos instance via API.
---

# SKILL: memos

Memos ([usememos](https://github.com/usememos/memos)) is an open-source, self-hosted memo/note tool.
It lets users quickly capture thoughts, ideas, and notes with a lightweight, Twitter-like interface,
supporting tags, visibility controls, and Markdown formatting.

## Security Guidelines

This skill follows these security guidelines to protect credentials:

1. **Never expose** the `MEMOS_ACCESS_TOKEN` value in chat, files, code, or logs.
2. **All API calls** must go through `scripts/api.cjs` — never use `curl`, `wget`, `fetch`, or other HTTP clients directly.
3. **Never read** `.env` files or environment variables containing credentials in conversation output.
4. **Sensitive values** in API responses are automatically sanitized via `scripts/sanitize.cjs`.
5. **Do not modify** the security scripts to disable masking or redirect output.

## How to Execute

1. **First invocation only** — read `${CLAUDE_SKILL_DIR}/docs/setup.md` for configuration, auth headers, and runtime detection.
2. Match the action from the table below.
3. Read the corresponding doc file for detailed steps.
4. If no arguments or unrecognized action, show the help table below.
5. If the user asks about Memos (what it is, how to use a command, or any API usage question) — read `${CLAUDE_SKILL_DIR}/docs/help.md` and follow the instructions there.

## Actions

| Action | Description | Details |
| -------- | ------------- | --------- |
| `list` | 列出笔记（支持过滤） | `docs/actions-memo.md` |
| `create` | 创建笔记 | `docs/actions-memo.md` |
| `get` | 获取单条笔记 | `docs/actions-memo.md` |
| `update` | 更新笔记 | `docs/actions-memo.md` |
| `delete` | 删除笔记 | `docs/actions-memo.md` |
| `pin` | 切换置顶/取消置顶 | `docs/actions-memo.md` |
| `tags` | 列出所有标签 | `docs/actions-tag.md` |
| `comments` | 查看/添加评论 | `docs/actions-comment.md` |
| `whoami` | 显示当前用户信息 | `docs/actions-user.md` |
| `user-stats` | 显示用户统计 | `docs/actions-user.md` |
| `share` | 创建/撤销/列出分享链接 | `docs/actions-share.md` |
| `attachments` | 列出笔记附件 | `docs/actions-attachment.md` |
| `help` | 回答 Memos 相关问题 | `docs/help.md` |

### `help` (or no arguments) — Show available actions

| Action | Usage | Description |
| -------- | ------- | ------------- |
| `list` | `/memos list [--limit=N] [--tag=xxx] [--state=NORMAL|ARCHIVED] [--order=xxx] [--filter=xxx] [--show-deleted]` | 列出笔记（默认 10 条） |
| `create` | `/memos create "内容" [--visibility=PUBLIC\|PRIVATE\|PROTECTED]` | 创建笔记 |
| `get` | `/memos get <memo_id>` | 获取单条笔记详情 |
| `update` | `/memos update <memo_id> "新内容"` | 更新笔记内容 |
| `delete` | `/memos delete <memo_id>` | 删除笔记 |
| `pin` | `/memos pin <memo_id>` | 切换置顶/取消置顶 |
| `tags` | `/memos tags` | 列出所有标签 |
| `comments` | `/memos comments <memo_id> ["评论内容"]` | 查看/添加评论 |
| `whoami` | `/memos whoami` | 显示当前用户信息 |
| `user-stats` | `/memos user-stats` | 显示用户统计 |
| `share` | `/memos share <memo_id> [--list] [--revoke=ID]` | 创建/撤销分享链接 |
| `attachments` | `/memos attachments <memo_id>` | 列出笔记附件 |
| `help` | `/memos help <问题>` | 回答 Memos 相关问题 |
