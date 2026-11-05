# Pitfalls — 真实接口契约与踩坑

以下结论来自真实实例（memos **v0.31.0**）实测，以及上游 `proto/gen/openapi.yaml` 的对照。
凡文档与服务端冲突处，CLI 以**真实服务端**为准，此处供排查与理解。

> ⚠️ **2026-10 起 memos 改用日历版本号并移除 `/api/v1`**：v0.31.0 之后的版本是 `26.10.0`、`26.11.0`（不是 v0.32）。
> 新版把 REST 路径从 `/api/v1/...` 改成 `/api/...`，并且对 `/api/v1/...` 返回 **410 Gone**（只保留一个版本用于提示迁移，下一版删除）。
> 连 26.x 实例必须 `--api-path /api`；连 v0.29–v0.31 用默认的 `/api/v1`。详见第 2 节。

## 1. 输出与判定

- 成功：`{ success:true, operation, data }`（stdout，退出码 0）。
- 失败：`{ success:false, message, code, httpStatus }`（stderr，退出码非 0）。
- 解析脚本请以 `success` 判定，不要只看退出码；`code` 是 gRPC-gateway 状态码
  （`3` INVALID_ARGUMENT、`5` NOT_FOUND、`7` PERMISSION_DENIED、`16` UNAUTHENTICATED）。

## 2. API 路径前缀在版本间变过（最容易踩）

| memos 版本 | 路径 | 实测 |
| --- | --- | --- |
| v0.29 – v0.31 | `/api/v1/...` | v0.31.0 实例 `/api/v1/auth/me` → 200 |
| **26.10.0 / 26.11.0**（v0.31.0 之后的日历版本号） | `/api/...` | 新版 `/api/auth/me` → 200；**旧前缀 `/api/v1/...` → 410 Gone**，响应体是 `API v1 has been removed. Use /api/...` 的 `UNIMPLEMENTED` 错误 |

CLI 默认 `/api/v1`，连 26.x 用 `--api-path /api` 或 `MEMOS_API_PATH=/api`。

**注意区分状态码**：老版本上打错前缀是 **404**，26.x 上打老前缀是 **410 Gone**。看到 410 就直接改 `--api-path /api`，不要怀疑令牌或网络。上游声明 410 只保留一个 release，之后老路径直接消失（届时会是 404）。

## 3. 标签过滤语法（旧写法已失效）

| 写法                              | 结果                                                   |
| --------------------------------- | ------------------------------------------------------ |
| `tags == ["ai"]`                  | ❌ 400 `invalid filter: unsupported value expression`   |
| `"ai" in tags`                    | ✅ 正常                                                 |
| `tags.exists(t, t == "ai")`       | ✅ 正常                                                 |

旧技能脚本用的是第一种，在 v0.31 上直接报 400。CLI 的 `--tag` / `tag memos` 已改用
`"tag" in tags`，并拒绝含双引号或反斜杠的标签。

`filter` 的可用字段：`content`、`creator`、`created_ts`、`updated_ts`、`pinned`、`visibility`、
`space`、`tags`、`has_task_list`、`has_link`、`has_code`、`has_incomplete_tasks`、`has_location`。

> 注意时间字段名不一致：`filter` 里用 `created_ts` / `updated_ts`，而 `order_by` 里用
> `create_time` / `update_time`。

## 4. 列表响应字段名不统一

| 接口                              | v0.29–v0.31 字段     | **26.10+ 字段**        | 易错写法       |
| --------------------------------- | -------------------- | ---------------------- | -------------- |
| `GET /memos`                      | `memos`              | `memos`                | —              |
| `GET /memos/{memo}/comments`      | `memos`              | **`comments`（已改名）** | `memos`（新版拿空数组） |
| `GET /memos/{memo}/reactions`     | `reactions`          | `reactions`            | —              |
| `GET /memos/{memo}/relations`     | `relations`          | `relations`            | —              |
| `GET /memos/{memo}/shares`        | **`memoShares`**     | `memoShares`           | `shares`       |
| `GET /memos/{memo}/attachments`   | `attachments`        | `attachments`          | —              |
| `GET /spaces/{space}/members`     | **`spaceMembers`**   | `spaceMembers`         | `members`      |
| `GET /spaces/{space}/invitations` | **`spaceInvitations`** | `spaceInvitations`   | `invitations`  |
| `GET /users/{user}:getStats`      | `tagCount`           | **`tagCounts`（已改名）**、新增 `totalMemoCount` | `tagCount` |

按错字段名解析不会报错，只会拿到空数组/`undefined`——这是最隐蔽的一类 bug。

> ⚠️ **评论列表的字段名在 26.10 反转了**：旧版是 `memos`，新版按 AIP 规范改成 `comments`。
> 写兼容两条路径的代码时依赖 `data.comments ?? data.memos`；`memos-cli` 当前只读 `memos`，在 26.x 实例上 `comment list` 会返回空数组。

