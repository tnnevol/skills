# chandao-cli

禅道（ZenTao）命令行工具：从 `skills/chandao/scripts/` 的命令能力剥离而来，重新按 REST API v1 / v2 组织，支持 **登录探测 + 版本偏好 + 强制版本**。

## 特性

- **鉴权持久化**：登录后 token 加密保存在 `~/.chandao/`，后续命令无需重复登录。
- **自动版本探测**：登录时同时探测 v2 与 v1，**优先使用 v2**；探测结果随配置持久化。
- **可强制版本**：全局 `--api-version v1|v2|auto`，或 `auth use v1|v2|auto` 修改默认偏好。
- **版本差异透明**：每个命令按可用版本自动映射（v1 分页用 `page/limit`，v2 用 `pageID/recPerPage`；v1 生命周期动作用 `POST`，v2 用 `PUT`）。
- **安全更新**：`update` 前先 GET 当前值并回填未提交字段，避免禅道 PUT 把缺失字段重置为默认值。
- **结构化输出**：默认输出 JSON，便于 Agent / 管道消费；`--pretty` 美化。
- **通用入口**：`chandao-cli api <METHOD> <PATH>` 可直接调用任意已知接口（含未收录在命令里的隐藏接口）。

## 安装

```bash
# 仓库内开发
pnpm --filter @tnnevol/chandao-cli build
node apps/chandao-cli/dist/cli.js --help

# 或全局安装（发布后）
pnpm add -g @tnnevol/chandao-cli
chandao-cli --help
```

## 登录与版本探测

```bash
chandao-cli auth login \
  --base-url http://192.168.0.19:8890 \
  --account mizen
# 密码支持交互输入；非交互场景用 --password 或 CHANDAO_PASSWORD
```

登录时会：

1. 尝试 `POST /api.php/v2/users/login`；
2. 尝试 `POST /api.php/v1/tokens`；
3. 两个版本都成功时记录 **detectedVersion = v2**，并把两套 token 都加密保存；
4. `auto` 模式下命令优先走 v2；某个操作只有 v1（如 `group list`、`dept list`）时自动回退 v1，并在输出里标 `fallback: true`。

```bash
chandao-cli auth status --verify   # 查看配置并用当前版本实际请求一次
chandao-cli auth use v1            # 强制默认 v1（也可 auto / v2）
chandao-cli auth logout            # 清除本地配置
```

`--api-version` 的优先级高于配置文件：

```bash
chandao-cli product list --api-version v1
chandao-cli product list --api-version v2
chandao-cli product list                 # auto（默认 v2）
```

强制版本不支持某操作时会直接报错，不会静默换版本：

```bash
chandao-cli --api-version v1 execution start --id 1
# {"success":false,"message":"操作在当前强制版本 v1 上未提供（支持：v2）..."}
```

## 配置与环境变量

| 环境变量 | 说明 |
|---|---|
| `CHANDAO_URL` | 禅道地址（可带 `/api.php`） |
| `CHANDAO_ACCOUNT` | 登录账号 |
| `CHANDAO_PASSWORD` | 登录密码（仅登录时使用，不落盘） |
| `CHANDAO_TOKEN` | 临时覆盖当前版本的 token（不写配置） |
| `CHANDAO_TOKEN_V1` / `CHANDAO_TOKEN_V2` | 分别指定 v1/v2 token |
| `CHANDAO_API_VERSION` | `auto` / `v1` / `v2` |
| `CHANDAO_CLI_NO_KEYCHAIN=1` | 禁用以系统钥匙串保存私钥，改用本地文件（600） |

配置目录：`~/.chandao/`

- `config.json`：地址、账号、版本偏好、加密后的 `tokenV1` / `tokenV2`
- `public.pem` / `private.pem`（或钥匙串）：token 加密密钥
- 配置目录权限 `700`，配置文件 `600`

## 命令

### 认证

