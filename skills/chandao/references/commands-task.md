# 任务命令（task）

```text
chandao-cli task list --execution <id> [--page <n>] [--limit <n>]
chandao-cli task get --id <id>
chandao-cli task create --execution <id> --name <name> [--type devel|test|design|discuss|ui] [--desc "<html>"]
chandao-cli task update --id <id> [--name ...] [--assignedTo ...] [--desc ...]
chandao-cli task start --id <id> [--assignedTo ...] [--left <n>] [--comment ...]
chandao-cli task pause --id <id> [--comment ...]
chandao-cli task restart --id <id> [--left <n>] [--comment ...]
chandao-cli task finish --id <id> --consumed <小时> [--left <n>] [--finishedDate ...]
chandao-cli task close --id <id> [--comment ...]
chandao-cli task activate --id <id>
chandao-cli task delete --id <id> --yes
```

## 关联

- 必填 `--execution`（所属执行/迭代）；
- 建议传 `--story <需求ID>` 把任务挂到需求，`--module` 归属模块；
- 任务只挂在执行下，执行本身已关联项目，因此不再重复传 project。

## 关键字段

| 参数 | 说明 |
| --- | --- |
| `--execution` | 所属执行（create/list 必填） |
| `--name` | 任务名称（纯文本） |
| `--desc` | 任务描述，**HTML 片段** |
| `--type` | `devel` / `test` / `design` / `discuss` / `ui` |
| `--assignedTo` | 指派账号 |
| `--estimate` / `--consumed` / `--left` | 预计/已消耗/剩余工时 |
| `--story` | 关联需求 ID |

## 旧版 v1 注意

- v1 创建任务必须传 `estStarted`（预计开始）；部分实例还要求 `deadline`。CLI 不设默认日期，请显式传。

## 版本

任务没有内容版本历史：`update` 直接改当前内容，`version` 字段不会递增，也不支持 `--spec-version`；读取始终是最新内容。

## 注意

- `task finish` 必须 `--consumed`。
- 附件 workflow：先创建任务拿到 ID，再 `file upload --object-type task --object-id <id>`，最后 `task update --desc` 回显链接。
- 更新会自动合并当前字段。

## 示例

```bash
chandao-cli task list --execution 3 --limit 5
chandao-cli task create --execution 3 --name "接口联调" --assignedTo mizen --estimate 8 --estStarted 2026-12-01 --deadline 2026-12-07
chandao-cli task start --id 9 --left 8
chandao-cli task finish --id 9 --consumed 8 --left 0
```
