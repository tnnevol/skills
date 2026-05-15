# Bug 管理命令

| 命令 | 描述 |
|------|------|
| `/chandao bug list [--product <id>] [--project <id>] [--execution <id>] [--limit N] [--page N]` | 列出 Bug（支持按产品/项目/执行筛选） |
| `/chandao bug get <id>` | Bug 详情 |
| `/chandao bug create --product <id> --title <title> [--assigned <user>] [--pri 1-4] [--severity 1-4] [--type <type>] [--opened-build <build>] [--desc <desc>] [--module <id>] [--execution <id>] [--task <id>] [--story <id>] [--os <os>] [--browser <browser>]` | 创建 Bug |
| `/chandao bug update <id> [--title <title>] [--assigned <user>] [--pri 1-4] [--execution <id>]` | 编辑 Bug |
| `/chandao bug resolve <id> --resolution fixed\|bydesign\|external\|postponed\|willnotfix\|duplicate\|notrepro [--assigned-to <user>] [--resolved-build <build>] [--comment <text>]` | 解决 Bug |
| `/chandao bug close <id> [--comment <text>]` | 关闭 Bug |
| `/chandao bug activate <id>` | 激活 Bug |
| `/chandao bug delete <id>` | 删除 Bug |

### 关键注意事项

- **状态流转必须用专用端点**：`bug resolve/close/activate`，`bug update --status` 无效
- **解决建议传 `--assigned-to`**：否则会清空指派人
- **解决建议传 `--resolved-build`**：禅道可能要求「解决版本」不能为空
- **按执行查 Bug**：`bug list --execution <id>`
- **关联需求**：`bug update` 不支持 `--story`，需直接调用 API
- **只关联一个主需求**：禅道 Bug 的 `story` 字段是单值
- **`bug list` 没有 `--pri` 参数**：优先级过滤需在禅道 Web UI 操作
