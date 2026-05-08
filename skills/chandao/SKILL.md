---
name: chandao
description: Assistant for 禅道 (ZenTao) project management system via chandao-cli. Use when the user asks about 禅道, lists/creates/updates projects, products, users, tasks, bugs, or manages project workflow via natural language commands.
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
2. **All API calls** must go through `chandao-cli` — never call the ZenTao API directly.
3. **Never read** `.env` files or environment variables containing credentials in conversation output.
4. 认证由 CLI 自动管理（首次请求自动登录，Token 内存缓存，401 自动刷新）。

## How to Execute

1. **首次使用** — 提示用户安装 CLI：`npm i -g @tnnevol/chandao-cli`
2. 从下方命令表中匹配用户意图。
3. 使用 `chandao-cli <module> <action> [--args]` 执行。

## 命令表

### 安装与帮助

| 命令 | 描述 |
|------|------|
| `/chandao help` | 查看所有模块 |
| `/chandao version` | 查看版本 |
| `/chandao <module> help` | 查看模块详细用法与参数 |

### 查询类命令（6 个模块）

| 命令 | 描述 | 输出示例 |
|------|------|----------|
| `/chandao user list [--limit N] [--page N]` | 列出用户 | 表格：账号\|姓名\|角色\|部门\|手机 |
| `/chandao user get <id>` | 用户详情 | 卡片（含联系方式、部门等） |
| `/chandao product list [--limit N] [--page N]` | 列出产品 | 表格：ID\|名称\|类型\|负责人\|状态 |
| `/chandao product get <id>` | 产品详情 | 卡片（含负责人、创建时间等） |
| `/chandao project list [--limit N] [--page N]` | 列出项目 | 表格：ID\|名称\|模式\|起止\|状态 |
| `/chandao project get <id>` | 项目详情 | 卡片（含进度、团队、负责人等） |

### 用户管理

| 命令 | 描述 |
|------|------|
| `chandao-cli user create --account <account> --realname <name> --email <email>` | 创建用户 |
| `chandao-cli user update <id> --realname <name>` | 更新用户 |
| `chandao-cli user delete <id>` | 删除用户 |

### 产品管理

| 命令 | 描述 |
|------|------|
| `chandao-cli product create --name <name> --code <code> [--type normal\|branch\|platform]` | 创建产品 |
| `chandao-cli product update <id> --name <name>` | 更新产品 |
| `chandao-cli product delete <id>` | 删除产品 |
| `chandao-cli product list-by-program <id>` | 按项目集列出产品 |

### 项目管理

| 命令 | 描述 |
|------|------|
| `chandao-cli project create --name <name> --code <code> --begin <date> --end <date>` | 创建项目 |
| `chandao-cli project update <id> --name <name>` | 更新项目 |
| `chandao-cli project delete <id>` | 删除项目 |
| `chandao-cli project list-by-program <id>` | 按项目集列出项目 |

### 需求管理

| 命令 | 描述 |
|------|------|
| `chandao-cli story list [--product <id>] [--limit N]` | 列出需求 |
| `chandao-cli story get <id>` | 获取需求详情 |
| `chandao-cli story create --product <id> --title <title> [--spec <desc>] [--pri 1-4]` | 创建需求 |
| `chandao-cli story update <id> --title <title>` | 更新需求 |
| `chandao-cli story review <id> --result pass\|reject` | 评审需求 |
| `chandao-cli story close <id>` | 关闭需求 |
| `chandao-cli story activate <id>` | 激活已关闭的需求 |
| `chandao-cli story delete <id>` | 删除需求 |
| `chandao-cli story change <id> [--spec <desc>]` | 变更需求（提交评审） |

### 任务管理

| 命令 | 描述 |
|------|------|
| `chandao-cli task list [--execution <id>] [--assigned <user>] [--limit N]` | 列出任务 |
| `chandao-cli task get <id>` | 获取任务详情 |
| `chandao-cli task create --execution <id> --name <name> [--assigned <user>] [--type devel\|test\|design\|discuss\|ui]` | 创建任务 |
| `chandao-cli task update <id> --name <name>` | 更新任务 |
| `chandao-cli task start <id>` | 开始任务（状态→进行中） |
| `chandao-cli task finish <id>` | 完成任务（状态→已完成） |
| `chandao-cli task close <id>` | 关闭任务 |
| `chandao-cli task activate <id>` | 激活已关闭的任务 |
| `chandao-cli task delete <id>` | 删除任务 |

