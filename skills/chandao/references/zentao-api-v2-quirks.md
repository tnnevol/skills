# ZenTao RESTful API v2.0 常见坑点

## 1. 创建接口参数名必须带 `ID` 后缀

API v2 的创建接口（POST）要求关联字段使用 `xxxID` 格式，而非裸字段名。

### 已确认的参数名映射

| 实体 | API 请求体字段 | 错误写法 | 正确写法 |
|------|--------------|---------|---------|
| Task create | `executionID` | `execution` | `executionID` |
| Build create | `executionID`, `projectID` | `execution`, `project` | `executionID`, `projectID` |
| Story create | `productID` | `product` | `productID` |
| Bug create | `productID` | `product` | `productID` |
| Epic create | `productID` | `product` | `productID` |
| Execution create | `project` | — | `project`（Execution 特殊，不需要 ID 后缀） |
| Project create | `model`, `begin`, `end` | `type` | `model`（项目管理方式，非 type） |

### 错误表现

参数名错误时，API 返回 HTTP 403：
```json
{"status": "fail", "message": "Not allowed"}
```

**重要**：这个 403 不是权限问题，是参数名错误！

**但是**：如果参数名已确认正确仍返回 403，检查用户是否分配了角色（`role` 字段非空）。详见 `references/zentao-api-permissions.md`。

## 2. Bug create 的 `openedBuild` 是数组

```json
{
  "productID": 21,
  "title": "Bug标题",
  "type": "code",
  "openedBuild": ["trunk"]  // ← 数组，不是字符串
}
```

## 3. Task create 的必填字段

- `executionID` — 所属执行 ID
- `name` — 任务名称
- `type` — 任务类型（devel/test/design/discuss/ui）

## 3.1 Testtask create 的必填字段

- `productID` — 所属产品 ID（CLI 参数 `--product`）
- `name` — 测试单名称（CLI 参数 `--name`）
- `build` — 关联版本 ID（CLI 参数 `--build`）
- `begin` — 开始日期（CLI 参数 `--begin`）
- `end` — 结束日期（CLI 参数 `--end`）

缺少 `build`/`begin`/`end` 会返回创建失败。

## 4. `bug list` 不支持 `--execution` 过滤

CLI 的 `bug list` 命令只支持 `--product` 参数。要按执行筛选 Bug，需要：

```bash
# 方法：先查产品，再逐个检查 execution 字段
chandao-cli execution get <execution_id>  # 获取关联产品
chandao-cli bug list --product <product_id>  # 列出产品下所有 Bug
chandao-cli bug get <bug_id>  # 检查每个 Bug 的 execution 字段
```

## 5. 登录端点差异

- API v2 登录：`POST /api.php/v2/tokens`（返回 `{"token": "xxx"}`）
- 旧版登录：`POST /api.php/v2/users/login`（返回不同格式）

CLI 使用 `/api.php/v2/tokens` 端点。

## 6. list 端点默认过滤导致返回空数据（已确认根因）

以下模块的 `list` 命令返回空数据，即使对应 `create` 成功。**根因已确认**：每个 list API 都有默认过滤参数，只返回特定状态的数据。

### 各模块默认过滤参数

| 模块 | API 参数名 | CLI 参数 | 默认值 | 含义 | 可选值 |
|------|-----------|---------|--------|------|--------|
| requirement list | `browse` | `--browse` | `unclosed` | 未关闭的需求 | `allstory`, `assignedtome`, `openedbyme`, `reviewedbyme`, `draftstory` |
| epic list | `browse` | `--browse` | `unclosed` | 未关闭的史诗 | `allstory`, `assignedtome`, `openedbyme`, `reviewedbyme`, `draftstory` |
| feedback list | `browseType` | `--browse` | `wait` | 待处理反馈 | `all`, `wait`, `closed`, `resolved`, `byme` |
| ticket list | `status` | `--status` | `active` | 活跃工单 | `active`, `closed`, `all`, `resolved` |
| testtask list | `browseType` | `--browse` | `all` | 所有测试单 | `all`, `unfinished`, `blocked` |

### 解决方案

CLI 已为以上 list 命令添加了过滤参数，默认值设为返回最多数据（`allstory`/`all`/`active`）。用户可通过 `--browse` 或 `--status` 指定过滤条件：

```bash
# 查看所有需求（包括已关闭的）
chandao-cli requirement list --product 21 --browse allstory

# 查看待处理反馈
chandao-cli feedback list --product 21 --browse wait

# 查看已关闭工单
chandao-cli ticket list --product 21 --status closed
```

### 踩坑要点

