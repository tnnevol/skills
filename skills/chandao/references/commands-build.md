# 构建/版本管理

| 命令 | 描述 |
|------|------|
| `/chandao build list [--project <id>] [--execution <id>] [--limit N]` | 列出版本 |
| `/chandao build list-by-project <id>` | 按项目列出版本 |
| `/chandao build list-by-execution <id>` | 按执行列出版本 |
| `/chandao build create --execution <id> --name <name> --project <id> [--desc <text>] [--scm-path <path>] [--file-path <path>] [--builder <account>] [--date <YYYY-MM-DD>] [--link-bug <ids>] [--link-story <ids>]` | 创建版本 |
| `/chandao build update <id> [--name <name>] [--desc <text>] [--scm-path <path>] [--file-path <path>] [--builder <account>] [--date <YYYY-MM-DD>] [--status <status>]` | 更新版本 |
| `/chandao build delete <id>` | 删除版本 |
