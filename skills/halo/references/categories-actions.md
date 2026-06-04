# 分类操作指南

## Actions

| Action            | 用法                                                               | 说明                                      |
| ----------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| `list-categories` | `/halo list-categories [--limit=N] [--page=N] [--sort=xxx]`        | 列出分类（`--limit=0 --page=0` 获取全部） |
| `create-category` | `/halo create-category --display-name=名称 [--slug=xxx]`           | 创建分类                                  |
| `get-category`    | `/halo get-category <name>`                                        | 获取分类详情                              |
| `update-category` | `/halo update-category <name> [--display-name=xxx] [--priority=N]` | 更新分类                                  |
| `delete-category` | `/halo delete-category <name>`                                     | 删除分类                                  |

## 参数说明

| 参数               | 说明                             | 适用操作                        |
| ------------------ | -------------------------------- | ------------------------------- |
| `--display-name=`  | 分类显示名（必填）               | create-category/update-category |
| `--slug=`          | 分类别名                         | create-category/update-category |
| `--cover=`         | 封面 URL                         | create-category/update-category |
| `--description=`   | 分类描述                         | create-category/update-category |
| `--priority=N`     | 排序优先级，默认 0               | create-category/update-category |
| `--hide-from-list` | 隐藏分类不在列表显示             | update-category                 |
| `--limit=N`        | 每页数量，默认 20                | list-categories                 |
| `--page=N`         | 页码，从 1 开始                  | list-categories                 |
| `--sort=`          | 排序字段，如 `spec.priority,asc` | list-categories                 |

## ⚠️ 重要说明

1. **全部走 Extension API** — 分类的 list/create/get/update/delete 均使用 Extension API (`/apis/content.halo.run/v1alpha1/categories`)。
2. **树形结构** — 分类支持层级关系，`spec.children` 数组存储子分类的 metadata.name。
3. **乐观锁** — 更新需要 `metadata.version`，脚本自动获取最新版本并在 409 冲突时重试。
4. **metadata.name 自动生成** — `create-category` 自动生成 `{slug}-{timestamp}` 格式的 name。
5. **全量获取** — `list-categories --page=0 --limit=0` 可获取所有分类（不分页）。
6. **无变更检测** — `update-category` 在没有实际变更时直接返回"无变更"，不发起 PUT 请求。
7. **hideFromList 限制** — 仅在一级分类（根节点）上生效，隐藏后该分类及其子分类和关联文章不在分类列表显示，但仍可通过永久链接访问。
