# 系统管理命令

| 命令 | 描述 |
|------|------|
| `/chandao system list --product <id> [--limit N] [--page N]` | 列出产品下的应用系统 |
| `/chandao system get <id>` | 获取应用系统详情 |
| `/chandao system create --name <name> [--code <code>] [--key <key>] [--desc <desc>] [--type <type>]` | 创建应用系统 |
| `/chandao system update <id> [--name <name>] [--key <key>] [--desc <desc>] [--type <type>]` | 更新应用系统 |

> ⚠️ `system create` 的 CLI 参数中**没有 `--product`**。如果 API 要求 `productID`，需直接调用 API 或确认 CLI 版本是否已支持。

### ⚠️ 更新操作前必须先获取当前值

**问题**：禅道 API 的 PUT 请求会将未包含的字段重置为默认值。

**正确流程**：
1. 先执行 `<module> get <id>` 获取当前值
2. 保留需要保持不变的字段值
3. 只修改需要更新的字段
4. 将所有字段一起发送更新请求

**详见**：`references/pitfalls.md` 第 23 条
