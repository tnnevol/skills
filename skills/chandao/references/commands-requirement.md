# 用户需求管理命令

| 命令 | 描述 |
|------|------|
| `/chandao requirement list --product <id> [--browse <type>] [--limit N] [--page N]` | 列出用户需求（**必须**指定 `--product`） |
| `/chandao requirement list-by-product --product <id> [--browse <type>] [--limit N] [--page N]` | 按产品列出用户需求 |
| `/chandao requirement get <id>` | 用户需求详情 |
| `/chandao requirement create --product <id> --title <title> [--spec <desc>] [--verify <criteria>] [--module <id>] [--pri 1-4] [--source <source>] [--assigned <user>] [--estimate <hours>]` | 创建用户需求 |
| `/chandao requirement update <id> [--title <title>] [--desc <desc>] [--module <id>] [--pri 1-4] [--assigned <user>] [--status <status>]` | 更新用户需求 |
| `/chandao requirement change <id> --reviewer <account> [--title <title>] [--spec <desc>] [--verify <criteria>]` | 变更需求（**必须**指定 `--reviewer`） |
| `/chandao requirement close <id> --reason done\|duplicate\|postponed\|willnotfix\|bydesign` | 关闭用户需求（**必须**指定 `--reason`） |
| `/chandao requirement activate <id>` | 激活已关闭的需求 |
| `/chandao requirement delete <id>` | 删除用户需求 |
