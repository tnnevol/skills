# 产品管理命令

## 列表

| 命令 | 描述 |
|------|------|
| `/chandao product list [--browse-type <type>] [--order-by <field>] [--limit N] [--page N]` | 列出产品 |
| `/chandao product get <id>` | 产品详情 |
| `/chandao product create --name <name> --code <code> [--type <type>] [--program <id>] [--line <id>] [--status <status>] [--po <account>] [--qd <account>] [--rd <account>] [--reviewer <accounts>] [--desc <desc>] [--acl <acl>] [--whitelist <users>]` | 创建产品 |
| `/chandao product update <id> [--name <name>] [--code <code>] [--type <type>] [--program <id>] [--line <id>] [--status <status>] [--po <account>] [--qd <account>] [--rd <account>] [--reviewer <accounts>] [--desc <desc>] [--acl <acl>] [--whitelist <users>]` | 更新产品 |
| `/chandao product delete <id>` | 删除产品 |
| `/chandao product list-by-program --program <id> [--limit N] [--page N]` | 按项目集列出产品 |

## 详细参数说明

### `/chandao product create`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `--name` | string | ✅ | 产品名称 |
| `--code` | string | ✅ | 产品代号 |
| `--type` | string | ❌ | 产品类型：`normal`(默认) / `branch` / `platform` |
| `--program` | int | ❌ | 所属项目集 ID |
| `--line` | int | ❌ | 所属产品线 ID |
| `--status` | string | ❌ | 状态：`normal`(默认) / `closed` |
| `--po` | string | ❌ | 产品负责人账号 |
| `--qd` | string | ❌ | 测试负责人账号 |
| `--rd` | string | ❌ | 发布负责人账号 |
| `--reviewer` | string | ❌ | 评审人账号（多个逗号分隔） |
| `--desc` | string | ❌ | 产品描述 |
| `--acl` | string | ❌ | 访问控制：`open`(默认) / `private` / `custom` |
| `--whitelist` | array[string] | ❌ | 白名单用户（逗号分隔） |
| `--dry-run` | flag | ❌ | 模拟运行 |

### `/chandao product update <id>`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | int | ✅ | 产品 ID |
| `--name` | string | ❌ | 产品名称 |
| `--code` | string | ❌ | 产品代号 |
| `--type` | string | ❌ | 产品类型 |
| `--program` | int | ❌ | 所属项目集 ID |
| `--line` | int | ❌ | 所属产品线 ID |
| `--status` | string | ❌ | 状态 |
| `--po` | string | ❌ | 产品负责人 |
| `--qd` | string | ❌ | 测试负责人 |
| `--rd` | string | ❌ | 发布负责人 |
| `--reviewer` | string | ❌ | 评审人 |
| `--desc` | string | ❌ | 产品描述 |
| `--acl` | string | ❌ | 访问控制 |
| `--whitelist` | array[string] | ❌ | 白名单用户 |
| `--dry-run` | flag | ❌ | 模拟运行 |

### `/chandao product list`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `--browse-type` | string | ❌ | 筛选状态：`noclosed`(默认) / `all` / `closed` |
| `--order-by` | string | ❌ | 排序：`id_desc`(默认) / `title_asc` / `begin_asc` / `end_asc` |
| `--page` | int | ❌ | 页码，从 1 开始 |
| `--limit` | int | ❌ | 每页数量，默认 20，最大 1000 |

### `/chandao product get <id>`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | int | ✅ | 产品 ID |

### `/chandao product list-by-program --program <id>`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `--program` | int | ✅ | 项目集 ID |
| `--page` | int | ❌ | 页码 |
| `--limit` | int | ❌ | 每页数量 |

### `/chandao product delete <id>`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | int | ✅ | 产品 ID |
| `--yes` | flag | ✅ | 跳过确认提示（安全机制） |
| `--dry-run` | flag | ❌ | 模拟运行 |
