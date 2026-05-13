# 版本/发布/计划管理命令

## 构建/版本

| 命令 | 描述 |
|------|------|
| `/chandao build list [--project <id>] [--execution <id>] [--limit N] [--page N]` | 列出版本（需指定 `--project` 或 `--execution`） |
| `/chandao build list-by-project --project <id> [--limit N] [--page N]` | 按项目列出版本 |
| `/chandao build list-by-execution --execution <id> [--limit N] [--page N]` | 按执行列出版本 |
| `/chandao build create --execution <id> --name <name> --project <id> [--desc <desc>] [--scm-path <path>] [--file-path <path>] [--builder <account>] [--date <date>] [--link-bug <ids>] [--link-story <ids>]` | 创建版本 |
| `/chandao build update <id> [--name <name>] [--desc <desc>] [--scm-path <path>] [--file-path <path>] [--builder <account>] [--date <date>] [--status <status>]` | 更新版本 |
| `/chandao build delete <id>` | 删除版本 |

## 发布

| 命令 | 描述 |
|------|------|
| `/chandao release list [--limit N] [--page N]` | 列出所有发布 |
| `/chandao release list-by-product --product <id> [--limit N] [--page N]` | 按产品列出发布 |
| `/chandao release create --product <id> --build <id> --name <name> [--date <date>] [--released-by <account>] [--mailto <accounts>] [--notify true\|false] [--desc <desc>] [--link-bug <ids>] [--link-story <ids>]` | 创建发布 |
| `/chandao release update <id> [--name <name>] [--desc <desc>] [--status <status>] [--date <date>] [--released-by <account>] [--mailto <accounts>]` | 更新发布 |
| `/chandao release delete <id>` | 删除发布 |

> ⚠️ `release create` 的 `--product`、`--build`、`--name` 均为必填。

## 产品计划

| 命令 | 描述 |
|------|------|
| `/chandao productplan list --product <id> [--limit N] [--page N]` | 列出计划（**必须**指定 `--product`） |
| `/chandao productplan list-by-product --product <id> [--limit N] [--page N]` | 按产品列出计划 |
| `/chandao productplan get <id>` | 计划详情 |
| `/chandao productplan create --product <id> --title <title> [--desc <desc>] [--begin <date>] [--end <date>]` | 创建计划 |
| `/chandao productplan update <id> [--title <title>] [--desc <desc>] [--begin <date>] [--end <date>]` | 更新计划 |
| `/chandao productplan delete <id>` | 删除计划 |
