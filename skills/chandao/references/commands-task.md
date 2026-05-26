# 任务管理命令

| 命令 | 描述 |
|------|------|
| `/chandao task list [--execution <id>] [--limit N] [--page N]` | 列出任务 |
| `/chandao task get <id>` | 获取任务详情 |
| `/chandao task create --execution <id> --name <name> [--type <type>] [--assigned <user>] [--est-started <date>] [--deadline <date>] [--pri 1-4] [--estimate <hours>] [--module <id>] [--story <id>] [--desc <desc>]` | 创建任务 |
| `/chandao task update <id> [--name <name>] [--assigned <user>] [--pri 1-4] [--status <status>] [--estimate <hours>] [--consumed <hours>]` | 更新任务 |
| `/chandao task start <id> [--consumed <hours>] [--left <hours>]` | 开始任务（状态→进行中） |
| `/chandao task finish <id> --consumed <hours> [--real-started <date>] [--finished-date <date>]` | 完成任务（**必须**指定 `--consumed`） |
| `/chandao task close <id> [--reason <reason>]` | 关闭任务 |
| `/chandao task activate <id> [--comment <text>]` | 激活已关闭的任务 |
| `/chandao task delete <id>` | 删除任务 |

## 详细参数说明

### `/chandao task create`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `--execution` | int | ✅ | 所属执行 ID |
| `--name` | string | ✅ | 任务名称 |
| `--type` | string | ❌ | 任务类型：`devel` / `test` / `design` / `discuss` / `ui` |
| `--assigned` | string | ❌ | 指派给 |
| `--est-started` | date | ❌ | 预计开始日期（YYYY-MM-DD） |
| `--deadline` | date | ❌ | 截止日期（YYYY-MM-DD） |
| `--pri` | int | ❌ | 优先级（1-4） |
| `--estimate` | number | ❌ | 预计工时（小时） |
| `--module` | int | ❌ | 所属模块 ID |
| `--story` | int | ❌ | 相关需求 ID |
| `--desc` | string | ❌ | 任务描述 |
| `--dry-run` | flag | ❌ | 模拟运行 |

### `/chandao task update <id>`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | int | ✅ | 任务 ID |
| `--name` | string | ❌ | 任务名称 |
| `--assigned` | string | ❌ | 指派给 |
| `--pri` | int | ❌ | 优先级（1-4） |
| `--status` | string | ❌ | 状态 |
| `--estimate` | number | ❌ | 预计工时（小时） |
| `--consumed` | number | ❌ | 已消耗工时（小时） |
| `--dry-run` | flag | ❌ | 模拟运行 |

### `/chandao task start <id>`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | int | ✅ | 任务 ID |
| `--consumed` | number | ❌ | 已消耗工时（小时） |
| `--left` | number | ❌ | 剩余工时（小时） |
| `--dry-run` | flag | ❌ | 模拟运行 |

### `/chandao task finish <id>`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | int | ✅ | 任务 ID |
| `--consumed` | number | ✅ | 已消耗工时（小时） |
| `--real-started` | date | ❌ | 实际开始日期（YYYY-MM-DD） |
| `--finished-date` | date | ❌ | 实际完成日期（YYYY-MM-DD） |
| `--dry-run` | flag | ❌ | 模拟运行 |

### 其他命令

| 命令 | 参数 | 必填 | 说明 |
|------|------|------|------|
| `get <id>` | `id` | ✅ | 任务 ID |
| `close <id>` | `id`, `--reason` | ✅ | 关闭任务 |
| `activate <id>` | `id`, `--comment` | ❌ | 激活已关闭的任务 |
| `delete <id>` | `id`, `--yes` | ✅ | 删除任务 |
