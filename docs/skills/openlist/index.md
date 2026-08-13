---
title: 网盘聚合
name: openlist
description: >
  通过 openlist-cli 操作 OpenList（多存储文件列表 / 网盘聚合，AList 开源分支）。触发场景：管理文件与目录（列出/获取/搜索/新建/重命名/移动/复制/删除/上传/解压压缩包）、创建与管理分享、查看当前用户、后台管理（用户/存储/元信息/设置/驱动/索引）。命令输出为结构化 JSON，所有命令支持 --help。当用户提到 openlist、alist、网盘文件管理、文件分享、跨盘复制/移动、解压等时使用。
metadata:
  author: Tnnevol
  version: "2026.07.24"
---

# 技能：网盘聚合

用 `openlist-cli` 完成用户对网盘聚合服务的操作；不要凭记忆拼接接口请求，优先用命令行工具的 `--help` 驱动下一步。命令行工具内部已把命令映射到经真实服务端核验的接口契约（见[踩坑记录](references/pitfalls.md)）。

## 安装前置要求

代理处理网盘聚合任务前，必须先阅读并遵循 [openlist-cli 首次安装引导](https://github.com/tnnevol/skills/blob/main/apps/openlist-cli/openlist-cli-installation-guide.md)，根据用户环境完成 `openlist-cli` 的安装或升级。安装完成前，不得直接执行认证或业务命令。

## 新会话检查

首次处理网盘聚合任务时，先按上述安装引导完成安装，再轻量确认命令行工具可用且已认证：

```bash
openlist-cli --version        # 确认 CLI 可用
openlist-cli me get           # 确认已认证（返回当前用户即 OK）
```

- 若 `openlist-cli` 不存在：`npm i -g @tnnevol/openlist-cli`（或用 `npx -y @tnnevol/openlist-cli <command>`；本仓库开发态可用 `node apps/openlist-cli/dist/cli.js`，需先 `pnpm --filter @tnnevol/openlist-cli build`）。
- 若 `me get` 报未配置：引导认证（见下）。

## 认证与配置

优先级：**命令行选项 > 环境变量 > 配置文件**。

| 方式     | 说明                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| 环境变量 | `OPENLIST_BASE_URL`、`OPENLIST_TOKEN`                                                       |
| 全局选项 | `--base-url <url>`、`--token <token>`、`--pretty`（美化 JSON）                              |
| 登录保存 | `openlist-cli auth login --base-url <url> --token <token>` → 写入 `~/.openlist/config.json` |

- Token 在 OpenList Web 界面获取。**不要在对话/日志/文件中回显 Token**。
- 在真实终端中运行 `openlist-cli auth login` 会交互式询问缺少的服务地址和 Token，Token 输入时不会回显；也可使用 `--interactive` 显式启用。
- 管道、脚本和 CI 等非交互环境必须显式提供 `--base-url` 与 `--token`，不要让命令阻塞等待输入。
- `openlist-cli auth status` 查看登录状态；`openlist-cli auth logout` 清除本地配置。

## 基础用法

```bash
openlist-cli --help
openlist-cli <group> --help
openlist-cli <group> <command> --help
```

命令分组：`auth`、`fs`（文件）、`share`（分享）、`me`（当前用户）、`admin`（后台，按资源子命令树）。

## 命令概览

| 分组          | 命令                                                                                                         | 说明                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| auth          | `login` / `logout` / `status`                                                                                | 认证与配置                                                                       |
| fs            | `list <path>` / `get <path>` / `search` / `dirs <path>`                                                      | 浏览与搜索                                                                       |
| fs            | `mkdir` / `rename` / `move` / `copy` / `remove`                                                              | 增改删（`move/copy/remove` 用 `--src-dir/--dst-dir/--names` 或 `--dir/--names`） |
| fs            | `put <local> <remote>` / `form <local> <remote>`                                                             | 上传（支持 `--as-task/--overwrite/--last-modified/--md5/--sha1/--sha256`）       |
| fs            | `batch-rename` / `regex-rename` / `recursive-move` / `remove-empty-dirs`                                     | 批量与整理                                                                       |
| fs            | `archive-meta` / `archive-list` / `archive-decompress`                                                       | 压缩包元信息/列表/解压                                                           |
| share         | `list` / `get <id>` / `create` / `update <id>` / `delete <id>` / `enable <id>` / `disable <id>`              | 分享（`create/update` 用 `--path`，可选 `--password`、`--expires <RFC3339>`）    |
| me            | `get`                                                                                                        | 当前用户信息                                                                     |
| admin user    | `list` / `get <id>` / `create` / `update <id>` / `delete <id>`                                               | 用户                                                                             |
| admin storage | `list` / `get <id>` / `create` / `update <id>` / `delete <id>` / `enable <id>` / `disable <id>` / `load-all` | 存储                                                                             |
| admin meta    | `list` / `get <id>` / `create` / `update <id>` / `delete <id>`                                               | 元信息                                                                           |
| admin setting | `list` / `get <key>` / `save` / `delete <key>` / `reset-token`                                               | 设置（按 key）                                                                   |
| admin driver  | `list` / `names` / `info <name>`                                                                             | 驱动（只读）                                                                     |
| admin index   | `build` / `stop` / `clear` / `progress` / `update`                                                           | 搜索索引                                                                         |

> `admin` 增删改用 `--file <path>` 或 `--data <json>` 传 JSON 体。详见 [commands](references/commands.md)。

## 分页结果处理

列表命令（`fs list` / `fs search` / `share list` / `admin user|storage|meta list`）输出在 `data` 同级带 `pagination`（`page` / `perPage` / `total` / `totalPages`）。

- **判断是否还有下一页**：`pagination.page < pagination.totalPages`。
- **还有下一页时**：先向用户展示当前页结果，并**主动提示"当前第 {page}/{totalPages} 页，共 {total} 条，是否获取下一页？"**，由用户决定；**不要默认自动翻页或拉全量**。
- 用户确认后：用 `--page <下一页> [--per-page <与上次相同>]` 获取；若用户要求全量，先告知总页数再逐页拉取。

## 意图识别（自然语言 → 命令）

- "列出 / 看目录 X" → `fs list X`
- "X 的信息 / 详情" → `fs get X`
- "搜索关键词 K" → `fs search -k K -p <目录>`
- "新建文件夹 X" → `fs mkdir X`
- "上传本地文件到 X" → `fs put <local> <remote>`
- "把 A 复制/移动到 B" → `fs copy/move --src-dir <A所在目录> --dst-dir <B> --names <文件名>`
- "删除 X" → `fs remove --dir <目录> --names <文件名>`（**破坏性，先确认**）
- "解压 X 到 Y" → `fs archive-decompress --path X --dst-dir Y`（目标目录须先存在，可先 `fs mkdir Y`）
- "分享 X / 创建分享" → `share create --path X`（可带 `--password` / `--expires`）
- "禁用/启用/删除分享 N" → `share disable/enable/delete N`
- "列出用户/存储/设置" → `admin user/storage/setting list`
- "看设置项 K" → `admin setting get K`

## 必须询问用户（不要自作主张）

- 认证信息（Token）缺失时——引导配置，不要编造。
- **破坏性操作**：`fs remove` / `fs move`（覆盖）、`share delete`、`admin */delete`、`admin storage disable`、`admin setting delete/reset-token`、`admin index build/clear` 等——执行前先向用户确认。
- 需要 JSON 体的 `admin create/update/save`——确认数据来源（`--file` 或 `--data`）。
- **创建存储 `admin storage create`**：驱动值来自 `admin driver names`（用户未指定驱动时**先提问**）；表单字段来自 `admin driver info <driver>`（据此告知用户需填哪些参数）；参数凑齐后**创建前二次确认**。详见 [commands · admin storage create 工作流](references/commands.md)。

## 错误处理

| 现象                        | 处理                                                                 |
| --------------------------- | -------------------------------------------------------------------- |
| 命令行工具不存在             | `npm i -g @tnnevol/openlist-cli` 或用 `npx -y @tnnevol/openlist-cli` |
| 未认证 / 服务地址未配置     | `auth login` 或设置 `OPENLIST_BASE_URL`/`OPENLIST_TOKEN`             |
| 不知道参数                  | `openlist-cli <group> <command> --help`                              |
| 跨驱动 copy/move/解压无产物 | 异步任务，需轮询目标目录（见 pitfalls）                              |
| `illegal file path: .`      | 该 tar.gz 含 `.` 顶层条目，服务端解压器限制（非 CLI 问题）           |

## 核心参考

| 主题     | 描述                           | 参考文档                            |
| -------- | ------------------------------ | ---------------------------------- |
| 环境配置 | 安装、认证与环境变量           | [环境配置文档](references/setup.md) |
| Commands | 全部命令与参数详解             | [commands](references/commands.md) |
| Pitfalls | 真实接口契约与踩坑（务必先读） | [pitfalls](references/pitfalls.md) |

## 关键提示摘要（详见踩坑记录）

- 输出为结构化 JSON：`{ success, operation, data }` 或错误 `{ success:false, message, code }`；加 `--pretty` 美化。
- 列表命令输出带 `pagination`；`page < totalPages` 时**主动提示用户是否获取下一页**，不要自动拉全量（见「分页结果处理」）。
- **跨驱动** copy/move/decompress 是**异步任务**（返回 `task`），需轮询目标目录确认落地。
- `share create/update` 用 `--path`（内部转 `files`）+ 可选 `--password`（服务端字段 `pwd`）、`--expires`（RFC3339，服务端字段 `expires`）。
- `fs archive-decompress` 目标目录须已存在；`name` 服务端要求数组，CLI 已自动处理。
- `admin` 的 `get/delete/enable/disable` 走 `?id=` 查询，`setting` 走 `?key=`——CLI 已封装，无需关心。
