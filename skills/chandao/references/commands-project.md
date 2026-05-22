# 项目管理命令

## 列表

| 命令 | 描述 |
|------|------|
| `/chandao project list [--browse-type <type>] [--order-by <field>] [--limit N] [--page N]` | 列出项目 |
| `/chandao project get <id>` | 项目详情 |
| `/chandao project create --name <name> --code <code> --model <model> --begin <date> --end <date> [--parent <id>] [--status <status>] [--desc <desc>] [--budget <hours>] [--products <ids>] [--pm <account>]` | 创建项目 |
| `/chandao project update <id> [--name <name>] [--code <code>] [--model <model>] [--begin <date>] [--end <date>] [--parent <id>] [--status <status>] [--desc <desc>] [--budget <hours>] [--products <ids>] [--pm <account>]` | 更新项目 |
| `/chandao project delete <id>` | 删除项目 |
| `/chandao project list-by-program --program <id> [--limit N] [--page N]` | 按项目集列出项目 |

## 详细参数说明

### `/chandao project create`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `--name` | string | ✅ | 项目名称 |
| `--code` | string | ✅ | 项目代号 |
| `--model` | string | ✅ | 管理方式：`scrum` / `waterfall` / `kanban` / `agileplus` / `waterfallplus` |
| `--begin` | date | ✅ | 开始日期（YYYY-MM-DD） |
| `--end` | date | ✅ | 结束日期（YYYY-MM-DD） |
| `--parent` | int | ❌ | 所属项目集 ID |
| `--status` | string | ❌ | 状态：`wait`(默认) / `doing` / `suspended` / `closed` |
| `--desc` | string | ❌ | 项目描述 |
| `--budget` | float | ❌ | 预算 |
| `--products` | array[int] | ❌ | 关联产品 ID（逗号分隔） |
| `--pm` | string | ❌ | 项目负责人账号 |
| `--dry-run` | flag | ❌ | 模拟运行，不实际执行 |

**注意：**
- `model` 是 ZenTao API v2 创建项目的必填字段，与执行（execution）的 `type` 字段概念不同
- `缺省日期`是不可能的，必须指定 `begin` 和 `end`

### `/chandao project update <id>`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | int | ✅ | 项目 ID（位置参数） |
| `--name` | string | ✅ | 项目名称 |
| `--model` | string | ✅ | 管理方式：`scrum` / `waterfall` / `kanban` / `agileplus` / `waterfallplus` |
| `--begin` | date | ✅ | 开始日期（YYYY-MM-DD） |
| `--end` | date | ✅ | 结束日期（YYYY-MM-DD） |
| `--code` | string | ❌ | 项目代号 |
| `--parent` | int | ❌ | 所属项目集 ID |
| `--status` | string | ❌ | 状态 |
| `--desc` | string | ❌ | 项目描述 |
| `--budget` | float | ❌ | 预算 |
| `--products` | array[int] | ❌ | 关联产品 ID |
| `--pm` | string | ❌ | 项目负责人 |
| `--dry-run` | flag | ❌ | 模拟运行 |

### `/chandao project list`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `--browse-type` | string | ❌ | 筛选状态：`undone`(默认) / `all` / `unclosed` / `wait` / `doing` |
| `--order-by` | string | ❌ | 排序：`id_desc`(默认) / `name_asc` / `begin_asc` / `end_asc` |
| `--page` | int | ❌ | 页码，从 1 开始 |
| `--limit` | int | ❌ | 每页数量，默认 20，最大 1000 |

### `/chandao project list-by-program <program>`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `program` | int | ✅ | 项目集 ID（位置参数） |
| `--page` | int | ❌ | 页码 |
| `--limit` | int | ❌ | 每页数量 |

### `/chandao project get <id>`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | int | ✅ | 项目 ID |

### `/chandao project delete <id>`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | int | ✅ | 项目 ID |
| `--yes` | flag | ✅ | 跳过确认提示（安全机制） |
| `--dry-run` | flag | ❌ | 模拟运行 |
