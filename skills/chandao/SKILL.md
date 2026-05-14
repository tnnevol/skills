---
name: chandao
description: Assistant for 禅道 (ZenTao) project management system via chandao-cli. Use when the user asks about 禅道, lists/creates/updates projects, products, users, tasks, bugs, or manages project workflow via natural language commands.
---

# SKILL: chandao (禅道)

让 AI Agent 通过自然语言操作禅道系统。基于 `chandao-cli`（Rust CLI）调用 ZenTao RESTful API v2。

## Quick Start

```bash
# 检查是否已安装，未安装则提示用户
which chandao-cli || npm i -g @tnnevol/chandao-cli

# 基本用法（用户输入 /chandao，实际执行 chandao-cli）
/chandao <module> <action> [--args]  # → chandao-cli <module> <action> [--args]

# 帮助
/chandao help
/chandao <module> help
```

## Security Guidelines

1. **Never expose** `CHANDAO_ACCOUNT` or `CHANDAO_PASSWORD` in chat, files, code, or logs.
2. **All API calls** must go through `/chandao` — never call the ZenTao API directly.
3. **Never read** `.env` files or environment variables containing credentials in conversation output.
4. 认证由 CLI 自动管理（首次请求自动登录，Token 内存缓存，401 自动刷新）。

## How to Execute

1. **首次使用** — 提示用户安装 CLI：`npm i -g @tnnevol/chandao-cli`
2. **匹配意图** — 从下方「意图识别规则」匹配用户自然语言。
3. **查命令** — 从「命令模块索引」找到对应模块，需要详细参数时查看 `references/commands-<module>.md`。
4. **执行** — 使用 `/chandao <module> <action> [--args]` 执行。

### 通用选项

- `--dry-run` — 预览操作结果，不实际执行（所有写操作）
- `--limit <N>` — 每页数量，默认 20，最大 1000（所有列表操作）
- `--page <N>` — 页码，从 1 开始（所有列表操作）
- `--yes` — 确认删除，不加则只提示不执行（所有 delete 操作）

## 命令模块索引

| 模块 | 命令 | 详细参数 |
|------|------|----------|
| 用户 | `user list\|get\|create\|update\|delete` | [commands-user.md](references/commands-user.md) |
| 产品 | `product list\|get\|create\|update\|delete\|list-by-program` | [commands-product.md](references/commands-product.md) |
| 项目 | `project list\|get\|create\|update\|delete\|list-by-program` | [commands-project.md](references/commands-project.md) |
| 需求 | `story list\|get\|create\|update\|review\|close\|activate\|delete\|change` | [commands-story.md](references/commands-story.md) |
| 任务 | `task list\|get\|create\|update\|start\|finish\|close\|activate\|delete` | [commands-task.md](references/commands-task.md) |
| 执行 | `execution list\|get\|create\|update\|start\|suspend\|close\|link-products\|delete` | [commands-execution.md](references/commands-execution.md) |
| Bug | `bug list\|get\|create\|resolve\|close\|activate\|update\|delete` | [commands-bug.md](references/commands-bug.md) |
| 史诗 | `epic list-by-product\|get\|create\|update\|close\|activate\|change\|delete` | [commands-epic.md](references/commands-epic.md) |
| 用户需求 | `requirement list-by-product\|get\|create\|update\|close\|activate\|delete\|change` | [commands-requirement.md](references/commands-requirement.md) |
| 测试 | `testcase list\|get\|create\|update\|delete` / `testtask list-*\|create\|update\|delete` | [commands-test.md](references/commands-test.md) |
| 文件 | `file upload\|edit\|delete` | [commands-file.md](references/commands-file.md) |
| 项目集 | `program list\|get\|create\|update\|delete` | [commands-program.md](references/commands-program.md) |
| 版本/发布/计划 | `build` / `release` / `productplan` | [commands-build-release.md](references/commands-build-release.md) |
| 系统 | `system list\|get\|create\|update` | [commands-system.md](references/commands-system.md) |

## 意图识别规则

### 安装相关
- "没有 chandao-cli" / "没装" / "找不到" → 提示 `npm i -g @tnnevol/chandao-cli`

