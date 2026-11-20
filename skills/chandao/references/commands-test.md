# 测试用例命令（testcase）

```text
chandao-cli testcase list [--product <id> | --project <id> | --execution <id>] [--page <n>] [--limit <n>]
chandao-cli testcase get --id <id> [--spec-version <n>]
chandao-cli testcase create --product <id> --title <title> --steps '<json 数组>' [--module <id>] [--pri <n>]
chandao-cli testcase update --id <id> [--title ...] [--steps ...]
chandao-cli testcase delete --id <id> --yes
```

## 步骤格式（严格）

`--steps` 是 JSON 数组，每个元素包含 `step` 和 `expect`，**全部为纯文本**：

```bash
chandao-cli testcase create --product 1 --title "导出 Excel" \
  --steps '[{"step":"打开导出页","expect":"显示导出按钮"},{"step":"点击导出 Excel","expect":"下载 xlsx 且内容完整"}]'
```

禁止：

- HTML 标签（`<p>`、`<strong>` 等）；
- Markdown 语法（`-`、`**`、`` ` `` 等）；
- 在步骤里塞图片/外链。

## 旧版 v1 注意

- v1 创建用例必须传 `type` 与 `pri`；CLI 默认 `feature` / `3`。
- v1 的 steps 在 API 层要求对象数组 `[{desc,expect,type}]`；CLI 会自动把 `--steps` JSON 转成该格式，不需要手写。

## 关联

- 必填 `--product`；
- 建议传 `--project` / `--execution` 以及 `--story <需求ID>`，否则用例在产品/项目/需求下都查不到；
- 模块用 `--module`。

## 版本

- 每次 `testcase update` 生成新版本，默认 `get` 返回最新；
- 历史版本：`testcase get --id <id> --spec-version <n>`；v1/v2 都支持，v1 响应里 `currentVersion` 是实际读取版本。

## 字段

| 参数 | 说明 |
| --- | --- |
| `--product` | 所属产品（create 必填） |
| `--title` | 用例标题（纯文本） |
| `--steps` | 步骤 JSON（必填） |
| `--module` / `--story` | 模块 / 关联需求 |
| `--pri` | 优先级 |
| `--type` | 用例类型 |
| `--precondition` | 前置条件（纯文本） |

## 附件

需要截图时，先创建用例拿到 ID，再单独上传绑定：

```bash
chandao-cli file upload --file ./case.png --object-type testcase --object-id <id>
```

步骤字段保持纯文本，不要把图片标签写进 `step`/`expect`。
