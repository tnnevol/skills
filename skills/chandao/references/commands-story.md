# 需求管理

| 命令 | 描述 |
|------|------|
| `/chandao story list [--product <id>] [--limit N]` | 列出需求 |
| `/chandao story get <id>` | 获取需求详情 |
| `/chandao story create --product <id> --title <title> [--spec <desc>] [--verify <criteria>] [--module <id>] [--pri 1-4] [--source <source>] [--assigned <user>] [--reviewer <account>] [--estimate <hours>]` | 创建需求 |
| `/chandao story update <id> [--title <title>] [--desc <desc>] [--module <id>] [--pri 1-4] [--assigned <user>] [--status <status>]` | 更新需求 |
| `/chandao story review <id> --result pass\|reject` | 评审需求 |
| `/chandao story close <id>` | 关闭需求 |
| `/chandao story activate <id>` | 激活已关闭的需求 |
| `/chandao story delete <id>` | 删除需求 |
| `/chandao story change <id> [--spec <desc>]` | 变更需求（提交评审） |
