# 项目集管理命令

| 命令 | 描述 |
|------|------|
| `/chandao program list [--browse-type <type>] [--order-by <field>] [--limit N] [--page N]` | 列出项目集 |
| `/chandao program get <id>` | 项目集详情 |
| `/chandao program create --name <name> --code <code> [--desc <desc>] [--status <status>] [--parent <id>] [--pm <account>] [--budget <hours>] [--begin <date>] [--end <date>]` | 创建项目集 |
| `/chandao program update <id> [--name <name>] [--code <code>] [--desc <desc>] [--status <status>] [--parent <id>] [--pm <account>] [--budget <hours>] [--begin <date>] [--end <date>]` | 更新项目集 |
| `/chandao program delete <id>` | 删除项目集 |

### ⚠️ 更新操作前必须先获取当前值

**问题**：禅道 API 的 PUT 请求会将未包含的字段重置为默认值。

**正确流程**：
1. 先执行 `<module> get <id>` 获取当前值
2. 保留需要保持不变的字段值
3. 只修改需要更新的字段
4. 将所有字段一起发送更新请求

**详见**：`references/pitfalls.md` 第 23 条
