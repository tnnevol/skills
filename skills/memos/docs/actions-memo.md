# Memo Actions

## `list` — List Memos

List memos with optional pagination, filtering, and sorting.

```bash
# Default: list 10 most recent memos
$RUNTIME "$API_SCRIPT" list

# List with custom limit
$RUNTIME "$API_SCRIPT" list --limit=20

# Filter by tag
$RUNTIME "$API_SCRIPT" list --tag=ai

# Filter by state (NORMAL or ARCHIVED)
$RUNTIME "$API_SCRIPT" list --state=ARCHIVED

# Order by different criteria
$RUNTIME "$API_SCRIPT" list --order="create_time asc"
$RUNTIME "$API_SCRIPT" list --order="pinned desc, display_time desc"

# Filter using CEL expressions
$RUNTIME "$API_SCRIPT" list --filter='tags == ["ai"]'

# Show deleted memos
$RUNTIME "$API_SCRIPT" list --show-deleted

# Combine multiple parameters
$RUNTIME "$API_SCRIPT" list --limit=20 --state=NORMAL --order="create_time desc" --tag=ai
```

**Implementation details:**

- Calls `GET /api/v1/memos` with query parameters:
  - `pageSize=N` (from `--limit`)
  - `state` (from `--state=NORMAL|ARCHIVED`)
  - `orderBy` (from `--order=xxx`)
  - `filter` (from `--filter=xxx` or combined with tag)
  - `showDeleted=true` (when `--show-deleted` is present)
- When `--tag` is specified, combines with filter parameter using CEL expressions
- Displays results as a formatted list showing:
  - Memo ID (shortened)
  - Content (first 100 chars)
  - Tags (if any)
  - Visibility (PRIVATE/PROTECTED/PUBLIC)
  - Created time (formatted to local timezone)

**Response format displayed:**

```
📝 memos/abc123
   内容: 这是一条测试笔记...
   标签: #ai #test
   可见性: PRIVATE
   创建时间: 2026-04-14 14:30
---
```

---

## `create` — Create a Memo

Create a new memo with content and optional visibility.

```bash
$RUNTIME "$API_SCRIPT" create "这是一条新笔记 #test"

$RUNTIME "$API_SCRIPT" create "公开笔记内容" --visibility=PUBLIC

$RUNTIME "$API_SCRIPT" create "受保护的笔记" --visibility=PROTECTED
```

**Implementation details:**

- Calls `POST /api/v1/memos` with body:
  ```json
  {
    "content": "内容",
    "visibility": "PRIVATE"  // default, or specified value
  }
  ```
- Valid visibility values: `PRIVATE` (default), `PROTECTED`, `PUBLIC`
- Tags are automatically extracted from `#tag` patterns in content
- Returns the created memo's ID and a summary

**Display after creation:**

```
✅ Memo created successfully
   ID: memos/abc123
   可见性: PRIVATE
   标签: #test
```

---

## `get` — Get a Single Memo

Retrieve a specific memo by ID.

```bash
$RUNTIME "$API_SCRIPT" get memos/abc123

$RUNTIME "$API_SCRIPT" get abc123
```

**Implementation details:**

- Calls `GET /api/v1/memos/{id}`
- Normalizes the ID (strips `memos/` prefix if present, then re-adds for the API call)
- Displays full memo content, tags, visibility, timestamps

**Display format:**

```
📋 Memo: memos/abc123
━━━━━━━━━━━━━━━━━━━━━━━━
[Full content with Markdown]
━━━━━━━━━━━━━━━━━━━━━━━━
标签: #ai #test
可见性: PRIVATE
创建: 2026-04-14 14:30
更新: 2026-04-14 15:00
```

---

## `update` — Update a Memo

Update a memo's content and/or visibility.

```bash
$RUNTIME "$API_SCRIPT" update abc123 "更新后的内容"

$RUNTIME "$API_SCRIPT" update abc123 "新内容" --visibility=PUBLIC
```

**Implementation details:**

- Calls `PATCH /api/v1/memos/{id}?updateMask=content,visibility`
- Body includes both `content` and `visibility` (if specified)
- Returns the updated memo summary

**Display after update:**

```
✅ Memo updated successfully
   ID: memos/abc123
   可见性: PUBLIC
   标签: #new
```

---

## `delete` — Delete a Memo

Delete a memo permanently.

```bash
$RUNTIME "$API_SCRIPT" delete abc123
```

**Implementation details:**

- Calls `DELETE /api/v1/memos/{id}`
- **Confirmation required**: Before deletion, confirm with the user by showing the memo content preview
- On success, display confirmation message

**Confirmation flow:**

1. Fetch memo content with `get`
2. Show: "⚠️ 确定要删除这条 memo 吗？" + content preview
3. User confirms → proceed with deletion
4. On success: "✅ Memo deleted: memos/abc123"

---

## `pin` — Pin/Unpin a Memo

Toggle a memo's pinned status.

```bash
$RUNTIME "$API_SCRIPT" pin abc123
```

**Implementation details:**

- First calls `GET /api/v1/memos/{id}` to check current pinned status
- Then calls `PATCH /api/v1/memos/{id}?updateMask=pinned` with `{"pinned": !current_pinned}`
- Toggles: if pinned → unpin, if unpinned → pin
- On success, display the new pinned status

**Display format:**

```bash
# Pinning an unpinned memo
📌 Memo pinned successfully
   ID: memos/abc123
   状态: 已置顶

# Unpinning a pinned memo
📌 Memo unpinned successfully
   ID: memos/abc123
   状态: 已取消置顶
```
