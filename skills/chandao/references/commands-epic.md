# 史诗管理命令

| 命令 | 描述 |
|------|------|
| `/chandao epic list --product <id> [--browse <type>] [--limit N] [--page N]` | 列出史诗（**必须**指定 `--product`） |
| `/chandao epic list-by-product --product <id> [--browse <type>] [--limit N] [--page N]` | 按产品列出史诗 |
| `/chandao epic get <id>` | 史诗详情 |
| `/chandao epic create --product <id> --title <title> [--spec <desc>] [--verify <criteria>] [--module <id>] [--pri 1-4] [--source <source>] [--assigned <user>] [--estimate <hours>]` | 创建史诗 |
| `/chandao epic update <id> [--title <title>] [--desc <desc>] [--module <id>] [--pri 1-4] [--assigned <user>] [--status <status>]` | 更新史诗 |
| `/chandao epic change <id> --reviewer <account> [--title <title>] [--spec <desc>] [--verify <criteria>]` | 变更史诗（**必须**指定 `--reviewer`） |
| `/chandao epic close <id> --reason done\|duplicate\|postponed\|willnotfix\|bydesign` | 关闭史诗（**必须**指定 `--reason`） |
| `/chandao epic activate <id>` | 激活已关闭的史诗 |
| `/chandao epic delete <id>` | 删除史诗 |