### 用户管理
- "查用户" / "用户列表" / "有哪些用户" → `user list`
- "用户详情" / "看看用户 X" → `user get <id>`
- "创建用户" / "新增用户" → `user create`
- "删除用户" → `user delete`

### 产品管理
- "查产品" / "产品列表" / "有哪些产品" → `product list`
- "产品详情" / "看看产品 X" → `product get <id>`
- "创建产品" / "新建产品" → `product create`
- "更新产品" / "修改产品" / "编辑产品" → `product update`
- "删除产品" → `product delete`
- "项目集的产品" / "项目集 N 的产品" → `product list-by-program <program>`

### 项目管理
- "查项目" / "项目列表" / "有哪些项目" → `project list`
- "项目详情" / "看看项目 X" → `project get <id>`
- "创建项目" / "新建项目" → `project create`
- "更新项目" / "修改项目" / "编辑项目" → `project update`
- "删除项目" → `project delete`
- "项目集的项目" / "项目集 N 的项目" → `project listbyprogram <program>`

### 透传参数提取规则

| 用户关键词 | 提取字段 | 取值 |
|-----------|---------|------|
| 敏捷 / Scrum | `--model` | `scrum` |
| 瀑布 / Waterfall | `--model` | `waterfall` |
| 看板 / Kanban | `--model` | `kanban` |
| 融合敏捷 / Agile Plus | `--model` | `agileplus` |
| 融合瀑布 / Waterfall Plus | `--model` | `waterfallplus` |

### 模糊指令处理

- "看下项目" / "查看项目" / "项目详情" **未提供 ID** → 追问用户："请提供项目 ID"
- "更新项目" / "修改项目" **未提供 ID** → 追问用户："请提供项目 ID"
- "删除项目" **未提供 ID** → 追问用户："请提供项目 ID"

### 需求管理
- "列出需求" / "需求列表" → `story list`
- "项目 N 的需求" → `story list --project N`
- "执行 N 的需求" → `story list --execution N`
- "需求详情" / "查看需求" → `story get <id>`
- "创建需求" / "新增需求" → `story create`
- "更新需求" / "修改需求" → `story update`
- "激活需求" / "重新打开需求" → `story activate`
- "评审需求" → `story review`
- "关闭需求" → `story close --reason done`
- "变更需求" → `story change --reviewer <account>`

### 任务管理
- "列出任务" / "任务列表" → `task list`
- "任务详情" / "查看任务" → `task get <id>`
- "创建任务" / "新建任务" → `task create`
- "开始任务" / "认领" → `task start`
- "完成任务" → `task finish`
- "关闭任务" → `task close`
- "删除任务" → `task delete`

### 迭代/执行管理
- "列出执行" / "迭代列表" → `execution list`
- "执行详情" / "查看迭代" → `execution get <id>`
- "创建执行" / "新建迭代" → `execution create`
- "更新执行" / "修改执行" / "编辑执行" → `execution update`
- "启动执行" / "启动迭代" → `execution start`
- "暂停执行" / "暂停迭代" → `execution suspend`
- "关闭执行" / "关闭迭代" → `execution close`
- "关联产品" / "绑定产品" → `execution link-products`
- "删除执行" / "删除迭代" → `execution delete`

### Bug 管理
- "Bug 列表" / "列出 Bug" → `bug list`
- "执行下的 Bug" / "迭代 Bug" / "执行 N 的 bug" → `bug list --execution <id>`
- "Bug 详情" / "查看 Bug" → `bug get <id>`
- "创建 Bug" / "报 Bug" → `bug create`
- "解决 Bug" → `bug resolve`
- "关闭 Bug" → `bug close`
- "重新打开 Bug" → `bug activate`

### 史诗管理
- "史诗列表" / "列出史诗" → `epic list-by-product`
- "史诗详情" → `epic get`
- "创建史诗" → `epic create`
- "关闭史诗" → `epic close`

### 测试管理
- "测试用例列表" → `testcase list`
- "创建测试用例" → `testcase create`
- "测试单列表" → `testtask list-by-product`
- "创建测试单" → `testtask create`

### 项目集管理
- "项目集列表" / "有哪些项目集" → `program list`
- "项目集详情" → `program get`

