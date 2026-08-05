# 标签操作指南

## Actions

| Action       | 用法                                                              | 说明                                      |
| ------------ | ----------------------------------------------------------------- | ----------------------------------------- |
| `list-tags`  | `/halo list-tags [--limit=N] [--page=N] [--sort=xxx]`             | 列出标签（`--limit=0 --page=0` 获取全部） |
| `create-tag` | `/halo create-tag --display-name=名称 [--slug=xxx] [--color=xxx]` | 创建标签                                  |
| `get-tag`    | `/halo get-tag <name>`                                            | 获取标签详情                              |
| `update-tag` | `/halo update-tag <name> [--display-name=xxx] [--color=xxx]`      | 更新标签                                  |
| `delete-tag` | `/halo delete-tag <name>`                                         | 删除标签                                  |

## 参数说明

| 参数              | 说明                                | 适用操作              |
| ----------------- | ----------------------------------- | --------------------- |
| `--display-name=` | 标签显示名（必填）                  | create-tag/update-tag |
| `--slug=`         | 标签别名                            | create-tag/update-tag |
| `--color=`        | 标签颜色，如 `#ff0000`              | create-tag/update-tag |
| `--cover=`        | 封面 URL                            | update-tag            |
| `--description=`  | 标签描述                            | create-tag/update-tag |
| `--limit=N`       | 每页数量，默认 20                   | list-tags             |
| `--page=N`        | 页码，从 1 开始                     | list-tags             |
| `--sort=`         | 排序字段，如 `spec.displayName,asc` | list-tags             |

## ⚠️ 重要说明

1. **全部走 Extension API** — 标签的 list/create/get/update/delete 均使用 Extension API (`/apis/content.halo.run/v1alpha1/tags`)。
2. **乐观锁** — 更新需要 `metadata.version`，脚本自动获取最新版本并在 409 冲突时重试。
3. **metadata.name 自动生成** — `create-tag` 自动生成 `{slug}-{timestamp}` 格式的 name。
4. **全量获取** — `list-tags --page=0 --limit=0` 可获取所有标签（不分页）。
5. **无变更检测** — `update-tag` 在没有实际变更时直接返回"无变更"，不发起 PUT 请求。

---

## API 参考

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
- 无变更时直接返回"无变更"，不发起 PUT 请求

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
