# 任务管理命令

| 命令 | 描述 |
|------|------|
| `/chandao task list [--execution <id>] [--limit N] [--page N]` | 列出任务 |
| `/chandao task get <id>` | 获取任务详情 |
| `/chandao task create --execution <id> --name <name> [--assigned <user>] [--pri 1-4] [--estimate <hours>] [--desc <desc>] [--type devel\|test\|design\|discuss\|ui] [--story <id>] [--module <id>] [--est-started <YYYY-MM-DD>] [--deadline <YYYY-MM-DD>]` | 创建任务 |
| `/chandao task update <id> [--name <name>] [--assigned <user>] [--pri 1-4] [--status <status>] [--estimate <hours>] [--consumed <hours>]` | 更新任务 |
| `/chandao task start <id> [--consumed <hours>] [--left <hours>]` | 开始任务（状态→进行中） |
| `/chandao task finish <id> --consumed <hours> [--real-started <date>] [--finished-date <date>]` | 完成任务（**必须**指定 `--consumed`） |
| `/chandao task close <id> [--reason <reason>]` | 关闭任务 |
| `/chandao task activate <id> [--comment <text>]` | 激活已关闭的任务 |
| `/chandao task delete <id>` | 删除任务 |
