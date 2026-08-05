---
title: 笔记管理
name: memos
description: >-
  通过脚本安全操作自建时间线式笔记服务。用户需要创建、查询、更新或删除笔记，管理标签、评论、表情、关联、附件或分享时使用。即使用户只说“查看我的笔记”“添加评论”“置顶笔记”“显示标签”或“记录想法”，也应使用本技能。所有接口调用均通过安全脚本完成，脚本会自动处理认证并清理凭据。该服务采用时间线组织，而不是文件夹笔记本，应使用标签整理笔记。
compatibility:
  runtime: node >= 18 (or bun, deno)
  dependencies: none (zero-dependency, uses native fetch)
  environment: MEMOS_BASE_URL, MEMOS_ACCESS_TOKEN
---

# 技能：笔记管理

Memos（[usememos](https://usememos.com/)）是一款自托管的**时间线式笔记工具**，不是基于文件夹的笔记本。它遵循“先记录，后整理”的方式：使用 Markdown 快速记录，再通过标签整理，并将笔记保存在自己的服务器上。

本技能为代理提供安全、零依赖的命令行接口，通过服务接口操作 Memos。所有操作均通过 `scripts/api.cjs` 完成，该脚本会自动处理认证、错误和凭据清理。

## 安全规范

`MEMOS_ACCESS_TOKEN` 属于敏感信息。脚本会自动清理输出中的令牌，避免它意外出现在聊天记录、文件或代码中。

所有接口调用均通过 `scripts/api.cjs` 完成，以确保错误处理和凭据清理保持一致，并避免直接使用 `curl` 或 `wget` 等网络客户端时意外暴露令牌。

环境文件（`.env`）和包含凭据的变量只能由脚本读取，不得展示在对话输出中。

接口响应中的敏感值会通过 `scripts/sanitize.cjs` 自动清理。

安全脚本必须保持原样使用。修改脚本以关闭遮蔽或重定向输出，可能导致敏感数据泄露。

## 使用方法

1. **First invocation only** — read `${CLAUDE_SKILL_DIR}/references/setup.md` for configuration, auth headers, and runtime detection.
2. 根据下方表格匹配操作。
3. 阅读对应文档，按详细步骤执行。
4. 没有参数或无法识别操作时，显示下方帮助表格。
5. 用户询问笔记服务、命令用法或接口用法时，阅读 `${CLAUDE_SKILL_DIR}/references/help.md` 并遵循其中说明。

## 操作列表

| 操作 | 描述 | 详细说明 |
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
