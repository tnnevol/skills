# 字段速查

> CLI 已封装 v1/v2 字段差异；本表用于核对含义与必填项。

## 产品 product

| 字段 | 创建 | 说明 |
| --- | --- | --- |
| `name` | ✅ | 名称 |
| `program` | 可选 | 项目集 |
| `line` | 可选 | 产品线 |
| `type` | 可选 | `normal` / `branch` / `platform` |
| `PO` / `QD` / `RD` | 可选 | 负责人账号 |
| `reviewer` | 可选 | 评审人（数组） |
| `desc` | 可选 | 纯文本 |
| `acl` | 可选 | `open` / `private` |

## 项目 project

| 字段 | 创建 | 说明 |
| --- | --- | --- |
| `name` | ✅ | 名称 |
| `model` | ✅ | `scrum` / `waterfall` / `kanban` / `agileplus` / `waterfallplus` |
| `begin` / `end` | ✅ | 起止日期 |
| `PM` | 可选 | 项目经理 |
| `products` | 可选 | 关联产品数组 |
| `parent` | 可选 | 父项目/项目集 |
| `workflowGroup` | 可选 | 工作流分组 |

## 需求 story

| 字段 | 创建 | 说明 |
| --- | --- | --- |
| `product` / `productID` | ✅ | 所属产品 |
| `title` | ✅ | 标题 |
| `spec` | 可选 | **HTML 片段** |
| `verify` | 可选 | **HTML 片段** |
| `pri` | 可选 | 优先级 |
| `module` / `parent` | 可选 | 模块/父需求 |
| `estimate` | 可选 | 预计工时 |
| `category` / `source` / `sourceNote` | 可选 | 类型/来源 |
| `assignedTo` | 可选 | 指派 |
| `reviewer` | 可选 | 评审人 |
| `project` / `execution` | 可选 | 关联项目/执行 |

## 任务 task

| 字段 | 创建 | 说明 |
| --- | --- | --- |
| `execution` / `executionID` | ✅ | 所属执行 |
| `name` | ✅ | 任务名 |
| `type` | 可选 | `devel` / `test` / `design` / `discuss` / `ui` |
| `desc` | 可选 | **HTML 片段** |
| `assignedTo` | 可选 | 指派 |
| `estStarted` / `deadline` | 可选 | 预计开始/截止 |
| `pri` / `estimate` | 可选 | 优先级/工时 |
| `module` / `story` | 可选 | 模块/需求 |

## 执行 execution

| 字段 | 创建 | 说明 |
| --- | --- | --- |
| `project` | ✅ | 所属项目 |
| `name` | ✅ | 名称 |
| `begin` / `end` | ✅ | 起止日期 |
| `lifetime` | 可选 | `short` / `long` / `ops` |
| `days` | 可选 | 迭代天数 |
| `products` | 可选 | 产品数组 |
| `PO` / `QD` / `PM` / `RD` | 可选 | 负责人 |
| `acl` | 可选 | `open` / `private` |

## Bug bug

| 字段 | 创建 | 说明 |
| --- | --- | --- |
| `product` / `productID` | ✅ | 所属产品 |
| `title` | ✅ | 标题 |
| `openedBuild` | 建议 | 影响版本，默认 `trunk` |
| `steps` | 可选 | **HTML 片段** |
| `severity` / `pri` | 可选 | 严重程度/优先级 |
| `type` | 可选 | Bug 类型 |
| `project` / `execution` | 可选 | 关联 |
| `story` | 可选 | 相关需求（单个） |
| `resolution` | resolve 必填 | 解决方案 |
| `resolvedBuild` | 建议 | 解决版本 |
| `assignedTo` | resolve 建议 | 指派人 |

## 测试用例 testcase

| 字段 | 创建 | 说明 |
| --- | --- | --- |
| `product` / `productID` | ✅ | 所属产品 |
| `title` | ✅ | 标题 |
| `steps` | ✅ | 纯文本 JSON：`[{"step":"...","expect":"..."}]` |
| `module` / `story` | 可选 | 模块/需求 |
| `pri` / `type` | 可选 | 优先级/类型 |
| `precondition` | 可选 | 前置条件（纯文本） |

## 用户 user

| 字段 | v1 | v2 |
| --- | --- | --- |
| `account` / `password` / `realname` | ✅ | ✅ |
| `gender` | ✅ `f`/`m` | 有限 |
| `role` | ✅ | 有限 |
| `dept` | ✅ | ❌ |
| `visions` | ✅ | ❌ |
| `group` | ✅（逗号分隔 ID） | ❌ |
| `email` | ✅ | ❌ |

## 附件 file

| 字段 | 说明 |
| --- | --- |
| `file` | 本地文件路径（CLI 参数 `--file`） |
| `objectType` | `story` / `bug` / `task` / `testcase`（v2） |
| `objectID` | 对象 ID（v2） |
| `uid` | v1 编辑器会话（可选） |
