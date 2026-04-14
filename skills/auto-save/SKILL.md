---
name: auto-save
description: Assistant for quark-auto-save (https://github.com/Cp0204/quark-auto-save), an open-source auto-save service for Quark Cloud Drive. Use when the user asks about managing save tasks, configurations, or securely interacting with the auto-save service via API.
---

# SKILL: auto-save

quark-auto-save ([quark-auto-save](https://github.com/Cp0204/quark-auto-save)) is an open-source auto-save service for Quark Cloud Drive.
It automatically saves and manages cloud drive resources (e.g., shared links, folders) by converting them into persistent save tasks.

## Security Guidelines

This skill follows these security guidelines to protect the API token:

1. Do not expose the `AUTO_SAVE_TOKEN` value in chat, files, code, logs, or command arguments.
2. All API calls should go through the provided script (`scripts/api.cjs`) rather than using `curl`, `wget`, `fetch`, or other HTTP clients to call auto-save endpoints directly.
3. Environment variables (`AUTO_SAVE_BASE_URL`, `AUTO_SAVE_TOKEN`) are read via `process.env` at runtime only. Do not hardcode credentials into any file.
4. Sensitive values in logs or output are automatically sanitized by `scripts/sanitize.cjs`.
5. `.env` files must not be committed to version control.
6. Do not modify the security scripts to disable masking or redirect output.

## How to Execute

1. **First invocation only** — read `${CLAUDE_SKILL_DIR}/docs/setup.md` for configuration, auth, and runtime detection.
2. Match the action from the table below.
3. Read the corresponding doc file for detailed steps.
4. If no arguments or unrecognized action, show the help table below.
5. If the user asks about auto-save (what it is, how to use a command, or any API usage question) — read `${CLAUDE_SKILL_DIR}/docs/help.md` and follow the instructions there.

## Actions

| Action | Description | Details |
| -------- | ------------- | --------- |
| `add-task` | Add a new save task | `docs/actions-tasks.md` |
| `config` | Get the overall configuration | `docs/actions-config.md` |
| `update-config` | Update the overall configuration | `docs/actions-config.md` |
| `run-now` | Run the script task immediately | `docs/actions-run.md` |
| `search` | Search for task suggestions with validity check | `docs/actions-tasks.md` |
| `detail` | View share details | `docs/actions-detail.md` |
| `help` | FAQ and help | `docs/help.md` |

### `help` (or no arguments) — Show available actions

| Action | Usage | Description |
| -------- | ------- | ------------- |
| `add-task` | `/auto-save add-task <share_url> [--name=xxx]` | 添加转存任务 |
| `config` | `/auto-save config` | 获取整体配置 |
| `update-config` | `/auto-save update-config <config_json>` | 更新整体配置 |
| `run-now` | `/auto-save run-now` | 立即运行脚本任务 |
| `search` | `/auto-save search <query>` | 搜索任务建议（带有效性检查） |
| `detail` | `/auto-save detail <share_url>` | 查看分享详情 |
| `help` | `/auto-save help <问题>` | 回答相关问题 |
