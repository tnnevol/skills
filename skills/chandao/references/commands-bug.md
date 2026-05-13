# Bug 管理

| 命令 | 描述 |
|------|------|
| `/chandao bug list [--product <id>] [--pri 1-4] [--limit N]` | 列出 Bug |
| `/chandao bug get <id>` | Bug 详情 |
| `/chandao bug create --product <id> --title <title> [--assigned <user>] [--pri 1-4] [--severity 1-4] [--type codeassign\|interface\|config\|design\|others] [--opened-build <build>] [--desc <text>] [--module <id>] [--execution <id>] [--task <id>] [--story <id>] [--os <os>] [--browser <browser>]` | 创建 Bug |
| `/chandao bug update <id> [--title <title>] [--assigned <user>] [--status <status>] [--pri 1-4] [--execution <id>]` | 更新 Bug |
| `/chandao bug resolve <id> --resolution fixed\|postponed\|bydesign\|willnotfix\|duplicate\|external [--assigned-to <user>] [--resolved-build <id>] [--comment <text>] [--resolved-date <YYYY-MM-DD>]` | 解决 Bug（注意：需通过 `--assigned-to` 指定指派人，否则禅道会清空指派人） |
| `/chandao bug close <id>` | 关闭 Bug |
| `/chandao bug activate <id>` | 激活 Bug |
| `/chandao bug delete <id>` | 删除 Bug |

## Bug 解决（保留原指派人）

**问题**：禅道 `bug resolve` 接口如果不传 `assignedTo` 参数，会将指派人清空。

**正确流程**：
1. 先获取 Bug 详情，拿到当前指派人：
   ```bash
   chandao bug get <bug_id>
   # 从返回的 JSON 中读取 assignedTo 字段
   ```

2. 解决时带上 `--assigned-to` 参数：
   ```bash
   chandao bug resolve <bug_id> --resolution fixed --assigned-to <原指派人> --resolved-build <build_id>
   ```

**示例**（解决 Bug #36 并保留指派人 hai）：
```bash
# 1. 获取详情
chandao bug get 36
# 返回: {"assignedTo": "hai", ...}

# 2. 解决并保留指派人
chandao bug resolve 36 --resolution bydesign --assigned-to hai --resolved-build 1
```
