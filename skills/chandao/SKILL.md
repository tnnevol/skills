---
name: chandao
description: Assistant for 禅道 (ZenTao) project management system via JS scripts. Use when the user asks about 禅道, lists/creates/updates projects, products, users, tasks, bugs, or manages project workflow via natural language commands.
---

# SKILL: chandao (禅道)

让 AI Agent 通过自然语言操作禅道系统。基于 `scripts/*.js`（Node.js 脚本）调用 ZenTao RESTful API v2。

## Quick Start

```bash
# 配置环境变量
export CHANDAO_URL="https://your-zentao.com"
export CHANDAO_ACCOUNT="your_account"
export CHANDAO_PASSWORD="your_password"

# 验证配置
node scripts/auth.js --action list-products

# 基本用法
node scripts/<module>.js --action <action> [--args]
```

## Security Guidelines

1. **Never expose** `CHANDAO_ACCOUNT` or `CHANDAO_PASSWORD` in chat, files, code, or logs.
2. **All API calls** must go through scripts — never call the ZenTao API directly.
3. **Never read** `.env` files or environment variables containing credentials in conversation output.
4. 认证由 `auth.js` 自动管理（首次请求自动登录、本地 Token 文件缓存、401 自动刷新）。

## How to Execute

1. **首次使用** — 确认环境变量 `CHANDAO_URL` / `CHANDAO_ACCOUNT` / `CHANDAO_PASSWORD` 已配置
2. **验证** — `node scripts/auth.js --action list-products`
3. **匹配意图** — 从下方「意图识别规则」匹配用户自然语言。
4. **执行** — 调用对应 `scripts/<module>.js --action <action> [--args]`。

### 脚本列表

| 脚本 | 模块 | 操作 |
|------|------|------|
| `auth.js` | 认证 | `login` / `get-token` / `list-products` |
| `product.js` | 产品 | `list` / `get` / `create` / `update` / `delete` / `list-by-program` |
| `project.js` | 项目 | `list` / `get` / `create` / `update` / `delete` / `list-by-program` |
| `story.js` | 需求 | `list` / `get` / `create` / `update` / `close` / `activate` / `change` / `delete` |
| `task.js` | 任务 | `list` / `get` / `create` / `update` / `start` / `finish` / `close` / `activate` / `delete` |
| `execution.js` | 执行 | `list` / `get` / `create` / `update` / `start` / `suspend` / `close` / `link-products` / `delete` |
| `bug.js` | Bug | `list` / `get` / `create` / `update` / `resolve` / `close` / `activate` / `delete` |
| `testcase.js` | 测试用例 | `list` / `get` / `create` / `update` / `delete` |

### 通用选项

- `--dry-run` — 预览操作结果，不实际执行（所有写操作）
- `--limit <N>` — 每页数量，默认 20，最大 1000（所有列表操作）
- `--page <N>` — 页码，从 1 开始（所有列表操作）
- `--yes` — 确认删除，不加则只提示不执行（所有 delete 操作）

## 意图识别规则

### 环境配置
- "配置禅道" / "设置禅道" / "找不到禅道" → 引导配置 `CHANDAO_URL` / `CHANDAO_ACCOUNT` / `CHANDAO_PASSWORD`
- "登录失败" / "认证失败" / "401" → 提示检查环境变量中的账号密码

- "查产品" / "产品列表" / "有哪些产品" → `node scripts/product.js --action list`
- "产品详情" / "看看产品 X" → `node scripts/product.js --action get --id <id>`
- "创建产品" / "新建产品" → `node scripts/product.js --action create --name <name>`
- "更新产品" / "修改产品" / "编辑产品" → `node scripts/product.js --action update --id <id>`
- "删除产品" → `node scripts/product.js --action delete --id <id>`
- "项目集的产品" / "项目集 N 的产品" → `node scripts/product.js --action list-by-program --program N`

#### 产品透传参数
| 用户关键词 | 提取字段 | 取值 |
|-----------|---------|------|
| 正常 | `--type` | `normal` |
| 多分支 | `--type` | `branch` |
| 多平台 | `--type` | `platform` |
| 公开 | `--acl` | `open` |
| 私有 | `--acl` | `private` |

