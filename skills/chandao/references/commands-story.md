# 需求命令（story）

```text
chandao-cli story list [--product <id> | --project <id> | --execution <id>] [--page <n>] [--limit <n>]
chandao-cli story get --id <id> [--spec-version <n>]
chandao-cli story create --product <id> --title <title> --spec "<html>" --verify "<html>" [--pri <n>] [--project <id> --execution <id>]
chandao-cli story update --id <id> [--title ...] [--spec ...] [--verify ...] [--status ...]
chandao-cli story close --id <id> --reason <reason> [--comment <text>]
chandao-cli story change --id <id> --reviewer <账号列表> [--title ...] [--spec ...]
chandao-cli story activate --id <id>
chandao-cli story delete --id <id> --yes
```

## 必填/关键字段

| 参数 | 说明 |
| --- | --- |
| `--product` | 所属产品（create 必填；list 三选一） |
| `--title` | 需求标题（纯文本） |
| `--spec` | 需求描述，**HTML 片段** |
| `--verify` | 验收标准，**HTML 片段**（必填，与 spec 一起构成完整需求） |
| `--pri` | 优先级 |
| `--module` / `--parent` | 模块 / 父需求 |
| `--estimate` | 预计工时 |
| `--reviewer` | 评审人（change 必填），逗号分隔 |
| `--reason` | close 必填：`done` / `subdivided` / `duplicate` / `postponed` / `willnotdo` / `cancel` / `bydesign` |

## 版本

- 默认 `get` 返回最新版本内容；
- `story change` 生成新版本；`story update` 修改当前版本（不递增）；
- 读取历史版本：`story get --id <id> --spec-version <n> --api-version v2`；v1 不支持，会报错。

## 旧版 v1 注意

- v1 创建需求时 `pri` / `category` / `branch` 是必填；CLI 会补默认值 `pri=3`、`category=feature`、`branch=0`。
- 部分旧版实例的 `PUT /stories/{id}`（story update）会返回 400 `error`；内容变更改用：

```bash
chandao-cli story change --id <id> --reviewer <账号> --spec '<p>...</p>'
```

## 内容格式

- `--spec`、`--verify` 必须是 HTML 片段，不能 Markdown。
- 图片必须走附件 workflow：先 `file upload --object-type story --object-id <id>`，再把返回 URL 放进 `<img src="...">`。

## 示例

```bash
chandao-cli story list --product 1 --limit 5
chandao-cli story create --product 1 --title "支持导出 Excel" --pri 3 \
  --spec '<p><strong>目标</strong></p><p>支持导出 .xlsx。</p>' \
  --verify '<ul><li>给定有数据列表，导出后 .xlsx 内容与列表一致。</li></ul>'
chandao-cli story update --id 7 --spec '<p>更新后的描述</p>'
chandao-cli story close --id 7 --reason done --comment "已上线"
```
