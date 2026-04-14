# 附件操作

## `attachments` — 列出笔记附件

查看笔记中上传的附件（图片、文件等）。

```bash
$RUNTIME "$API_SCRIPT" attachments abc123
```

**实现细节：**

- 调用 `GET /api/v1/memos/{id}` 获取笔记详情
- 从笔记的 `attachments` 字段提取附件信息
- 显示每个附件的：
  - 文件名
  - 大小（自动格式化）
  - MIME 类型
  - 外部链接（可访问 URL）

**显示格式：**

```
📎 memos/abc123 的附件（共 2 个）:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 screenshot.png
   大小: 256.3 KB
   类型: image/png
   链接: https://memos.example.com/file/...
──────────────────────────────────────────

📄 document.pdf
   大小: 1.2 MB
   类型: application/pdf
   链接: https://memos.example.com/file/...
──────────────────────────────────────────
```

> 注意：当前版本仅支持查看附件，上传功能需通过 Memos Web 界面操作。
