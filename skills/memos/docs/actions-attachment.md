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
- 附件名称、大小、外部链接（永久有效路径）
- **永久路径格式**: `$MEMOS_BASE_URL/file/attachments/{attachment_name}/{filename}`
- 该路径通过 Memos 认证后永久有效，不依赖过期的预签名 URL

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
# 步骤 1: 上传图片，获取永久路径
$RUNTIME "$API_SCRIPT" upload-attachment /path/to/img.jpg --memo=abc123
# → 返回永久链接: https://memos.example.com/file/attachments/attachments/XyZ123/img.jpg

# 步骤 2: 创建笔记，嵌入永久路径的 Markdown 图片引用
$RUNTIME "$API_SCRIPT" create "这是带图笔记：

![描述](https://memos.example.com/file/attachments/attachments/XyZ123/img.jpg)

正文内容..."

# 或更新已有笔记，添加图片
$RUNTIME "$API_SCRIPT" update abc123 "更新内容：

![新图片](https://memos.example.com/file/attachments/attachments/XyZ123/img.jpg)"
```

**重要**：
- 使用 `/file/attachments/{name}/{filename}` 格式（永久有效）
- 不要使用 R2 预签名 URL（5 天后过期）
- 路径中必须同时包含 attachment_name 和 filename

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
