# 需求管理命令

| 命令 | 描述 |
|------|------|
| `/chandao story list [--product <id>] [--project <id>] [--execution <id>] [--browse-type all\|unclosed\|bysearch] [--order-by <field>] [--limit N] [--page N]` | 列出需求（支持按产品/项目/执行筛选） |
| `/chandao story get <id>` | 获取需求详情 |
| `/chandao story create --product <id> --title <title> [--spec <desc>] [--verify <criteria>] [--module <id>] [--parent <id>] [--pri 1-4] [--category <type>] [--source <source>] [--assigned <user>] [--reviewer <account>] [--estimate <hours>] [--project <id>] [--execution <id>]` | 创建需求 |
| `/chandao story update <id> [--title <title>] [-S <spec>] [--module <id>] [--parent <id>] [--pri 1-4] [--category <type>] [--source <source>] [--assigned <user>] [--status <status>]` | 更新需求 |
| `/chandao story review <id> --result pass\|reject\|revert [--comment <text>]` | 评审需求 |
| `/chandao story close <id> --reason done\|subdivided\|duplicate\|postponed\|willnotdo\|cancel\|bydesign` | 关闭需求（**必须**指定 `--reason`） |
| `/chandao story activate <id> [--assigned <user>] [--comment <text>]` | 激活已关闭的需求 |
| `/chandao story delete <id>` | 删除需求 |
| `/chandao story change <id> --reviewer <account> [--title <title>] [--spec <desc>] [--verify <criteria>]` | 变更需求（**必须**指定 `--reviewer`） |
