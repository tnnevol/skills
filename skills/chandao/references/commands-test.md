# 测试管理命令

## 测试用例

| 命令 | 描述 |
|------|------|
| `/chandao testcase list [--product <id>] [--limit N] [--page N]` | 列出测试用例 |
| `/chandao testcase get <id>` | 测试用例详情 |
| `/chandao testcase create --product <id> --title <title> [--project <id>] [--execution <id>] [--module <id>] [--type <type>] [--stage <stage>] [--pri 1-4] [--precondition <text>] [--steps <json>] [--expect <text>] [--step-type step\|group] [--story <id>]` | 创建测试用例 |
| `/chandao testcase update <id> [--title <title>] [--status <status>] [--pri 1-4] [--type <type>] [--precondition <text>] [--steps <json>] [--story <id>]` | 更新测试用例 |
| `/chandao testcase delete <id>` | 删除测试用例 |

> type 可选值：`feature|performance|config|interface|security|other|unit|install`
> stage 可选值：`unit|feature|intergr|system|accept|others`

## 测试单

| 命令 | 描述 |
|------|------|
| `/chandao testtask list --product <id> [--browse all\|unfinished\|blocked] [--limit N] [--page N]` | 列出测试单（**必须**指定 `--product`） |
| `/chandao testtask list-by-product --product <id> [--browse <type>] [--limit N] [--page N]` | 按产品列出测试单 |
| `/chandao testtask list-by-project --project <id> [--limit N] [--page N]` | 按项目列出测试单 |
| `/chandao testtask list-by-execution --execution <id> [--limit N] [--page N]` | 按执行列出测试单 |
| `/chandao testtask create --product <id> --name <name> --build <id> --begin <date> --end <date> [--project <id>] [--execution <id>] [--assigned <user>] [--pri 1-4] [--desc <desc>] [--status <status>] [--module <id>] [--report <report>] [--mailto <accounts>] [--stories <ids>] [--linkcases <cases>]` | 创建测试单 |
| `/chandao testtask update <id> [--name <name>] [--assigned <user>] [--pri 1-4] [--status <status>] [--desc <desc>]` | 更新测试单 |
| `/chandao testtask delete <id>` | 删除测试单 |
