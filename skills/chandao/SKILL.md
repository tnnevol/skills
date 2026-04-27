---
name: chandao
description: Assistant for 禅道 (ZenTao) project management system via RESTful API v2. Use when the user asks about 禅道, lists/creates/updates projects, products, users, tasks, bugs, or manages project workflow via natural language commands.
---

# SKILL: chandao (禅道)

让 AI Agent 通过自然语言操作禅道系统，实现项目查询与管理。基于禅道官方 RESTful API v2。

## Security Guidelines

1. **Never expose** `CHANDAO_ACCOUNT` or `CHANDAO_PASSWORD` in chat, files, code, or logs.
2. **All API calls** must go through `scripts/api.cjs` — never use `curl`, `wget`, `fetch`, or other HTTP clients directly.
3. **Never read** `.env` files or environment variables containing credentials in conversation output.
4. **Sensitive values** in API responses are automatically sanitized via `scripts/sanitize.cjs`.
5. Token 由系统自动管理，用户无需手动操作。

## How to Execute

1. **首次使用** — 读 `docs/setup.md` 了解环境变量配置和运行原理。
2. **认证自动管理** — 首次请求自动登录，Token 内存缓存，401 自动刷新。
3. 从下方命令表中匹配用户意图。
4. 根据命令类型分发到对应 action 模块执行：
   - 查询类 → `scripts/actions/query.cjs`
   - 用户管理 → `scripts/actions/user.cjs`
   - 项目管理 → `scripts/actions/project.cjs`
   - 需求管理 → `scripts/actions/story.cjs`
   - 任务管理 → `scripts/actions/task.cjs`
5. 如果用户询问禅道使用帮助 — 读 `docs/help.md`。

## 命令表

### P0 查询类命令（6 个）

由 `scripts/actions/query.cjs` 实现，底层基于 `http/https` 模块（不用 fetch）。

| 命令 | 描述 | 输出格式 |
|------|------|----------|
| `/chandao users [--page=N] [--limit=N]` | 列出用户 | 表格：账号\|姓名\|角色\|部门\|手机 |
| `/chandao user <id>` | 用户详情 | 卡片（含联系方式、部门等） |
| `/chandao products [--page=N] [--limit=N]` | 列出产品 | 表格：ID\|名称\|类型\|负责人\|状态 |
| `/chandao product <id>` | 产品详情 | 卡片（含负责人、创建时间等） |
| `/chandao projects [--page=N] [--limit=N]` | 列出项目 | 表格：ID\|名称\|模式\|起止\|状态 |
| `/chandao project <id>` | 项目详情 | 卡片（含进度、团队、负责人等） |

### 用户管理命令（6 个）

由 `scripts/actions/user.cjs` 实现，包含参数校验和业务逻辑处理。

| 命令 | 描述 | 输出格式 |
|------|------|----------|
| `/chandao create-user --account=<account> --realname=<name> --email=<email>` | 创建用户 | 成功/失败信息 |
| `/chandao update-user <id> --realname=<name> --email=<email>` | 更新用户信息 | 成功/失败信息 |
| `/chandao delete-user <id>` | 删除用户 | 成功/失败信息 |
| `/chandao activate-user <id>` | 激活用户 | 成功/失败信息 |
| `/chandao unlock-user <id>` | 解锁用户 | 成功/失败信息 |
| `/chandao reset-password <id> --password=<new_password>` | 重置用户密码 | 成功/失败信息 |

### 项目管理命令（8 个）

由 `scripts/actions/project.cjs` 实现，包含项目生命周期管理。

| 命令 | 描述 | 输出格式 |
|------|------|----------|
| `/chandao create-project --name=<name> --code=<code> --begin=<date> --end=<date>` | 创建项目 | 成功/失败信息 |
| `/chandao update-project <id> --name=<name> --code=<code>` | 更新项目信息 | 成功/失败信息 |
| `/chandao start-project <id>` | 启动项目 | 成功/失败信息 |
| `/chandao suspend-project <id>` | 暂停项目 | 成功/失败信息 |
| `/chandao close-project <id>` | 关闭项目 | 成功/失败信息 |
| `/chandao team <id>` | 查看项目团队 | 表格：用户\|角色 |
| `/chandao add-team <id> --user=<account> --role=<role>` | 添加团队成员 | 成功/失败信息 |
| `/chandao remove-team <id> --user=<account>` | 移除团队成员 | 成功/失败信息 |

### 需求管理命令（6 个）

由 `scripts/actions/story.cjs` 实现，支持需求的完整生命周期。

| 命令 | 描述 | 输出格式 |
|------|------|----------|
| `/chandao list-story [--product=<id>] [--status=<status>]` | 列出需求 | 表格：ID\|标题\|状态\|负责人 |
| `/chandao get-story <id>` | 获取需求详情 | 卡片（含描述、附件等） |
| `/chandao create-story --product=<id> --title=<title> --specification=<desc>` | 创建需求 | 成功/失败信息 |
| `/chandao update-story <id> --title=<title> --specification=<desc>` | 更新需求 | 成功/失败信息 |
| `/chandao close-story <id>` | 关闭需求 | 成功/失败信息 |
| `/chandao review-story <id> --result=<pass/reject>` | 评审需求 | 成功/失败信息 |

### 任务管理命令（6 个）

由 `scripts/actions/task.cjs` 实现，支持任务的创建、分配、跟踪和关闭。