### 项目管理
- "查项目" / "项目列表" / "有哪些项目" → `node scripts/project.js --action list`
- "项目详情" / "看看项目 X" → `node scripts/project.js --action get --id <id>`
- "创建项目" / "新建项目" → `node scripts/project.js --action create --name <name> --model <model> --begin <date> --end <date>`
- "更新项目" / "修改项目" / "编辑项目" → `node scripts/project.js --action update --id <id>`
- "删除项目" → `node scripts/project.js --action delete --id <id>`
- "项目集的项目" / "项目集 N 的项目" → `node scripts/project.js --action list-by-program --program N`

#### 项目透传参数

| 用户关键词 | 提取字段 | 取值 |
|-----------|---------|------|
| 敏捷 / Scrum | `--model` | `scrum` |
| 瀑布 / Waterfall | `--model` | `waterfall` |
| 看板 / Kanban | `--model` | `kanban` |
| 融合敏捷 / Agile Plus | `--model` | `agileplus` |
| 融合瀑布 / Waterfall Plus | `--model` | `waterfallplus` |

### 通用更新规则

**⚠️ 所有更新操作前必须先获取当前值**
禅道 API 的 PUT 请求会将未包含的字段重置为默认值（如优先级会从2变成3）。

**正确流程**（脚本内部已自动实现）：
1. 先 `GET /<module>/<id>` 获取当前值
2. 保留需要保持不变的字段值
3. 只修改需要更新的字段
4. 将所有字段一起发送更新请求

**影响范围**：`story update`、`task update`、`execution update`、`bug update`、`product update`、`project update`、`testcase update` 等所有 update 操作。

**详见**：`references/pitfalls.md` 第 23 条

### 模糊指令处理

- "看下项目" / "查看项目" / "项目详情" **未提供 ID** → 追问用户："请提供项目 ID"
- "更新项目" / "修改项目" **未提供 ID** → 追问用户："请提供项目 ID"
- "删除项目" **未提供 ID** → 追问用户："请提供项目 ID"

### 需求管理
- "列出需求" / "需求列表" → `node scripts/story.js --action list`
- "项目 N 的需求" → `node scripts/story.js --action list --project N`
- "执行 N 的需求" → `node scripts/story.js --action list --execution N`
- "需求详情" / "查看需求" → `node scripts/story.js --action get --id <id>`
- "创建需求" / "新增需求" → `node scripts/story.js --action create --product <id> --title <title>`
- "更新需求" / "修改需求" → `node scripts/story.js --action update --id <id>`
- "激活需求" / "重新打开需求" → `node scripts/story.js --action activate --id <id>`
- "关闭需求" → `node scripts/story.js --action close --id <id> --reason done`
- "变更需求" → `node scripts/story.js --action change --id <id> --reviewer <account>`

**⚠️ 重要：spec/verify 字段格式要求**
- 需求描述（`--spec`）和验收标准（`--verify`）字段**必须使用 HTML 格式**
- 不可使用 Markdown 格式（如 `# 标题`、`**粗体**`、`- 列表`）
- 应使用 HTML 标签（如 `<h2>标题</h2>`、`<strong>粗体</strong>`、`<ul><li>列表</li></ul>`）

#### 需求透传参数
| 用户关键词 | 提取字段 | 取值 |
|-----------|---------|------|
| 功能 | `--category` | `feature` |
| 接口 | `--category` | `interface` |
| 性能 | `--category` | `performance` |
| 安全 | `--category` | `safe` |
| 体验 | `--category` | `experience` |
| 改进 | `--category` | `improve` |
| 客户 | `--source` | `customer` |
| 用户 | `--source` | `user` |

### 任务管理
- "列出任务" / "任务列表" → `node scripts/task.js --action list --execution <id>`
- "任务详情" / "查看任务" → `node scripts/task.js --action get --id <id>`
- "创建任务" / "新建任务" → `node scripts/task.js --action create --execution <id> --name <name>`
- "开始任务" / "认领" → `node scripts/task.js --action start --id <id>`
- "完成任务" → `node scripts/task.js --action finish --id <id> --consumed <hours>`
- "关闭任务" → `node scripts/task.js --action close --id <id>`
- "激活任务" → `node scripts/task.js --action activate --id <id>`
- "删除任务" → `node scripts/task.js --action delete --id <id>`

#### 任务透传参数
| 用户关键词 | 提取字段 | 取值 |
|-----------|---------|------|
| 开发 | `--type` | `devel` |
| 测试 | `--type` | `test` |
| 设计 | `--type` | `design` |
| 讨论 | `--type` | `discuss` |
| 界面/UI | `--type` | `ui` |

