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
