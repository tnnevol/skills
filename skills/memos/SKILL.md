---
name: memos
description: >-
  Secure, script-based interface for Memos — a self-hosted timeline for quick notes, daily logs, and snippets. Use this skill whenever the user wants to interact with Memos: creating, listing, updating, or deleting notes; managing tags, comments, reactions, or relations; uploading attachments; or managing shares. Even if the user just says "check my notes", "add a comment", "pin that", "show my tags", "what did I write about X", or "capture this thought", use this skill. All API calls go through secure scripts that handle authentication and sanitize credentials automatically. Memos works as a timeline (not a folder-based notebook) — use tags to organize notes instead of directories.
compatibility:
  runtime: node >= 18 (or bun, deno)
  dependencies: none (zero-dependency, uses native fetch)
  environment: MEMOS_BASE_URL, MEMOS_ACCESS_TOKEN
---

# SKILL: memos

Memos ([usememos](https://usememos.com/)) is a self-hosted **timeline-based note tool** — not a folder-based notebook. It follows "Capture first, organize later" — write quickly in Markdown, use tags for organization, and keep notes on your own server.

This skill provides a secure, zero-dependency CLI interface for agents to interact with Memos via its API. All operations go through `scripts/api.cjs`, which handles authentication, error handling, and credential sanitization automatically.

## Security Guidelines

The `MEMOS_ACCESS_TOKEN` is sensitive. Scripts automatically sanitize it in output to prevent accidental exposure in chat logs, files, and code.

All API calls go through `scripts/api.cjs`. This ensures consistent error handling, credential sanitization, and avoids accidental token exposure that could occur when using direct HTTP clients like `curl` or `wget`.

Environment files (`.env`) and variables containing credentials are read only by the scripts and are not surfaced in conversation output.

Sensitive values in API responses are automatically sanitized via `scripts/sanitize.cjs`.

The security scripts should be used as-is. Modifying them to disable masking or redirect output could expose sensitive data.

## How to Execute

1. **First invocation only** — read `${CLAUDE_SKILL_DIR}/references/setup.md` for configuration, auth headers, and runtime detection.
2. Match the action from the table below.
3. Read the corresponding doc file for detailed steps.
4. If no arguments or unrecognized action, show the help table below.
5. If the user asks about Memos (what it is, how to use a command, or any API usage question) — read `${CLAUDE_SKILL_DIR}/references/help.md` and follow the instructions there.

## Actions

| Action | Description | Details |
| -------- | ------------- | --------- |
| `list` | 列出笔记（支持过滤） | `references/actions-memo.md` |
| `create` | 创建笔记 | `references/actions-memo.md` |
| `get` | 获取单条笔记 | `references/actions-memo.md` |
| `update` | 更新笔记 | `references/actions-memo.md` |
| `delete` | 删除笔记 | `references/actions-memo.md` |
| `pin` | 切换置顶/取消置顶 | `references/actions-memo.md` |
| `tags` | 列出所有标签 | `references/actions-tag.md` |
| `comments` | 查看/添加/删除/更新评论 | `references/actions-comment.md` |
| `whoami` | 显示当前用户信息 | `references/actions-user.md` |
| `user-stats` | 显示用户统计 | `references/actions-user.md` |
| `share` | 创建/撤销/列出分享链接 | `references/actions-share.md` |
| `attachments` | 列出笔记附件 | `references/actions-attachment.md` |
| `upload-attachment` | 上传附件（支持关联笔记） | `references/actions-attachment.md` |
| `delete-attachment` | 删除附件 | `references/actions-attachment.md` |
| `batch-delete-attachment` | 批量删除附件 | `references/actions-attachment.md` |
| `reactions` | 查看表情回应 | `references/actions-reaction.md` |
| `react` | 添加/切换表情 | `references/actions-reaction.md` |
| `unreact` | 取消表情 | `references/actions-reaction.md` |
| `relations` | 查看关联笔记 | `references/actions-relation.md` |
| `relate` | 建立笔记关系 | `references/actions-relation.md` |
| `unrelate` | 解除笔记关系 | `references/actions-relation.md` |
| `help` | 回答 Memos 相关问题 | `references/help.md` |

<!-- 修复完成时间：2026-04-29 -->
