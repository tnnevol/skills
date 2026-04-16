# Halo Posts API 参考

> 完整的文章 RESTful API 文档，区分 Console API 和 Extension API。

## 目录

1. [双 API 策略](#双-api-策略)
2. [Console API 端点](#console-api-端点)
3. [Extension API 端点](#extension-api-端点)
4. [数据结构](#数据结构)
5. [错误码](#错误码)

---

## 双 API 策略

Halo 有两套文章相关 API，**用途不同，不能混用**：

| API | 基地址 | 用途 | 触发快照？ |
|-----|--------|------|------------|
| **Console API** | `/apis/api.console.halo.run/v1alpha1/posts` | 管理操作（创建、更新、发布） | ✅ 是 |
| **Extension API** | `/apis/content.halo.run/v1alpha1/posts` | 内容查询（列表、详情、删除） | ❌ 否 |

### 何时用哪个？

| 操作 | 使用的 API | 原因 |
|------|-----------|------|
| 创建文章 | Console API | 需要自动创建快照 |
| 更新文章 | Console API | 需要自动创建快照 |
| 发布/取消发布 | Console API | 需要触发完整发布流程（生成 permalink、设置 conditions） |
| 列出文章 | Extension API | 返回完整数据（含分类、标签） |
| 获取详情 | Extension API | 返回完整 Post 对象 |
| 删除文章 | Extension API | 直接删除即可 |

### 请求体格式差异

**Console API（创建/更新）— 嵌套格式：**
```json
{
  "post": {
    "apiVersion": "content.halo.run/v1alpha1",
    "kind": "Post",
    "metadata": { "name": "xxx", "labels": {}, "annotations": {} },
    "spec": { "title": "...", ... }
  },
  "content": {
    "raw": "Markdown 内容",
    "content": "HTML 内容",
    "rawType": "MARKDOWN"
  }
}
```

**Extension API — 平铺格式：**
```json
{
  "apiVersion": "content.halo.run/v1alpha1",
  "kind": "Post",
  "metadata": { ... },
  "spec": { ... }
}
```

---

## Console API 端点

基地址: `/apis/api.console.halo.run/v1alpha1/posts`

| 操作 | 方法 | 端点 | 说明 |
|------|------|------|------|
| 创建文章 | POST | `/posts` | DraftPost，自动创建快照 |
| 更新文章 | PUT | `/posts/{name}` | UpdateDraftPost，自动创建快照 |
| 发布文章 | PUT | `/posts/{name}/publish` | 触发完整发布流程 |
| 取消发布 | PUT | `/posts/{name}/unpublish` | 取消发布 |
| 更新内容 | PUT | `/posts/{name}/content` | 单独更新内容 |
| 删除内容 | DELETE | `/posts/{name}/content?snapshotName=xxx` | 删除快照 |
| 查看头内容 | GET | `/posts/{name}/head-content` | 查看最新编辑内容 |
| 查看已发布内容 | GET | `/posts/{name}/release-content` | 查看已发布版本内容 |
| 查看快照列表 | GET | `/posts/{name}/snapshot` | 查看快照历史 |
| 恢复快照 | PUT | `/posts/{name}/revert-content` | 恢复到指定快照 |

### Console API 请求体格式（PostRequest）

创建/更新文章必须使用嵌套格式：

```json
{
  "post": {
    "apiVersion": "content.halo.run/v1alpha1",
    "kind": "Post",
    "metadata": {
      "name": "post-slug-here",
      "labels": {},
      "annotations": {}
    },
    "spec": {
      "title": "文章标题",
      "slug": "post-slug-here",
      "aliases": [],
      "categories": [],
      "tags": [],
      "meta": { "labels": {}, "annotations": {} },
      "publish": false,
      "pinned": false,
      "allowComment": true,
      "visible": "PUBLIC",
      "template": "",
      "cover": "",
      "deprecated": false,
      "deleted": false,
      "priority": 0,
      "excerpt": { "autoGenerate": true, "raw": "" },
      "htmlMetas": []
    }
  },
  "content": {
    "raw": "Markdown 内容",
    "content": "HTML 内容",
    "rawType": "MARKDOWN"
  }
}
```

### spec 必填字段

更新时必须保留所有现有字段，以下字段不可省略：

| 字段 | 类型 | 说明 |
|------|------|------|
| `deleted` | boolean | 必须为 `false` |
| `priority` | int | 排序优先级，默认 `0` |
| `excerpt` | object | `{ autoGenerate: true, raw: "" }` |
| `htmlMetas` | array | 默认 `[]` |
| `meta` | object | `{ labels: {}, annotations: {} }` |
| `aliases` | array | 默认 `[]` |
| `template` | string | 默认 `""` |

---

## Extension API 端点

基地址: `/apis/content.halo.run/v1alpha1/posts`

| 操作 | 方法 | 端点 | 说明 |
|------|------|------|------|
| 列表 | GET | `/posts` | 分页列出文章 |
| 详情 | GET | `/posts/{name}` | 获取文章详情（含分类、标签关联） |
| 删除 | DELETE | `/posts/{name}` | 删除文章 |

### 列表查询参数

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `page` | int | 1 | 页码 |
| `size` | int | 20 | 每页条数（最大 100） |
| `keyword` | string | — | 搜索关键词 |

### 列表响应

```json
{
  "page": 1,
  "size": 20,
  "total": 100,
  "items": [Post],
  "hasNext": true
}
```

---

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
    "publishTime": "2024-01-01T00:00:00Z"
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

---

## 错误码

| 状态码 | 说明 |
|--------|------|
| 400 | 请求参数错误（缺少必填字段等） |
| 401 | 认证失败（Token 无效或过期） |
| 403 | 权限不足 |
| 404 | 文章不存在 |
| 409 | 版本冲突（乐观锁失败） |
| 500 | 服务端错误 |
