# 文章操作指南

## Actions

| Action      | 用法                                                                           | 说明                                |
| ----------- | ------------------------------------------------------------------------------ | ----------------------------------- |
| `list`      | `/halo list [--limit=N] [--page=N] [--keyword=xxx]`                            | 列出文章                            |
| `get`       | `/halo get <name>`                                                             | 获取文章详情                        |
| `create`    | `/halo create --title=标题 --content=内容 [--slug=xxx] [--publish] [--public]` | 创建文章（默认 PRIVATE，HTML 格式） |
| `update`    | `/halo update <name> [--title=xxx] [--content=xxx] [--content-file=xxx]`       | 更新文章                            |
| `delete`    | `/halo delete <name>`                                                          | 删除文章                            |
| `publish`   | `/halo publish <name>`                                                         | 发布文章                            |
| `unpublish` | `/halo unpublish <name>`                                                       | 取消发布                            |

## 参数说明

| 参数              | 说明                         | 适用操作      |
| ----------------- | ---------------------------- | ------------- |
| `--title=`        | 文章标题                     | create/update |
| `--content=`      | HTML 内容，直接发送到 API    | create/update |
| `--content-file=` | 本地 HTML 文件路径           | create/update |
| `--slug=`         | 文章别名                     | create        |
| `--publish`       | 创建后立即发布               | create        |
| `--public`        | 设置公开可见（默认 PRIVATE） | create/update |
| `--visible=`      | 可见性: PUBLIC/PRIVATE       | update        |
| `--pinned`        | 是否置顶                     | update        |
| `--cover=`        | 封面 URL                     | update        |
| `--keyword=`      | 搜索关键词                   | list          |
| `--limit=N`       | 每页数量，默认 20            | list          |
| `--page=N`        | 页码，从 1 开始              | list          |

## Agent 意图

- **文章内容必须使用 HTML**：`--content` 参数**必须输出 HTML 内容**，禁止使用 Markdown。示例：`<h2>标题</h2><p>正文</p><ul><li>列表项</li></ul>`
- **禁止 Markdown 语法**：不得使用 `# 标题`、`**粗体**`、`- 列表项` 等 Markdown 语法。应使用对应的 HTML 标签。

## ⚠️ 重要说明

1. **Console API vs Extension API** — create/publish/unpublish 使用 **Console API**（触发快照创建）；list/get/update/delete 使用 **Extension API**。
2. **请求体格式** — Console API create 需要嵌套格式 `{ post: {...}, content: { raw, content, rawType } }`，`raw` 和 `content` 都必须设置为 HTML 内容。
3. **快照机制** — Halo 通过快照管理内容版本：`baseSnapshot`（初始）、`headSnapshot`（当前草稿）、`releaseSnapshot`（已发布）。前端渲染 `releaseSnapshot.contentPatch`。
4. **更新后需发布** — 通过 `update` 更新内容后，必须调用 `publish` 同步 releaseSnapshot。脚本会在内容更新后重新获取最新 post 以保留新的 headSnapshot。
5. **乐观锁** — 更新需要 `metadata.version`，脚本自动获取最新版本并在 409 冲突时重试。
6. **metadata.name 规则** — ≤253 字符，仅小写字母、数字和连字符。`create` 自动生成 `{slug}-{timestamp}`。
7. **可见性** — 默认 `PRIVATE`，使用 `--public` 设为 PUBLIC。
8. **Slug 自动生成** — CJK 字符保留，特殊字符替换为连字符。
