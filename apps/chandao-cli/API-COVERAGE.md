# API Coverage

chandao-cli 的命令与禅道 REST API v1 / v2 的映射。基于对 `192.168.0.19:8890`（禅道 22.1）的实测：

- **v1**：97 个文档化接口中 96 个可用（唯一例外是官方文档笔误的 `DELETE /v1/productsplan/{id}`，真实应为 `/v1/productplans/{id}`）。
- **v2**：核心模块（产品/项目/执行/任务/Bug/需求/用例/用户等）可用；企业版模块（工作流、文档、反馈、工单、AI、风险、问题、会议、基线、交付物、周报、过程裁剪等）在实例上未实现。

## 命令 → 版本

| 命令 | v1 | v2 | 说明 |
|---|:--:|:--:|---|
| `auth login/status/use/logout` | ✅ | ✅ | 登录探测两个版本 |
| `product list/get/create/update/delete` | ✅ | ✅ | v1 update 用 `/product/{id}`（文档路径），v2 用 `/products/{id}` |
| `product list-by-program` | ✅ | ✅ | v1 用 `?program=`，v2 用 `/programs/{id}/products` |
| `project list/get/create/update/delete` | ✅ | ✅ | |
| `project list-by-program` | ✅ | ✅ | |
| `story list` | ✅ | ✅ | 必须带 product/project/execution |
| `story get/create/update/delete` | ✅ | ✅ | |
| `story close/change` | ✅ | ✅ | v1 POST，v2 PUT |
| `story activate` | ✅ | ✅ | v1 `/active`（源码 entry），v2 `/activate` |
| `task list` | ✅ | ✅ | 必须带 `--execution` |
| `task get/create/update/delete` | ✅ | ✅ | |
| `task start/pause/restart/finish/close` | ✅ | ✅ | v1 POST，v2 PUT |
| `task activate` | ✅ | ✅ | v1 `/active`，v2 `/activate` |
| `execution list/get/create/update/delete` | ✅ | ✅ | |
| `execution start/suspend/close` | ❌ | ✅ | 仅 v2 |
| `bug list` | ✅ | ✅ | 支持 product/project/execution 过滤（v1 的 project/execution 路径来自源码 entry） |
| `bug get/create/update/delete` | ✅ | ✅ | |
| `bug resolve/close/activate/confirm` | ✅ | ✅ | v1 POST，v2 PUT；activate v1 路径为 `/active` |
| `testcase list/get/create/update/delete` | ✅ | ✅ | |
| `user list/get/create/update/delete` | ✅ | ✅ | v1 字段更全（dept/role/group/visions） |
| `story get --spec-version` | ❌ | ✅ | v1 忽略 version 参数；v2 返回指定版本内容，实体 version 仍为当前版本 |
| `testcase get --spec-version` | ✅ | ✅ | v1/v2 都支持 `?version=N`；v1 响应 `currentVersion` 标识读取版本 |
| `testtask list/get/delete` | ✅ | ❌ | 测试单读接口仅 v1；创建需 project+product+execution+build，CLI 暂未封装 |
| `group list` | ✅ | ✅ | v1 `/groups` 带 `privs`；v2 `/groups` 带 `users` |
| `dept list/get` | ✅ | ✅ | v1 `/departments`、v2 `/depts`；均无创建接口 |
| `file upload` | ✅ | ✅ | v1 字段 `imgFile`，不绑定对象；v2 字段 `file` + `objectType/objectID`（缺绑定返回 200 空） |
| `file get` | ❌ | ✅ | v2 返回元数据；v1 无此语义 |
| `file download` / `story images` | ✅ | ❌（元数据） | 下载走 v1 `GET /files/{id}` 二进制；v2 只有元数据，无下载接口 |
| `doc libs/list/get` | ✅ | ✅ | v1 `/doclibs`、`/docs`、`/doc/{id}`；v2 `/doc/...`（22.5+） |
| `doc create/update/delete` | ❌ | ✅ | v2 文档写接口需 22.5+；22.1 返回空。`contentType=doc` 才会 Markdown→HTML |
| `api <METHOD> <PATH>` | ✅ | ✅ | 直接透传，path 自带版本前缀 |

## 附件上传（实测）

