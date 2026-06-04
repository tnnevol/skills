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