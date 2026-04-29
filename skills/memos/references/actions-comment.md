# Comment Actions

## `comments` — View/Add/Delete/Update Comments on a Memo

View existing comments, add a new comment, delete or update an existing comment on a memo.

```bash
# View comments on a memo
$RUNTIME "$API_SCRIPT" comments abc123

# Add a comment to a memo
$RUNTIME "$API_SCRIPT" comments abc123 "这是一条评论"

# Add a comment with explicit visibility
$RUNTIME "$API_SCRIPT" comments abc123 "这是一条公开评论" --visibility=PUBLIC

# Update a comment
$RUNTIME "$API_SCRIPT" comments abc123 "更新后的评论内容" --operation=update --comment-id=comment_memo_id

# Delete a comment
$RUNTIME "$API_SCRIPT" comments abc123 "" --operation=delete --comment-id=comment_memo_id
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
| "删除 XXX 的评论" | `comments --operation=delete` | 需要获取评论的 memo ID |
| "更新 XXX 的评论" | `comments --operation=update` | 需要获取评论的 memo ID 和新内容 |
| "修改评论内容" | `comments --operation=update` | 需要获取评论的 memo ID 和新内容 |

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

### Delete Comment
- Calls `POST /api/v1/memos/{id}/comments` with body:
  ```json
  {
    "content": "评论内容",
    "visibility": "PRIVATE"
  }
  ```
- To delete an existing comment, use the `--operation=delete --comment-id=xxx` pattern
- Calls `DELETE /api/v1/memos/{comment_id}` internally
- 评论的 ID 格式通常为 `memos/[ID]`，可在评论列表中获取

### Update Comment
- Calls `POST /api/v1/memos/{id}/comments` with body:
  ```json
  {
    "content": "评论内容",
    "visibility": "PRIVATE"
  }
  ```
- To update an existing comment, use the `--operation=update --comment-id=xxx` pattern
- Calls `PATCH /api/v1/memos/{comment_id}` internally
- 评论的 ID 格式通常为 `memos/[ID]`，可在评论列表中获取

### Visibility 默认继承规则

**核心原则：评论的可见性与父笔记独立管理，但默认继承父笔记的可见性。**

| 场景 | 行为 |
|------|------|
| 不传 `--visibility` | 自动获取父笔记的 visibility 并继承 |
| 显式指定 `--visibility=PUBLIC` | 使用 PUBLIC，覆盖父笔记可见性 |
| 显式指定 `--visibility=PRIVATE` | 使用 PRIVATE，覆盖父笔记可见性 |
| 显式指定 `--visibility=PROTECTED` | 使用 PROTECTED，覆盖父笔记可见性 |

**所有 Agent 需统一遵守此规则，保证行为一致性。**

## 高级用法

### 1. 添加评论到现有 Memo

有两种主要方法：

#### 方法 A: 通过关系建立评论（传统方法）
要将评论添加到现有的 memo，需要创建一个新 memo 并建立 COMMENT 关系：

```javascript
// 步骤 1: 创建评论内容作为新的 memo
const commentPayload = {
    content: "评论内容",
    visibility: "PROTECTED"
};

const commentResponse = await callAPI('POST', `/api/v1/memos`, commentPayload);

// 步骤 2: 将新创建的评论与原 memo 建立关系
const relationPayload = {
    relatedMemo: commentResponse.name,  // 新评论的名称
    type: "COMMENT"
};

const relationResponse = await callAPI('POST', `/api/v1/memos/${originalMemoId}/relation`, relationPayload);
```

#### 方法 B: 直接使用评论 API（推荐）
更简单的方法是使用专用的评论 API 端点：

```javascript
const commentPayload = {
    content: "评论内容",
    visibility: "PROTECTED"
};

const commentResponse = await callAPI('POST', `/api/v1/memos/${originalMemoId}/comments`, commentPayload);
```

### 2. 使用环境变量

在进行 API 调用时，确保正确设置环境变量：

```javascript
const baseUrl = process.env.MEMOS_BASE_URL;
const accessToken = process.env.MEMOS_ACCESS_TOKEN;
```

## 常见问题解决

### 问题：无法通过 `get` 操作访问特定 ID 的 memo
**原因**: ID 格式可能不正确，Memos API 中的完整名称是 `memos/[ID]` 格式
**解决方案**: 使用正确的完整名称格式，例如 `memos/8oW2zMmxb5FbxJzcpLCkJC`

### 问题：创建评论后无法正确关联到原 memo
**原因**: 直接将评论内容添加到原 memo 的内容中，而不是创建独立的 memo 并建立关系
**解决方案**: 先创建评论作为独立的 memo，然后使用 relation API 建立 COMMENT 关系

## 错误处理

- **404 errors**: 通常由于 ID 格式不正确；确保使用 `memos/{id}` 格式
- **权限错误**: 检查是否有适当的权限来创建、更新或删除评论
- **关系错误**: 验证目标 memo 存在且您有权限创建关系

## 注意事项

1. **ID 格式**: Memos 的名称格式通常是 `memos/[ID]`，在 API 调用时可能只需要使用 ID 部分
2. **权限**: 确保有适当的权限来创建、更新或删除评论
3. **关系类型**: 评论关系的类型是 "COMMENT"，这与其他关系类型（如 "REFERENCE"）不同

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
   ID: memos/xyz789
───────────────────────────────
2. Another comment
   创建者: users/2 (alice)
   可见性: PROTECTED
   创建时间: 2026-04-14 15:00
   ID: memos/abc456
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

**Delete display format:**

```
✅ Comment deleted successfully
   ID: memos/xyz789
   删除时间: 2026-04-14 17:00
```

**Update display format:**

```
✅ Comment updated successfully
   ID: memos/xyz789
   新内容: 这是更新后的评论
   更新时间: 2026-04-14 17:00
```
