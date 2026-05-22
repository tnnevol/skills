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
