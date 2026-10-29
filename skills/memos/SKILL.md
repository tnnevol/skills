---
name: memos
displayName: memos
slug: tnnevol-memos
description: >-
  通过 memos-cli 操作 Memos（自建时间线式笔记服务）。触发场景：创建/查看/更新/删除笔记，置顶、按标签或时间检索，
  管理评论、表情回应、笔记关联、附件上传、分享链接，以及空间（Space）与成员邀请。命令输出为结构化 JSON，所有命令支持 --help。
  当用户提到 memos、笔记、随手记、时间线、标签检索、给笔记评论、上传附件、分享笔记时使用。
metadata:
  author: Tnnevol
  version: "2.0.0"
---

# SKILL: memos

用 `memos-cli` 完成用户对 Memos 的操作；不要凭记忆拼接 API 请求，优先用 CLI 的 `--help` 驱动下一步。CLI 内部已把命令映射到经真实服务端核验的 API 契约（见 [pitfalls](references/pitfalls.md)）。

Memos（[usememos](https://usememos.com/)）是**时间线式**笔记工具，不是文件夹式笔记本：鼓励"先记录、后整理"，用标签而不是目录来组织内容。

## 安装前置要求

代理处理 memos 任务前，必须先阅读并遵循 [memos-cli 首次安装引导](installation-guide.md)，根据用户环境完成 `memos-cli` 的安装或升级。安装完成前，不得直接执行认证或业务命令。

若当前环境已经可用（`memos-cli me get` 或 `memos-cli auth status` 能正常返回当前用户），则无需再次引导，直接执行业务命令即可。

## 新会话检查

首次处理 memos 任务时，先按上述安装引导完成安装，再轻量确认 CLI 可用与已认证：

```bash
memos-cli --version        # 确认 CLI 可用
memos-cli me get           # 确认已认证（返回当前用户即 OK）
```

- 若 `memos-cli` 不存在：`npm i -g @tnnevol/memos-cli`（或用 `npx -y @tnnevol/memos-cli <command>`；本仓库开发态可用 `node apps/memos-cli/dist/cli.js`，需先 `pnpm --filter @tnnevol/memos-cli build`）。
- 若报未配置：引导用户执行 `memos-cli auth login`（见下），不要直接代用户拼接令牌。

## 认证与配置

优先级：**CLI 选项 > 环境变量 > 配置文件**。

| 方式     | 说明                                                                                 |
| -------- | ------------------------------------------------------------------------------------ |
| 环境变量 | `MEMOS_BASE_URL`、`MEMOS_ACCESS_TOKEN`、`MEMOS_API_PATH`（可选）                      |
| 全局选项 | `--base-url <url>`、`--token <token>`、`--api-path <path>`、`--pretty`（美化 JSON）   |
| 登录保存 | `memos-cli auth login` → 交互式填写地址与令牌，校验通过后写入 `~/.memos/config.json` |

- 访问令牌在 Memos「设置 → 访问令牌（Access tokens）」生成。**不要在对话/日志/文件中回显令牌**。
- 授权缺失时，必须使用终端交互式方式运行 `memos-cli auth login`，让用户在提示中填写服务地址和令牌；需要明确告知用户当前正在等待其输入。
- 不要默认改用 `--base-url`、`--token`、环境变量或配置文件代替交互式授权。只有用户明确要求脚本化、非交互式登录，或当前环境无法提供交互终端时，才使用参数、环境变量或配置文件。
- 交互式 `auth login` 会先问服务地址，再以隐藏输入问令牌，并用 `/auth/me` 校验；校验失败继续提示，通过后才保存。非交互模式必须同时提供地址与令牌（同样先校验）。
- `memos-cli auth status` 查看登录状态；`memos-cli auth logout` 清除本地配置。

### API 路径前缀（跨版本必看）

| memos 版本    | 路径前缀   | 用法                                                    |
| ------------- | ---------- | ------------------------------------------------------- |
| v0.29 – v0.31 | `/api/v1`  | 默认，无需配置                                          |
| main / v0.32+ | `/api`     | `--api-path /api` 或 `MEMOS_API_PATH=/api`              |

**症状**：所有命令都返回 404 → 先怀疑路径前缀。用 `memos-cli me instance` 看实例 `version`，再决定是否需要 `--api-path`。

## 基础用法

```bash
memos-cli --help
memos-cli <group> --help
memos-cli <group> <command> --help
```

命令分组：`auth`、`memo`（笔记）、`comment`（评论）、`tag`（标签）、`reaction`（表情）、`relation`（关联）、`attachment`（附件）、`share`（分享）、`space`（空间）、`me`（当前用户与实例）。

## 命令概览

| 分组       | 命令                                                                                     | 说明                                     |
| ---------- | ---------------------------------------------------------------------------------------- | ---------------------------------------- |
| auth       | `login` / `logout` / `status`                                                            | 认证与配置                               |
| memo       | `list` / `get` / `create` / `update` / `delete` / `pin` / `unpin`                        | 笔记 CRUD 与置顶                         |
| comment    | `list <memo>` / `create <memo>` / `update <comment>` / `delete <comment>`                | 评论（评论本身也是一条 memo）            |
| tag        | `list` / `memos <tag>`                                                                   | 汇总标签、按标签列笔记                   |
| reaction   | `list <memo>` / `add <memo> <emoji>` / `remove <memo> <reaction>`                        | 表情回应                                 |
| relation   | `list <memo>` / `add <memo> <related>` / `remove <memo> <related>`                       | 笔记关联（`--type` 默认 REFERENCE）      |
| attachment | `list` / `get` / `list-by-memo` / `upload` / `update` / `delete` / `batch-delete` / `set-memo` | 附件                                 |
| share      | `list <memo>` / `create <memo>` / `delete <memo> <share>` / `get <token>`                | 分享链接                                 |
| space      | `list` / `get` / `create` / `update` / `delete` / `members` / `member-*` / `invitation*` | 空间、成员与邀请（v0.31+）               |
| me         | `get` / `stats` / `instance`                                                             | 当前用户、统计、实例信息                 |

> `<memo>` 接受 `memos/xxx` 或纯 ID，CLI 自动补前缀；`<comment>`/`<attachment>`/`<share>` 同理。
> 笔记内容可用 `--content`、`--content-file <path>` 或管道（`echo ... | memos-cli memo create`）传入。

## 分页结果处理

列表命令（`memo list` / `comment list` / `reaction list` / `relation list` / `attachment list` /
`space list` 等）输出在 `data` 同级带 `pagination`（`pageSize` / `nextPageToken` / `hasMore`）。

Memos 用**游标分页**（不是页码）：

- **判断是否还有下一页**：`pagination.hasMore === true`（即 `nextPageToken` 非空）。
- **还有下一页时**：先向用户展示当前页结果，并**主动提示"还有更多，是否继续获取下一页？"**，由用户决定；**不要默认自动翻页或拉全量**。
- 用户确认后：`--page-token <上一页的 pagination.nextPageToken>`（`--page-size` 建议与上次一致）。

例外：`tag list` 为了汇总标签必须扫描多页，默认最多 10 页 × 200 条，达到上限会返回
`truncated: true` 和 `nextPageToken`——此时要告知用户"结果不完整"，而不是当成全量结果。

## 意图识别（自然语言 → 命令）

- "记一下 / 记录想法 / 新建笔记 X" → `memo create --content "X"`
- "查看 / 列出笔记" → `memo list -n 10`
- "看 X 的内容 / 详情" → `memo get <id>`
- "修改 / 更新这条笔记" → `memo update <id> --content "新内容"`
- "删除这条笔记" → `memo delete <id>`（**破坏性，先确认**）
- "置顶 / 取消置顶" → `memo pin` / `memo unpin`
- "有哪些标签 / 标签统计" → `tag list`
- "看看 #ai 的笔记" → `tag memos ai`（或 `memo list --tag ai`）
- "给 X 评论 / 在 X 下留言" → `comment create <memo> --content "..."`
- "看看 X 的评论" → `comment list <memo>`
- "给 X 加个 👍 / 取消表情" → `reaction add` / `reaction remove`
- "把 A 和 B 关联起来" → `relation add <A> <B>`
- "上传附件到 X" → `attachment upload <file> --memo <id>`
- "分享这条笔记 / 生成分享链接" → `share create <memo>`
- "撤销分享" → `share delete <memo> <share>`
- "有哪些空间 / 建个空间 / 邀请某人" → `space list` / `space create` / `space invite`
- "我是谁" → `me get`；"实例版本" → `me instance`；"我的统计" → `me stats`

## 必须询问用户（不要自作主张）

- 服务地址或令牌缺失时——引导 `auth login`，不要编造或让用户把令牌贴进对话。
- **破坏性操作**：`memo delete`、`comment delete`、`attachment delete`/`batch-delete`、
  `share delete`、`space delete`、`space member-remove`、`space invitation-revoke`、
  `attachment set-memo`（整体覆盖附件列表）、`relation remove`——执行前先向用户确认目标。
- 环境是 v0.32+ 还是 v0.29–v0.31 不确定、且命令全 404 时——先问用户实例版本或让其确认 `--api-path`。
- `tag list` 结果被截断（`truncated: true`）时——告知不完整，问是否扩大 `--max-pages`。

## 错误处理

| 现象                                          | 处理                                                                                   |
| --------------------------------------------- | -------------------------------------------------------------------------------------- |
| CLI 不存在                                    | `npm i -g @tnnevol/memos-cli` 或用 `npx -y @tnnevol/memos-cli`                         |
| 未认证 / 地址未配置                           | `auth login`，或设置 `MEMOS_BASE_URL` / `MEMOS_ACCESS_TOKEN`                           |
| `authentication required`（code 16）          | 令牌无效或已撤销，重新生成并登录                                                       |
| `memo not found`（code 5）                    | 检查 ID 是否属于当前用户可见范围；不要重试同一 ID                                      |
| 所有接口 404                                  | 路径前缀不匹配：v0.29–v0.31 用 `/api/v1`，v0.32+ 用 `--api-path /api`                  |
| `invalid filter: unsupported value expression`| 标签过滤要用 `"tag" in tags`；直接用 `--tag` 即可                                      |
| 不知道参数                                    | `memos-cli <group> <command> --help`                                                   |

## Core References

| Topic    | Description                          | Reference                            |
| -------- | ------------------------------------ | ------------------------------------ |
| Setup    | 安装、认证、配置与环境变量           | [setup](references/setup.md)         |
| Commands | 全部命令与参数详解                   | [commands](references/commands.md)   |
| Pitfalls | 真实接口契约与踩坑（务必先读）       | [pitfalls](references/pitfalls.md)   |

## 关键提示摘要（详见 pitfalls）

- 输出为结构化 JSON：`{ success, operation, data }` 或错误 `{ success:false, message, code, httpStatus }`；加 `--pretty` 美化。判断成功用 `success`，不要只看退出码。
- 分页是**游标**：`pagination.nextPageToken` + `hasMore`，续页用 `--page-token`。
- 标签过滤语法是 `"tag" in tags`；`tags == ["tag"]` 会报 400。
- 评论在数据模型上就是 memo（带 `parent`）：更新/删除评论走 `/memos/{commentMemo}`。
- `relation add/remove` 与 `attachment set-memo` 在服务端是**整体覆盖**，CLI 已做先读后写；不要绕过 CLI 直接调 PATCH。
- 附件上传返回的 `externalLink` 是**会过期的预签名 URL**；笔记正文要用 `permanentPath`（`{baseUrl}/file/attachments/...`）。
- `space` 分组是 v0.31 新增，旧实例上必然 404。
