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
