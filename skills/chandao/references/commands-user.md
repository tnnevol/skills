# 用户管理命令

| 命令 | 描述 |
|------|------|
| `/chandao user list [--order-by <field>] [--limit N] [--page N]` | 列出用户 |
| `/chandao user get <id>` | 用户详情（数字 ID 或账号名） |
| `/chandao user create --account <account> --realname <name> --password <pwd>` | 创建用户 |
| `/chandao user update <id> [--realname <name>] [--password <pwd>] [--email <email>] [--phone <phone>] [--role <role>]` | 更新用户 |
| `/chandao user delete <id>` | 删除用户 |

> `user get` 支持数字 ID 和字符串账号名，但账号名不稳定，优先用数字 ID。
> `user create` 的 `--account`、`--realname`、`--password` 均为必填。
