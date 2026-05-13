# 产品管理命令

| 命令 | 描述 |
|------|------|
| `/chandao product list [--browse-type <type>] [--order-by <field>] [--limit N] [--page N]` | 列出产品 |
| `/chandao product get <id>` | 产品详情 |
| `/chandao product create --name <name> --code <code> [--type <type>] [--program <id>] [--line <id>] [--status <status>] [--po <account>] [--qd <account>] [--rd <account>] [--reviewer <accounts>] [--desc <desc>] [--acl <acl>] [--whitelist <users>]` | 创建产品 |
| `/chandao product update <id> [--name <name>] [--code <code>] [--type <type>] [--program <id>] [--line <id>] [--status <status>] [--po <account>] [--qd <account>] [--rd <account>] [--reviewer <accounts>] [--desc <desc>] [--acl <acl>] [--whitelist <users>]` | 更新产品 |
| `/chandao product delete <id>` | 删除产品 |
| `/chandao product list-by-program --program <id> [--limit N] [--page N]` | 按项目集列出产品 |
