# 项目命令（project）

```text
chandao-cli project list [--program <id>] [--page <n>] [--limit <n>]
chandao-cli project get --id <id>
chandao-cli project create --name <name> --model <model> --begin <date> --end <date> [--PM <账号>] [--products 1,2]
chandao-cli project update --id <id> [--name ...] [--model ...] [--begin ...] [--end ...]
chandao-cli project delete --id <id> --yes
chandao-cli project list-by-program --program <id>
```

## 必填字段

| 参数 | 说明 |
| --- | --- |
| `--name` | 项目名称 |
| `--model` | `scrum` / `waterfall` / `kanban` / `agileplus` / `waterfallplus` |
| `--begin` / `--end` | 开始/结束日期（`YYYY-MM-DD`） |
| `--PM` | 项目经理账号 |
| `--products` | 关联产品 ID，逗号分隔 |

## 注意

- `model`（项目模型）与执行的 `type`（sprint/kanban…）不是一回事。
- 更新会自动合并当前字段。
- 删除需要 `--yes`。

## 示例

```bash
chandao-cli project list --limit 10
chandao-cli project create --name "官网改版" --model scrum --begin 2026-12-01 --end 2026-12-31 --PM mizen
chandao-cli project get --id 2
```
