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
   - Bug 管理 → `scripts/actions/bug.cjs`
   - 史诗/故事管理 → `scripts/actions/epic.cjs` + `scripts/actions/story.cjs`
   - 测试管理 → `scripts/actions/testcase.cjs` + `scripts/actions/testtask.cjs`
   - 执行/迭代管理 → `scripts/actions/execution.cjs`
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

### 执行/迭代管理命令（8 个）

由 `scripts/actions/execution.cjs` 实现，支持执行/迭代的完整生命周期。

| 命令 | 描述 | 输出格式 |
|------|------|----------|
| `/chandao list-execution [--project=<id>] [--product=<id>] [--status=<wait|doing|suspended|closed>] [--limit=<N>]` | 列出执行 | 表格：ID\|名称\|状态\|项目\|产品\|日期 |
| `/chandao get-execution <id>` | 获取执行详情 | 卡片（含负责人、创建时间等） |
| `/chandao create-execution --name=<name> --begin=<date> --end=<date> --project=<id> --product=<id>` | 创建执行 | 成功/失败信息 |
| `/chandao update-execution <id> [--name=<name>] [--begin=<date>] [--end=<date>] [--desc=<desc>]` | 更新执行 | 成功/失败信息 |
| `/chandao delete-execution <id>` | 删除执行 | 成功/失败信息 |
| `/chandao start-execution <id>` | 启动执行 | 成功/失败信息 |
| `/chandao suspend-execution <id>` | 暂停执行 | 成功/失败信息 |
| `/chandao close-execution <id>` | 关闭执行 | 成功/失败信息 |

### Bug 管理命令（8 个）

由 `scripts/actions/bug.cjs` 实现，支持 Bug 的完整生命周期（创建→解决→关闭→激活）。

| 命令 | 描述 | 输出格式 |
|------|------|----------|
| `/chandao list-bug [--product=<id>] [--status=<unresolved|resolved|closed>] [--pri=<1-4>]` | 列出 Bug | 表格：ID\|标题\|严重度\|优先级\|状态\|指派给 |
| `/chandao get-bug <id>` | Bug 详情 | 卡片（含严重度/优先级/重现步骤/影响版本） |
| `/chandao create-bug --product=<id> --title=<title> --openedBuild=trunk\|<buildID>` | 创建 Bug | 成功/失败信息 |
| `/chandao resolve-bug <id> --resolution=<fixed\|bydesign\|external\|postponed\|willnotfix\|duplicate\|notrepro> --resolvedBuild=trunk\|<buildID>` | 解决 Bug | 成功/失败信息 |
| `/chandao close-bug <id>` | 关闭 Bug | 成功/失败信息 |
| `/chandao activate-bug <id>` | 激活 Bug | 成功/失败信息 |
| `/chandao update-bug <id> [--title=<title>] [--pri=<1-4>] [--severity=<1-4>]` | 编辑 Bug | 成功/失败信息 |
| `/chandao delete-bug <id>` | 删除 Bug | 成功/失败信息 |

### 史诗/故事管理命令（12 个）

史诗和故事同属需求层级：史诗 → 故事 → 需求。由 `scripts/actions/epic.cjs` 和 `scripts/actions/story.cjs` 实现。

| 命令 | 描述 | 输出格式 |
|------|------|----------|
| `/chandao list-epic [--product=<id>]` | 列出史诗 | 表格：ID\|标题\|产品\|优先级\|状态 |
| `/chandao get-epic <id>` | 史诗详情 | 卡片 |
| `/chandao create-epic --product=<id> --title=<title>` | 创建史诗 | 成功/失败信息 |
| `/chandao update-epic <id> [--title=xxx] [--desc=xxx]` | 更新史诗 | 成功/失败信息 |
| `/chandao delete-epic <id>` | 删除史诗 | 成功/失败信息 |
| `/chandao list-story [--product=<id>] [--epic=<id>] [--status=<status>]` | 列出需求 | 表格：ID\|标题\|产品\|优先级\|状态\|指派给 |
| `/chandao get-story <id>` | 需求详情 | 卡片 |
| `/chandao create-story --product=<id> --title=<title>` | 创建需求 | 成功/失败信息 |
| `/chandao update-story <id> [--title=xxx] [--spec=xxx]` | 更新需求 | 成功/失败信息 |
| `/chandao close-story <id>` | 关闭需求 | 成功/失败信息 |
| `/chandao review-story <id> --result=<pass\|reject>` | 评审需求 | 成功/失败信息 |
| `/chandao delete-story <id>` | 删除需求 | 成功/失败信息 |

