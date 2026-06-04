# Halo Categories API 参考

> 所有调用走 Node.js script，本文档仅在排查报错时参考

## API 端点

| 方法   | 路径                                                | 说明     |
| ------ | --------------------------------------------------- | -------- |
| GET    | `/apis/content.halo.run/v1alpha1/categories`        | 列出分类 |
| POST   | `/apis/content.halo.run/v1alpha1/categories`        | 创建分类 |
| GET    | `/apis/content.halo.run/v1alpha1/categories/{name}` | 获取分类 |
| PUT    | `/apis/content.halo.run/v1alpha1/categories/{name}` | 更新分类 |
| DELETE | `/apis/content.halo.run/v1alpha1/categories/{name}` | 删除分类 |

## 创建分类请求体

```json
{
  "apiVersion": "content.halo.run/v1alpha1",
  "kind": "Category",
  "metadata": {
    "name": "category-slug-20240101120000"
  },
  "spec": {
    "displayName": "分类显示名",
    "slug": "category-slug",
    "priority": 0,
    "children": [],
    "cover": "",
    "description": ""
  }
}
```

- `metadata.name` 自动生成，格式为 `{slug}-{timestamp}`
- `spec.displayName` 和 `spec.slug` 为必填
- `spec.priority` 排序优先级，默认 0
- `spec.children` 子分类的 metadata.name 数组

## 更新分类

- 路径参数: `name` — 分类的 metadata.name
- 使用 GET-modify-PUT 模式，先获取完整分类对象，修改 spec 字段后 PUT 回去
- 更新需要 `metadata.version`（乐观锁），脚本会自动重试 409 冲突
- 可更新字段: `displayName`, `slug`, `cover`, `description`, `priority`, `hideFromList`

## 删除分类

- 路径参数: `name` — 分类的 metadata.name
- 删除前脚本会先 GET 确认分类存在，不存在则报 404 错误

## 查询参数

| 参数            | 类型     | 说明                                 |
| --------------- | -------- | ------------------------------------ |
| `page`          | integer  | 页码，从 1 开始，0 表示不分页        |
| `size`          | integer  | 每页数量，0 表示不分页               |
| `labelSelector` | string[] | 标签选择器，如 `hidden!=true`        |
| `fieldSelector` | string[] | 字段选择器，如 `metadata.name==halo` |
| `sort`          | string[] | 排序条件，格式 `property,(asc        | desc)` |

## 数据结构

### Category 对象

```json
{
  "apiVersion": "content.halo.run/v1alpha1",
  "kind": "Category",
  "metadata": {
    "name": "category-name",
    "version": 1,
    "creationTimestamp": "2024-01-01T00:00:00Z",
    "labels": {},
    "annotations": {}
  },
  "spec": {
    "displayName": "分类显示名",
    "slug": "category-slug",
    "priority": 0,
    "children": ["child-category-name"],
    "cover": "",
    "description": "",
    "hideFromList": false,
    "template": "",
    "postTemplate": "",
    "preventParentPostCascadeQuery": false
  },
  "status": {
    "permalink": "https://example.com/categories/category-slug",
    "postCount": 10,
    "visiblePostCount": 8
  }
}
```

### CategorySpec 字段

| 字段                            | 类型     | 必填 | 说明                                         |
| ------------------------------- | -------- | ---- | -------------------------------------------- |
| `displayName`                   | string   | 是   | 分类显示名称（最少 1 字符）                  |
| `slug`                          | string   | 是   | 分类别名（最少 1 字符）                      |
| `priority`                      | integer  | 是   | 排序优先级，默认 0                           |
| `children`                      | string[] | 否   | 子分类的 metadata.name 数组                  |
| `cover`                         | string   | 否   | 封面图片 URL                                 |
| `description`                   | string   | 否   | 分类描述                                     |
| `hideFromList`                  | boolean  | 否   | 是否在分类列表中隐藏（仅一级分类生效）       |
| `template`                      | string   | 否   | 分类页面模板                                 |
| `postTemplate`                  | string   | 否   | 分类下文章页面模板（优先级低于文章自身模板） |
| `preventParentPostCascadeQuery` | boolean  | 否   | 是否阻止父分类级联查询本分类下的文章         |

### CategoryStatus 字段

| 字段               | 类型    | 说明                                           |
| ------------------ | ------- | ---------------------------------------------- |
| `permalink`        | string  | 分类永久链接                                   |
| `postCount`        | integer | 包括当前和其下所有层级的文章数量 (depth=max)   |
| `visiblePostCount` | integer | 包括当前和其下所有层级的已发布且公开的文章数量 |
