# User Actions

## `whoami` — Show Current User Info

Display the current authenticated user's profile information.

```bash
$RUNTIME "$API_SCRIPT" whoami
```

**Implementation details:**

- Calls `GET /api/v1/users/{user_id}` where user_id is extracted from memo creator patterns
- Falls back to trying user ID `1` if no memos exist
- Displays:
  - Username
  - Display name
  - Role (ADMIN/USER)
  - Email (masked)
  - State (NORMAL/ARCHIVED)
  - Account created time
  - Last updated time

**Display format:**

```
👤 Current User
━━━━━━━━━━━━━━━━━━━━━━━
用户名: tnnevol
显示名: tnnevol
角色: ADMIN
邮箱: g***@foxmail.com
状态: NORMAL
创建时间: 2023-05-05 02:56
━━━━━━━━━━━━━━━━━━━━━━━
```

---

## `user-stats` — Show User Statistics

Show statistics about the current user's memo activity.

```bash
$RUNTIME "$API_SCRIPT" user-stats
```

**Implementation details:**

- Calls `GET /api/v1/users/{user_id}` for user info
- Calls `GET /api/v1/memos?pageSize=1` to get total size estimate
- Displays:
  - Total memo count (estimated via pagination)
  - Total tag count (unique tags)
  - Pinned memo count
  - Public/Protected/Private memo breakdown
  - Most used tags (top 5)

**Display format:**

```
📊 User Statistics
━━━━━━━━━━━━━━━━━━━━━━━━
总 Memo 数: 42
已置顶: 3
可见性分布:
  PRIVATE: 30
  PROTECTED: 5
  PUBLIC: 7
唯一标签数: 15
常用标签:
  #ai (5), #docker (3), #linux (2), #nas (2), #pve (2)
━━━━━━━━━━━━━━━━━━━━━━━━
```

> Note: Memo count is estimated by paginating through memos. For large datasets (>1000 memos), the count may be approximate.
