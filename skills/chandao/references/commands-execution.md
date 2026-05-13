# 执行/迭代管理

| 命令 | 描述 |
|------|------|
| `/chandao execution list [--project <id>] [--status wait\|doing\|suspended\|closed] [--limit N]` | 列出执行 |
| `/chandao execution get <id>` | 获取执行详情 |
| `/chandao execution create --project <id> --name <name> --begin <YYYY-MM-DD> --end <YYYY-MM-DD> [--code <code>] [--desc <text>]` | 创建执行 |
| `/chandao execution update <id> [--name <name>] [--desc <text>] [--status wait\|doing\|closed\|suspended]` | 更新执行 |
| `/chandao execution start <id>` | 启动执行 |
| `/chandao execution suspend <id>` | 暂停执行 |
| `/chandao execution close <id>` | 关闭执行 |
| `/chandao execution link-products <id> --products <ID1,ID2>` | 关联产品到执行 |
| `/chandao execution delete <id>` | 删除执行 |
