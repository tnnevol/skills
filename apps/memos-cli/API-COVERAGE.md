# Memos CLI 接口对照清单

> 数据来源：`github.com/usememos/memos` 各 tag 的 `proto/gen/openapi.yaml`（官方文档
> <https://usememos.com/docs/api/latest> 渲染的同一份文件）+ 真实实例 `v0.31.0` 实测。
> 凡文档与真实服务端不一致处，实现以真实服务端为准，并在「差异详解」中记录。

## 一、总览

CLI 按使用频率和技能需求裁剪，未追求全量覆盖。

| 分组          | 已对接命令数 | 说明                                                        |
| ------------- | ------------ | ----------------------------------------------------------- |
| auth          | 3            | login / logout / status（用 `/auth/me` 校验）               |
| memo          | 7            | list / get / create / update / delete / pin / unpin          |
| comment       | 4            | list / create / update / delete（评论本身是 memo）          |
| tag           | 2            | list（客户端汇总）/ memos（按标签过滤）                     |
| reaction      | 3            | list / add / remove                                         |
| relation      | 3            | list / add / remove（整体覆盖语义，CLI 先读后写）           |
| attachment    | 8            | list / get / list-by-memo / upload / update / delete / batch-delete / set-memo |
| share         | 4            | list / create / delete / get（按 token 读公开笔记）         |
| space         | 13           | 空间 CRUD + 成员 + 邀请（v0.31 新增服务）                   |
| me            | 3            | get / stats / instance                                      |
| **合计**      | **50**       | 对应 v0.31.0 的 92 个接口中的核心子集                       |

未对接的服务（按需求裁剪）：`ai:transcribe`、`identity-providers`、`instance`（除 profile）、
`users` 管理（除 `:getStats`）、`linkedIdentities`、`notifications`、`personalAccessTokens`、
`views`、`webhooks`、`importMemos`/`exportMemos`。

## 二、路径前缀与版本

| memos 版本      | 接口路径前缀 | CLI 用法                                    |
| --------------- | ------------ | ------------------------------------------- |
| v0.29 – v0.31   | `/api/v1`    | 默认，无需额外配置                          |
| main / v0.32+   | `/api`       | `--api-path /api` 或 `MEMOS_API_PATH=/api`  |

实测 `v0.31.0` 实例：`/api/v1/auth/me` → 200，`/api/auth/me` → 404。

## 三、已对接接口清单

| CLI 命令                              | 接口                                                    |
| ------------------------------------- | ------------------------------------------------------- |
| `auth login` / `status`               | GET `/auth/me`                                          |
| `memo list`                           | GET `/memos`                                            |
| `memo get` / `delete` / `pin` / `unpin` / `update` | GET / DELETE / PATCH `/memos/{memo}`       |
| `memo create`                         | POST `/memos`                                           |
| `comment list`                        | GET `/memos/{memo}/comments`                            |
| `comment create`                      | POST `/memos/{memo}/comments`                           |
| `comment update` / `delete`           | PATCH / DELETE `/memos/{memo}`（评论是 memo）           |
| `tag memos` / `memo list --tag`       | GET `/memos?filter="tag" in tags`                       |
| `reaction list`                       | GET `/memos/{memo}/reactions`                           |
| `reaction add`                        | POST `/memos/{memo}/reactions`                          |
| `reaction remove`                     | DELETE `/memos/{memo}/reactions/{reaction}`             |
| `relation list`                       | GET `/memos/{memo}/relations`                           |
| `relation add` / `remove`             | PATCH `/memos/{memo}/relations`（整体覆盖）             |
| `attachment list`                     | GET `/attachments`                                      |
| `attachment get` / `update` / `delete`| GET / PATCH / DELETE `/attachments/{attachment}`        |
| `attachment list-by-memo`             | GET `/memos/{memo}/attachments`                         |
| `attachment upload`                   | POST `/attachments`（base64 内联）                      |
| `attachment batch-delete`             | POST `/attachments:batchDelete`                         |
| `attachment set-memo`                 | PATCH `/memos/{memo}/attachments`（整体覆盖）           |
| `share list`                          | GET `/memos/{memo}/shares`                              |
| `share create`                        | POST `/memos/{memo}/shares`                             |
| `share delete`                        | DELETE `/memos/{memo}/shares/{share}`                   |
| `share get`                           | GET `/shares/{shareToken}/memo`                         |
| `space list` / `create`               | GET / POST `/spaces`                                    |
| `space get` / `update` / `delete`     | GET / PATCH / DELETE `/spaces/{space}`                  |
| `space members`                       | GET `/spaces/{space}/members`                           |
| `space member-update` / `member-remove` | PATCH / DELETE `/spaces/{space}/members/{member}`     |
| `space invitations`                   | GET `/spaces/{space}/invitations`                       |
| `space invite`                        | POST `/spaces/{space}/invitations`                      |
| `space invitation-revoke`             | DELETE `/spaces/{space}/invitations/{invitation}`       |
| `space invitation-accept` / `-decline`| POST `/spaces/{space}/invitations/{invitation}:accept` / `:decline` |
| `me get`                              | GET `/auth/me`                                          |
| `me stats`                            | GET `/users/{user}:getStats`                            |
| `me instance`                         | GET `/instance/profile`                                 |

