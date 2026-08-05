# 笔记关系操作

## `relations` — 查看关联笔记

列出笔记的所有关联关系（ relations ）。

```bash
# 查看笔记的关联关系
$RUNTIME "$API_SCRIPT" relations abc123
```

**实现细节：**

- 调用 `GET /api/v1/memos/{id}/relations`
- 显示每个关联笔记的 ID、关系类型和创建者
- 如果没有关联关系，显示提示信息

**显示格式：**

```
🔗 memos/abc123 的关联笔记（共 2 个）:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 关联笔记: memos/def456
   类型: REFERENCE
   创建者: users/1
────────────────────────────────────────

📝 关联笔记: memos/ghi789
   类型: PARENT
   创建者: users/2
────────────────────────────────────────
```

---

## `relate` — 建立笔记关系

建立笔记之间的关系（引用、父子等）。

```bash
# 建立引用关系
$RUNTIME "$API_SCRIPT" relate abc123 def456 --type=REFERENCE

# 建立父子关系
$RUNTIME "$API_SCRIPT" relate abc123 def456 --type=PARENT

# 建立评论关系
$RUNTIME "$API_SCRIPT" relate abc123 def456 --type=COMMENT

# 默认为引用关系
$RUNTIME "$API_SCRIPT" relate abc123 def456
```

**实现细节：**

- 调用 `PATCH /api/v1/memos/{id}/relations`
- 请求体包含关系数组，每个关系包含目标笔记 ID 和类型
- 支持的关系类型：
  - `REFERENCE` — 引用关系（默认）
  - `PARENT` — 父子关系
  - `COMMENT` — 评论关系

**显示格式：**

```bash
✅ 笔记关系已建立
   源笔记: memos/abc123
   目标笔记: memos/def456
   关系类型: REFERENCE
```

---

## `unrelate` — 解除笔记关系

解除笔记之间的关系。

```bash
# 解除与目标笔记的关系
$RUNTIME "$API_SCRIPT" unrelate abc123 def456
```

**实现细节：**

- 首先调用 `GET /api/v1/memos/{id}/relations` 获取所有关系
- 找到与目标笔记的关系并从关系列表中移除
- 调用 `PATCH /api/v1/memos/{id}/relations` 更新关系列表（不包含要移除的关系）
- 如果未找到指定的关系，显示提示信息

**显示格式：**

```bash
✅ 笔记关系已解除
   源笔记: memos/abc123
   目标笔记: memos/def456

⚠️  未找到与目标笔记的关系
   笔记: memos/abc123
   目标: memos/def456
```
