# Halo Tags API 参考

> 所有调用走 Node.js script，本文档仅在排查报错时参考

## API 端点

| 方法   | 路径                                          | 说明     |
| ------ | --------------------------------------------- | -------- |
| GET    | `/apis/content.halo.run/v1alpha1/tags`        | 列出标签 |
| POST   | `/apis/content.halo.run/v1alpha1/tags`        | 创建标签 |
| GET    | `/apis/content.halo.run/v1alpha1/tags/{name}` | 获取标签 |
| PUT    | `/apis/content.halo.run/v1alpha1/tags/{name}` | 更新标签 |
| DELETE | `/apis/content.halo.run/v1alpha1/tags/{name}` | 删除标签 |

## 创建标签请求体

```json
{
  "apiVersion": "content.halo.run/v1alpha1",
  "kind": "Tag",
  "metadata": {
    "name": "tag-slug-20240101120000"
  },
  "spec": {
    "displayName": "标签显示名",
    "slug": "tag-slug",
    "color": "#ff0000",
    "cover": "",
    "description": ""
  }
}
```

- `metadata.name` 自动生成，格式为 `{slug}-{timestamp}`
- `spec.displayName` 和 `spec.slug` 为必填
- `spec.color` 可选，格式 `#RRGGBB` 或 `#RGB`

## 删除标签

- 路径参数: `name` — 标签的 metadata.name
- 删除前脚本会先 GET 确认标签存在，不存在则报 404 错误

## 更新标签

- 路径参数: `name` — 标签的 metadata.name
- 使用 GET-modify-PUT 模式，先获取完整标签对象，修改 spec 字段后 PUT 回去
- 更新需要 `metadata.version`（乐观锁），脚本会自动重试 409 冲突
- 可更新字段: `displayName`, `slug`, `color`, `cover`, `description`
- 无变更时直接返回“无变更”，不发起 PUT 请求

## 查询参数

| 参数            | 类型     | 说明                                 |
| --------------- | -------- | ------------------------------------ |
| `page`          | integer  | 页码，从 1 开始，0 表示不分页        |
| `size`          | integer  | 每页数量，0 表示不分页               |
| `labelSelector` | string[] | 标签选择器，如 `hidden!=true`        |
| `fieldSelector` | string[] | 字段选择器，如 `metadata.name==halo` |
| `sort`          | string[] | 排序条件，格式 `property,(asc        | desc)` |

## 数据结构

### Tag 对象

```json
{
  "apiVersion": "content.halo.run/v1alpha1",
  "kind": "Tag",
  "metadata": {
    "name": "tag-name",
    "version": 1,
    "creationTimestamp": "2024-01-01T00:00:00Z",
    "labels": {},
    "annotations": {}
  },
  "spec": {
    "displayName": "标签显示名",
    "slug": "tag-slug",
    "color": "#ff0000",
    "cover": "",
    "description": ""
  },
  "status": {
    "permalink": "https://example.com/tags/tag-slug",
    "postCount": 10,
    "visiblePostCount": 8,
    "observedVersion": 1
  }
}
```

### TagSpec 字段

| 字段          | 类型   | 必填 | 说明                             |
| ------------- | ------ | ---- | -------------------------------- |
| `displayName` | string | 是   | 标签显示名称（最少 1 字符）      |
| `slug`        | string | 是   | 标签别名（最少 1 字符）          |
| `color`       | string | 否   | 颜色值，格式 `#RRGGBB` 或 `#RGB` |
| `cover`       | string | 否   | 封面图片 URL                     |
| `description` | string | 否   | 标签描述                         |

### TagStatus 字段

| 字段               | 类型    | 说明           |
| ------------------ | ------- | -------------- |
| `permalink`        | string  | 标签永久链接   |
| `postCount`        | integer | 关联文章总数   |
| `visiblePostCount` | integer | 可见文章数     |
| `observedVersion`  | integer | 观察到的版本号 |

## 响应格式

```json
{
  "page": 1,
  "size": 20,
  "total": 5,
  "totalPages": 1,
  "first": true,
  "last": true,
  "hasNext": false,
  "hasPrevious": false,
  "items": [ /* Tag[] */ ]
}
```
