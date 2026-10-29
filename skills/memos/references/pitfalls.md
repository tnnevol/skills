# Pitfalls — 真实接口契约与踩坑

以下结论来自真实实例（memos **v0.31.0**）实测，以及上游 `proto/gen/openapi.yaml` 的对照。
凡文档与服务端冲突处，CLI 以**真实服务端**为准，此处供排查与理解。

## 1. 输出与判定

- 成功：`{ success:true, operation, data }`（stdout，退出码 0）。
- 失败：`{ success:false, message, code, httpStatus }`（stderr，退出码非 0）。
- 解析脚本请以 `success` 判定，不要只看退出码；`code` 是 gRPC-gateway 状态码
  （`3` INVALID_ARGUMENT、`5` NOT_FOUND、`7` PERMISSION_DENIED、`16` UNAUTHENTICATED）。

## 2. API 路径前缀在版本间变过（最容易踩）

| memos 版本    | 路径          | 实测                                        |
| ------------- | ------------- | ------------------------------------------- |
| v0.29 – v0.31 | `/api/v1/...` | v0.31.0 实例 `/api/v1/auth/me` → 200        |
| main / v0.32+ | `/api/...`    | 同一实例 `/api/auth/me` → 404               |

CLI 默认 `/api/v1`，连新版本用 `--api-path /api` 或 `MEMOS_API_PATH=/api`。

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

| 接口                              | 真实字段            | 易错写法       |
| --------------------------------- | ------------------- | -------------- |
| `GET /memos`                      | `memos`             | —              |
| `GET /memos/{memo}/comments`      | `memos`             | `comments`     |
| `GET /memos/{memo}/reactions`     | `reactions`         | —              |
| `GET /memos/{memo}/relations`     | `relations`         | —              |
| `GET /memos/{memo}/shares`        | **`memoShares`**    | `shares`       |
| `GET /memos/{memo}/attachments`   | `attachments`       | —              |
| `GET /spaces/{space}/members`     | **`spaceMembers`**  | `members`      |
| `GET /spaces/{space}/invitations` | **`spaceInvitations`** | `invitations` |

按错字段名解析不会报错，只会拿到空数组——这是最隐蔽的一类 bug。

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

## 8. 附件上传：base64 内联 vs 分块

- `POST /attachments` 的 `content` 是 base64 字符串，请求体随文件线性增大，适合中小文件。
- `externalLink` 是**预签名 URL，会过期**，不能写进笔记正文；正文用永久路径
  `{baseUrl}/file/attachments/{attachmentName}/{filename}`（CLI 以 `permanentPath` 返回）。
- 大文件应走分块接口 `POST /attachments:upload`（`spec` + `uploadId` + `writeOffset` +
  `data` + `finishWrite`，30 分钟无活动失效），CLI 暂未封装。

## 9. 空间（Space）是 v0.31 新增

v0.29 / v0.30 没有 `/spaces`，`space` 分组命令在旧实例上必然 404。
`--api-path` 只解决路径前缀，不能跨版本降级特性。

## 10. `--api-path` 与 `me instance` 的关系

`me instance` 也走同样的前缀，所以**前缀错时它自己也会 404**，不能拿它"先探版本"。
真正稳妥的做法是：先试默认 `/api/v1`，全 404 时再换 `/api`，或直接问用户实例版本。
