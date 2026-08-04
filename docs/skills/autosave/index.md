---
title: 自动保存
name: autosave
description: 用于管理开源网盘自动保存服务。用户需要管理转存任务、配置，或通过接口安全操作网盘自动保存服务时使用。
---

# 技能：自动保存

自动保存是一项开源网盘自动保存服务。
它将分享链接、文件夹等网盘资源转换为持久化转存任务，并自动完成保存与管理。

## 安全规范

本技能遵循以下安全规范，以保护接口令牌：

1. Do not expose the `AUTO_SAVE_TOKEN` value in chat, files, code, logs, or command arguments.
2. All API calls should go through the provided script (`scripts/api.cjs`) rather than using `curl`, `wget`, `fetch`, or other HTTP clients to call autosave endpoints directly.
3. Environment variables (`AUTO_SAVE_BASE_URL`, `AUTO_SAVE_TOKEN`) are read via `process.env` at runtime only. Do not hardcode credentials into any file.
4. 日志或输出中的敏感值会由 `scripts/sanitize.cjs` 自动清理。
5. `.env` files must not be committed to version control.
6. Do not modify the security scripts to disable masking or redirect output.

## 使用方法

1. **First invocation only** — read `${CLAUDE_SKILL_DIR}/docs/setup.md` for configuration, auth, and runtime detection.
2. 根据下方表格匹配操作。
3. 阅读对应文档，按详细步骤执行。
4. 没有参数或无法识别操作时，显示下方帮助表格。
5. 用户询问自动保存服务、命令用法或接口用法时，阅读 `${CLAUDE_SKILL_DIR}/docs/help.md` 并遵循其中说明。

## 操作列表

| 操作 | 描述 | 详细说明 |
| -------- | ------------- | --------- |
| `add-task` | 添加转存任务 | `docs/actions-tasks.md` |
| `config` | 获取整体配置 | `docs/actions-config.md` |
| `update-config` | 更新整体配置 | `docs/actions-config.md` |
| `run-now` | 立即运行脚本任务 | `docs/actions-run.md` |
| `search` | 搜索任务建议并检查有效性 | `docs/actions-tasks.md` |
| `detail` | 查看分享详情 | `docs/actions-detail.md` |
| `help` | 常见问题和帮助 | `docs/help.md` |

### `help`（或无参数）— 显示可用操作

| 操作 | 用法 | 描述 |
| -------- | ------- | ------------- |
| `add-task` | `/autosave add-task <share_url> [--name=xxx]` | 添加转存任务 |
| `config` | `/autosave config` | 获取整体配置 |
| `update-config` | `/autosave update-config <config_json>` | 更新整体配置 |
| `run-now` | `/autosave run-now [--taskname=xxx] [--shareurl=xxx] [--savepath=xxx] [--pattern=xxx] [--replace=xxx]` | 立即运行脚本任务 |
| `search` | `/autosave search <query> [--depth=N] [--tree] [--max-depth=N]` | 搜索任务建议（带有效性检查和可选目录树） |
| `detail` | `/autosave detail <share_url>` | 查看分享详情 |
| `help` | `/autosave help <问题>` | 回答相关问题 |
