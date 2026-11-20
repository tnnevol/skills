# Bug 命令（bug）

```text
chandao-cli bug list [--product <id> | --project <id> | --execution <id>] [--page <n>] [--limit <n>]
chandao-cli bug get --id <id>
chandao-cli bug create --product <id> --title <title> [--severity <n>] [--steps "<html>"] [--openedBuild trunk]
chandao-cli bug update --id <id> [--title ...] [--steps ...] [--assignedTo ...]
chandao-cli bug resolve --id <id> --resolution <resolution> [--resolvedBuild <build>] [--assignedTo ...] [--comment ...]
chandao-cli bug close --id <id> [--comment ...]
chandao-cli bug activate --id <id> [--openedBuild ...]
chandao-cli bug confirm --id <id> [--comment ...]
chandao-cli bug delete --id <id> --yes
```

## 关联

- 必填 `--product`；
- 建议同时传 `--project` / `--execution`（所属项目/迭代），从需求发现时再传 `--story <需求ID>`，方便按项目/执行/需求筛选；
- 缺少这些字段时 Bug 会变成孤立数据。

## 关键字段

| 参数 | 说明 |
| --- | --- |
| `--product` | 所属产品（create 必填） |
| `--title` | Bug 标题（纯文本） |
| `--steps` | 重现步骤，**HTML 片段** |
| `--severity` | 严重程度 1–4 |
| `--pri` | 优先级 |
| `--type` | `codeerror` / `config` / `install` / `security` / `performance` 等 |
| `--openedBuild` | 影响版本，默认 `trunk` |
| `--resolution` | `fixed` / `bydesign` / `notrepro` / `duplicate` / `postponed` / `willnotdo` / `tostory` / `external` |
| `--resolvedBuild` | 解决版本（建议传） |

## 旧版 v1 注意

- v1 创建 Bug 必须传 `type`（Bug 类型）；CLI 默认 `codeerror`。
- `openedBuild` 默认 `trunk`；`severity`/`pri` 建议显式传。

## 版本

Bug 没有内容版本历史：`update` 直接改当前内容，`version` 字段可能为空，也不支持 `--spec-version`。

## 状态流转

必须用专用命令，`bug update --status` 不会生效：

| 目标 | 命令 |
| --- | --- |
| 已解决 | `bug resolve --id <id> --resolution fixed --resolvedBuild trunk` |
| 已关闭 | `bug close --id <id>` |
| 激活 | `bug activate --id <id>` |
| 确认 | `bug confirm --id <id>` |

## 附件（截图）

```bash
chandao-cli bug create --product 1 --title "导出失败" --severity 2 --steps "<p>复现步骤...</p>"
chandao-cli file upload --file ./error.png --object-type bug --object-id <id>
chandao-cli bug update --id <id> --steps '<p>复现步骤...</p><p><img src="{url}" alt="错误截图"></p>'
```

## 示例

```bash
chandao-cli bug list --product 1 --limit 5
chandao-cli bug resolve --id 4 --resolution fixed --resolvedBuild trunk
```