- `story list` 和 `bug list` **不受影响**，默认就能返回数据
- `requirement list` 和 `epic list` 使用 `browse` 参数（不是 `browseType`）
- `feedback list` 和 `testtask list` 使用 `browseType` 参数
- `ticket list` 使用 `status` 参数（与其他模块都不同）
- 参数名和可选值**因模块而异**，切勿想当然地套用

## 7. API 文档索引

两篇完整的 API 文档索引笔记：
- 上篇：Memo ID `8BYQFtAujXdcNn7iBKrdPL`
- 下篇：Memo ID `KPcXoBDz4Z6WzbPCKAgCiQ`

可通过 memos skill 读取：`node skills/memos/scripts/api.cjs get <memo_id>`

### ⚠️ PUT/DELETE 端点可能返回空响应

禅道 API 的 PUT/DELETE 端点可能返回空响应体（HTTP 200 但 body 为空），导致 JSON 解析失败。

**错误表现**：`bug resolve` 等操作报 `JSON 解析失败: EOF while parsing`

**修复**：`put` 和 `delete` 方法先读取文本，检查是否为空：

```rust
let text = resp.into_string().map_err(|e| format!("读取响应失败: {}", e))?;
if text.trim().is_empty() {
    return Ok(serde_json::json!({"status": "success"}));
}
```

### ⚠️ Bug/Task/Story 状态修改不能通过 `PUT /{entity}s/{id}` 实现

### 问题

`PUT /bugs/{id}` 请求体中的 `status` 字段**会被静默忽略**，API 返回 `"保存成功"` 但实际状态不变。

```bash
# ❌ 错误：status 被静默忽略
curl -X PUT -H "Token: $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"resolved"}' "https://zentao.example.com/api.php/v2/bugs/39"
# 返回 {"status":"success","message":"保存成功"} 但实际 status 没变！
```

### 解决方案

禅道的状态流转必须使用**专门的端点**：

| 操作 | 端点 | 必填参数 |
|------|------|---------|
| 解决 Bug | `PUT /bugs/{id}/resolve` | `resolution`（fixed/bydesign/external/postponed/willnotfix/duplicate/notrepro）, `resolvedBuild` |
| 关闭 Bug | `PUT /bugs/{id}/close` | 无必填 |
| 激活 Bug | `PUT /bugs/{id}/activate` | 无必填 |
| 解决 Story | `PUT /stories/{id}/resolve` | — |
| 关闭 Story | `PUT /stories/{id}/close` | `reason` |
| 激活 Story | `PUT /stories/{id}/activate` | 无必填 |
| 完成 Task | `PUT /tasks/{id}/finish` | `currentConsumed`, `realStarted`, `finishedDate` |
| 关闭 Task | `PUT /tasks/{id}/close` | — |
| 激活 Task | `PUT /tasks/{id}/activate` | 无必填 |

### 验证方法

```bash
# 修改前查状态
curl -s -H "Token: $TOKEN" ".../api.php/v2/bugs/39" | jq .bug.status  # "active"

# 尝试用 PUT 直接改 status（无效）
curl -s -X PUT -H "Token: $TOKEN" -d '{"status":"resolved"}' ".../api.php/v2/bugs/39"
# 返回 success 但...

# 再查（还是 active）
curl -s -H "Token: $TOKEN" ".../api.php/v2/bugs/39" | jq .bug.status  # "active" ← 没变！

# 正确方式：用 resolve 端点
curl -s -X PUT -H "Token: $TOKEN" \
  -d '{"resolution":"fixed","resolvedBuild":"1"}' \
  ".../api.php/v2/bugs/39/resolve"

# 再查（resolved）
curl -s -H "Token: $TOKEN" ".../api.php/v2/bugs/39" | jq .bug.status  # "resolved" ✓
```

### CLI 处理

chandao-cli 的 `bug update` 命令已禁止 `--status` 参数，报错引导用户使用 `bug resolve`/`bug close`/`bug activate`。

### ⚠️ Bug resolve 会清空指派人

`PUT /bugs/{id}/resolve` 如果不传 `assignedTo` 参数，会将 Bug 的指派人**清空为空字符串**。

```bash
# ❌ 不传 assignedTo → 指派人被清空
curl -s -X PUT -H "Token: $TOKEN" \
  -d '{"resolution":"fixed","resolvedBuild":"1"}' \
  ".../api.php/v2/bugs/36/resolve"
# Bug #36 的 assignedTo 变为 "" ← 被清空了！

# ✅ 传 assignedTo → 指派人保留
curl -s -X PUT -H "Token: $TOKEN" \
  -d '{"resolution":"fixed","resolvedBuild":"1","assignedTo":"hai"}' \
  ".../api.php/v2/bugs/36/resolve"
# Bug #36 的 assignedTo 保持 "hai" ✓
```

