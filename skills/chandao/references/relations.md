# 关联关系（必须填）

禅道的数据是**按产品/项目/执行串联**的。创建时不填关联字段，后续在列表、看板、测试单里都查不到，等于埋进孤岛。Agent 在创建前必须先解析出正确的 ID，并写进请求。

## 1. 对象关系图

```text
产品 product
├── 项目 project
│   └── 执行/迭代 execution
│       ├── 任务 task ──────────── 关联 story
│       ├── 测试单 testtask ───── 关联 execution + build
│       └── Bug bug ───────────── 关联 story / execution
└── 需求 story ────────────────── 关联 project / execution（v2）
    ├── 任务 task
    ├── Bug bug
    ├── 测试用例 testcase
    └── 测试单 testtask

测试用例 testcase：product + project/execution + story
```

## 2. 各对象创建时的关联字段

| 对象 | 必填关联 | 建议关联 | CLI 参数 |
| --- | --- | --- | --- |
| 需求 story | `product` | v2：`project` **或** `execution`（二选一）；可选 `module`、`plan`、`branch` | `--product --project --execution --module --parent` |
| 任务 task | `execution` | `story`、`module` | `--execution --story --module` |
| Bug bug | `product` | `project`、`execution`、`story` | `--product --project --execution --story` |
| 测试用例 testcase | `product` | `project`、`execution`、`story`、`module` | `--product --project --execution --story --module` |
| 测试单 testtask | `project` + `product` + `execution` + `build` | `owner`、`begin`/`end` | CLI 暂未提供 create；见第 5 节 |

版本差异：

- **v2**：需求创建支持 `project` / `execution`，但二者是**不同维度的关联**：
  - 传 `--project`：进入项目需求池（`story list --project <项目>` 可查）；
  - 传 `--execution`：进入迭代需求（`story list --execution <执行>` 可查）；
  - 同时传时实测只有 `execution` 关联生效（`zt_projectstory.project` 写的是执行 ID），项目池里查不到。需要同时进项目和迭代时，创建到项目后用 Web 关联迭代。
- **v1（旧版）**：`POST /stories` 只接受 `product`/`plan`/`branch`/`module` 等，**不接受 project/execution**；需要到项目里用 Web 关联，或升级到有 v2 的实例。
- Bug / 任务 / 用例的关联字段 v1/v2 都可用（字段名由 CLI 自动转换）。

## 3. 先解析 ID，再创建

```bash
# 产品 → 项目 → 执行 → 需求
chandao-cli product list --limit 50
chandao-cli project list --limit 50
chandao-cli execution list --project <projectID> --limit 50
chandao-cli story list --product <productID> --limit 50
```

不要猜 ID，也不要把 `0` 当占位符提交（会丢关联）。

## 4. 示例：需求进项目池（或改用 `--execution` 进迭代）

```bash
chandao-cli story create --product 1 --project 2 \
  --title "支持导出 Excel" --pri 3 \
  --spec '<p>……</p>' --verify '<ul><li>……</li></ul>'
```

示例：带完整关联的 Bug（从需求来）：

```bash
chandao-cli bug create --product 1 --project 2 --execution 3 --story 12 \
  --title "导出 Excel 失败" --severity 2 --openedBuild trunk --steps '<p>……</p>'
```

示例：任务挂到执行 + 需求：

```bash
chandao-cli task create --execution 3 --story 12 --name "实现导出" \
  --estStarted 2026-12-01 --deadline 2026-12-07
```

示例：用例挂到产品 + 项目/执行 + 需求：

```bash
chandao-cli testcase create --product 1 --project 2 --execution 3 --story 12 \
  --title "导出 Excel" --steps '[{"step":"打开导出页","expect":"显示导出按钮"}]'
```

## 5. 测试单 testtask

CLI 已支持查询/删除：

```bash
chandao-cli testtask list --product 1
chandao-cli testtask list --project 2
chandao-cli testtask get --id 1
```

创建测试单需要同时满足：

- `project`、`product`、`execution`、`build`（版本/构建 ID）都不为空；
- `name`、`begin`、`end` 必填；
- 执行必须属于该产品/项目，build 必须是该产品的有效构建。

CLI 暂未封装 create（依赖 build 选择）；需要时用 Web 界面，或 `chandao-cli api POST /v1/testtasks/... --data '{...}'`，并先通过 `api GET /v1/products/<id>/builds` 找到 build ID。

## 6. 创建后自检

```bash
chandao-cli story get --id <id>  | jq '{product, project, execution, title}'
chandao-cli bug get --id <id>    | jq '{product, project, execution, story}'
chandao-cli task get --id <id>   | jq '{execution, story, name}'
chandao-cli testcase get --id <id> | jq '{product, project, execution, story}'
chandao-cli testtask list --product <productID> | jq '.data.data.testtasks[] | {id,project,execution,build,name}'
```

若 `project`/`execution` 仍为 0，说明创建时没传或该版本不支持，需要用另一版本或 Web 补关联。

## 7. 优先级

当用户没有明确给出关联时：

1. 已知产品/项目/执行上下文 → 直接使用；
2. 只给了标题/需求文本 → 先 `product list` / `project list` / `execution list` 选出最匹配项；
3. 无法确定 → 向用户确认目标产品/项目/执行，**不要**用 0 或空值硬建。
