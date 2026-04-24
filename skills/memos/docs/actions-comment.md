# Comment Actions

## `comments` — View/Add Comments on a Memo

View existing comments or add a new comment to a memo.

```bash
# View comments on a memo
$RUNTIME "$API_SCRIPT" comments abc123

# Add a comment to a memo
$RUNTIME "$API_SCRIPT" comments abc123 "这是一条评论"

# Add a comment with explicit visibility
$RUNTIME "$API_SCRIPT" comments abc123 "这是一条公开评论" --visibility=PUBLIC
```

**触发关键词映射表：**

当用户使用以下自然语言表达时，应识别为评论操作：

| 用户说法示例 | 对应 action | 说明 |
|-------------|-------------|------|
| "去 XXX 笔记下评论" | `comments` | 需要先获取笔记 ID |
| "在 memo-XXX 下评论" | `comments` | memo-XXX 格式需提取 ID |
| "给 XXX 写条评论" | `comments` | 自然语言评论请求 |
| "在 XXX 下面留言" | `comments` | "留言" = 评论 |
| "看看 XXX 的评论" | `comments` (无内容参数) | 查看评论列表 |
| "XXX 有人评论吗" | `comments` (无内容参数) | 查看评论列表 |

**Implementation details:**

### View Comments
- Calls `GET /api/v1/memos/{id}/comments`
- Lists all comments with content, author, visibility, and timestamp
- Shows "No comments" if the memo has no comments

### Add Comment
- Calls `POST /api/v1/memos/{id}/comments` with body:
  ```json
  {
    "content": "评论内容",
    "visibility": "PRIVATE"
  }
  ```

### Visibility 默认继承规则

**核心原则：评论的可见性与父笔记独立管理，但默认继承父笔记的可见性。**

| 场景 | 行为 |
|------|------|
| 不传 `--visibility` | 自动获取父笔记的 visibility 并继承 |
| 显式指定 `--visibility=PUBLIC` | 使用 PUBLIC，覆盖父笔记可见性 |
| 显式指定 `--visibility=PRIVATE` | 使用 PRIVATE，覆盖父笔记可见性 |
| 显式指定 `--visibility=PROTECTED` | 使用 PROTECTED，覆盖父笔记可见性 |

**所有 Agent 需统一遵守此规则，保证行为一致性。**

Comments are created as memo-like objects with the same structure.
Returns the created comment's ID and a summary.

**View display format:**

```
💬 Comments on memos/abc123 (共 3 条)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Test comment
   创建者: users/1 (tnnevol)
   可见性: PRIVATE
   创建时间: 2026-04-14 14:30
───────────────────────────────
2. Another comment
   创建者: users/2 (alice)
   可见性: PROTECTED
   创建时间: 2026-04-14 15:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Add display format:**

```
✅ Comment added successfully
   ID: memos/xyz789
   内容: 这是一条评论
   可见性: PROTECTED (继承自父笔记)
   创建时间: 2026-04-14 16:00
```
