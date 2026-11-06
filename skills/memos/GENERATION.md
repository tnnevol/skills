# Generation Info

skills/memos 的参考文件以本仓库 `apps/memos-cli` 的真实命令行为准
（经真实实例 v0.31.0 核验，见 `references/pitfalls.md`），不提炼自上游文档仓库。

- **Source:** `apps/memos-cli`（本仓库应用）+ 上游 OpenAPI 单点引用
- **Skill version:** `2.4.0`
- **Synced:** 2026-11-05

## v2.4.0 记录（2026-11-06）：配置文件凭证加密

`~/.memos/config.json` 的 `token` 字段改为加密存储，`baseUrl` 与 `apiPath` 保持明文；环境变量仍为明文。

实现与 openlist-cli 一致（各 CLI 独立发包，因此各自内置一份）：

- 混合加密 RSA-3072-OAEP(SHA-256) + AES-256-GCM，密文前缀 `enc:v1:`
- 私钥优先进系统钥匙串，不可用时降级 `~/.memos/private.pem`（600）
- 旧明文配置自动迁移；非交互环境不调用钥匙串（避免弹窗阻塞）
- 可用 `MEMOS_CLI_NO_KEYCHAIN=1` 强制文件降级

实测：8 条加密单测全过。

## 技能自带文件

- `installation-guide.md`：首次安装引导，随技能一起分发（`pnpx skills add` 只拉 `skills/` 目录，
  因此不能依赖 `apps/` 下的外链）。变更 CLI 安装方式时同步此处。

## 上游引用范围

- 接口事实来源：`github.com/usememos/memos` 各 tag 的 `proto/gen/openapi.yaml`
  （即官网 <https://usememos.com/docs/api/latest> 渲染的同一份文件）。
  官网只维护 `latest`（跟随 main），历史版本只能从对应 tag 取该文件。
- 可用的 spec 产物：

  | tag 范围      | 产物                                        | 格式        |
  | ------------- | ------------------------------------------- | ----------- |
  | v0.25.1 起    | `proto/gen/openapi.yaml`                    | OpenAPI 3   |
  | v0.23.1–v0.25.0 | `proto/gen/apidocs.swagger.yaml`          | Swagger 2.0 |
  | ≤ v0.23.0     | 无生成产物                                  | —           |

- 上游文档站无独立文档仓库可挂 submodule，**不建子模块**，以 tag 内的 spec 直链引用。

## v2.3.0 记录（2026-11-05）：记录附件列表的「按创建者隔离」

实测多用户实例（11 个用户）时发现：图片在笔记页面显示正常，但附件列表为空。
定位到服务端 `ListAttachments` 强制 `CreatorID = 当前登录用户`
（`server/api/v1/attachment_service.go`），不受 visibility 影响，也不可绕过。

| 文件 | 改动 |
| --- | --- |
| `references/pitfalls.md` 第 8 节 | 补充「只返回本人创建的附件」及其与 `/file/` 路由的差异；强调 `content` 是 `writeOnly`，恒为空串，二者都不能作为「上传失败」的判据 |

同时 CLI 已发布 npm：`@tnnevol/memos-cli@1.1.0`（附件路径修复 + 默认 PROTECTED）、
`@tnnevol/openlist-cli@1.2.1`（仅格式化，patch 发布）。

## v2.2.0 记录（2026-11-05）：修复附件路径与图文流程，默认可见性改为受保护

`apps/memos-cli` 升到 `1.1.0`，同时纠正技能里错误的图文结论。

### CLI 变更

- **修复 `permanentPath` 重复段**：原先拼成 `/file/attachments/attachments/<id>/<file>`（404），
  现已输出 `/file/attachments/<id>/<file>`；拼接抽到 `src/paths.ts` 的 `buildAttachmentPaths` 并加单测。
- **新增 `relativePath`**：`/file/attachments/<id>/<file>`，笔记正文用这个。
- **默认可见性 `PRIVATE` → `PROTECTED`**：`memo create` 默认对登录用户可见，可用 `--visibility` 覆盖。

### 技能变更（原结论有误，已纠正）

| 文件 | 改动 |
| --- | --- |
| `references/pitfalls.md` | 第 8 节重写：区分相对/绝对路径；实例未配置 `instanceUrl` 时正文只能写相对路径；补「先绑定后引用」与三步图文流程；记录旧版 `permanentPath` 的 404 bug |
| `references/commands.md` | 修正 `permanentPath` 说明并补 `relativePath`；`memo create` 默认 `PROTECTED` |
| `SKILL.md` | 关键提示改为相对路径 + 先绑定后引用 + 默认 `PROTECTED` |
| `docs/cli/memos-cli.md`（文档站） | 同步上述结论 |

