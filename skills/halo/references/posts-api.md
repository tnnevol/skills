# Halo Posts API 参考

> 所有调用走 CLI，本文档仅在排查报错时参考

## 错误码速查表

| 状态码 | 说明 |
|--------|------|
| 400 | 请求参数错误（缺少必填字段等） |
| 401 | 认证失败（Token 无效或过期） |
| 403 | 权限不足 |
| 404 | 文章不存在 |
| 409 | 版本冲突（乐观锁失败） |
| 500 | 服务端错误 |

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

## API 概念

Halo 有两套文章相关 API：

| API | 基地址 | 用途 |
|-----|--------|------|
| **Console API** | `/apis/api.console.halo.run/v1alpha1/posts` | 管理操作（创建、发布） |
| **Extension API** | `/apis/content.halo.run/v1alpha1/posts` | 内容查询（列表、详情、删除） |