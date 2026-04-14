# Tag Actions

## `tags` — List All Tags

List all unique tags across all memos.

```bash
$RUNTIME "$API_SCRIPT" tags
```

**Implementation details:**

- The Memos API v1 does not have a dedicated `/tags` endpoint
- Instead, fetch memos with a large page size and extract tags from the response
- Calls `GET /api/v1/memos?pageSize=100`
- Iterates through all memos, collecting unique tags from each memo's `tags` array
- If there are more than 100 memos, paginate through all pages using `nextPageToken`

**Algorithm:**

1. Initialize empty `Set` for tags
2. Fetch first page of memos (pageSize=100)
3. Collect all tags into the set
4. If `nextPageToken` exists, fetch next page
5. Repeat until no more pages
6. Display all unique tags sorted alphabetically

**Display format:**

```
🏷️ Tags (共 12 个)
━━━━━━━━━━━━━━━━━━━━━━━
  ai (2)
  deepseek (1)
  iptv (1)
  mock (1)
  audio (1)
  录音 (1)
  影视资源 (1)
  pve (1)
  ...
━━━━━━━━━━━━━━━━━━━━━━━
括号内为该标签下的 memo 数量
```

> Note: Tag counts are approximate when there are many memos, since the API may paginate.
