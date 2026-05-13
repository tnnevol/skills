# 用户管理

| 命令 | 描述 |
|------|------|
| `/chandao user list [--order-by <field>] [--limit N] [--page N]` | 列出用户（order-by: id_desc, account_asc 等） |
| `/chandao user get <id\|account>` | 用户详情（支持 ID 或账号名） |
| `/chandao user create --account <account> --realname <name> --password <password>` | 创建用户 |
| `/chandao user update <id> [--realname <name>] [--role <role>]` | 更新用户 |
| `/chandao user delete <id>` | 删除用户 |