### 实测（真实实例 v0.31.0）

- 上传后 `permanentPath` / `relativePath` 带令牌均 200；无令牌 401（私有附件）。
- 正文写绝对地址 → 400 `absolute managed attachment image URLs require a configured instance URL`。
- 未绑定就引用 → 400 `managed image attachment xxx must be bound to the memo`。
- 三步流程（建文本 → `attachment set-memo` → `memo update`）可写入 39 张图的图文笔记。

## v2.1.0 同步记录（2026-11-05）：上游新版本体系的破坏性变更

`apps/memos-cli` 本身未改动（仍是 2.0.0 那套），但**上游 memos 发布了破坏性变更**，技能原先写的版本事实已过期，本次只修文档、不动 CLI。

### 上游事实（已核实）

- **版本号体系切换**：v0.31.0（2026-09-19）之后改用日历版本号，依次是 `26.10.0`（2026-10-31）、`26.11.0`（2026-11-01）。**没有 v0.32**。
- **`/api/v1` 前缀被移除**：REST 从 `/api/v1/...` 改为 `/api/...`，SSE 从 `/api/v1/sse` 改为 `/api/sse`；proto 包 `memos.api.v1` 改为 `memos.api`。26.10 这一个 release 内，旧路径返回 **410 Gone**（`UNIMPLEMENTED` + 迁移提示），下一版删除。
- **响应字段按 AIP 规范改名**（影响解析）：`ListMemoCommentsResponse.memos` → **`comments`**；`UserStats.tagCount` → **`tagCounts`**，并新增 `totalMemoCount`；`ListAllUserStats` → `ListUserStats`（要求 `parent`，`GET /api/users/-/stats`，响应字段 `user_stats`）。
- **新增端点**：`GET /api/instance/configuration`（管理员，列出受配置文件管理的项）、`GET /api/users/{user}/stats`、`GET /api/users/{user}/usage`。

### 已纳入技能

| 文件 | 改动 |
| --- | --- |
| `references/pitfalls.md` | 顶部加 26.x 警告；第 2 节加入日历版本号与 **410 Gone** 的区分（老版本打错前缀是 404，26.x 打老前缀是 410）；第 4 节字段表按版本分列，标注 `comments` / `tagCounts` 改名；第 9、10 节补充 26.x 行为 |
| `references/setup.md` | API 前缀表改为「26.10.0 及以后」，补实测与「没有 v0.32」说明；`MEMOS_API_PATH` 说明同步 |
| `SKILL.md` | 版本号 `2.0.0` → `2.1.0`；前缀表与症状判断改为区分 404/410；错误处理表新增 410 行；关键提示补版本体系与字段改名 |
| `installation-guide.md` | 前缀提示与排错表同步为 26.10+ / 410 |

### 已知未修（需要改 CLI，不在本次文档同步范围）

- `apps/memos-cli` 的 `comment list` 只读 `data.memos`，在 26.x 实例上会返回空数组；应改为 `data.comments ?? data.memos`。
- `config.ts` 的 `DEFAULT_API_PATH` 仍是 `/api/v1`，对 26.x 实例必须显式传 `--api-path /api`。目前的取舍是保持向后兼容（现存实例多为 v0.29–v0.31），改默认值会让这些实例失效。
- 枚举重编号（`User.Role`、`UserSetting.Key` 等从 1 起）只影响发数字枚举值的客户端，CLI 用字符串，无需改。
- 访问令牌在 26.10 起与密码哈希绑定，改密后立即失效——这属服务端行为，技能只在 `authentication required` 排错时体现。

## 同步方式

- CLI 行为变化时：改 `apps/memos-cli` → 同步 `references/commands.md` / `pitfalls.md`，
  并更新 `apps/memos-cli/API-COVERAGE.md`。
- 上游发新 tag 时：
  1. 取 `raw.githubusercontent.com/usememos/memos/<tag>/proto/gen/openapi.yaml`；
  2. 对比 `paths` 差异，判断是否需要扩展命令；
  3. 用真实实例跑 `pnpm --filter @tnnevol/memos-cli test`；
  4. 任何文档与服务端冲突记进 `references/pitfalls.md`。

## 版本沿革

- `1.0.2` 及更早：技能自带零依赖 `.cjs` 脚本（`skills/memos/scripts/`），直接拼 HTTP 请求。
- `2.0.0`：脚本拆分为独立 CLI（`apps/memos-cli`，发布为 `@tnnevol/memos-cli`），
  技能只保留 SKILL.md 与 references，按 CLI 命令组织内容。
