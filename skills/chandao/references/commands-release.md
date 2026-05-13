# 发布管理

| 命令 | 描述 |
|------|------|
| `/chandao release list` | 列出所有发布 |
| `/chandao release list-by-product <id>` | 按产品列出发布 |
| `/chandao release create --product <id> --build <id> --name <name> [--date <YYYY-MM-DD>] [--released-by <account>] [--mailto <users>] [--notify true\|false] [--desc <text>] [--link-bug <ids>] [--link-story <ids>]` | 创建发布 |
| `/chandao release update <id> [--name <name>] [--desc <text>] [--status <status>] [--date <YYYY-MM-DD>] [--released-by <account>]` | 更新发布 |
| `/chandao release delete <id>` | 删除发布 |
