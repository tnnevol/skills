## 操作指南

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

---

## API 参考

# Halo Posts API 参考

> 所有调用走 Node.js script，本文档仅在排查报错时参考

## 错误码速查表

| 状态码 | 说明                           |
| ------ | ------------------------------ |
| 400    | 请求参数错误（缺少必填字段等） |
| 401    | 认证失败（Token 无效或过期）   |
| 403    | 权限不足                       |
| 404    | 文章不存在                     |
| 409    | 版本冲突（乐观锁失败）         |
| 500    | 服务端错误                     |

## 数据结构

### Post 对象

```json
{
  "apiVersion": "content.halo.run/v1alpha1",
  "kind": "Post",
  "metadata": {
    "name": "my-post-slug",
    "version": 5,
    "creationTimestamp": "2024-01-01T00:00:00Z",
    "labels": {},
    "annotations": {}
  },
  "spec": {
    "title": "文章标题",
    "slug": "my-post-slug",
    "aliases": [],
    "categories": ["category-name"],
    "tags": ["tag-name"],
    "meta": { "labels": {}, "annotations": {} },
    "publish": true,
    "pinned": false,
    "allowComment": true,
    "visible": "PUBLIC",
    "template": "",
    "cover": "",
    "deprecated": false,
    "deleted": false,
    "priority": 0,
    "excerpt": { "autoGenerate": true, "raw": "" },
    "htmlMetas": [],
    "publishTime": "2024-01-01T00:00:00Z",
    "baseSnapshot": "snapshot-uuid-base",
    "headSnapshot": "snapshot-uuid-head",
    "releaseSnapshot": "snapshot-uuid-release"
  },
  "status": {
    "permalink": "https://example.com/archives/my-post-slug",
    "excerpt": "摘要...",
    "conditions": [
      { "type": "PUBLISHED", "status": "TRUE", ... }
    ],
    "visitCount": 100,
    "lastModifyTime": "2024-01-01T00:00:00Z"
  }
}
```

## API 概念

Halo 有两套文章相关 API：

| API               | 基地址                                      | 用途                           |
| ----------------- | ------------------------------------------- | ------------------------------ |
| **Console API**   | `/apis/api.console.halo.run/v1alpha1/posts` | 创建、发布、取消发布、内容更新 |
| **Extension API** | `/apis/content.halo.run/v1alpha1/posts`     | 内容查询、更新、删除           |

## Snapshot 机制

Halo 通过 Snapshot 对文章内容进行版本管理：

| 字段              | 说明                                           |
| ----------------- | ---------------------------------------------- |
| `baseSnapshot`    | 初始快照（首次创建时生成）                     |
| `headSnapshot`    | 当前草稿快照（每次内容更新创建新的）           |
| `releaseSnapshot` | 已发布快照（`publish` 时从 headSnapshot 同步） |

**前端渲染使用 `releaseSnapshot` 的 `contentPatch` 字段**。

### Snapshot 对象

```json
{
  "apiVersion": "content.halo.run/v1alpha1",
  "kind": "Snapshot",
  "metadata": { "name": "snapshot-uuid" },
  "spec": {
    "rawPatch": "HTML 源内容（后台编辑器显示）",
    "contentPatch": "HTML 渲染内容（前端页面显示）",
    "rawType": "HTML",
    "owner": "claude",
    "subjectRef": {
      "group": "content.halo.run",
      "kind": "Post",
      "name": "post-name",
      "version": "v1alpha1"
    }
  }
}
```

## Content Payload 格式

创建和更新内容时，必须同时提供 `raw` 和 `content` 两个字段：

```json
{
  "raw": "<h2>标题</h2><p>正文</p>",
  "content": "<h2>标题</h2><p>正文</p>",
  "rawType": "HTML"
}
```

- `raw` → 存入 `rawPatch`（后台编辑器使用）
- `content` → 存入 `contentPatch`（前端页面渲染）
- 缺少 `content` 字段会导致前端页面显示 `null`

## 更新流程注意事项

1. `PUT /posts/{name}/content` 创建新的 headSnapshot
2. `PUT /posts/{name}` 更新元数据（不影响快照）
3. `PUT /posts/{name}/publish` 将 releaseSnapshot 同步为 headSnapshot
4. **更新内容后必须重新发布**，否则前端仍显示旧内容
5. 脚本在内容更新后会重新获取最新 post，避免元数据 PUT 覆盖新的 headSnapshot
