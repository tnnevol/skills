# 表情回应操作

## `reactions` — 查看表情回应

列出笔记的所有表情回应（ reactions ）。

```bash
# 查看笔记的表情回应
$RUNTIME "$API_SCRIPT" reactions abc123
```

**实现细节：**

- 调用 `GET /api/v1/memos/{id}/reactions`
- 按表情类型分组显示，统计每个表情的数量和用户
- 如果没有表情回应，显示提示信息

**显示格式：**

```
🎭 memos/abc123 的表情回应（共 3 个）:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👍 x2 — users/1, users/2
❤️ x1 — users/1
😄 x1 — users/3
────────────────────────────────────────
```

---

## `react` — 添加/切换表情

为笔记添加表情回应，或切换（添加/取消）已有表情。

```bash
# 为笔记添加点赞
$RUNTIME "$API_SCRIPT" react abc123 👍

# 为笔记添加爱心
$RUNTIME "$API_SCRIPT" react abc123 ❤️

# 为笔记添加笑脸
$RUNTIME "$API_SCRIPT" react abc123 😄
```

**实现细节：**

- 首先调用 `GET /api/v1/memos/{id}/reactions` 检查当前用户是否已有该表情
- 如果用户已有该表情，则调用 `DELETE /api/v1/{reaction_name}` 取消（切换效果）
- 如果用户没有该表情，则调用 `POST /api/v1/memos/{id}/reactions` 添加
- 支持常见表情：👍 ❤️ 😄 😢 😮 😡 🚀 ✅ ⭐ 等

**显示格式：**

```bash
# 添加表情
✅ 表情 👍 已添加
   笔记: memos/abc123
   表情: 👍

# 取消表情（切换）
✅ 表情 👍 已取消
   笔记: memos/abc123
   表情: 👍
```

---

## `unreact` — 取消表情

取消笔记上的特定表情回应。

```bash
# 取消笔记上的点赞
$RUNTIME "$API_SCRIPT" unreact abc123 👍

# 取消笔记上的爱心
$RUNTIME "$API_SCRIPT" unreact abc123 ❤️
```

**实现细节：**

- 调用 `GET /api/v1/memos/{id}/reactions` 查找特定的表情回应
- 找到对应的 reaction 对象后，调用 `DELETE /api/v1/{reaction_name}` 删除
- 如果未找到指定的表情回应，显示提示信息

**显示格式：**

```bash
# 成功取消
✅ 表情 👍 已取消
   笔记: memos/abc123
   表情: 👍

# 未找到表情
⚠️  未找到 👍 表情回应
   笔记: memos/abc123
   表情: 👍
```