## 四、差异详解（文档 vs 真实服务端）

### 1. 标签过滤语法

| 来源                        | 写法                                | 实测结果                                             |
| --------------------------- | ----------------------------------- | ---------------------------------------------------- |
| 旧技能脚本 / 历史文档       | `tags == ["ai"]`                    | ❌ `invalid filter: unsupported value expression`（400） |
| v0.31 OpenAPI 参数说明      | `"work" in tags` 或 `tags.exists(...)` | ✅ 正常返回                                       |

CLI 用 `"tag" in tags`，并对含双引号/反斜杠的标签直接报错，避免拼出非法表达式。

### 2. 列表响应字段名不统一

| 接口                              | 字段名（真实）    | 易错写法     |
| --------------------------------- | ----------------- | ------------ |
| GET `/memos`                      | `memos`           | —            |
| GET `/memos/{memo}/comments`      | `memos`           | `comments`   |
| GET `/memos/{memo}/shares`        | **`memoShares`**  | `shares`     |
| GET `/spaces/{space}/members`     | **`spaceMembers`**| `members`    |
| GET `/spaces/{space}/invitations` | **`spaceInvitations`** | `invitations` |

CLI 输出按真实字段名返回，避免给调用方喂空数组。

### 3. 分页是游标，不是页码

`pageSize` + `nextPageToken`（响应里的 `nextPageToken` 为空字符串表示没有下一页）。
CLI 在 `data.pagination` 里归一成 `pageSize` / `nextPageToken` / `hasMore`。

`pageSize` 上限 1000，超过会被服务端强制降为 1000；CLI 先做一次 clamp。

### 4. 评论与关联的整体覆盖语义

- `POST /memos/{memo}/comments` 创建的是**另一条 memo**（带 `parent` 字段），所以更新和
  删除评论走的是 `/memos/{commentMemo}`，不是 `/comments/{id}`。
- `PATCH /memos/{memo}/relations` 与 `PATCH /memos/{memo}/attachments` 都是**整体覆盖**：
  请求体里的数组会替换全部现有关联/附件。CLI 的 `relation add/remove` 因此先 GET 全量
  （自动翻页）再回写，避免误删；重复添加不报错，返回 `changed: false`。

### 5. 附件上传是 base64 内联

`POST /attachments` 的 `content` 字段是 base64 字符串，适合中小文件；上传返回的
`externalLink` 是预签名 URL（会过期），笔记正文应使用
`{baseUrl}/file/attachments/{attachmentName}/{filename}` 这一永久路径（CLI 已作为
`permanentPath` 返回）。

大文件应改用分块接口 `POST /attachments:upload`（`UploadAttachmentRequest`：
`spec` + `uploadId` + `writeOffset` + `data` + `finishWrite`），CLI 暂未封装。

### 6. 空间（Space）是 v0.31 新增

v0.29/v0.30 没有 `/spaces` 接口；在旧实例上执行 `space` 分组命令会得到 404。这也意味着
CLI 的 `--api-path` 只解决路径前缀，不能跨版本降级特性。

## 五、维护方式

1. 上游发新 tag 后取 `proto/gen/openapi.yaml`（`raw.githubusercontent.com/usememos/memos/<tag>/proto/gen/openapi.yaml`）。
2. 对比 `paths` 差异，按需扩展 `src/commands/`。
3. 用真实实例跑 `pnpm --filter @tnnevol/memos-cli test`，任何文档与服务端冲突都记到本文件第四节。
