# 执行/迭代管理命令

| 命令 | 描述 |
|------|------|
| `/chandao execution list [--project <id>] [--limit N] [--page N]` | 列出执行 |
| `/chandao execution get <id>` | 获取执行详情 |
| `/chandao execution create --project <id> --name <name> --begin <date> --end <date> [--code <code>] [--desc <desc>]` | 创建执行 |
| `/chandao execution update <id> [--name <name>] [--desc <desc>] [--status wait\|doing\|closed\|suspended]` | 更新执行 |
| `/chandao execution start <id>` | 启动执行 |
| `/chandao execution suspend <id>` | 暂停执行 |
| `/chandao execution close <id>` | 关闭执行 |
| `/chandao execution link-products <id> --products <ID1,ID2> [--plans <json>]` | 关联产品到执行 |
| `/chandao execution delete <id>` | 删除执行 |

> ⚠️ `execution create` 的参数是 `--project`（不是 `--product`）。