| 命令 | 说明 |
|---|---|
| `auth login` | 登录并探测 v1/v2，保存 token |
| `auth status [--verify]` | 查看配置、版本与 token 状态 |
| `auth use <auto\|v1\|v2>` | 切换版本偏好 |
| `auth logout` | 清除本地配置 |

### 资源命令

| 资源 | 命令 |
|---|---|
| 产品 | `product list/get/create/update/delete/list-by-program` |
| 项目 | `project list/get/create/update/delete/list-by-program` |
| 需求 | `story list/get/create/update/close/change/activate/delete` |
| 任务 | `task list/get/create/update/start/pause/restart/finish/close/activate/delete` |
| 执行/迭代 | `execution list/get/create/update/start/suspend/close/delete`（start/suspend/close 仅 v2） |
| Bug | `bug list/get/create/update/resolve/close/activate/confirm/delete` |
| 测试用例 | `testcase list/get/create/update/delete` |
| 测试单 | `testtask list/get/delete`（仅 v1 读；创建需 build） |
| 用户 | `user list/get/create/update/delete` |
| 权限分组/角色 | `group list`（仅 v1） |
| 部门 | `dept list/get`（仅 v1） |
| 附件 | `file upload/get`（v2 可绑定对象，v1 仅上传） |
| 任意接口 | `api <METHOD> <PATH>` |

通用选项：

- `--page <n>` / `--limit <n>`：分页（v1→page/limit，v2→pageID/recPerPage）
- `--order <order>`：排序，默认 `id_desc`
- `--yes`：删除类命令必须显式确认
- `--spec-version <n>`：读取需求/用例的历史版本（仅 v2 支持；默认最新）
- `--pretty`：美化输出

## 示例

```bash
# 产品
chandao-cli product list --limit 10
chandao-cli product get --id 1
chandao-cli product list-by-program --program 1

# 需求（列表必须带 product/project/execution 之一）
chandao-cli story list --product 1 --limit 5
chandao-cli story create --product 1 --title "新需求" --pri 2 --spec "<p>...</p>" --verify "<ul><li>...</li></ul>"
chandao-cli story close --id 5 --reason done --comment "已上线"
chandao-cli story change --id 5 --reviewer admin --title "新标题"

# 任务
chandao-cli task list --execution 3 --limit 5
chandao-cli task create --execution 3 --name "联调" --assignedTo admin --estimate 4
chandao-cli task finish --id 8 --consumed 3 --left 0

# Bug
chandao-cli bug list --product 1 --limit 5
chandao-cli bug create --product 1 --title "登录失败" --severity 2 --pri 1 --steps "复现步骤..."
chandao-cli bug resolve --id 4 --resolution fixed --resolvedBuild trunk

# 用户 / 角色
chandao-cli user list --limit 10
chandao-cli user create --account dsh --password 'Init@2026' --realname "DSH" \
  --gender m --role po --dept 5 --group 5 --visions rnd
chandao-cli group list
chandao-cli dept list

# 附件：上传后把返回的 url 回显到 HTML 内容
chandao-cli file upload --file ./mockup.png --object-type story --object-id 12
# -> {"id":37,"url":"/index.php?m=file&f=read&t=png&fileID=37"}
chandao-cli story update --id 12 --spec '<p>布局：</p><p><img src="/index.php?m=file&f=read&t=png&fileID=37" alt="布局"></p>'

# 直接调用任意接口（path 可带 /v1 或 /v2）
chandao-cli api GET '/v1/products?limit=2'
chandao-cli api POST /v2/products --data '{"name":"新产品"}'
```

## 输出

成功：

```json
{ "success": true, "operation": "product.list", "data": { "version": "v2", "data": { "products": [] } } }
```

失败（stderr，退出码 1）：

```json
{ "success": false, "message": "POST /products 失败：『产品名称』不能为空。", "httpStatus": 400, "version": "v2" }
```

`data.version` 表示实际使用的 API 版本；auto 模式下发生回退时会出现 `data.fallback: true`。

## 内容版本

