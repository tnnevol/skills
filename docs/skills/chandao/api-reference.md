# 禅道 API 参考

## 权限与角色问题

# 禅道 API v2 权限与角色相关问题

## 1. 用户无角色导致 403 和空列表

### 现象
- 创建操作返回 `HTTP 403: {"status":"error","message":"Not allowed"}`
- 列表操作返回空数据（`recTotal: 0`），但其他用户/模块正常

### 根因
用户 `role` 字段为空（`""`），未分配任何角色。禅道权限模型：
- **读取权限**：登录用户即可访问（如 `story list`、`bug list`）
- **写入权限**：需要角色对应的 capability（如 `storyCreate`、`epicCreate`）
- **模块权限**：某些模块（如 systems）需要特定角色才能访问

### 诊断步骤
```bash
# 1. 查看当前用户角色
chandao user get <numeric_id>
# 检查返回的 "role" 字段是否为空

# 2. 如果 user get <account_name> 返回 "User does not exist"
# 用数字 ID 重试（字符串账号名查询不稳定）
```

### 解决方案
禅道 Web 后台 → 组织 → 用户 → 编辑 → 分配角色

### 受影响的端点（已验证）

| 端点 | 无角色时表现 | 有角色后预期 |
|------|------------|------------|
| `POST /epics` | 403 | 200 + 创建成功 |
| `POST /requirements` | 403 | 200 + 创建成功 |
| `POST /stories` | 403 | 200 + 创建成功 |
| `GET /products/{id}/systems` | 403 | 200 + 系统列表 |
| `GET /products/{id}/requirements` | 200 但 `recTotal: 0` | 200 + 实际数据 |
| `GET /products/{id}/epics` | 200 但 `recTotal: 0` | 200 + 实际数据 |
| `GET /products/{id}/feedbacks` | 200 但 `recTotal: 0` | 200 + 实际数据 |
| `GET /products/{id}/tickets` | 200 但 `recTotal: 0` | 200 + 实际数据 |

**注意**：列表端点不会返回 403，而是返回空数据。这是最容易误判的情况——看起来像代码解析问题，实际是权限问题。

## 2. 角色级模块权限差异（qa vs dev/po/pm）

### 现象
用户已分配角色（如 `qa`），但特定模块仍返回 403。

### 根因
禅道的权限是**按角色 × 模块**配置的，不同角色默认拥有不同模块的访问权限：

| 模块 | qa（测试） | dev（开发） | po（产品） | pm（项目） |
|------|-----------|------------|-----------|-----------|
| Bug | ✅ 读写 | ✅ 读写 | ✅ 读 | ✅ 读 |
| Story | ✅ 读 | ✅ 读写 | ✅ 读写 | ✅ 读 |
| Epic | ✅ 读 | ❌ | ✅ 读写 | ✅ 读 |
| System（应用） | ❌ | ❌ | ✅ 读写 | ✅ 读写 |
| Testcase | ✅ 读写 | ✅ 读 | ✅ 读 | ✅ 读 |
| Testtask | ✅ 读写 | ❌ | ✅ 读 | ✅ 读 |

**已验证**（xiaoqian, role=qa, product=21）：
- `GET /products/21/epics` → 200 ✅（qa 可读 epic）
- `POST /epics` → 403 ❌（qa 无 epic 写入权限）
- `GET /products/21/systems` → 403 ❌（qa 无 system 模块权限）
- `POST /systems` → 403 ❌

### 解决方案
1. 在禅道后台给角色添加对应模块的权限：组织 → 权限 → 选择角色 → 勾选模块
2. 或者换用更高权限的角色（如 `po` 或 `pm`）

### ⚠️ 角色可能被清空
在禅道后台修改权限配置时，用户的 `role` 字段可能被意外清空。修改权限后建议重新检查：
```bash
chandao user get <id>
# 确认 "role" 字段不为空
```

## 3. `user get` 字符串账号名不稳定

### 现象
```bash
chandao user get xiaoqian   # → "User does not exist."
chandao user get 6          # → 正常返回用户详情
```

### 根因
禅道 API v2 的 `/users/{id}` 端点对字符串账号名的查找逻辑不一致，某些账号名无法被识别。

### 建议
始终使用数字用户 ID 查询，不要依赖字符串账号名。

---

## API v2 常见坑点

# ZenTao RESTful API v2.0 常见坑点

