# 测试管理命令

## 测试用例

| 命令                                                                                                                                                                                                                                                            | 描述                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `/chandao testcase list [--product <id>] [--project <id>] [--execution <id>] [--limit N] [--page N]`                                                                                                                                                            | 列出测试用例（支持按产品/项目/执行筛选） |
| `/chandao testcase get <id>`                                                                                                                                                                                                                                    | 测试用例详情                             |
| `/chandao testcase create --product <id> --title <title> [--project <id>] [--execution <id>] [--module <id>] [--type <type>] [--stage <stage>] [--pri 1-4] [--precondition <text>] [--steps <json>] [--story <id>]` | 创建测试用例                             |
| `/chandao testcase update <id> [--title <title>] [--status <status>] [--pri 1-4] [--type <type>] [--module <id>] [--precondition <text>] [--steps <json>] [--story <id>]`                                                                                       | 更新测试用例                             |
| `/chandao testcase delete <id>`                                                                                                                                                                                                                                 | 删除测试用例                             |

> type 可选值：`feature|performance|config|interface|security|other|unit|install`
> stage 可选值：`unit|feature|intergr|system|accept|others`

### ⚠️ 测试用例步骤与预期格式要求

**重要**：测试用例**必须包含步骤（`--steps`）**，使用纯文本格式，**禁止使用 HTML 和 Markdown**。

**API 期望格式**（平行数组，长度一一对应）：
```json
{
  "steps": ["步骤1", "步骤2"],
  "expects": ["期望1", "期望2"],
  "stepType": ["step", "step"]
}
```

**CLI `--steps` 参数格式**（唯一格式）：

```json
[{"step": "步骤1", "expect": "期望1", "type": "step"}, {"step": "步骤2", "expect": "期望2", "type": "step"}]
```

- `type` 仅支持 `step`
- 三个解析后的数组 `steps`、`expects`、`stepType` 长度一致，一一对应

**示例**：
```bash
--steps '[
  {"step": "打开登录页面", "expect": "页面正常加载，显示用户名和密码输入框", "type": "step"},
  {"step": "输入有效用户名", "expect": "输入框接受字符输入", "type": "step"},
  {"step": "输入有效密码", "expect": "密码以密文显示", "type": "step"},
  {"step": "点击登录按钮", "expect": "按钮点击响应正常", "type": "step"}
]'
```

## 测试单

| 命令                                                                                                                                                                                                                                                                                                       | 描述                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `/chandao testtask list --product <id> [--browse all\|unfinished\|blocked] [--limit N] [--page N]`                                                                                                                                                                                                         | 列出测试单（**必须**指定 `--product`） |
| `/chandao testtask list-by-product --product <id> [--browse <type>] [--limit N] [--page N]`                                                                                                                                                                                                                | 按产品列出测试单                       |
| `/chandao testtask list-by-project --project <id> [--limit N] [--page N]`                                                                                                                                                                                                                                  | 按项目列出测试单                       |
| `/chandao testtask list-by-execution --execution <id> [--limit N] [--page N]`                                                                                                                                                                                                                              | 按执行列出测试单                       |
| `/chandao testtask create --product <id> --name <name> --build <id> --begin <date> --end <date> [--project <id>] [--execution <id>] [--assigned <user>] [--pri 1-4] [--desc <desc>] [--status <status>] [--module <id>] [--report <report>] [--mailto <accounts>] [--stories <ids>] [--linkcases <cases>]` | 创建测试单                             |
| `/chandao testtask update <id> [--name <name>] [--assigned <user>] [--pri 1-4] [--status <status>] [--desc <desc>]`                                                                                                                                                                                        | 更新测试单                             |
| `/chandao testtask delete <id>`                                                                                                                                                                                                                                                                            | 删除测试单                             |

### ⚠️ 更新操作前必须先获取当前值

**问题**：禅道 API 的 PUT 请求会将未包含的字段重置为默认值。

**正确流程**：
1. 先执行 `<module> get <id>` 获取当前值
2. 保留需要保持不变的字段值
3. 只修改需要更新的字段
4. 将所有字段一起发送更新请求

**详见**：`references/pitfalls.md` 第 23 条
