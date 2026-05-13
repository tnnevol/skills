# 项目管理命令

| 命令 | 描述 |
|------|------|
| `/chandao project list [--browse-type <type>] [--order-by <field>] [--limit N] [--page N]` | 列出项目 |
| `/chandao project get <id>` | 项目详情 |
| `/chandao project create --name <name> --code <code> [--type <type>] [--begin <date>] [--end <date>] [--parent <id>] [--status <status>] [--desc <desc>] [--budget <hours>] [--products <ids>] [--pm <account>]` | 创建项目 |
| `/chandao project update <id> [--name <name>] [--code <code>] [--type <type>] [--begin <date>] [--end <date>] [--parent <id>] [--status <status>] [--desc <desc>] [--budget <hours>] [--products <ids>] [--pm <account>]` | 更新项目 |
| `/chandao project delete <id>` | 删除项目 |
| `/chandao project list-by-program --program <id> [--limit N] [--page N]` | 按项目集列出项目 |