**最佳实践**：解决 Bug 前先 `bug get <id>` 获取当前 `assignedTo`，然后在 resolve 时显式传入。

### ⚠️ `ac.get()` 返回的已经是提取后的实体对象

chandao-cli 的 `check_response` 函数会自动从响应中提取实体字段。例如 `ac.get("/bugs/36")` 返回的直接是 `bug` 对象，不需要再 `.get("bug")`：

```rust
// ❌ 错误：多了一层提取
let bug_data = ac.get(&format!("/bugs/{}", id))?;
let assigned = bug_data.get("bug").and_then(|b| b.get("assignedTo"));  // 永远是 None

// ✅ 正确：直接访问字段
let bug_data = ac.get(&format!("/bugs/{}", id))?;
let assigned = bug_data.get("assignedTo").and_then(|v| v.as_str());  // 正确获取
```

### ⚠️ 关键教训

**API 返回 "成功" 不代表操作真的生效了**。修改类操作后必须回查验证。这是一个通用的 API 集成陷阱，不只限于禅道。

### ⚠️ `file edit` 使用命名参数 `--id`，与其他命令不一致

大多数 update/edit 命令将 ID 作为位置参数（如 `story update <id>`、`bug update <id>`），但 `file edit` 要求命名参数：

```bash
# 大多数命令：位置参数
chandao-cli story update 123 --title "new"

# file edit：命名参数（不同！）
chandao-cli file edit --id 123 --title "new"
```

### ⚠️ 修改 Rust 代码参数后必须同步更新 SKILL.md

chandao-cli 的命令参数定义在 Rust `actions.rs` 的 enum 中。添加/修改参数后，SKILL.md 的命令表**必须同步更新**，否则 agent 会按过时文档引导用户。

**检查方法**：修改完 Rust 代码后，运行 `chandao-cli <module> <action> --help` 对比 SKILL.md 中的参数列表。

## 9. `index.js` Node.js 包装器 bin 路径结构

npm 包的 `index.js` 通过 `spawn` 调用 Rust 二进制。`bin/` 目录结构可能有两种形式：

**目录结构**（npm 发布后未 flatten）：
```
bin/
├── chandao-linux/chandao-linux    ← 子目录内是可执行文件
├── chandao-macos/chandao-macos
└── chandao-win.exe/chandao-win.exe
```

**扁平结构**（workflow flatten 成功后）：
```
bin/
├── chandao-linux
├── chandao-macos
└── chandao-win.exe
```

**解决方案**（参考 halo-cli）：`resolveBinPath` 函数自动检测并兼容两种结构：

```javascript
function resolveBinPath(binPath) {
  if (fs.statSync(binPath).isDirectory()) {
    const entries = fs.readdirSync(binPath);
    for (const entry of entries) {
      if (entry === binName || entry.endsWith('.exe') || !entry.includes('.')) {
        return path.join(binPath, entry);
      }
    }
  }
  return binPath;
}
```

**调试技巧**：`stdio: 'pipe'` 会抛正常 Error，`stdio: 'inherit'` 对目录目标抛 `EACCES` 且无输出。如果遇到"EACCES 但权限正确"，先检查路径是否指向目录。

### ⚠️ feedback/ticket 的 list API 可能返回空数据（即使 create 成功）

`feedback list` 和 `ticket list` 的 API 端点在某些禅道配置下会返回空数据，即使对应 `create` 成功。

**已确认现象**：
- `feedback create --product 21 --title "测试"` → 成功
- `feedback list-by-product --product 21 --browse all` → 📭 暂无数据
- `ticket create --product 21 --title "测试"` → 成功
- `ticket list-by-product --product 21 --status all` → 📭 暂无数据

**可能原因**：
1. 禅道产品未启用「反馈」或「工单」模块
2. API 端点参数名与 requirement/epic 不一致（`browseType` vs `browse`）
3. 禅道版本差异导致 API 行为不同

**排查方法**：
1. 在禅道 Web UI 中检查产品是否启用了对应模块
2. 用 curl 直接测试 API 端点，确认返回内容
3. 检查参数名是否正确（feedback 用 `browseType`，ticket 用 `status`）

**注意**：requirement 和 epic 的 list API 正常工作（使用 `browse` 参数）。

## 参考链接

- [禅道 RESTful API v2.0 开发手册](https://www.zentao.net/book/api/)
- [创建任务](https://www.zentao.net/book/api/post-tasks-2207.html)
- [创建版本/构建](https://www.zentao.net/book/api/post-builds-2230.html)
- [创建Bug](https://www.zentao.net/book/api/post-bugs-2192.html)
- [创建业务需求](https://www.zentao.net/book/api/post-epics-2178.html)
- [创建执行](https://www.zentao.net/book/api/post-executions-2160.html)
