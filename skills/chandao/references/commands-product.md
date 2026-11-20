# 产品命令（product）

```text
chandao-cli product list [--program <id>] [--page <n>] [--limit <n>]
chandao-cli product get --id <id>
chandao-cli product create --name <name> [--program <id>] [--line <id>] [--type normal|branch|platform]
chandao-cli product update --id <id> [--name ...] [--PO <账号>] [--QD ...] [--RD ...] [--reviewer a,b] [--acl open|private]
chandao-cli product delete --id <id> --yes
chandao-cli product list-by-program --program <id>
```

## 字段

| 参数 | 说明 |
| --- | --- |
| `--name` | 产品名称（创建必填） |
| `--program` | 所属项目集 |
| `--line` | 产品线 |
| `--type` | `normal` / `branch` / `platform` |
| `--PO` / `--QD` / `--RD` | 产品/测试/发布负责人账号 |
| `--reviewer` | 评审人，逗号分隔 |
| `--desc` | 描述（纯文本） |
| `--acl` | `open` / `private` |

## 说明

- `list` 支持 `--program` 过滤；`list-by-program` 是语义化别名（v1 走 `?program=`，v2 走 `/programs/{id}/products`）。
- `update` 会自动 GET 回填未提交字段；只传要改的字段。
- 删除需要 `--yes`，先向用户确认。

## 示例

```bash
chandao-cli product list --limit 10
chandao-cli product get --id 1
chandao-cli product create --name "内部工具" --program 1 --PO mizen
chandao-cli product update --id 1 --name "公司网站"
```
