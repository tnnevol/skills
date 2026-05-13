# 禅道 CLI 踩坑记录

> 从 SKILL.md 分离出来的详细踩坑记录。SKILL.md 只保留关键警告摘要。

## 1. API v2 创建接口参数名必须带 `ID` 后缀

禅道 API v2 的创建接口参数名与 CLI 命令参数名**不一致**，必须使用带 `ID` 后缀的形式：

| 实体 | CLI 参数 | API 请求体字段 | 备注 |
|------|---------|--------------|------|
| Task | `--execution` | `executionID` | ❌ 用 `execution` 会返回 403 |
| Build | `--execution` / `--project` | `executionID` / `projectID` | 同上 |
| Story | `--product` | `productID` | ✅ 代码已正确 |
| Bug | `--product` | `productID` | ✅ 代码已正确 |
| Epic | `--product` | `productID` | ✅ 代码已正确 |
| System | `--product` | `productID` | ✅ Bug 38 已修复（2026-05-12） |
| Execution | `--project` | `project` | ✅ Execution 的 project 不需要 ID 后缀 |

**根因**：API 返回 `{"status":"fail","message":"Not allowed"}` (HTTP 403) 时，往往是参数名错误而非权限问题。

详见 `references/zentao-api-v2-quirks.md`。

## 2. 多个模块 list 有默认过滤，可能返回空数据

`requirement list`、`epic list`、`feedback list`、`ticket list`、`testtask list` 都有默认过滤参数，只返回特定状态的数据。已为 CLI 添加了 `--browse`/`--status` 参数，默认值设为返回最多数据。

各模块参数名和可选值**不同**，详见 `references/zentao-api-v2-quirks.md` 第 6 节。

## 3. 按执行查找 Bug 用 `bug list --execution`

```bash
chandao-cli bug list --execution <execution_id> [--limit 50]
```

底层调用 ZenTao API `/executions/{id}/bugs` 端点，一条命令拿到执行下所有 Bug。

## 4. `user get` 支持数字 ID 和账号名（但账号名不稳定）

```bash
chandao-cli user get 5          # 按数字 ID ✅ 始终可靠
chandao-cli user get xiaoqian   # 按账号名 ❌ 可能返回 "User does not exist"
```

**建议**：优先使用数字 ID 查询用户。

## 5. Bug 状态流转必须使用专用端点

禅道的 `PUT /bugs/{id}` 通用更新接口**不支持修改 `status` 字段**（会静默忽略）。

| 目标状态 | 正确命令 | API 端点 |
|---------|---------|---------|
| resolved | `bug resolve <id> --resolution <type>` | `PUT /bugs/{id}/resolve` |
| closed | `bug close <id>` | `PUT /bugs/{id}/close` |
| active | `bug activate <id>` | `PUT /bugs/{id}/activate` |

**错误表现**：`bug update <id> --status resolved` 会返回"成功"但状态不变。

## 6. Bug 解决时必须显式传 `--assigned-to` 和 `--resolved-build`

禅道 `PUT /bugs/{id}/resolve` 接口有两个必填参数：
- `assignedTo` — 如果不传，会将 Bug 的指派人**清空**
- `resolvedBuild` — 如果不传，会返回错误 `"『解决版本』不能为空"`

```bash
# 1. 获取 Bug 详情，拿到当前指派人
chandao bug get <bug_id>
# 2. 解决时带上 --assigned-to 和 --resolved-build
chandao bug resolve <bug_id> --resolution fixed --assigned-to <原指派人> --resolved-build <build_id>
```

## 7. Bug 只能关联一个主需求

禅道的 Bug 有一个 `story` 字段（整数），只能关联**一个**主需求。无法通过 API 同时关联多个需求。

如需关联多个需求，只能在禅道 Web UI 中手动操作"相关需求"。

## 8. `bug update` 不支持 `--story`，关联需求需直接调用 API

```bash
TOKEN=$(curl -s -X POST "$CHANDAO_URL/api.php/v1/tokens" \
  -H "Content-Type: application/json" \
  -d "{\"account\":\"$CHANDAO_ACCOUNT\",\"password\":\"$CHANDAO_PASSWORD\"}" | jq -r '.token')

curl -s -X PUT "$CHANDAO_URL/api.php/v1/bugs/<bug_id>" \
  -H "Content-Type: application/json" \
  -H "Token: $TOKEN" \
  -d '{"story": <story_id>}'
```

## 9. 403 错误诊断流程

禅道 API 返回 `HTTP 403: {"status":"error","message":"Not allowed"}` 时，按以下顺序排查：

1. **检查用户角色是否为空** — `chandao user get <id>`，`role` 字段为空则无任何模块权限
2. **检查角色是否有目标模块权限** — 不同角色默认权限不同：
   - `qa`：Bug、用例、测试单等测试模块
   - `dev`：需求、任务等开发模块
   - `po`/`pm`：Epic、System 等管理模块
3. **用 curl 直接测试 API** — 排除 CLI 代码问题
4. **换产品测试** — 不同产品可能配置了不同的权限

**注意**：禅道权限是按**产品+模块**二维配置的，同一角色在不同产品下可能有不同权限。

## 10. API 响应可能返回多种错误格式

