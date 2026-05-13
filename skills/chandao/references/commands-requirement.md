# 用户需求管理

| 命令 | 描述 |
|------|------|
| `/chandao requirement list --product <id> [--browse allstory\|assignedtome\|openedbyme\|reviewedbyme\|draftstory] [--limit N]` | 列出用户需求 |
| `/chandao requirement list-by-product <id> [--limit N]` | 按产品列出用户需求 |
| `/chandao requirement get <id>` | 用户需求详情 |
| `/chandao requirement create --product <id> --title <title> [--spec <desc>] [--verify <criteria>] [--module <id>] [--pri 1-4] [--source <source>] [--assigned <user>] [--estimate <hours>]` | 创建用户需求 |
| `/chandao requirement update <id> [--title <title>] [--desc <desc>] [--module <id>] [--pri 1-4] [--assigned <user>] [--status <status>]` | 更新用户需求 |
| `/chandao requirement close <id>` | 关闭用户需求 |
| `/chandao requirement activate <id>` | 激活已关闭的需求 |
| `/chandao requirement delete <id>` | 删除用户需求 |
| `/chandao requirement change <id>` | 变更需求（提交评审） |
