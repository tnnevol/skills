# 执行/迭代命令（execution）

```text
chandao-cli execution list [--project <id>] [--status undone|wait|doing|all] [--page <n>] [--limit <n>]
chandao-cli execution get --id <id>
chandao-cli execution create --project <id> --name <name> --begin <date> --end <date> [--lifetime short|long|ops] [--days <n>] [--products 1,2]
chandao-cli execution update --id <id> [--name ...] [--begin ...] [--end ...] [--products ...]
chandao-cli execution start --id <id>        # 仅 v2
chandao-cli execution suspend --id <id>      # 仅 v2
chandao-cli execution close --id <id>        # 仅 v2
chandao-cli execution delete --id <id> --yes
```

## 必填字段

| 参数 | 说明 |
| --- | --- |
| `--project` | 所属项目（create 必填） |
| `--name` | 执行名称 |
| `--begin` / `--end` | 起止日期 |
| `--lifetime` | 生命周期：`short` / `long` / `ops` |
| `--days` | 迭代天数 |
| `--products` | 关联产品 ID，逗号分隔 |
| `--PO` / `--QD` / `--PM` / `--RD` | 各角色负责人 |

## 注意

- 创建用 `--project`（不是 `--product`）。
- 启动/暂停/关闭没有 v1 实现，强制 v1 会报错；auto 在 v2 可用时正常。
- 更新自动合并当前字段。

## 示例

```bash
chandao-cli execution list --project 2 --limit 10
chandao-cli execution create --project 2 --name "迭代 40" --begin 2026-12-01 --end 2026-12-15 --lifetime short --days 15
chandao-cli execution start --id 4
```
