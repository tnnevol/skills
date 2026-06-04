# 单页 API 参考

## API 端点

Halo 提供三层 API 用于单页操作：

### 1. Extension API（底层操作）

基础路径：`/apis/content.halo.run/v1alpha1`

| 方法   | 路径                  | 说明           |
| ------ | --------------------- | -------------- |
| GET    | `/singlepages`        | 列出单页       |
| POST   | `/singlepages`        | 创建单页       |
| GET    | `/singlepages/{name}` | 获取单页详情   |
| PUT    | `/singlepages/{name}` | 更新单页元数据 |
| DELETE | `/singlepages/{name}` | 删除单页       |

### 2. Console API（管理后台）

基础路径：`/apis/api.console.halo.run/v1alpha1`

| 方法 | 路径                                  | 说明                          |
| ---- | ------------------------------------- | ----------------------------- |
| GET  | `/singlepages`                        | 列出单页（支持 keyword 搜索） |
| POST | `/singlepages`                        | 创建单页（含内容）            |
| PUT  | `/singlepages/{name}`                 | 更新单页草稿                  |
| GET  | `/singlepages/{name}/content`         | 获取单页内容                  |
| PUT  | `/singlepages/{name}/content`         | 更新单页内容                  |
| PUT  | `/singlepages/{name}/publish`         | 发布单页                      |
| PUT  | `/singlepages/{name}/unpublish`       | 取消发布                      |
| GET  | `/singlepages/{name}/head-content`    | 获取草稿内容                  |
| GET  | `/singlepages/{name}/release-content` | 获取已发布内容                |
| GET  | `/singlepages/{name}/snapshot`        | 列出快照                      |
| PUT  | `/singlepages/{name}/revert-content`  | 恢复到指定快照                |

### 3. Content API（前台查询）

基础路径：`/apis/api.content.halo.run/v1alpha1`

| 方法 | 路径                  | 说明                 |
| ---- | --------------------- | -------------------- |
| GET  | `/singlepages`        | 查询已发布的单页列表 |
| GET  | `/singlepages/{name}` | 根据名称查询单页     |

## 数据结构

### SinglePage 对象

```json
{
  "apiVersion": "content.halo.run/v1alpha1",
  "kind": "SinglePage",
  "metadata": {
    "name": "about-us-20260604120000",
    "version": 1,
    "creationTimestamp": "2026-06-04T12:00:00Z"
  },
  "spec": {
    "title": "关于我们",
    "slug": "about-us",
    "visible": "PUBLIC",
    "deleted": false,
    "publish": true,
    "publishTime": "2026-06-04T12:00:00Z",
    "excerpt": {
      "raw": "",
      "autoGenerate": true
    }
  },
  "status": {
    "phase": "PUBLISHED",
    "lastModifyTime": "2026-06-04T12:00:00Z"
  }
}
```

### Content 对象

```json
{
  "raw": "<h1>关于我们</h1><p>内容...</p>",
  "content": "<h1>关于我们</h1><p>内容...</p>",
  "rawType": "HTML"
}
```

## 创建单页（含内容）

使用 Console API 一次性创建单页和内容：

```bash
POST /apis/api.console.halo.run/v1alpha1/singlepages
Content-Type: application/json
Authorization: Bearer {pat}

{
  "singlePage": {
    "metadata": {
      "name": "about-us-20260604120000"
    },
    "spec": {
      "title": "关于我们",
      "slug": "about-us",
      "visible": "PUBLIC",
      "deleted": false,
      "excerpt": { "raw": "", "autoGenerate": true },
      "publish": false
    },
    "apiVersion": "content.halo.run/v1alpha1",
    "kind": "SinglePage"
  },
  "content": {
    "raw": "<h1>关于我们</h1><p>内容...</p>",
    "content": "<h1>关于我们</h1><p>内容...</p>",
    "rawType": "HTML"
  }
}
```

## 更新单页内容

```bash
PUT /apis/api.console.halo.run/v1alpha1/singlepages/{name}/content
Content-Type: application/json
Authorization: Bearer {pat}

{
  "raw": "<h1>新内容</h1>",
  "content": "<h1>新内容</h1>",
  "rawType": "HTML"
}
```

## 发布单页

```bash
PUT /apis/api.console.halo.run/v1alpha1/singlepages/{name}/publish
Authorization: Bearer {pat}
Content-Type: application/json

{}
```

## 更新单页元数据

```bash
PUT /apis/content.halo.run/v1alpha1/singlepages/{name}
Content-Type: application/json
Authorization: Bearer {pat}

{
  "apiVersion": "content.halo.run/v1alpha1",
  "kind": "SinglePage",
  "metadata": {
    "name": "about-us-20260604120000",
    "version": 2
  },
  "spec": {
    "title": "关于我们（更新）",
    "slug": "about-us",
    "visible": "PUBLIC"
  }
}
```

**注意**：更新操作需要 `metadata.version`，用于乐观锁控制。如果版本不匹配会返回 409 冲突。

## 快照机制

单页内容支持版本快照，类似 Git 的版本管理：

1. 每次更新内容都会创建新快照
2. 可以查看历史快照列表
3. 可以恢复到任意历史快照

### 查看快照列表

```bash
GET /apis/api.console.halo.run/v1alpha1/singlepages/{name}/snapshot
```

### 恢复到指定快照

```bash
PUT /apis/api.console.halo.run/v1alpha1/singlepages/{name}/revert-content
{
  "snapshotName": "snapshot-xxx"
}
```

## 分页查询

```bash
GET /singlepages?page=1&size=20&keyword=关于
```

**参数说明**：
- `page`: 页码，从 1 开始
- `size`: 每页数量
- `keyword`: 搜索关键词（仅 Console API 支持）

## 错误码

| 状态码 | 说明       | 处理方式           |
| ------ | ---------- | ------------------ |
| 401    | 认证失败   | 检查 HALO_PAT      |
| 403    | 无权限     | 确认 PAT 权限      |
| 404    | 资源不存在 | 检查名称是否正确   |
| 409    | 版本冲突   | 获取最新版本后重试 |
| 500    | 服务器错误 | 稍后重试           |

## 使用建议

1. **优先使用 Console API** - 创建和更新内容时使用 Console API，一次性完成
2. **处理 409 冲突** - 更新元数据时遇到 409，重新获取最新版本后重试
3. **内容分离** - 内容更新使用 `/content` 端点，元数据更新使用主端点
4. **发布流程** - 创建时可设置 `publish: true`，或使用 `/publish` 端点发布草稿
