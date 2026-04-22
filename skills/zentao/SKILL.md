---
name: zentao
description: Assistant for ZenTao (禅道项目管理软件 v2 RESTful API). Use when the user asks about ZenTao, managing projects, tasks, bugs, stories, products, users, or securely interacting with a ZenTao instance via API.
---

# SKILL: zentao

禅道 (ZenTao) 是一款开源项目管理软件，提供 RESTful v2 API 覆盖产品、项目、任务、Bug、需求、测试等模块。

## Security Guidelines

1. **Never expose** `CHANDAO_ACCOUNT` or `CHANDAO_PASSWORD` values in chat, files, code, or logs.
2. **All API calls** must go through `scripts/api.cjs` — never use `curl`, `wget`, `fetch`, or other HTTP clients directly.
3. **Never read** `.env` files or environment variables containing credentials in conversation output.
4. **Sensitive values** in API responses are automatically sanitized via `scripts/sanitize.cjs`.
5. Token 由系统自动管理，用户无需手动登录。

## How to Execute

1. **First invocation** — read `docs/setup.md` for configuration and runtime detection.
2. Match the action from the table below.
3. Read the corresponding doc file for detailed steps.
4. If no arguments or unrecognized action, show the help table below.
5. If the user asks about ZenTao — read `docs/help.md` and follow the instructions there.

## Actions (P0 — 查询类)

| Action | Description | Details |
|--------|-------------|---------|
| `users` | 列出用户 | `docs/actions-user.md` |
| `user` | 获取用户详情 | `docs/actions-user.md` |
| `products` | 列出产品 | `docs/actions-product.md` |
| `product` | 获取产品详情 | `docs/actions-product.md` |
| `projects` | 列出项目 | `docs/actions-project.md` |
| `project` | 获取项目详情 | `docs/actions-project.md` |

### CLI 用法

```bash
# 列出（支持 --limit=N --page=N）
node scripts/api.cjs get /users --limit=20
node scripts/api.cjs get /products --limit=50
node scripts/api.cjs get /projects --page=2

# 获取详情
node scripts/api.cjs get /users/1
node scripts/api.cjs get /products/5
node scripts/api.cjs get /projects/3
```

### `help` (or no arguments) — Show available actions

| Action | Usage | Description |
|--------|-------|-------------|
| `users` | `/zentao users [--limit=N] [--page=N]` | 列出用户（默认 20 条） |
| `user` | `/zentao user <id>` | 获取用户详情 |
| `products` | `/zentao products [--limit=N] [--page=N]` | 列出产品 |
| `product` | `/zentao product <id>` | 获取产品详情 |
| `projects` | `/zentao projects [--limit=N] [--page=N] [--status=doing]` | 列出项目 |
| `project` | `/zentao project <id>` | 获取项目详情 |
| `help` | `/zentao help <问题>` | 回答 ZenTao 相关问题 |

## P0+ 阶段（后续）

| Action | Usage | Description |
|--------|-------|-------------|
| `create-bug` | `/zentao create-bug --product=ID --title=xxx` | 创建缺陷 |
| `create-task` | `/zentao create-task --execution=ID --name=xxx` | 创建任务 |
| `create-story` | `/zentao create-story --product=ID --title=xxx` | 创建需求 |
| `resolve-bug` | `/zentao resolve-bug <id> --resolution=fixed` | 解决缺陷 |
| `finish-task` | `/zentao finish-task <id>` | 完成任务 |
| `bugs` | `/zentao bugs [--product=ID] [--status=unresolved]` | 列出缺陷 |
| `tasks` | `/zentao tasks [--execution=ID] [--assignedTo=user]` | 列出任务 |
| `stories` | `/zentao stories [--product=ID] [--status=open]` | 列出需求 |
