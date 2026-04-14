# 分享操作

## `share` — 创建/撤销/列出分享链接

为笔记创建公开分享链接，或管理已有的分享。

```bash
# 创建分享链接
$RUNTIME "$API_SCRIPT" share abc123

# 列出笔记的分享链接
$RUNTIME "$API_SCRIPT" share abc123 --list

# 撤销指定分享
$RUNTIME "$API_SCRIPT" share abc123 --revoke <分享ID>
```

**实现细节：**

### 创建分享
- 调用 `POST /api/v1/memos/{id}/shares`
- 返回分享链接 URL

### 列出分享
- 调用 `GET /api/v1/memos/{id}/shares`
- 显示所有分享链接及其 ID、URL、创建时间

### 撤销分享
- 调用 `DELETE /api/v1/shares/{shareId}`
- 确认撤销成功

> 注意：分享 API 的端点可能因 Memos 版本而异。如果该 Memos 实例不支持分享功能，会显示错误提示。
