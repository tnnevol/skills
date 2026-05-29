# 执行/迭代管理命令

## 列表

| 命令                                                                                                                                                                                                                                                                                           | 描述         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `/chandao execution list [--project <id>] [--status <status>] [--order-by <field>] [--limit N] [--page N]`                                                                                                                                                                                     | 列出执行     |
| `/chandao execution get <id>`                                                                                                                                                                                                                                                                  | 获取执行详情 |
| `/chandao execution create --project <id> --name <name> --begin <date> --end <date> [--lifetime <type>] [--days <n>] [--products <ids>] [--plans <json>] [--po <account>] [--qd <account>] [--pm <account>] [--rd <account>] [--acl open\|private]`                                            | 创建执行     |
| `/chandao execution update <id> --name <name> --begin <date> --end <date> [--project <id>] [--lifetime <type>] [--days <n>] [--products <ids>] [--plans <json>] [--po <account>] [--qd <account>] [--pm <account>] [--rd <account>] [--acl open\|private] [--desc <desc>] [--status <status>]` | 更新执行     |
| `/chandao execution start <id>`                                                                                                                                                                                                                                                                | 启动执行     |
| `/chandao execution suspend <id>`                                                                                                                                                                                                                                                              | 暂停执行     |
| `/chandao execution close <id>`                                                                                                                                                                                                                                                                | 关闭执行     |
| `/chandao execution delete <id>`                                                                                                                                                                                                                                                               | 删除执行     |

> ⚠️ `execution create` 的参数是 `--project`（不是 `--product`）。

> ⚠️ **关联产品说明**：
> - ✅ 在 `create` 或 `update` 时使用 `--products` 参数关联产品
> - ❌ `link-products` 命令**不支持**（禅道 API 返回 403 权限错误）
> - 📝 迭代必须先关联项目，只能关联项目已关联的产品

## 详细参数说明

### `/chandao execution create`

| 参数         | 类型       | 必填 | 说明                                         |
| ------------ | ---------- | ---- | -------------------------------------------- |
| `--project`  | int        | ✅    | 所属项目 ID                                  |
| `--name`     | string     | ✅    | 执行名称                                     |
| `--begin`    | date       | ✅    | 开始日期（YYYY-MM-DD）                       |
| `--end`      | date       | ✅    | 结束日期（YYYY-MM-DD）                       |
| `--lifetime` | string     | ❌    | 执行类型：`short` / `long` / `ops`           |
| `--days`     | int        | ❌    | 可用工作日                                   |
| `--products` | array[int] | ❌    | 关联产品 ID（逗号分隔）                      |
| `--plans`    | JSON       | ❌    | 关联计划映射，格式 `{"productId": [planId]}` |
| `--po`       | string     | ❌    | 产品负责人账号                               |
| `--qd`       | string     | ❌    | 测试负责人账号                               |
| `--pm`       | string     | ❌    | 执行负责人账号                               |
| `--rd`       | string     | ❌    | 发布负责人账号                               |
| `--acl`      | string     | ❌    | 访问控制：`open` / `private`                 |
| `--dry-run`  | flag       | ❌    | 模拟运行                                     |

### `/chandao execution update <id>`

| 参数         | 类型       | 必填 | 说明                                      |
| ------------ | ---------- | ---- | ----------------------------------------- |
| `id`         | int        | ✅    | 执行 ID                                   |
| `--name`     | string     | ✅    | 执行名称                                  |
| `--begin`    | date       | ✅    | 开始日期                                  |
| `--end`      | date       | ✅    | 结束日期                                  |
| `--project`  | int        | ❌    | 所属项目 ID                               |
| `--lifetime` | string     | ❌    | 执行类型                                  |
| `--days`     | int        | ❌    | 可用工作日                                |
| `--products` | array[int] | ❌    | 关联产品 ID                               |
| `--plans`    | JSON       | ❌    | 关联计划映射                              |
| `--po`       | string     | ❌    | 产品负责人                                |
| `--qd`       | string     | ❌    | 测试负责人                                |
| `--pm`       | string     | ❌    | 执行负责人                                |
| `--rd`       | string     | ❌    | 发布负责人                                |
| `--acl`      | string     | ❌    | 访问控制                                  |
| `--desc`     | string     | ❌    | 描述                                      |
| `--status`   | string     | ❌    | 状态：`wait`/`doing`/`closed`/`suspended` |
| `--dry-run`  | flag       | ❌    | 模拟运行                                  |

### `/chandao execution list`

| 参数         | 类型   | 必填 | 说明                                                              |
| ------------ | ------ | ---- | ----------------------------------------------------------------- |
| `--project`  | int    | ❌    | 按项目 ID 筛选                                                    |
| `--status`   | string | ❌    | 状态筛选：`undone`(默认) / `all` / `wait` / `doing`               |
| `--order-by` | string | ❌    | 排序：`rawID_asc`(默认) / `nameCol_asc` / `begin_asc` / `end_asc` |
| `--page`     | int    | ❌    | 页码，从 1 开始                                                   |
| `--limit`    | int    | ❌    | 每页数量，默认 20，最大 1000                                      |

### 其他命令

| 命令           | 参数          | 必填 | 说明                  |
| -------------- | ------------- | ---- | --------------------- |
| `get <id>`     | `id`          | ✅    | 执行 ID               |
| `start <id>`   | `id`          | ✅    | 启动执行              |
| `suspend <id>` | `id`          | ✅    | 暂停执行              |
| `close <id>`   | `id`          | ✅    | 关闭执行              |
| `delete <id>`  | `id`, `--yes` | ✅    | 删除，需 `--yes` 确认 |

> ❌ **注意**：`link-products` 命令已移除（禅道 API 不支持），请使用 `create` 或 `update` 的 `--products` 参数替代。

### ⚠️ 更新操作前必须先获取当前值

**问题**：禅道 API 的 PUT 请求会将未包含的字段重置为默认值。

**正确流程**：
1. 先执行 `<module> get <id>` 获取当前值
2. 保留需要保持不变的字段值
3. 只修改需要更新的字段
4. 将所有字段一起发送更新请求

**详见**：`references/pitfalls.md` 第 23 条