### 测试管理命令（12 个）

由 `scripts/actions/testcase.cjs`（测试用例）和 `scripts/actions/testtask.cjs`（测试任务 + 结果）实现。

| 命令 | 描述 | 输出格式 |
|------|------|----------|
| `/chandao list-testcase [--product=<id>] [--type=feature\|interface\|performance\|security\|other]` | 列出测试用例 | 表格：ID\|标题\|类型\|优先级\|状态 |
| `/chandao get-testcase <id>` | 测试用例详情 | 卡片（含前置条件/步骤/预期结果） |
| `/chandao create-testcase --product=<id> --title=<title> --type=<type>` | 创建测试用例 | 成功/失败信息 |
| `/chandao update-testcase <id> [--title=xxx] [--type=xxx]` | 更新测试用例 | 成功/失败信息 |
| `/chandao delete-testcase <id>` | 删除测试用例 | 成功/失败信息 |
| `/chandao list-testtask [--product=<id>] [--build=<id>]` | 列出测试任务 | 表格：ID\|名称\|产品\|状态\|创建人 |
| `/chandao get-testtask <id>` | 测试任务详情 | 卡片 |
| `/chandao create-testtask --product=<id> --name=<name>` | 创建测试任务 | 成功/失败信息 |
| `/chandao update-testtask <id> [--name=xxx] [--build=xxx]` | 更新测试任务 | 成功/失败信息 |
| `/chandao delete-testtask <id>` | 删除测试任务 | 成功/失败信息 |
| `/chandao run-testtask <id>` | 执行测试任务 | 成功/失败信息 |
| `/chandao submit-testresult --testtask=<id> --testcase=<id> --result=<pass\|fail\|blocked>` | 提交测试结果 | 成功/失败信息 |

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

**执行/迭代管理：**
- "列出执行" / "执行列表" / "迭代列表" → `list-execution`
- "执行详情" / "查看执行" / "查看迭代" → `get-execution`
- "创建执行" / "新建迭代" → `create-execution`
- "更新执行" / "修改执行" → `update-execution`
- "删除执行" / "归档执行" → `delete-execution`
- "启动执行" / "启动迭代" → `start-execution`
- "暂停执行" / "暂停迭代" → `suspend-execution`
- "关闭执行" / "关闭迭代" → `close-execution`

**Bug 管理：**
- "Bug 列表" / "列出 Bug" / "查 Bug" → `list-bug`
- "Bug 详情" / "查看 Bug" → `get-bug`
- "创建 Bug" / "新建 Bug" / "报 Bug" → `create-bug`
- "解决 Bug" → `resolve-bug`
- "关闭 Bug" → `close-bug`
- "激活 Bug" / "重新打开 Bug" → `activate-bug`
- "编辑 Bug" / "修改 Bug" → `update-bug`
- "删除 Bug" → `delete-bug`

**史诗/故事管理：**
- "史诗列表" / "列出史诗" → `list-epic`
- "史诗详情" → `get-epic`
- "创建史诗" → `create-epic`
- "删除史诗" → `delete-epic`
- "删除需求" → `delete-story`
- "需求列表" 加 `--epic=N` → 按史诗过滤

**测试管理：**
- "测试用例列表" / "列出测试用例" → `list-testcase`
- "测试用例详情" → `get-testcase`
- "创建测试用例" → `create-testcase`
- "测试任务列表" → `list-testtask`
- "创建测试任务" → `create-testtask`
- "执行测试任务" → `run-testtask`
- "提交测试结果" / "测试通过/失败" → `submit-testresult`

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
│       ├── task.cjs            # 任务管理命令实现
│       ├── execution.cjs       # 执行/迭代管理命令实现
│       ├── bug.cjs             # Bug 管理命令实现
│       ├── epic.cjs            # 史诗管理命令实现
│       ├── testcase.cjs        # 测试用例管理命令实现
│       └── testtask.cjs        # 测试任务+结果管理命令实现
├── docs/
│   ├── setup.md                # 安装配置指南
│   ├── help.md                 # 禅道使用帮助
│   ├── actions-query.md        # 查询命令详细文档
│   ├── actions-user.md         # 用户模块 API 文档
│   ├── actions-product.md      # 产品模块 API 文档
│   └── actions-execution.md    # 执行/迭代模块 API 文档
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