### 迭代/执行管理
- "列出执行" / "迭代列表" → `node scripts/execution.js --action list [--project N] [--status all|undone|wait|doing]`
- "执行详情" / "查看迭代" → `node scripts/execution.js --action get --id <id>`
- "创建执行" / "新建迭代" → `node scripts/execution.js --action create --project <id> --name <name> --begin <date> --end <date>`
- "更新执行" / "修改执行" / "编辑执行" → `node scripts/execution.js --action update --id <id>`
- "启动执行" / "启动迭代" → `node scripts/execution.js --action start --id <id>`
- "暂停执行" / "暂停迭代" → `node scripts/execution.js --action suspend --id <id>`
- "关闭执行" / "关闭迭代" → `node scripts/execution.js --action close --id <id>`
- "关联产品" / "绑定产品" → `node scripts/execution.js --action link-products --id <id> --products <ids>`
- "删除执行" / "删除迭代" → `node scripts/execution.js --action delete --id <id>`

#### 执行透传参数
| 用户关键词 | 提取字段 | 取值 |
|-----------|---------|------|
| 敏捷 / Scrum | `--type` | `sprint` |
| 看板 / Kanban | `--type` | `kanban` |
| 短期 | `--lifetime` | `short` |
| 长期 | `--lifetime` | `long` |
| 运维 | `--lifetime` | `ops` |
| 公开 | `--acl` | `open` |
| 私有 | `--acl` | `private` |

### Bug 管理
- "Bug 列表" / "列出 Bug" → `node scripts/bug.js --action list`
- "产品 N 的 Bug" → `node scripts/bug.js --action list --product N`
- "项目 N 的 Bug" → `node scripts/bug.js --action list --project N`
- "执行下的 Bug" / "迭代 Bug" / "执行 N 的 bug" → `node scripts/bug.js --action list --execution <id>`
- "Bug 详情" / "查看 Bug N" → `node scripts/bug.js --action get --id <id>`
- "创建 Bug" / "报 Bug" → `node scripts/bug.js --action create --product <id> --title <title>`
- "修改 Bug" / "编辑 Bug" / "更新 Bug" → `node scripts/bug.js --action update --id <id>`
- "解决 Bug N" → `node scripts/bug.js --action resolve --id <id> --resolution <resolution>`
- "关闭 Bug N" → `node scripts/bug.js --action close --id <id>`
- "重新打开 Bug N" / "激活 Bug N" → `node scripts/bug.js --action activate --id <id> --openedBuild <version|trunk>`
- "删除 Bug N" → `node scripts/bug.js --action delete --id <id>`（需用户确认）

#### Bug 透传参数
| 用户关键词 | 提取字段 | 取值 |
|-----------|---------|------|
| 代码错误 | `--type` | `codeerror` |
| 配置 | `--type` | `config` |
| 安装 | `--type` | `install` |
| 安全 | `--type` | `security` |
| 性能 | `--type` | `performance` |
| 已解决 | `--resolution` | `fixed` |
| 设计如此 | `--resolution` | `bydesign` |
| 无法重现 | `--resolution` | `notrepro` |
| 严重/紧急 | `--severity` | `1` |
| 高 | `--severity` | `2` |
| 中 | `--severity` | `3` |
| 低 | `--severity` | `4` |

### 史诗管理
> 史诗模块暂未实现，后续可按需添加。

### 测试管理
- "测试用例列表" → `node scripts/testcase.js --action list`
- "产品 N 的用例" → `node scripts/testcase.js --action list --product N`
- "项目 N 的测试用例" → `node scripts/testcase.js --action list --project N`
- "执行 N 的测试用例" → `node scripts/testcase.js --action list --execution N`
- "测试用例详情" / "查看用例 N" → `node scripts/testcase.js --action get --id <id>`
- "创建测试用例" → `node scripts/testcase.js --action create --product <id> --title <title> --steps '...'`
- "修改测试用例" / "编辑用例" → `node scripts/testcase.js --action update --id <id>`
- "删除测试用例" / "删除用例 N" → `node scripts/testcase.js --action delete --id <id>`（需用户确认）

**⚠️ 重要：测试用例步骤与预期格式要求**
- 测试用例**必须包含步骤（`--steps`）**，步骤中通过 `expect` 字段指定预期
- 步骤和预期均使用**纯文本**，**禁止使用 HTML 和 Markdown**
- `--steps` 格式：`[{"step": "步骤1", "expect": "期望1", "type": "step"}, ...]`
- `type` 仅支持 `step`

### 项目集管理
> 项目集模块暂未实现，后续可按需添加。

