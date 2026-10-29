# Commands — 命令与参数详解

所有命令支持 `--help`。全局选项 `--base-url` / `--token` / `--api-path` / `--pretty` 可加在任意命令前。

> 分页：Memos 用 **游标分页**（`pageSize` + `pageToken`）。列表命令默认 `--page-size` 50（上限 1000），
> 输出在 `data` 同级附带 `pagination`（`pageSize` / `nextPageToken` / `hasMore`）；
> 续页时传 `--page-token <上一页 pagination.nextPageToken>`。

## auth — 认证

| 命令          | 说明                              | 选项                                                          |
| ------------- | --------------------------------- | ------------------------------------------------------------- |
| `auth login`  | 登录并保存配置                    | `--base-url <url>`、`--token <token>`、`--api-path <path>`    |
| `auth logout` | 清除本地配置                      | —                                                             |
| `auth status` | 查看登录状态（调用 `/auth/me` 校验） | —                                                          |

授权缺失时默认使用终端交互式登录。代理应运行 `memos-cli auth login`，明确告知用户需要在提示中填写服务地址和令牌，并等待用户完成输入；不要直接代用户拼接认证参数。只有用户明确要求非交互式登录，或当前环境无法提供交互终端时，才使用参数、环境变量或配置文件。

交互式流程：地址（格式校验）→ 令牌（隐藏输入）→ `/auth/me` 校验 → 失败重试 → 通过后保存。地址变更会清除配置中的旧令牌。非交互模式必须同时提供地址与令牌，同样先校验再保存；不会阻塞等待输入。

## memo — 笔记

| 命令                 | 说明             | 选项                                                                                  |
| -------------------- | ---------------- | ------------------------------------------------------------------------------------- |
| `memo list`          | 列出笔记         | `-n/--page-size`(50)、`--page-token`、`--state`、`--order-by`、`--filter`、`--tag`、`--show-deleted`、`--full` |
| `memo get <memo>`    | 单条笔记         | —                                                                                     |
| `memo create`        | 创建笔记         | `-c/--content`、`--content-file`、`--visibility`(PRIVATE)、`--memo-id`、`--space`、`--pinned` |
| `memo update <memo>` | 更新内容/可见性  | `-c/--content`、`--content-file`、`--visibility`（至少一项）                           |
| `memo delete <memo>` | 删除笔记         | `--force`                                                                             |
| `memo pin <memo>`    | 置顶             | —                                                                                     |
| `memo unpin <memo>`  | 取消置顶         | —                                                                                     |

`<memo>` 接受 `memos/xxx` 或纯 `xxx`。

`--filter` 是 CEL 表达式，可用字段：`content`、`creator`、`created_ts`/`updated_ts`、`pinned`、
`visibility`、`space`、`tags`、`has_task_list`、`has_link`、`has_code`、`has_location`。

```bash
memos-cli memo list -n 20 --tag ai
memos-cli memo list --state ARCHIVED --order-by "update_time desc"
memos-cli memo list --filter 'content.contains("roadmap") && created_ts > now - duration("168h")'
memos-cli memo list --filter 'pinned == true && visibility == "PUBLIC"'

memos-cli memo create --content "随手记 #idea" --visibility PRIVATE
memos-cli memo create --content-file ./note.md --memo-id my-custom-id
printf '来自管道的内容\n' | memos-cli memo create

memos-cli memo update memos/abc --content "新内容"
memos-cli memo update memos/abc --visibility PUBLIC
memos-cli memo delete memos/abc --force
```

> `--tag` 内部转成 `"tag" in tags`；直接写 `tags == ["tag"]` 会被服务端拒绝（见 pitfalls）。

## comment — 评论

| 命令                        | 说明                             | 选项                                                       |
| --------------------------- | -------------------------------- | ---------------------------------------------------------- |
| `comment list <memo>`       | 列出评论                         | `-n/--page-size`(50)、`--page-token`、`--order-by`         |
| `comment create <memo>`     | 添加评论                         | `-c/--content`、`--content-file`、`--visibility`、`--comment-id` |
| `comment update <comment>`  | 更新评论内容/可见性              | `-c/--content`、`--content-file`、`--visibility`           |
| `comment delete <comment>`  | 删除评论                         | —                                                          |

评论在数据模型上本身是一条 memo（带 `parent` 字段），因此 `<comment>` 用的是**评论那条 memo 的资源名**，
`update`/`delete` 实际打到 `/memos/{commentMemo}`。

```bash
memos-cli comment create memos/abc --content "赞同"
memos-cli comment list memos/abc
memos-cli comment update memos/def --content "改一下措辞"
memos-cli comment delete memos/def
```

## tag — 标签

| 命令                | 说明                             | 选项                                                       |
| ------------------- | -------------------------------- | ---------------------------------------------------------- |
| `tag list`          | 汇总标签并按次数排序             | `-n/--page-size`(200)、`--max-pages`(10)、`--filter`       |
| `tag memos <tag>`   | 列出带某个标签的笔记             | `-n/--page-size`(50)、`--page-token`、`--full`             |

服务端没有独立标签接口，`tag list` 通过扫描笔记的 `tags` 字段汇总。为控制成本默认最多
10 页 × 200 条；达到上限时返回 `truncated: true` 与 `nextPageToken`，表示**结果不完整**。

```bash
memos-cli tag list
memos-cli tag list --max-pages 20 -n 500
memos-cli tag list -n 500 --filter 'created_ts > now - duration("720h")'
memos-cli tag memos ai -n 20
```

## reaction — 表情回应

