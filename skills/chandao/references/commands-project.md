# 项目管理

| 命令 | 描述 |
|------|------|
| `/chandao project list [--limit N] [--page N]` | 列出项目 |
| `/chandao project get <id>` | 项目详情 |
| `/chandao project create --name <name> --code <code> [--type sprint\|stage\|kanban] [--parent <id>] [--begin <YYYY-MM-DD>] [--end <YYYY-MM-DD>] [--status wait\|doing\|suspended\|closed] [--desc <text>] [--budget <hours>] [--products <id1,id2>] [--pm <account>]` | 创建项目 |
| `/chandao project update <id> [--name <name>] [--code <code>] [--type <type>] [--begin <date>] [--end <date>] [--status <status>] [--desc <text>] [--budget <hours>] [--pm <account>]` | 更新项目 |
| `/chandao project delete <id>` | 删除项目 |
| `/chandao project list-by-program <id>` | 按项目集列出项目 |
