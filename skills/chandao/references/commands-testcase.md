# 测试用例管理

| 命令 | 描述 |
|------|------|
| `/chandao testcase list [--product <id>] [--limit N]` | 列出测试用例 |
| `/chandao testcase get <id>` | 测试用例详情 |
| `/chandao testcase create --product <id> --title <title> [--project <id>] [--execution <id>] [--module <id>] [--type feature\|performance\|config\|interface\|security\|other\|unit\|install] [--stage unit\|feature\|intergr\|system\|accept\|others] [--pri 1-4] [--precondition <text>] [--steps <json>] [--story <id>]` | 创建测试用例 |
| `/chandao testcase update <id> [--title <title>] [--status <status>] [--pri 1-4] [--type <type>] [--precondition <text>] [--steps <json>] [--story <id>]` | 更新测试用例 |
| `/chandao testcase delete <id>` | 删除测试用例 |
