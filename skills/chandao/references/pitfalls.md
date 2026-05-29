# 禅道 Script Skill 踩坑记录

> 从原始踩坑记录中筛选出与脚本调用 API 相关的内容。

## 1. API v2 创建接口参数名必须带 `ID` 后缀

API v2 创建接口参数名与常规写法不同，必须使用带 `ID` 后缀的形式：

| 实体 | API 请求体字段 | 说明 |
|------|--------------|------|
| Task create | `executionID` | 不能用 `execution` |
| Story create | `productID` | 不能用 `product` |
| Bug create | `productID` | 不能用 `product` |
| Execution create | `project` | 特殊，不需要 ID 后缀 |

**错误表现**：参数名错误时 API 返回 HTTP 403 `{"status":"fail","message":"Not allowed"}`，这不是权限问题！

详见 [zentao-api-v2-quirks.md](./zentao-api-v2-quirks.md)。

## 2. 多个模块 list 有默认过滤，可能返回空数据

`requirement list`、`epic list`、`testtask list` 等都有默认过滤参数，只返回特定状态的数据。

`story list` 和 `bug list` **不受影响**，默认就能返回数据。

## 3. 按执行查找 Bug 用 `bug list --execution`

底层调用 ZenTao API `/executions/{id}/bugs` 端点。

## 4. 403 错误诊断流程

禅道 API 返回 `HTTP 403: {"status":"error","message":"Not allowed"}` 时，按以下顺序排查：

1. **检查用户角色是否为空** — `user get <id>`，`role` 字段为空则无任何模块权限
2. **检查角色是否有目标模块权限** — 不同角色默认权限不同
3. **用 curl 直接测试 API** — 排除脚本代码问题
4. **换产品测试** — 不同产品可能配置了不同的权限

**注意**：禅道权限是按**产品+模块**二维配置的（见第 10 条）。

## 5. API 响应可能返回多种错误格式

1. **标准格式**: `{"status": "fail", "message": "错误信息"}`
2. **嵌套格式**: `{"status": "fail", "message": {"field": ["错误详情"]}}`
3. **error 格式**: `{"error": "错误信息"}`

## 6. Bug 状态流转必须使用专用端点

`PUT /bugs/{id}` 通用更新接口**不支持修改 `status` 字段**（会静默忽略）。

| 目标状态 | 脚本 action | API 端点 |
|---------|------------|---------|
| resolved | `resolve` | `PUT /bugs/{id}/resolve` |
| closed | `close` | `PUT /bugs/{id}/close` |
| active | `activate` | `PUT /bugs/{id}/activate` |

**错误表现**：`update --status resolved` 会返回"成功"但状态不变。

## 7. Bug 解决时需要传 `assignedTo` 和 `resolvedBuild`

`PUT /bugs/{id}/resolve` 接口：
- `assignedTo` — 不传会将指派人**清空**
- `resolvedBuild` — 不传会返回错误

脚本 `resolve` action 已支持 `--assignedTo` 和 `--resolvedBuild` 参数。

## 8. Bug 只能关联一个主需求

禅道的 Bug 有一个 `story` 字段（整数），只能关联**一个**主需求。

## 9. 所有 `delete` 命令需要 `--yes` 确认

```bash
# ✅ 正确用法
node scripts/bug.js --action delete --id 107 --yes
```

适用于所有实体的 delete 操作。

## 10. 禅道权限是按产品+模块二维配置的

同一个角色在不同产品下可能有不同的权限。测试 API 时应指定目标产品 ID。

## 11. PUT 请求会重置未包含字段为默认值

**这是最重要的踩坑记录**。禅道 API 的 PUT 请求行为：**未包含在请求体中的字段会被重置为默认值**。

### 问题复现

```bash
# 需求优先级为 2
node scripts/story.js --action get --id 38
# 输出: "pri": 2

# 更新标题（脚本内部已自动 GET 并合并）
node scripts/story.js --action update --id 38 --title "新标题"
# 优先级保持不变 ✅
```

### 解决方案

脚本内部已自动实现：先 `GET /<module>/<id>` 获取当前值，保留所有字段，再合并用户指定的字段发送 PUT 请求。

### 影响范围

所有模块的 update 操作均已实现此保护机制。