## 5. 分页是游标，不是页码

`pageSize` + `nextPageToken`；响应里 `nextPageToken` 为空字符串表示没有下一页。
`pageSize` 上限 1000，超过被服务端强制降到 1000。CLI 归一成
`pagination: { pageSize, nextPageToken, hasMore }`，续页用 `--page-token`。

## 6. 评论就是 memo

`POST /memos/{memo}/comments` 创建的是**另一条 memo**（带 `parent` 字段，relation type 为 COMMENT），
所以：

- 更新/删除评论走 `/memos/{commentMemo}`，**没有** `/comments/{id}` 这种端点。
- 评论列表返回的 `content` 可能是摘要而非全文；需要完整内容用 `memo get <commentMemo>`。
- 评论的可见性默认继承父笔记；可在创建时用 `--visibility` 覆盖。

## 7. 关系与附件是"整体覆盖"

- `PATCH /memos/{memo}/relations`（`SetMemoRelationsRequest`）与
  `PATCH /memos/{memo}/attachments`（`SetMemoAttachmentsRequest`）都**替换**整个数组。
- 直接调 PATCH 会静默删掉未列出的关联/附件。CLI 的 `relation add/remove` 因此先 GET 全量
  （自动翻页）再回写；`attachment set-memo` 则要求用户显式给出完整列表。
- 重复添加关联不报错，CLI 返回 `changed: false`。

## 8. 附件与图文笔记

- `POST /attachments` 的 `content` 是 base64 字符串，请求体随文件线性增大，适合中小文件。
- 访问路径有两种形态，别混。`attachmentName` 形如 `attachments/xxx`，**本身已含 `attachments/` 前缀**：
  - 相对路径 `/file/{attachmentName}/{filename}` → `/file/attachments/xxx/pic.png`，
    **笔记正文用这个**（CLI 返回 `relativePath`）。
  - 绝对路径 `{baseUrl}/file/{attachmentName}/{filename}`，站外下载/分享用（CLI 返回 `permanentPath`）。
  - 多拼一层 `attachments` 得到 `/file/attachments/attachments/xxx/pic.png` → **404**。
    旧版 CLI 的 `permanentPath` 就是这个 bug（已在 1.1.0 修复）。
- 实例未配置 `instanceUrl` 时，正文里写**绝对地址会被服务端拒收**：
  `absolute managed attachment image URLs require a configured instance URL`（400）。只能用相对路径。
- **正文引用前，附件必须已绑定到该笔记**，否则 400：
  `managed image attachment xxx must be bound to the memo`。
  `memo create` / `memo update` 没有附件参数，所以图文笔记的标准流程是三步：
  1. `memo create --content-file draft.md`（先写纯文本，正文里不放图片）
  2. `attachment set-memo <memo> -a <id1>,<id2>,...`（整体覆盖，必须给全量列表）
  3. `memo update <memo> --content-file final.md`（这时正文里的 `![](/file/...)` 才会被接受）
- `externalLink` 是预签名 URL（部分实例直接为空），会过期，不要写进正文。
- **`attachment list` 只返回「你本人创建的」附件**：服务端 `ListAttachments` 强制
  `CreatorID = 当前登录用户`（`server/api/v1/attachment_service.go`），不受 visibility 影响。
  多用户实例里，别人传的附件在你账号下**永远查不到**，但笔记页面仍能正常显示图片
  （`/file/` 路由按 memo 访问权限判断，不经过 ListAttachments）。
  遇到「图片显示正常、附件列表却为空」，先比对附件 `creator` 与当前令牌用户，不要误判为上传失败。
  同理，`content` 字段是 `writeOnly`，查询恒为空串，也不能作为「没存」的依据。
- 大文件应走分块接口 `POST /attachments:upload`（`spec` + `uploadId` + `writeOffset` +
  `data` + `finishWrite`，30 分钟无活动失效），CLI 暂未封装。

## 9. 空间（Space）是 v0.31 新增

v0.29 / v0.30 没有 `/spaces`，`space` 分组命令在旧实例上必然 404。
`--api-path` 只解决路径前缀，不能跨版本降级特性。

26.10+ 的空间接口仍在，但字段与路由按 AIP 规范重排（例如 `ListMemoComments` 等改用 `parent` 参数、若干资源复数名调整）。

## 10. `--api-path` 与 `me instance` 的关系

`me instance` 也走同样的前缀，所以**前缀错时它自己也会 404 / 410**，不能拿它"先探版本"。
真正稳妥的做法是：先问用户实例版本，或按「默认 `/api/v1` → 全 404/410 就换 `/api`」两步试。

26.x 上另一种确认方式：直接看错误体。410 会带 `API v1 has been removed. Use /api/...`，这是**最明确的版本信号**，比探接口更快。
