# 产品管理

| 命令 | 描述 |
|------|------|
| `/chandao product list [--browse-type unclosed\|all] [--order-by <field>] [--limit N]` | 列出产品 |
| `/chandao product get <id>` | 产品详情 |
| `/chandao product create --name <name> --code <code> [--program <id>] [--line <id>] [--type normal\|multi-branch\|platform] [--status normal\|closed] [--po <user>] [--qd <user>] [--rd <user>] [--reviewer <user>] [--desc <text>] [--acl open\|private\|custom] [--whitelist <users>]` | 创建产品 |
| `/chandao product update <id> [--name <name>] [--code <code>] [--program <id>] [--type <type>] [--status <status>] [--po <user>] [--qd <user>] [--rd <user>] [--desc <text>]` | 更新产品 |
| `/chandao product delete <id>` | 删除产品 |
| `/chandao product list-by-program <id>` | 按项目集列出产品 |