### 执行/迭代管理

| 命令 | 描述 |
|------|------|
| `chandao-cli execution list [--project <id>] [--status wait\|doing\|suspended\|closed] [--limit N]` | 列出执行 |
| `chandao-cli execution get <id>` | 获取执行详情 |
| `chandao-cli execution create --name <name> --begin <date> --end <date> --project <id> --product <id>` | 创建执行 |
| `chandao-cli execution update <id> --name <name>` | 更新执行 |
| `chandao-cli execution start <id>` | 启动执行 |
| `chandao-cli execution suspend <id>` | 暂停执行 |
| `chandao-cli execution close <id>` | 关闭执行 |
| `chandao-cli execution link-products <id> --products <ID1,ID2>` | 关联产品到执行 |
| `chandao-cli execution delete <id>` | 删除执行 |

### Bug 管理

| 命令 | 描述 |
|------|------|
| `chandao-cli bug list [--product <id>] [--pri 1-4] [--limit N]` | 列出 Bug |
| `chandao-cli bug get <id>` | Bug 详情 |
| `chandao-cli bug create --product <id> --title <title> --opened-build <buildId>` | 创建 Bug |
| `chandao-cli bug resolve <id> --resolution fixed\|bydesign\|external\|postponed\|willnotfix\|duplicate\|notrepro` | 解决 Bug |
| `chandao-cli bug close <id>` | 关闭 Bug |
| `chandao-cli bug activate <id>` | 激活 Bug |
| `chandao-cli bug update <id> --title <title>` | 编辑 Bug |
| `chandao-cli bug delete <id>` | 删除 Bug |

### 史诗管理

| 命令 | 描述 |
|------|------|
| `chandao-cli epic list-by-product <id> [--limit N]` | 列出史诗 |
| `chandao-cli epic get <id>` | 史诗详情 |
| `chandao-cli epic create --product <id> --title <title>` | 创建史诗 |
| `chandao-cli epic update <id> --title <title>` | 更新史诗 |
| `chandao-cli epic close <id>` | 关闭史诗 |
| `chandao-cli epic activate <id>` | 激活已关闭的史诗 |
| `chandao-cli epic change <id>` | 变更史诗（提交评审） |
| `chandao-cli epic delete <id>` | 删除史诗 |

### 用户需求管理

| 命令 | 描述 |
|------|------|
| `chandao-cli requirement list-by-product <id> [--limit N]` | 列出用户需求 |
| `chandao-cli requirement get <id>` | 用户需求详情 |
| `chandao-cli requirement create --product <id> --title <title>` | 创建用户需求 |
| `chandao-cli requirement update <id> --title <title>` | 更新用户需求 |
| `chandao-cli requirement close <id>` | 关闭用户需求 |
| `chandao-cli requirement activate <id>` | 激活已关闭的需求 |
| `chandao-cli requirement delete <id>` | 删除用户需求 |
| `chandao-cli requirement change <id>` | 变更需求（提交评审） |

### 测试用例管理

| 命令 | 描述 |
|------|------|
| `chandao-cli testcase list [--product <id>] [--limit N]` | 列出测试用例 |
| `chandao-cli testcase get <id>` | 测试用例详情 |
| `chandao-cli testcase create --product <id> --title <title> [--type feature\|interface\|performance\|security\|other]` | 创建测试用例 |
| `chandao-cli testcase update <id> --title <title>` | 更新测试用例 |
| `chandao-cli testcase delete <id>` | 删除测试用例 |

### 测试单管理

| 命令 | 描述 |
|------|------|
| `chandao-cli testtask list-by-product <id>` | 按产品列出测试单 |
| `chandao-cli testtask list-by-project <id>` | 按项目列出测试单 |
| `chandao-cli testtask list-by-execution <id>` | 按执行列出测试单 |
| `chandao-cli testtask create --product <id> --name <name>` | 创建测试单 |
| `chandao-cli testtask update <id> --name <name>` | 更新测试单 |
| `chandao-cli testtask delete <id>` | 删除测试单 |