### 发布/版本
- "版本列表" / "构建列表" → `build list-by-project`
- "发布列表" → `release list-by-product`
- "产品计划" → `productplan list-by-product`

### 系统管理
- "系统列表" / "应用系统" / "有哪些系统" → `system list`

## Bug 修复工作流（重要！用户纠正过）

**修复完 Bug 后必须立即更新禅道状态**，不要等所有 Bug 都修完再批量处理。

```bash
# 修复完一个 Bug 后，立即执行：
chandao bug resolve <id> --resolution fixed --assigned-to <原指派人> --resolved-build <build_id>
```

**正确流程**：
1. 读取 Bug 列表，逐个修复
2. 每修完一个 → 编译测试 → 立即 `bug resolve`
3. 全部修完后提交代码、打版本

## 错误处理

| 情况 | 处理 |
|------|------|
| `command not found: chandao-cli` | 提示用户：`npm i -g @tnnevol/chandao-cli` |
| 登录失败 | 提示检查 `~/.config/chandao/.env` 中的账号密码 |
| 无数据 | "📭 暂无数据" |
| 网络错误 | 友好提示，不暴露内部细节 |
| `--dry-run` 输出 | 展示将要执行的操作，询问用户是否确认 |
| HTTP 403 | 检查用户角色和模块权限，详见 Pitfalls |

## 关键警告摘要

> 详细说明见 [references/pitfalls.md](references/pitfalls.md)

- ⚠️ API v2 创建接口参数名必须带 `ID` 后缀（如 `executionID`），否则返回 403
- ⚠️ Bug 状态流转必须用专用端点（`bug resolve/close/activate`），`bug update --status` 无效
- ⚠️ Bug 解决建议传 `--assigned-to`（否则清空指派人）和 `--resolved-build`
- ⚠️ `story close` 必须传 `--reason`（枚举：done/subdivided/duplicate/postponed/willnotdo/cancel/bydesign）
- ⚠️ `story change`/`epic change`/`requirement change` 必须传 `--reviewer`
- ⚠️ `task finish` 必须传 `--consumed`
- ⚠️ `execution create` 用 `--project`（不是 `--product`）
- ⚠️ `bug list` 没有 `--pri` 参数
- ⚠️ `system create` CLI 没有 `--product` 参数
- ⚠️ `project create` 必填 `name` + `code` + `model` + `begin` + `end`，`model` 取值 `scrum` / `waterfall` / `kanban` / `agileplus` / `waterfallplus`
- ⚠️ `project create/update` 的 `model` 字段与 `execution` 的 `type` 是不同概念，不要混淆
- ⚠️ `execution create` 必填 `project` + `name` + `begin` + `end`，支持 `lifetime`/`days`/`products`/`plans`/`PO`/`QD`/`PM`/`RD`/`acl` 等扩展字段
- ⚠️ `execution update` 必填 `name` + `begin` + `end`，`--project` 用于修改所属项目
- ⚠️ 所有 `delete` 命令需要 `--yes` 确认
- ⚠️ `user create` 必须传 `--password`
- ⚠️ 403 错误可能是参数名错误、用户无角色、或角色缺少模块权限

## References

| 文件 | 说明 |
|------|------|
| [references/commands-*.md](references/) | 按模块拆分的命令详情（14 个文件） |
| [references/pitfalls.md](references/pitfalls.md) | 完整踩坑记录（22 条） |
| [references/setup.md](references/setup.md) | 安装与配置 |
| [references/help.md](references/help.md) | 常见问题 |
| [references/zentao-v2-api-fields.md](references/zentao-v2-api-fields.md) | v2 API 必填参数速查 |
| [references/zentao-api-v2-quirks.md](references/zentao-api-v2-quirks.md) | API v2 常见坑点 |
| [references/zentao-api-permissions.md](references/zentao-api-permissions.md) | 权限与角色问题 |
| [references/framework-alignment.md](references/framework-alignment.md) | 与 halo-cli 框架对齐 |

## AI 安装指南

chandao-cli 项目包含 `AI-SETUP.md` 文档，用于指导 AI Agent 安装和配置（安装 CLI、配置环境变量、验证步骤、故障排查）。

所有执行依赖 `chandao-cli`，无需额外脚本文件。
