# 任务管理

| 命令 | 描述 |
|------|------|
| `/chandao task list [--execution <id>] [--assigned <user>] [--limit N]` | 列出任务 |
| `/chandao task get <id>` | 获取任务详情 |
| `/chandao task create --execution <id> --name <name> [--assigned <user>] [--type devel\|test\|design\|discuss\|ui] [--pri 1-4] [--estimate <hours>] [--desc <text>] [--story <id>] [--module <id>] [--est-started <YYYY-MM-DD>] [--deadline <YYYY-MM-DD>]` | 创建任务 |
| `/chandao task update <id> [--name <name>] [--assigned <user>] [--pri 1-4] [--status <status>] [--estimate <hours>] [--consumed <hours>]` | 更新任务 |
| `/chandao task start <id>` | 开始任务（状态→进行中） |
| `/chandao task finish <id>` | 完成任务（状态→已完成） |
| `/chandao task close <id>` | 关闭任务 |
| `/chandao task activate <id>` | 激活已关闭的任务 |
| `/chandao task delete <id>` | 删除任务 |