- 需求：`story change` 生成新版本；`story update` 修改当前版本；默认 `get` 返回最新。
- 用例：每次 `testcase update` 生成新版本。
- 历史版本：
  - 需求：`story get --id <id> --spec-version <n>`（仅 v2；v1 不支持）
  - 用例：`testcase get --id <id> --spec-version <n>`（v1/v2 都支持；v1 返回 `currentVersion` 标识实际读取版本）
- 任务/Bug 没有内容版本历史，始终返回最新。

按版本读取时，输出 `data.requestedVersion` 是请求的版本，实体 `version` 仍是当前版本号。

## 与 skills/chandao 脚本的关系

- 原 `skills/chandao/scripts/*.js` 的 action 全部映射为子命令（`--action list` → `list`）。
- 原脚本只走 v2；本 CLI 增加 v1 映射与自动探测/强制版本。
- 新增了原脚本没有的 `user`、`group`、`dept`、`api` 命令（来自实测可用接口）。
- 原脚本的 `--dry-run` 未继承：写操作要么执行、要么不执行；删除需 `--yes`。

## 子路径部署

站点在子目录（如 `http://host/zentao`）时直接把子路径作为 `--base-url`；CLI 会拼成 `/zentao/api.php/v1`。根路径首页正常但 API 404，通常就是漏了子路径。

`auth login` 在根地址探测失败时会自动尝试 `/zentao`、`/pms` 两个常见子路径，命中后把纠正后的地址写入配置（输出 `subpathDetected: true`）。

## 兼容旧版 ZenTao（v1-only 实例）

部分旧实例（实测 `chandao.freetek.cc`，ZenTao 18.x）v2 API 整体未实现，v2 路由会直接抛 PHP Fatal：

```text
Class 'productsEntry' not found
```

CLI 的行为：

- `auto`：v2 登录/路由失败时自动使用 v1（`detectedVersion = v1`）；
- 强制 `--api-version v2`：返回明确错误（“接口返回了非 JSON 响应”），不会把 HTML 错误页当成功；
- 旧版 v1 的创建接口必填字段更多，CLI 会补安全默认值：
  - story：`pri=3`、`category=feature`、`branch=0`
  - bug：`type=codeerror`、`openedBuild=trunk`
  - testcase：`type=feature`、`pri=3`，steps 自动转成 v1 需要的对象数组
  - task：`estStarted`/`deadline` 无默认值，必须显式传
- 旧版 v1 的 `PUT /stories/{id}` 可能返回 400 `error`；此时用 `story change --reviewer <账号>` 提交内容变更（会生成新版本/评审）。
- 旧版 v1 上传返回的 URL 可能是**绝对地址**：`http://host/zentao/file-read-<id>.png`；新版返回相对路径 `/index.php?m=file&f=read...`。两者都直接嵌入 HTML，不要改写。
- 子路径部署（如 `http://host/zentao`）可直接作为 `--base-url`。

## 已知限制

- **修改角色权限（grouppriv）没有 REST API**，只有 `group list` 可读；授权需 Web 会话或直接改库。
- 部门仅支持查询：禅道 v1 未提供 `POST /departments`。
- v2 缺失的模块（工作流、文档、反馈、工单等）在强制 v2 时会报错；auto 模式会回退 v1（若 v1 有实现），否则提示不可用。
- `execution start/suspend/close` 仅 v2 实现。
- **v2 上传附件必须绑定对象**（`--object-type` + `--object-id`），否则禅道返回 200 空响应；auto 模式无绑定时会走 v1（只上传，不绑定对象）。
- 文档模块：v1 无创建接口，v2 `/v2/doc/*` 在实例上未实现；`file get` 仅 v2 可用。
- 详情/列表返回结构在 v1/v2 间不同（例如 v1 的 `PO` 是对象、v2 是字符串），CLI 原样透传不做归一化。

## 开发

```bash
pnpm --filter @tnnevol/chandao-cli build
pnpm --filter @tnnevol/chandao-cli test
```