| 检查 | 结果 |
|---|---|
| v1 `POST /v1/files`（`imgFile`） | ✅ 200，返回 `{id,url}`，不绑定对象 |
| v2 `POST /v2/files`（`file` + `objectType/objectID`） | ✅ 200，返回 `{status,id,url}`，绑定对象 |
| v2 缺少 `objectType/objectID` | ⚠️ 200 空响应（CLI 直接报错） |
| 返回 URL | `/index.php?m=file&f=read&t=png&fileID=N`，嵌入 HTML `<img src>` 后渲染正常（禅道会自动补 `onload`） |
| 未登录访问 file read | 302/登录 HTML（正常鉴权）；下载请用 `file download` 走 v1 files 接口 |

## 版本差异处理

| 维度 | v1 | v2 |
|---|---|---|
| 登录 | `POST /api.php/v1/tokens` → 201 token | `POST /api.php/v2/users/login` → 200 token |
| 鉴权头 | `Token: <token>` | `Token: <token>` |
| 分页 | `page` / `limit` / `order` | `pageID` / `recPerPage` / `orderBy` |
| 状态流转 | `POST /{resource}/{id}/{action}` | `PUT /{resource}/{id}/{action}` |
| 错误 | HTTP 4xx + `{"error": "..."}` | 多为 HTTP 200 + `{"status":"fail","message":...}` |
| 未命中路由 | 404 `{"error":"not found"}` | 200 空响应 |
| 响应结构 | 扁平对象/数组 | `{"status":"success", ...}`，实体常包一层（`product`/`task`/…） |
| 创建需求 | body `product` | body `productID` |
| 创建任务 | `POST /executions/{id}/tasks`，body 无 executionID | `POST /tasks`，body `executionID` |

CLI 会按实际使用的版本生成对应请求；输出里的 `data.version` 标明版本，`data.fallback` 标明 auto 回退。

## 未覆盖 / 限制

- **修改角色权限（grouppriv）**：无 REST API，仅可 `group list` 读；写需 Web 会话（`index.php?m=group&f=managePriv`）或直接操作 `zt_grouppriv`。
- **部门创建/修改**：v1 只有查询；创建需 Web 或 DB。
- **v2 未实现模块**：强制 v2 调用会报错；auto 会回退 v1（若 v1 有实现），否则提示不可用。
- **未文档化 v1 接口**：实例源码里还有 `issues/risks/meetings/repos/pipelines/zfile/jobs/...` 等 entry，可用 `api` 命令直接调用，但未封装成子命令。

## 实测记录

| 检查 | 结果 |
|---|---|
| v2 登录 | ✅ 200 + token |
| v1 登录 | ✅ 201 + token |
| 自动探测 | `detectedVersion = v2` |
| `product list` auto / v1 / v2 | ✅ 均返回数据 |
| `group list` auto | ✅ 自动回退 v1（输出 `fallback: true`） |
| `--api-version v1 execution start` | ✅ 按预期拒绝（仅 v2） |
| 写操作 | 仅验证路由/参数校验，未在实例上创建业务数据 |


## 旧版 v1-only 实例实测（chandao.freetek.cc）

| 项 | 结果 |
|---|---|
| 站点部署 | 子路径 `/zentao`，API `http://chandao.freetek.cc/zentao/api.php/v1` |
| 根地址登录 | ✅ `auth login --base-url http://chandao.freetek.cc` 自动探测到 `/zentao`（`subpathDetected: true`） |
| v1 登录 | ✅ 201 + token |
| v2 登录 | ❌ HTTP 200 + PHP Fatal `Class 'userEntry' not found` |
| v2 其他路由 | ❌ 同样 Fatal（`productsEntry` 等）→ 该实例 v2 整体不可用 |
| auto 探测 | ✅ `detectedVersion=v1`，所有读命令正常 |
| 读命令 | ✅ product/project/execution/story/bug/task/testcase/user/group/dept 列表与详情 |
| v1 上传 | ✅ 返回绝对 URL `http://chandao.freetek.cc/zentao/file-read-56133.png` |
| v1 story 创建 | ✅ 需要 `pri`/`category`/`branch`，CLI 已补默认值 |
| v1 story update | ❌ `PUT /stories/{id}` 返回 400 `error`；改用 `story change --reviewer` ✅ |
| v1 bug/task 更新 | ✅ HTML `steps` / `desc` 可写入并回显 |
| v1 testcase 步骤 | ✅ `steps` 需对象数组 `{desc,expect,type}`；CLI 自动转换 |
| v1 bug 创建 | 需 `type`（CLI 默认 `codeerror`） |
| v1 testcase 创建 | 需 `type`/`pri`（CLI 默认 `feature`/`3`） |
| v1 task 创建 | 需 `estStarted`（`deadline` 建议传），CLI 不设默认日期 |
