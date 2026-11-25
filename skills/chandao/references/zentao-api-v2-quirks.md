# v1 / v2 API 差异与实例限制

`chandao-cli` 默认 auto：登录时同时探测 v2 与 v1，优先 v2；缺失操作回退 v1。下面这些差异是很多“明明参数对却失败”的根源。

## 1. 登录与鉴权

| 维度 | v1 | v2 |
| --- | --- | --- |
| 登录 | `POST /api.php/v1/tokens` → 201 + token | `POST /api.php/v2/users/login` → 200 + token |
| 请求头 | `Token: <token>` | `Token: <token>` |
| 错误 | HTTP 4xx + `{"error":"..."}` | 多为 200 + `{"status":"fail","message":...}` |

## 2. 分页与排序

| 维度 | v1 | v2 |
| --- | --- | --- |
| 页码 | `page` | `pageID` |
| 每页 | `limit` | `recPerPage` |
| 排序 | `order` | `orderBy` |

CLI 已按版本自动转换，无需手写。

## 3. 状态流转

| 动作 | v1 | v2 |
| --- | --- | --- |
| Bug 解决/关闭/激活 | `POST /bugs/{id}/resolve|close|active` | `PUT /bugs/{id}/resolve|close|activate` |
| 需求关闭/变更 | `POST /stories/{id}/close|change` | `PUT ...` |
| 任务开始/完成/关闭 | `POST /tasks/{id}/start|finish|close` | `PUT ...` |
| 执行启动/暂停/关闭 | ❌ 未实现 | `PUT /executions/{id}/start|suspend|close` |

## 4. 创建字段命名

| 资源 | v1 | v2 |
| --- | --- | --- |
| 需求 | body `product` | body `productID` |
| Bug | body `product` | body `productID` |
| 任务 | `POST /executions/{id}/tasks`，body 无 executionID | `POST /tasks`，body `executionID` |
| 执行 | `POST /projects/{id}/executions` | `POST /executions`，body `project` |

## 5. 响应结构

- v1：多为扁平对象/数组，如 `{"products":[...]}`、`{"id":1,...}`。
- v2：外层通常有 `{"status":"success", ...}`，实体再包一层（`product`/`story`/`task`/`bug`/...）。
- CLI 原样透传到 `data.data`，不做结构归一化，因此解析时要按版本取字段。

## 6. 空响应 = 路由未实现

v2 未实现的路由可能返回 **HTTP 200 + 空 body**（不是 404）。CLI 会把它当错误：

- `/v2/doc/*`（本实例文档模块未实现）
- 其他企业版模块（工作流、反馈、工单等）

v1 未实现路由一般返回 404。

## 7. 本实例已知情况（禅道 22.1）

| 项 | 状态 |
| --- | --- |
| v1 文档化接口 | 96/97 可用（唯一例外是官方文档笔误的 `/productsplan/{id}`，真实为 `/productplans/{id}`） |
| v2 核心模块 | 产品/项目/执行/任务/需求/Bug/用例/用户/附件可用 |
| v2 文档模块 | `/v2/doc/*` 返回空（未实现） |
| 分组 API | v1 `GET /groups`；v2 `GET /groups`（字段含 `users`，无 v1 的 `privs`） |
| 部门 API | v1 `/departments`、v2 `/depts` 均可查询；无创建接口 |
| 隐藏 v1 entry | `groups`、`tasks/{id}/active`、`projects/{id}/bugs` 等来自源码 `api/v1/entries/` |
| 附件上传 | v2 必须绑定对象；v1 只上传不绑定 |
| 历史版本读取 | story：仅 v2 `?version=N`；testcase：v1/v2 都支持 `?version=N`；task/bug：无 |

## 8. 附件上传语义

| 维度 | v1 | v2 |
| --- | --- | --- |
| 路径 | `POST /v1/files` | `POST /v2/files` |
| 表单字段 | `imgFile` | `file` |
| 对象绑定 | ❌（仅 `uid`） | ✅ `objectType` + `objectID` |
| 缺绑定 | 正常返回 | 200 空响应 |
| 返回 | `{id, url}` | `{status,id,url,data:{id,url}}` |

## 9. 登录探测与强制版本

- auto：v2 可用则优先 v2；某命令只有 v1 时回退并标 `fallback: true`。
- 强制 v1/v2：不支持的操作为失败，不会偷偷换版本——这适合回归测试。

## 10. 旧版 v1-only 实例（实测 chandao.freetek.cc）

| 项 | 结果 |
|---|---|
| 部署 | 子路径 `/zentao` |
| v1 | ✅ 登录与全部读接口正常 |
| v2 | ❌ 所有路由 PHP Fatal（`Class 'xxxEntry' not found`），HTTP 200 + HTML |
| auto | ✅ 自动探测为 v1 |
| 上传 | ✅ v1 返回绝对 URL `http://host/zentao/file-read-<id>.png` |
| story 创建 | 需 `pri`/`category`/`branch`；CLI 默认 3/feature/0 |
| story 更新 | `PUT /stories/{id}` 400 `error` → 用 `story change --reviewer` |
| testcase steps | 需对象数组 `{desc,expect,type}`；CLI 自动转换 |
| bug/testcase 创建 | 需 `type`；CLI 默认 `codeerror`/`feature` |
| task 创建 | 需 `estStarted`（+`deadline`） |
