# 测试单管理

| 命令 | 描述 |
|------|------|
| `/chandao testtask list --product <id> [--browse all\|unfinished\|blocked] [--limit N]` | 列出测试单 |
| `/chandao testtask list-by-product <id>` | 按产品列出测试单 |
| `/chandao testtask list-by-project <id>` | 按项目列出测试单 |
| `/chandao testtask list-by-execution <id>` | 按执行列出测试单 |
| `/chandao testtask create --product <id> --name <name> --build <id> --begin <YYYY-MM-DD> --end <YYYY-MM-DD> [--project <id>] [--execution <id>] [--assigned <user>] [--pri 1-4] [--desc <text>] [--status wait\|doing\|blocked\|done] [--module <id>] [--report <text>] [--mailto <users>] [--stories <ids>]` | 创建测试单 |
| `/chandao testtask update <id> [--name <name>] [--assigned <user>] [--pri 1-4] [--status <status>] [--desc <text>]` | 更新测试单 |
| `/chandao testtask delete <id>` | 删除测试单 |