## 1. 创建接口参数名必须带 `ID` 后缀

API v2 的创建接口（POST）要求关联字段使用 `xxxID` 格式，而非裸字段名。

| 实体 | API 请求体字段 | 说明 |
|------|--------------|------|
| Task create | `executionID` | 不能用 `execution` |
| Story create | `productID` | 不能用 `product` |
| Bug create | `productID` | 不能用 `product` |
| Execution create | `project` | 特殊，不需要 ID 后缀 |
| Project create | `model`, `begin`, `end` | 项目类型字段是 `model`，非 `type` |

### 错误表现

参数名错误时，API 返回 HTTP 403：
```json
{"status": "fail", "message": "Not allowed"}
```

**重要**：这个 403 不是权限问题，是参数名错误！

如果参数名已确认正确仍返回 403，检查用户是否分配了角色（`role` 字段非空）。见 [zentao-api-permissions.md](./zentao-api-permissions.md)。

## 2. Bug create 的 `openedBuild` 是数组

```json
{
  "productID": 21,
  "title": "Bug标题",
  "openedBuild": ["trunk"]
}
```

## 3. Task create 的必填字段

- `executionID` — 所属执行 ID
- `name` — 任务名称
- `type` — 任务类型（devel/test/design/discuss/ui）

## 4. 登录端点差异

- API v2 登录：`POST /api.php/v2/users/login`（脚本使用此端点）
- 旧版登录：`POST /api.php/v2/tokens`

## 5. list 端点默认过滤导致返回空数据

以下模块的 `list` 命令返回空数据。**根因**：每个 list API 都有默认过滤参数，只返回特定状态的数据。

| 模块 | API 参数名 | 默认值 | 说明 |
|------|-----------|--------|------|
| requirement list | `browse` | `unclosed` | 未关闭的需求 |
| epic list | `browse` | `unclosed` | 未关闭的史诗 |
| testtask list | `browseType` | `all` | 所有测试单 |

- `story list` 和 `bug list` **不受影响**，默认就能返回数据

## 6. PUT/DELETE 端点可能返回空响应

禅道 API 的 PUT/DELETE 端点可能返回空响应体（HTTP 200 但 body 为空）。脚本内部已处理空响应，自动返回 `{"status": "success"}`。

## 7. 状态修改不能通过通用 PUT 端点

`PUT /bugs/{id}` 请求体中的 `status` 字段**会被静默忽略**。

| 操作 | 端点 | 必填参数 |
|------|------|---------|
| 解决 Bug | `PUT /bugs/{id}/resolve` | `resolution`, `resolvedBuild` |
| 关闭 Bug | `PUT /bugs/{id}/close` | 无 |
| 激活 Bug | `PUT /bugs/{id}/activate` | 无 |
| 完成 Task | `PUT /tasks/{id}/finish` | `consumed` |
| 关闭 Task | `PUT /tasks/{id}/close` | 无 |
| 激活 Task | `PUT /tasks/{id}/activate` | 无 |

**关键教训**：API 返回 "成功" 不代表操作真的生效了。修改类操作后必须回查验证。

## 8. Bug resolve 会清空指派人

`PUT /bugs/{id}/resolve` 如果不传 `assignedTo` 参数，会将指派人**清空为空字符串**。

脚本 `bug resolve` action 支持 `--assignedTo` 参数，建议在解决 Bug 时显式传入。

## 9. 修改参数后必须同步更新 SKILL.md

脚本参数修改后，SKILL.md 中的参数表**必须同步更新**，否则 agent 会按过时文档引导用户。

## 参考链接