### 文件/附件管理

| 命令 | 描述 |
|------|------|
| `chandao-cli file upload --path <file> --object-type <objectType> --object-id <objectID>` | 上传附件 |
| `chandao-cli file edit <id> --name <newName>` | 编辑/重命名附件 |
| `chandao-cli file delete <id>` | 删除附件 |

### 项目集管理

| 命令 | 描述 |
|------|------|
| `chandao-cli program list [--limit N]` | 列出项目集 |
| `chandao-cli program get <id>` | 项目集详情 |
| `chandao-cli program create --name <name>` | 创建项目集 |
| `chandao-cli program update <id> --name <name>` | 更新项目集 |
| `chandao-cli program delete <id>` | 删除项目集 |

### 构建/版本管理

| 命令 | 描述 |
|------|------|
| `chandao-cli build list-by-project <id>` | 按项目列出版本 |
| `chandao-cli build list-by-execution <id>` | 按执行列出版本 |
| `chandao-cli build create --product <id> --name <name>` | 创建版本 |
| `chandao-cli build update <id> --name <name>` | 更新版本 |
| `chandao-cli build delete <id>` | 删除版本 |

### 发布管理

| 命令 | 描述 |
|------|------|
| `chandao-cli release list-by-product <id>` | 按产品列出发布 |
| `chandao-cli release list` | 列出所有发布 |
| `chandao-cli release create --product <id> --name <name>` | 创建发布 |
| `chandao-cli release update <id> --name <name>` | 更新发布 |
| `chandao-cli release delete <id>` | 删除发布 |

### 产品计划管理

| 命令 | 描述 |
|------|------|
| `chandao-cli productplan list-by-product <id>` | 按产品列出计划 |
| `chandao-cli productplan get <id>` | 计划详情 |
| `chandao-cli productplan create --product <id> --title <title> --begin <date> --end <date>` | 创建计划 |
| `chandao-cli productplan update <id> --title <title>` | 更新计划 |
| `chandao-cli productplan delete <id>` | 删除计划 |

### 反馈管理

| 命令 | 描述 |
|------|------|
| `chandao-cli feedback list-by-product <id>` | 按产品列出反馈 |
| `chandao-cli feedback get <id>` | 反馈详情 |
| `chandao-cli feedback create --product <id> --title <title>` | 创建反馈 |
| `chandao-cli feedback update <id> --title <title>` | 更新反馈 |
| `chandao-cli feedback close <id>` | 关闭反馈 |
| `chandao-cli feedback activate <id>` | 激活已关闭的反馈 |
| `chandao-cli feedback delete <id>` | 删除反馈 |

### 工单管理

| 命令 | 描述 |
|------|------|
| `chandao-cli ticket list-by-product <id>` | 按产品列出工单 |
| `chandao-cli ticket get <id>` | 工单详情 |
| `chandao-cli ticket create --product <id> --title <title>` | 创建工单 |
| `chandao-cli ticket update <id> --title <title>` | 更新工单 |
| `chandao-cli ticket close <id>` | 关闭工单 |
| `chandao-cli ticket activate <id>` | 激活已关闭的工单 |
| `chandao-cli ticket delete <id>` | 删除工单 |

### 系统管理

| 命令 | 描述 |
|------|------|
| `chandao-cli system list` | 列出应用系统 |

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

### 反馈/工单
- "反馈列表" → `feedback list-by-product`
- "工单列表" → `ticket list-by-product`

## 目录结构

```
skills/chandao/
├── SKILL.md       # 主入口 + 命令定义
```

所有执行依赖 `chandao-cli`，无需额外脚本文件。

## 错误处理

| 情况 | 处理 |
|------|------|
| `command not found: chandao-cli` | 提示用户：`npm i -g @tnnevol/chandao-cli` |
| 登录失败 | 提示检查 `~/.config/chandao/.env` 中的账号密码 |
| 无数据 | "📭 暂无数据" |
| 网络错误 | 友好提示，不暴露内部细节 |
| `--dry-run` 输出 | 展示将要执行的操作，询问用户是否确认 |
