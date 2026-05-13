---
name: chandao
description: >-
  Assistant for 禅道 (ZenTao) project management system via chandao-cli. 
  Use when the user asks about 禅道, lists/creates/updates projects, products, users, tasks, bugs, or manages project workflow via natural language commands.
  Triggers: /chandao help, /chandao user list, /chandao bug create, managing ZenTao projects, creating tasks, resolving bugs.
compatibility:
  runtime: node >= 18
  dependencies: "@tnnevol/chandao-cli"
  environment: CHANDAO_URL, CHANDAO_ACCOUNT, CHANDAO_PASSWORD
---

# SKILL: chandao (禅道)

让 AI Agent 通过自然语言操作禅道系统，实现项目查询与管理。基于 `chandao-cli`（Rust CLI）调用 ZenTao RESTful API v2。

## 命令别名

- **用户界面命令**: `/chandao <module> <action> [--args]`
- **实际执行**: `chandao-cli <module> <action> [--args]`

当用户输入 `/chandao` 时，实际执行 `chandao-cli`。

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
2. 从下方命令表中匹配用户意图。
3. 使用 `/chandao <module> <action> [--args]` 执行。

## 命令模块索引

| 模块 | 描述 | 命令详情 |
|------|------|----------|
| 用户 | 用户管理 | [commands-user.md](references/commands-user.md) |
| 产品 | 产品管理 | [commands-product.md](references/commands-product.md) |
| 项目 | 项目管理 | [commands-project.md](references/commands-project.md) |
| 需求 | 需求管理 | [commands-story.md](references/commands-story.md) |
| 任务 | 任务管理 | [commands-task.md](references/commands-task.md) |
| 执行/迭代 | 执行/迭代管理 | [commands-execution.md](references/commands-execution.md) |
| Bug | Bug 管理 | [commands-bug.md](references/commands-bug.md) |
| 史诗 | 史诗管理 | [commands-epic.md](references/commands-epic.md) |
| 用户需求 | 用户需求管理 | [commands-requirement.md](references/commands-requirement.md) |
| 测试用例 | 测试用例管理 | [commands-testcase.md](references/commands-testcase.md) |
| 测试单 | 测试单管理 | [commands-testtask.md](references/commands-testtask.md) |
| 文件/附件 | 文件/附件管理 | [commands-file.md](references/commands-file.md) |
| 项目集 | 项目集管理 | [commands-program.md](references/commands-program.md) |
| 构建/版本 | 构建/版本管理 | [commands-build.md](references/commands-build.md) |
| 发布 | 发布管理 | [commands-release.md](references/commands-release.md) |
| 产品计划 | 产品计划管理 | [commands-productplan.md](references/commands-productplan.md) |
| 系统 | 系统管理 | [commands-system.md](references/commands-system.md) |

## 通用选项

所有写操作（create/update/delete）支持：
- `--dry-run` — 预览操作结果，不实际执行

所有列表操作支持：
- `--limit <N>` — 每页数量（默认 20，最大 1000）
- `--page <N>` — 页码（从 1 开始）

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
- "删除产品" → `product delete`

### 项目管理
- "查项目" / "项目列表" / "有哪些项目" → `project list`
- "项目详情" / "看看项目 X" → `project get <id>`
- "创建项目" / "新建项目" → `project create`
- "删除项目" → `project delete`

### 需求管理
- "列出需求" / "需求列表" → `story list`
- "需求详情" / "查看需求" → `story get <id>`
- "创建需求" / "新增需求" → `story create`
- "更新需求" / "修改需求" → `story update`
- "评审需求" → `story review`
- "关闭需求" → `story close`

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
- "启动执行" / "启动迭代" → `execution start`
- "暂停执行" / "暂停迭代" → `execution suspend`
- "关闭执行" / "关闭迭代" → `execution close`
- "关联产品" / "绑定产品" → `execution link-products`

### Bug 管理
- "Bug 列表" / "列出 Bug" → `bug list`
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

### 用户需求管理
- "用户需求列表" / "列出用户需求" → `requirement list-by-product`
- "用户需求详情" → `requirement get`
- "创建用户需求" → `requirement create`
- "关闭用户需求" → `requirement close`

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
- "系统详情" → `system get`
- "创建系统" → `system create`
- "更新系统" → `system update`

## 错误处理

| 情况 | 处理 |
|------|------|
| `command not found: chandao-cli` | 提示用户：`npm i -g @tnnevol/chandao-cli` |
| 登录失败 | 提示检查 `~/.config/chandao/.env` 中的账号密码 |
| 无数据 | "📭 暂无数据" |
| 网络错误 | 友好提示，不暴露内部细节 |
| `--dry-run` 输出 | 展示将要执行的操作，询问用户是否确认 |