| 命令                                | 说明                                                       |
| ----------------------------------- | ---------------------------------------------------------- |
| `reaction list <memo>`              | 列出表情（`-n`、`--page-token`）                           |
| `reaction add <memo> <emoji>`       | 添加表情；同类型已存在时服务端覆盖更新                     |
| `reaction remove <memo> <reaction>` | 移除表情（`<reaction>` 用列表返回的 name，或纯 ID）        |

```bash
memos-cli reaction add memos/abc 👍
memos-cli reaction list memos/abc
memos-cli reaction remove memos/abc memos/abc/reactions/1
```

## relation — 关联

| 命令                                  | 说明                                                     |
| ------------------------------------- | -------------------------------------------------------- |
| `relation list <memo>`                | 列出关联（`-n`、`--page-token`）                         |
| `relation add <memo> <related>`       | 建立关联；`--type` 取 `REFERENCE`(默认)/`COMMENT`/`PARENT` |
| `relation remove <memo> <related>`    | 解除关联；`--type` 可只解指定类型                        |

服务端 `PATCH /memos/{memo}/relations` 是**整体覆盖**语义，CLI 会先拉全量（自动翻页）再回写，
所以增删都安全。重复添加不报错，返回 `changed: false`。不允许自关联。

```bash
memos-cli relation add memos/abc memos/def
memos-cli relation add memos/abc memos/def --type PARENT
memos-cli relation remove memos/abc memos/def
```

## attachment — 附件

| 命令                                | 说明                                                    |
| ----------------------------------- | ------------------------------------------------------- |
| `attachment list`                   | 列出附件（`-n`、`--page-token`、`--filter`、`--order-by`） |
| `attachment get <attachment>`       | 附件详情                                                |
| `attachment list-by-memo <memo>`    | 笔记的附件（`-n`、`--page-token`）                      |
| `attachment upload <file>`          | 上传（base64 内联）；`--memo`、`--filename`、`--type`、`--attachment-id` |
| `attachment update <attachment>`    | `--filename` / `--memo`（至少一项）                     |
| `attachment delete <attachment>`    | 删除附件                                                |
| `attachment batch-delete <...>`     | 批量删除（可多个）                                      |
| `attachment set-memo <memo>`        | 设置笔记附件列表（整体覆盖）；`-a/--attachments` 逗号分隔 |

上传返回里 `permanentPath` = `{baseUrl}/file/attachments/{name}/{filename}`，这是笔记正文该用的
**永久路径**；`externalLink` 是预签名 URL，会过期，不要写进笔记。

```bash
memos-cli attachment upload ./pic.png --memo memos/abc
memos-cli attachment list-by-memo memos/abc
memos-cli attachment update attachments/xyz --filename new.png
memos-cli attachment set-memo memos/abc -a attachments/a,attachments/b
memos-cli attachment batch-delete attachments/a attachments/b
```

MIME 类型按扩展名推断（png/jpg/gif/webp/svg/pdf/json/txt/md/csv/html/zip/mp3/mp4/wav/mov），
其余落到 `application/octet-stream`；也可用 `--type` 显式指定。

## share — 分享

| 命令                              | 说明                                                     |
| --------------------------------- | -------------------------------------------------------- |
| `share list <memo>`               | 列出分享（返回字段是 `memoShares`）                      |
| `share create <memo>`             | 创建分享；`--expire-time` 为 RFC3339                     |
| `share delete <memo> <share>`     | 撤销分享                                                 |
| `share get <token>`               | 用分享 token 读取公开笔记                               |

`share create` 额外返回 `shareToken` 与可访问 `url`（`{baseUrl}/memos/shares/{token}`）。

```bash
memos-cli share create memos/abc
memos-cli share create memos/abc --expire-time 2027-01-01T00:00:00Z
memos-cli share list memos/abc
memos-cli share get hqK2eQebp2spQj6Vnnd3Cd
```

## space — 空间（v0.31+）

| 命令                                       | 说明                                     |
| ------------------------------------------ | ---------------------------------------- |
| `space list`                               | 列出空间（`-n`、`--page-token`）         |
| `space get <space>`                        | 空间详情                                 |
| `space create`                             | `--title`(必填)、`--description`、`--emoji`、`--lucide`、`--space-id` |
| `space update <space>`                     | `--title`、`--description`、`--emoji`、`--lucide`（至少一项） |
| `space delete <space>`                     | 删除空间                                 |
| `space members <space>`                    | 列出成员（返回 `spaceMembers`）          |
| `space member-update <space> <member>`     | `--role` 角色                            |
| `space member-remove <space> <member>`     | 移除成员                                 |
| `space invitations <space>`                | 列出邀请（返回 `spaceInvitations`）      |
| `space invite <space>`                     | `--invitee`(必填)、`--role`(MEMBER)、`--invitation-id` |
| `space invitation-revoke <space> <inv>`    | 撤销邀请                                 |
| `space invitation-accept <space> <inv>`    | 接受邀请                                 |
| `space invitation-decline <space> <inv>`   | 拒绝邀请                                 |

```bash
memos-cli space create --title "团队空间" --emoji 🧪
memos-cli space invite spaces/abc --invitee users/alice --role MEMBER
memos-cli space members spaces/abc
memos-cli space member-update spaces/abc users/alice --role ADMIN
```

旧实例（v0.29/v0.30）没有 `/spaces` 接口，该分组命令会 404。

## me — 当前用户与实例

| 命令           | 说明                                       | 选项                          |
| -------------- | ------------------------------------------ | ----------------------------- |
| `me get`       | 当前登录用户                               | —                             |
| `me stats`     | 用户统计（笔记类型、标签分布等）           | `--user`、`--filter`          |
| `me instance`  | 实例信息（版本、访问模式、管理员）         | —                             |

```bash
memos-cli me get
memos-cli me stats --user users/alice
memos-cli me instance
```