1. **标准格式**: `{"status": "fail", "message": "错误信息"}`
2. **嵌套格式**: `{"status": "fail", "message": {"field": ["错误详情"]}}`
3. **error 格式**: `{"error": "错误信息"}`

## 11. `index.js` Node.js 包装器的路径陷阱

`chandao-cli` 的 npm 包通过 `index.js` 包装器调用 Rust 二进制。`bin/` 目录下按平台名建子目录：

```
bin/
├── chandao-linux/chandao-linux    ← 实际二进制
├── chandao-macos/chandao-macos
└── chandao-win.exe/chandao-win.exe
```

**常见错误**：`path.join(__dirname, "bin", binaryName)` 指向的是**目录**而非文件，导致 `EACCES` 错误。

**正确方案**：参考 halo-cli 的 `resolveBinPath` 模式。

## 12. npm 包装器 bin 路径 Bug（已修复）

`index.js` 的 Node.js 包装器路径 bug 已修复，加了 `resolveBinPath` 函数自动检测目录/扁平两种结构。

## 13. Monorepo 子应用不应有 package-lock.json

chandao-cli 是 skills monorepo 的子应用，应使用根目录 `pnpm-lock.yaml` 统一管理依赖。子目录下不应存在 `package-lock.json`。

## 14. Rust CLI 的 put/delete 需处理空响应

禅道 API 的 PUT/DELETE 端点可能返回空响应体。CLI 的 `put` 和 `delete` 方法必须先检查响应是否为空：

```rust
if text.trim().is_empty() {
    return Ok(serde_json::json!({"status": "success"}));
}
```

**错误表现**：不处理空响应时，`bug resolve` 等操作会报 `JSON 解析失败: EOF while parsing`。

## 15. system create 的 productID 问题

禅道 `POST /api.php/v2/systems` 创建应用时，API 请求体需要 `productID` 字段，但 **CLI 的 `system create` 没有 `--product` 参数**。如需指定产品，需直接调用 API。

## 16. 所有 `delete` 命令需要 `--yes` 确认

```bash
# ❌ 不会执行，只提示确认
chandao-cli testcase delete 107
# 输出: ⚠️  确认删除测试用例 #107？使用 --yes

# ✅ 正确用法
chandao-cli testcase delete 107 --yes
```

适用于所有实体的 delete 操作。

## 17. Node 包装器路径 bug 仍然存在（v最新）

npm 包 `@tnnevol/chandao-cli` 的 `index.js` 包装器路径拼接有 bug，**最新版本仍未修复**。

**临时 workaround**：直接调用二进制文件：

```bash
# 找到实际二进制路径
ls ~/.local/lib/node_modules/@tnnevol/chandao-cli/bin/chandao-linux/

# 直接调用（以 Linux 为例）
~/.local/lib/node_modules/@tnnevol/chandao-cli/bin/chandao-linux/chandao-linux <module> <action> [args]

# 可以设个 alias
alias chandao-cli='~/.local/lib/node_modules/@tnnevol/chandao-cli/bin/chandao-linux/chandao-linux'
```

## 18. Release workflow 的 artifact flatten 命令不可靠

```yaml
- name: Flatten artifact directories
  working-directory: apps/chandao-cli/bin/
  run: |
    mv */* . 2>/dev/null || true
    rmdir * 2>/dev/null || true
```

## 19. 子项目不要创建 `.gitignore`

chandao-cli 子项目**不应**有自己的 `.gitignore`。skills 根目录的 `.gitignore` 已覆盖所有通用排除项。

## 20. feedback/ticket 模块已移除

当前禅道实例不支持反馈(feedback)和工单(ticket)模块，相关代码和文档已从 CLI 和技能中移除。

## 21. 编辑大型 Rust 源文件不要用 hermes_tools 的 read_file/write_file

`hermes_tools` 的 `read_file` 有 **2000 行上限**，`write_file` 会**将行号写入文件内容**。

**正确做法**：使用 `sed` 进行精确编辑。

## 22. 禅道权限是按产品+模块二维配置的

同一个角色在不同产品下可能有不同的权限。测试 API 时应指定目标产品 ID。

## 开发与发布

chandao-cli 是 skills monorepo (`github.com:tnnevol/skills`) 下的应用，与 halo-cli 框架对齐。

源码路径：`apps/chandao-cli/`

### 本地开发

```bash
# 在 skills 根目录
pnpm install

# 编译
cd apps/chandao-cli
make build-all    # 全平台
make linux        # 仅 Linux
make verify       # 验证编译结果

# 测试新编译的二进制
./target/release/chandao version
```

### 发布

```bash
# 在 apps/chandao-cli 目录
pnpm run bump         # 交互式选择版本
pnpm run bump:patch   # 1.0.0 → 1.0.1

# 推送 tag 触发 CI/CD
git tag v2.0.6 && git push origin v2.0.6
```

CI/CD 自动编译四平台二进制并发布到 npm。

### 框架对齐（与 halo-cli）

两个 CLI 应保持一致的框架结构：
- `index.js` — Node.js 包装器（含 resolveBinPath 兼容逻辑）
- `Makefile` — 友好输出、install-targets、verify
- `package.json` — license/repository/author/build:targets
- `README.md` — 安装/配置/功能/开发文档
- `.github/workflows/release-*.yml` — CI/CD 发布流程

详细对比见 `references/framework-alignment.md`。