| 命令 | 描述 | 输出格式 |
|------|------|----------|
| `/chandao list-task [--project=<id>] [--assignedTo=<user>]` | 列出任务 | 表格：ID\|标题\|状态\|负责人 |
| `/chandao get-task <id>` | 获取任务详情 | 卡片（含描述、进度等） |
| `/chandao create-task --project=<id> --name=<name> --assignedTo=<user>` | 创建任务 | 成功/失败信息 |
| `/chandao update-task <id> --name=<name> --assignedTo=<user>` | 更新任务 | 成功/失败信息 |
| `/chandao close-task <id>` | 关闭任务 | 成功/失败信息 |
| `/chandao delete-task <id>` | 删除任务 | 成功/失败信息 |

### CLI 用法

```bash
node scripts/actions/query.cjs users --page=1 --limit=20
node scripts/actions/query.cjs user 1
node scripts/actions/query.cjs products
node scripts/actions/query.cjs product 5
node scripts/actions/query.cjs projects --page=2
node scripts/actions/query.cjs project 3
```

### 意图识别规则

**P0 查询类：**
- "查用户" / "用户列表" / "有哪些用户" → `users`
- "查产品" / "产品列表" / "有哪些产品" → `products`
- "查项目" / "项目列表" / "有哪些项目" → `projects`
- "用户详情" / "看看用户 X" → `user <id>`
- "产品详情" / "看看产品 X" → `product <id>`
- "项目详情" / "看看项目 X" → `project <id>`
- "下一页" / "第 2 页" → `--page=2`
- "显示 50 条" → `--limit=50`

**用户管理：**
- "创建用户" / "新增用户" → `create-user`
- "更新用户" / "修改用户" → `update-user`
- "删除用户" → `delete-user`
- "激活用户" → `activate-user`
- "解锁用户" → `unlock-user`
- "重置密码" → `reset-password`

**项目管理：**
- "创建项目" / "新建项目" → `create-project`
- "更新项目" / "修改项目" → `update-project`
- "启动项目" → `start-project`
- "暂停项目" → `suspend-project`
- "关闭项目" → `close-project`
- "项目团队" / "查看团队" → `team`
- "添加团队成员" / "增加成员" → `add-team`
- "移除团队成员" / "删除成员" → `remove-team`

**需求管理：**
- "列出需求" / "需求列表" → `list-story`
- "需求详情" / "查看需求" → `get-story`
- "创建需求" / "新增需求" → `create-story`
- "更新需求" / "修改需求" → `update-story`
- "关闭需求" → `close-story`
- "评审需求" → `review-story`

**任务管理：**
- "列出任务" / "任务列表" → `list-task`
- "任务详情" / "查看任务" → `get-task`
- "创建任务" / "新建任务" → `create-task`
- "更新任务" / "修改任务" → `update-task`
- "关闭任务" / "完成任务" → `close-task`
- "删除任务" → `delete-task`

### 脱敏规则

- 密码、Token → `***`
- 手机号 → `138****5678`（保留前3后4）
- 邮箱 → `tes***@test.com`（保留前3字符 + @域名）

## 目录结构

```
chandao/
├── SKILL.md                    # 本文件：主入口 + 命令定义
├── .env.example                # 环境变量示例
├── GENERATION.md               # 生成元信息
├── scripts/
│   ├── env.cjs                 # 环境变量加载与校验
│   ├── auth.cjs                # Token 认证管理
│   ├── api.cjs                 # HTTP 请求封装（GET/POST/PUT）
│   ├── sanitize.cjs            # 敏感信息脱敏
│   ├── validate.cjs            # 参数校验工具（必填/长度/日期/邮箱等）
│   └── actions/
│       ├── query.cjs           # P0 查询命令实现
│       ├── user.cjs            # 用户管理命令实现
│       ├── project.cjs         # 项目管理命令实现
│       ├── story.cjs           # 需求管理命令实现
│       └── task.cjs            # 任务管理命令实现
├── docs/
│   ├── setup.md                # 安装配置指南
│   ├── help.md                 # 禅道使用帮助
│   ├── actions-query.md        # 查询命令详细文档
│   ├── actions-user.md         # 用户模块 API 文档
│   ├── actions-product.md      # 产品模块 API 文档
│   └── actions-project.md      # 项目模块 API 文档
```

## 错误处理

| 错误 | 处理 |
|------|------|
| `CONFIG_MISSING` | 提示用户设置 CHANDAO_URL / CHANDAO_ACCOUNT / CHANDAO_PASSWORD |
| 登录失败 | 提示检查账号密码或禅道实例是否可达 |
| 无数据 | "📭 暂无数据" |
| 网络错误 | 友好提示，不暴露内部细节 |
| Token 过期 | 系统自动刷新，用户无感知 |

## P0+ 阶段（后续规划）

| Action | Usage | Description |
|--------|-------|-------------|
| `create-bug` | `/chandao create-bug --product=ID --title=xxx` | 创建缺陷 |
| `create-task` | `/chandao create-task --execution=ID --name=xxx` | 创建任务 |
| `create-story` | `/chandao create-story --product=ID --title=xxx` | 创建需求 |
| `resolve-bug` | `/chandao resolve-bug <id> --resolution=fixed` | 解决缺陷 |
| `finish-task` | `/chandao finish-task <id>` | 完成任务 |
| `bugs` | `/chandao bugs [--product=ID] [--status=unresolved]` | 列出缺陷 |
| `tasks` | `/chandao tasks [--execution=ID] [--assignedTo=user]` | 列出任务 |
| `stories` | `/chandao stories [--product=ID] [--status=open]` | 列出需求 |
| `validate` | `/chandao validate --param=value` | 参数校验 |
