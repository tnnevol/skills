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
  - 外部链接（永久有效路径）

**显示格式：**

```
📎 memos/abc123 的附件（共 2 个）:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 screenshot.png
   大小: 256.3 KB
   类型: image/png
   链接: https://memos.example.com/file/attachments/attachments/XyZ123/screenshot.png
──────────────────────────────────────────
```

---

## `upload-attachment` — 上传附件

上传图片或文件到 Memos，可关联到指定笔记。

```bash
# 上传文件（自动检测 MIME 类型）
$RUNTIME "$API_SCRIPT" upload-attachment /path/to/screenshot.png

# 上传并关联到指定笔记
$RUNTIME "$API_SCRIPT" upload-attachment /path/to/img.jpg --memo=abc123

# 上传并自定义文件名
$RUNTIME "$API_SCRIPT" upload-attachment /tmp/xxx --filename="my-diagram.png" --memo=abc123
```

**参数说明：**

| 参数 | 必填 | 说明 |
|------|------|------|
| `<文件路径>` | ✅ | 本地文件路径 |
| `--memo=ID` | ❌ | 关联的笔记 ID |
| `--filename=xxx` | ❌ | 自定义文件名（默认使用原文件名） |
| `--type=MIME` | ❌ | MIME 类型（自动检测） |

**实现细节：**

- 调用 `POST /api/v1/attachments`
- Body 格式：`{ filename, content: base64, type, memo? }`
- 自动读取文件并转为 Base64 编码
- 自动检测 MIME 类型（基于文件扩展名）

**返回信息：**
- 附件名称、大小、**永久路径**（笔记内容中使用）、预签名 URL（辅助验证）
- **永久路径**: `$MEMOS_BASE_URL/file/attachments/{attachment_name}/{filename}` — **笔记内容中使用的路径**
- **预签名 URL**: API 返回的 `externalLink`，5 天有效（仅辅助验证，不应嵌入笔记）

> ✅ **永久路径是笔记内容中的标准用法**，笔记在 Memos 内渲染时自动生效。

**显示格式：**

```
📤 正在上传附件:
   文件: screenshot.png
   大小: 256.3 KB
   类型: image/png

✅ 附件上传成功
   名称: attachments/XyZ123
   大小: 256.3 KB
   链接: https://memos.example.com/file/attachments/attachments/XyZ123/screenshot.png
```

### 🖼️ 自动图文笔记工作流

当需要创建带图片的笔记时，使用以下步骤：

```bash
# 步骤 1: 上传图片，获取永久路径（用于嵌入笔记）
$RUNTIME "$API_SCRIPT" upload-attachment /path/to/img.jpg --memo=abc123
# → 返回：
#    永久路径: https://memos.example.com/file/attachments/attachments/XyZ123/img.jpg
#    预签名URL: https://r2.cloudflarestorage.com/... (辅助验证，不嵌入笔记)

# 步骤 2: 创建笔记，使用永久路径嵌入 Markdown 图片引用
$RUNTIME "$API_SCRIPT" create "这是带图笔记：

![描述](https://memos.example.com/file/attachments/attachments/XyZ123/img.jpg)

正文内容..."
```

**⚠️ 重要**：
- **笔记内容中必须使用永久路径** (`$MEMOS_BASE_URL/file/attachments/{name}/{filename}`)
- 永久路径在 Memos 内渲染时自动生效（笔记自带认证上下文）
- 预签名 URL 仅辅助验证，5 天后过期，**不要**嵌入笔记

---

## `delete-attachment` — 删除附件

删除指定的附件。

```bash
$RUNTIME "$API_SCRIPT" delete-attachment attachments/XyZ123
```

**实现细节：**

- 调用 `GET /api/v1/attachments/{name}` 获取附件信息
- 显示确认提示（名称、大小、类型）
- 调用 `DELETE /api/v1/attachments/{name}` 执行删除
- 删除后资源被真正释放

---

## `batch-delete-attachment` — 批量删除附件

一次删除多个附件。

```bash
$RUNTIME "$API_SCRIPT" batch-delete-attachment attachments/A attachments/B attachments/C
```

**实现细节：**

- 调用 `POST /api/v1/attachments:batchDelete`
- Body: `{ names: ["attachments/A", "attachments/B", ...] }`
- 执行前显示待删除列表
