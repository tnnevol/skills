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
- 附件名称、大小、预签名 URL、永久路径
- **预签名 URL**: API 返回的 `externalLink`，有效期 5 天（R2 存储）
- **永久路径**: `$MEMOS_BASE_URL/file/attachments/{attachment_name}/{filename}`，通过 Memos 认证后永久有效

> ⚠️ **注意**：预签名 URL 5 天后过期。如需长期有效，使用永久路径格式（需要 Memos 认证）。

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
# 步骤 1: 上传图片，获取链接
$RUNTIME "$API_SCRIPT" upload-attachment /path/to/img.jpg --memo=abc123
# → 返回两个链接：
#    预签名URL: https://r2.cloudflarestorage.com/... (5天有效)
#    永久路径: https://memos.example.com/file/attachments/attachments/XyZ123/img.jpg (需认证)

# 步骤 2: 创建笔记，嵌入图片的 Markdown 引用
$RUNTIME "$API_SCRIPT" create "这是带图笔记：

![描述](预签名URL)

正文内容..."
```

**两种 URL 方案**：

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 预签名 URL | 直接访问，无需认证 | 5 天后过期 | 短期使用、分享 |
| 永久路径 | 永久有效 | 需 Memos 认证 | 笔记内部引用、Agent 自动读取 |

**重要**：
- 路径中必须同时包含 `attachment_name` 和 `filename`
- 永久路径适合 Agent 内部使用（自动携带认证）
- 对外分享建议使用预签名 URL

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
