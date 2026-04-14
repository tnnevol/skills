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
| `list` | List memos with optional filters | `docs/actions-memo.md` |
| `create` | Create a new memo | `docs/actions-memo.md` |
| `get` | Get a single memo by ID | `docs/actions-memo.md` |
| `update` | Update an existing memo | `docs/actions-memo.md` |
| `delete` | Delete a memo | `docs/actions-memo.md` |
| `pin` | Pin/unpin a memo | `docs/actions-memo.md` |
| `tags` | List all tags | `docs/actions-tag.md` |
| `comments` | View/add comments on a memo | `docs/actions-comment.md` |
| `whoami` | Show current user info | `docs/actions-user.md` |
| `user-stats` | Show user statistics | `docs/actions-user.md` |
| `help` | Answer questions about Memos | `docs/help.md` |

### `help` (or no arguments) — Show available actions

| Action | Usage | Description |
| -------- | ------- | ------------- |
| `list` | `/memos list [--limit=N] [--tag=xxx]` | List memos (default limit: 10) |
| `create` | `/memos create "内容" [--visibility=PUBLIC\|PRIVATE\|PROTECTED]` | Create a new memo |
| `get` | `/memos get <memo_id>` | Get a single memo |
| `update` | `/memos update <memo_id> "新内容"` | Update a memo's content |
| `delete` | `/memos delete <memo_id>` | Delete a memo |
| `pin` | `/memos pin <memo_id>` | Toggle pin/unpin |
| `tags` | `/memos tags` | List all unique tags |
| `comments` | `/memos comments <memo_id> ["评论内容"]` | View/add comments |
| `whoami` | `/memos whoami` | Show current user info |
| `user-stats` | `/memos user-stats` | Show user statistics |
| `help` | `/memos help <question>` | Answer questions about Memos |