### 发布/版本
> 发布/版本模块暂未实现，后续可按需添加。

### 系统管理
> 系统管理模块暂未实现，后续可按需添加。

## Bug 修复工作流（重要！用户纠正过）

**修复完 Bug 后必须立即更新禅道状态**，不要等所有 Bug 都修完再批量处理。

```bash
# 修复完一个 Bug 后，立即执行：
node scripts/bug.js --action resolve --id <id> --resolution fixed
```

**正确流程**：
1. 读取 Bug 列表，逐个修复
2. 每修完一个 → 编译测试 → 立即 `bug resolve`
3. 全部修完后提交代码、打版本

## 错误处理

| 情况 | 处理 |
|------|------|
| 未配置环境变量 | 提示配置 `CHANDAO_URL` / `CHANDAO_ACCOUNT` / `CHANDAO_PASSWORD` |
| 登录失败 | 提示检查环境变量中的账号密码是否正确 |
| 无数据 | "暂无数据" |
| 网络错误 | 友好提示，不暴露内部细节 |
| `--dry-run` 输出 | 展示将要执行的操作，询问用户是否确认 |
| HTTP 403 | 检查用户角色和模块权限，详见 Pitfalls |

## 关键警告摘要

> 详细说明见 [references/pitfalls.md](references/pitfalls.md)

- ⚠️ API v2 创建接口参数名必须带 `ID` 后缀（如 `executionID`），否则返回 403
- ⚠️ Bug 状态流转必须用专用端点（`bug resolve/close/activate`），`bug update --status` 无效
- ⚠️ Bug 解决建议传 `--assigned-to`（否则清空指派人）和 `--resolved-build`
- ⚠️ `story close` 必须传 `--reason`（枚举：done/subdivided/duplicate/postponed/willnotdo/cancel/bydesign）
- ⚠️ `story change` 必须传 `--reviewer`
- ⚠️ `task finish` 必须传 `--consumed`
- ⚠️ `execution create` 用 `--project`（不是 `--product`）
- ⚠️ `bug list` 没有 `--pri` 参数
- ⚠️ `project create` 必填 `name` + `model` + `begin` + `end`，`model` 取值 `scrum` / `waterfall` / `kanban` / `agileplus` / `waterfallplus`
- ⚠️ `project create/update` 的 `model` 字段与 `execution` 的 `type` 是不同概念，不要混淆
- ⚠️ `execution create` 必填 `project` + `name` + `begin` + `end`，支持 `lifetime`/`days`/`products`/`plans`/`PO`/`QD`/`PM`/`RD`/`acl` 等扩展字段
- ⚠️ `execution update` 必填 `name` + `begin` + `end`，`--project` 用于修改所属项目
- ⚠️ 所有 `delete` 命令需要 `--yes` 确认
- ⚠️ 403 错误可能是参数名错误、用户无角色、或角色缺少模块权限
- ⚠️ **spec/verify 字段必须使用 HTML 格式**：需求描述（`--spec`）和验收标准（`--verify`）字段必须使用 HTML 格式，不可使用 Markdown
- ⚠️ **PUT 请求会重置未包含字段为默认值**：禅道 API 的 PUT 请求会将未包含在请求体中的字段重置为默认值。更新操作前必须先获取当前值，再合并用户指定的字段。详见 `references/pitfalls.md` 第 23 条

## References

| 文件 | 说明 |
|------|------|
| [references/pitfalls.md](references/pitfalls.md) | 完整踩坑记录（23 条） |
| [references/setup.md](references/setup.md) | 安装与配置 |
| [references/help.md](references/help.md) | 常见问题 |
| [references/zentao-v2-api-fields.md](references/zentao-v2-api-fields.md) | v2 API 必填参数速查 |
| [references/zentao-api-v2-quirks.md](references/zentao-api-v2-quirks.md) | API v2 常见坑点 |
| [references/zentao-api-permissions.md](references/zentao-api-permissions.md) | 权限与角色问题 |

## 脚本架构

```
scripts/
├── auth.js         # 共享 HTTP + Token 认证 + 工具函数（所有脚本依赖）
├── product.js      # 产品 CRUD
├── project.js      # 项目 CRUD
├── story.js        # 需求 CRUD + 生命周期
├── task.js         # 任务 CRUD + 生命周期
├── execution.js    # 执行 CRUD + 生命周期
├── bug.js          # Bug CRUD + 生命周期
└── testcase.js     # 测试用例 CRUD
```