- [禅道 RESTful API v2.0 开发手册](https://www.zentao.net/book/api/)
- [创建任务](https://www.zentao.net/book/api/post-tasks-2207.html)
- [创建版本/构建](https://www.zentao.net/book/api/post-builds-2230.html)
- [创建Bug](https://www.zentao.net/book/api/post-bugs-2192.html)

---

## v2 API 创建接口必填参数与字段名速查

# 禅道 v2 API 创建接口 — 必填参数与字段名速查

> 来源：禅道官方文档 https://www.zentao.net/book/api/ + Memos 笔记交叉验证
> 整理日期：2026-05-08

## 通用规则

- 请求 Header：`token: <token>`
- 返回格式：`{status: 'success'|'fail', ...}`
- 分页：`recPerPage` ≤ 1000, `pageID` 从 1 开始
- 日期格式：`YYYY-MM-DD`
- URL 格式：`{CHANDAO_URL}/api.php/v2/<resource>`

## 创建接口必填参数

| 接口 | 端点 | 必填参数 | 关键可选参数 |
|------|------|----------|--------------|
| 创建Bug | `POST /bugs` | productID, title, openedBuild | project, execution, severity, pri, type, steps, story |
| 创建需求 | `POST /stories` | productID, title | pri, module, parent, estimate, spec, category, source, verify, assignedTo, reviewer, project, execution |
| 创建任务 | `POST /tasks` | name, executionID | type, assignedTo, estStarted, deadline, pri, estimate, module, story, desc |
| 创建项目 | `POST /projects` | name, model, begin, end, workflowGroup | products, parent, PM |
| 创建产品 | `POST /products` | name | program, line, type, PO, reviewer, desc, QD, RD, acl |
| 创建测试用例 | `POST /testcases` | productID, title | module, story, pri, type, precondition, steps, expects, stepType, project, execution |
| 创建执行 | `POST /executions` | project, name, begin, end | lifetime, days, products, plans, PO, QD, PM, RD, acl |
| 创建测试单 | `POST /testtasks` | productID, name, build, begin, end | execution, type, owner, status, desc |
| 创建史诗 | `POST /epics` | productID, title | pri, parent, estimate, spec, category, source, verify, assignedTo, reviewer |
| 创建用户需求 | `POST /requirements` | productID, title | pri, module, parent, estimate, spec, category, source, verify, assignedTo, reviewer |
| 创建工单 | `POST /tickets` | productID, title | pri, type, assignedTo, deadline, description |
| 创建反馈 | `POST /feedbacks` | productID, title | pri, type, assignedTo, deadline, description |

## 关键字段名（易错）

| 正确字段名 | 错误写法 | 用于接口 |
|-----------|----------|----------|
| `productID` | `product` | Bug, Story, Testcase, Testtask, Epic, Requirement, Ticket, Feedback |
| `executionID` | `execution` | Task |
| `project` | `projectID` | Execution |
| `openedBuild` | `openedBuild[]` | Bug（数组格式，主干填 `["trunk"]`）|

## 状态流转

### Bug
- active → resolved（PUT /bugs/:id/resolve）
- active/resolved → closed（PUT /bugs/:id/close）
- closed/resolved → active（PUT /bugs/:id/activate）

### Task
- wait → started（PUT /tasks/:id/start）
- started → finished（PUT /tasks/:id/finish）
- finished → closed（PUT /tasks/:id/close）
- closed/finished → active（PUT /tasks/:id/activate）

### Story
- draft → active（评审通过）
- active → closed（PUT /stories/:id/close）
- closed → active（PUT /stories/:id/activate）

## 官方文档链接

- 创建Bug: https://www.zentao.net/book/api/post-bugs-2192.html
- 创建需求: https://www.zentao.net/book/api/post-stories-2169.html
- 创建任务: https://www.zentao.net/book/api/post-tasks-2207.html
- 创建项目: https://www.zentao.net/book/api/post-projects-2156.html
- 创建产品: https://www.zentao.net/book/api/post-products-2151.html
- 创建测试用例: https://www.zentao.net/book/api/post-testcases-2201.html
- 创建执行: https://www.zentao.net/book/api/post-executions-2160.html
- 创建测试单: https://www.zentao.net/book/api/post-testtasks-2234.html

## Memos 笔记参考

| 笔记 ID | 内容 |
|----------|------|
| `brJN8LeEXhLsKyuwWerZNw` | 禅道 RESTful API v2.0 文档索引（总） |
| `8BYQFtAujXdcNn7iBKrdPL` | 禅道 RESTful API v2.0 文档索引（上） |
| `KPcXoBDz4Z6WzbPCKAgCiQ` | 禅道 RESTful API v2.0 文档索引（下） |
| `K2z5NfrYKVQXWB48YMNiNQ` | 禅道 v2 API 入参出参详解（二） |
| `QVFR3ZSZFQ8Vy3b3r732um` | 禅道 v2 API 入参出参详解（一） |
| `dUNfXqs3de9FRYmCLqjbqJ` | 禅道 v2 API 入参出参详解（P0核心模块） |
