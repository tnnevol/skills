# Comment Actions

## `comments` — View/Add Comments on a Memo

View existing comments or add a new comment to a memo.

```bash
# View comments on a memo
$RUNTIME "$API_SCRIPT" comments abc123

# Add a comment to a memo
$RUNTIME "$API_SCRIPT" comments abc123 "这是一条评论"
```

**Implementation details:**

### View Comments
- Calls `GET /api/v1/memos/{id}/comments`
- Lists all comments with content, author, and timestamp
- Shows "No comments" if the memo has no comments

### Add Comment
- Calls `POST /api/v1/memos/{id}/comments` with body:
  ```json
  {
    "content": "评论内容"
  }
  ```
- Comments are created as memo-like objects with the same structure
- Returns the created comment's ID and a summary

**View display format:**

```
💬 Comments on memos/abc123 (共 3 条)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Test comment
   创建者: users/1 (tnnevol)
   创建时间: 2026-04-14 14:30
───────────────────────────────
2. Another comment
   创建者: users/2 (alice)
   创建时间: 2026-04-14 15:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Add display format:**

```
✅ Comment added successfully
   ID: memos/xyz789
   内容: 这是一条评论
   创建时间: 2026-04-14 16:00
```
