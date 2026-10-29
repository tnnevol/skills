# Memos CLI

[Memos](https://github.com/usememos/memos)（[usememos.com](https://usememos.com/)）命令行工具，用于管理笔记、评论、标签、表情、关联、附件、分享与空间。

## 安装

```bash
# npm
npm install -g @tnnevol/memos-cli

# pnpm
pnpm add -g @tnnevol/memos-cli

# 直接运行（无需安装）
npx -y @tnnevol/memos-cli <command>
```

## 快速开始

```bash
# 1. 登录（保存到 ~/.memos/config.json）
memos-cli auth login
# 或非交互式
memos-cli auth login --base-url https://memos.example.com --token <TOKEN>

# 2. 确认身份
memos-cli me get

# 3. 新建笔记
memos-cli memo create --content "第一条笔记 #hello"

# 4. 列出最近笔记
memos-cli memo list -n 10 --pretty
```

## 配置

配置优先级：**CLI 选项 > 环境变量 > 配置文件**。

### 配置文件

路径：`~/.memos/config.json`

```json
{
  "baseUrl": "https://memos.example.com",
  "token": "memos_pat_xxx",
  "apiPath": "/api/v1"
}
```

使用 `memos-cli auth login` 自动生成，无需手动创建。

### 环境变量

| 变量                 | 说明                                                       |
| -------------------- | ---------------------------------------------------------- |
| `MEMOS_BASE_URL`     | Memos 服务地址                                             |
| `MEMOS_ACCESS_TOKEN` | 访问令牌（Memos 设置 → Access tokens 生成）                |
| `MEMOS_API_PATH`     | API 路径前缀，默认 `/api/v1`；v0.32+ 改为 `/api`           |

### 全局选项

| 选项                | 说明                                                     |
| ------------------- | -------------------------------------------------------- |
| `--base-url <url>`  | Memos 服务地址                                           |
| `--token <token>`   | 访问令牌                                                 |
| `--api-path <path>` | API 路径前缀，默认 `/api/v1`；v0.32+ 用 `/api`           |
| `--pretty`          | 美化 JSON 输出                                           |

> **API 路径前缀**：v0.29–v0.31 的接口路径是 `/api/v1/...`，上游 main（v0.32 起）改成了
> `/api/...`。CLI 默认按稳定版走 `/api/v1`，连新版本实例时用 `--api-path /api`
> 或 `MEMOS_API_PATH=/api`。

> **分页**：Memos 列表接口用 `pageSize` + `pageToken` 游标分页。列表命令输出在 `data`
> 同级附带 `pagination`（`pageSize` / `nextPageToken` / `hasMore`）；续页时把
> `nextPageToken` 传给 `--page-token`。

## 输出格式

所有命令输出单行 JSON（`--pretty` 时格式化）：

```json
{ "success": true, "operation": "memo.list", "data": { "...": "..." } }
```

失败时输出到 stderr，退出码非零：

```json
{ "success": false, "message": "memo not found", "code": 5, "httpStatus": 404 }
```

`code` 是服务端 gRPC-gateway 状态码（`5` = NOT_FOUND、`16` = UNAUTHENTICATED、
`3` = INVALID_ARGUMENT 等），`httpStatus` 是 HTTP 状态码。

## 命令

### auth — 账号管理

| 命令          | 说明                   |
| ------------- | ---------------------- |
| `auth login`  | 登录并保存配置         |
| `auth logout` | 退出登录并清除本地配置 |
| `auth status` | 查看当前登录状态       |

`auth login` 选项：`--base-url <url>`、`--token <token>`、`--api-path <path>`。

在真实终端中直接运行 `memos-cli auth login` 会进入交互式流程：先问服务地址，再以隐藏输入
方式问令牌，并用 `/auth/me` 校验；校验失败会继续提示重新输入，只有校验通过才写入配置。
管道、脚本和 CI 等非交互环境必须显式提供 `--base-url` 与 `--token`（或对应环境变量），
此时同样会先校验再保存。

### memo — 笔记

| 命令                        | 说明                                             |
| --------------------------- | ------------------------------------------------ |
| `memo list`                 | 列出笔记                                         |
| `memo get <memo>`           | 获取单条笔记                                     |
| `memo create`               | 创建笔记                                         |
| `memo update <memo>`        | 更新内容或可见性                                 |
| `memo delete <memo>`        | 删除笔记                                         |
| `memo pin <memo>`           | 置顶                                             |
| `memo unpin <memo>`         | 取消置顶                                         |

`<memo>` 接受 `memos/xxx` 或纯 ID，CLI 自动补前缀。

```bash
# 分页与过滤
memos-cli memo list -n 20 --tag ai
memos-cli memo list --state ARCHIVED --order-by "update_time desc"
memos-cli memo list --filter 'content.contains("roadmap") && created_ts > now - duration("168h")'

# 创建（--content / --content-file / 管道三种方式）
memos-cli memo create --content "内容 #tag" --visibility PUBLIC
memos-cli memo create --content-file ./note.md
echo "来自管道的内容" | memos-cli memo create

# 更新与删除
memos-cli memo update memos/abc --content "新内容" --visibility PRIVATE
memos-cli memo delete memos/abc --force
```

`memo list` 选项：`-n/--page-size`（默认 50，上限 1000）、`--page-token`、`--state`、
`--order-by`、`--filter`、`--tag`、`--show-deleted`、`--full`。

> `--tag` 内部转成 CEL 的 `"tag" in tags`。注意服务端**不支持** `tags == ["tag"]`，
> 直接传那种 filter 会返回 `invalid filter: unsupported value expression`。

### comment — 评论

| 命令                          | 说明                             |
| ----------------------------- | -------------------------------- |
| `comment list <memo>`         | 列出笔记的评论                   |
| `comment create <memo>`       | 添加评论                         |
| `comment update <comment>`    | 更新评论内容                     |
| `comment delete <comment>`    | 删除评论                         |

评论在数据模型上本身也是一条 memo，所以 `update`/`delete` 接受评论的 memo 资源名。

```bash
memos-cli comment create memos/abc --content "赞同"
memos-cli comment list memos/abc -n 20
memos-cli comment delete memos/def
```

### tag — 标签

| 命令                  | 说明                                               |
| --------------------- | -------------------------------------------------- |
| `tag list`            | 汇总标签并按出现次数排序                           |
| `tag memos <tag>`     | 列出带某个标签的笔记                               |

`tag list` 通过扫描笔记的 `tags` 字段汇总（服务端没有独立标签接口）。为避免全量扫描，
默认每次拉 200 条、最多 10 页，可达上限时输出 `truncated: true` 并给出 `nextPageToken`，
需要更多就调大 `--max-pages` 或继续用 `pagination.nextPageToken` 翻页。

```bash
memos-cli tag list --max-pages 20
memos-cli tag memos ai -n 20
```

### reaction — 表情回应

| 命令                              | 说明                                                     |
| --------------------------------- | -------------------------------------------------------- |
| `reaction list <memo>`            | 列出表情                                                 |
| `reaction add <memo> <emoji>`     | 添加表情（同类型已存在时由服务端覆盖更新）               |
| `reaction remove <memo> <reaction>` | 移除表情（用列表返回的 name，或纯 ID）                 |

```bash
memos-cli reaction add memos/abc 👍
memos-cli reaction list memos/abc
memos-cli reaction remove memos/abc memos/abc/reactions/1
```

### relation — 关联

| 命令                                | 说明                                          |
| ----------------------------------- | --------------------------------------------- |
| `relation list <memo>`              | 列出关联                                      |
| `relation add <memo> <related>`     | 建立关联（`--type` 默认 `REFERENCE`）         |
| `relation remove <memo> <related>`  | 解除关联（可用 `--type` 只解指定类型）        |

服务端 `PATCH /memos/{memo}/relations` 是**整体覆盖**语义，CLI 会先拉全量再回写，
因此增删都是安全的；重复添加时返回 `changed: false` 而不报错。

```bash
memos-cli relation add memos/abc memos/def --type REFERENCE
memos-cli relation remove memos/abc memos/def
```

### attachment — 附件

| 命令                                  | 说明                                        |
| ------------------------------------- | ------------------------------------------- |
| `attachment list`                     | 列出附件                                    |
| `attachment get <attachment>`         | 附件详情                                    |
| `attachment list-by-memo <memo>`      | 列出笔记的附件                              |
| `attachment upload <file>`            | 上传（base64 内联，适合中小文件）           |
| `attachment update <attachment>`      | 改文件名 / 重新关联笔记                     |
| `attachment delete <attachment>`      | 删除附件                                    |
| `attachment batch-delete <...>`       | 批量删除                                    |
| `attachment set-memo <memo>`          | 设置笔记的附件列表（整体覆盖）              |

上传返回 `permanentPath`（`{baseUrl}/file/attachments/{name}/{filename}`），
这是笔记内容里应使用的永久路径，不要用 `externalLink`（预签名 URL，会过期）。

```bash
memos-cli attachment upload ./pic.png --memo memos/abc
memos-cli attachment list-by-memo memos/abc
memos-cli attachment update attachments/xyz --filename new.png
memos-cli attachment batch-delete attachments/a attachments/b
```

### share — 分享

| 命令                                | 说明                                              |
| ----------------------------------- | ------------------------------------------------- |
| `share list <memo>`                 | 列出笔记的分享链接                                |
| `share create <memo>`               | 创建分享（`--expire-time` RFC3339）               |
| `share delete <memo> <share>`       | 撤销分享                                          |
| `share get <token>`                 | 通过分享 token 读取公开笔记                       |

```bash
memos-cli share create memos/abc
memos-cli share create memos/abc --expire-time 2027-01-01T00:00:00Z
memos-cli share list memos/abc
memos-cli share get hqK2eQebp2spQj6Vnnd3Cd
```

`share create` 额外返回 `shareToken` 与可访问的 `url`。

### space — 空间（v0.31+）

| 命令                                          | 说明               |
| --------------------------------------------- | ------------------ |
| `space list`                                  | 列出空间           |
| `space get <space>`                           | 空间详情           |
| `space create`                                | 创建空间           |
| `space update <space>`                        | 更新标题/描述/图标 |
| `space delete <space>`                        | 删除空间           |
| `space members <space>`                       | 列出成员           |
| `space member-update <space> <member>`        | 修改成员角色       |
| `space member-remove <space> <member>`        | 移除成员           |
| `space invitations <space>`                   | 列出邀请           |
| `space invite <space>`                        | 邀请用户           |
| `space invitation-revoke <space> <inv>`       | 撤销邀请           |
| `space invitation-accept <space> <inv>`       | 接受邀请           |
| `space invitation-decline <space> <inv>`      | 拒绝邀请           |

```bash
memos-cli space create --title "团队空间" --emoji 🧪
memos-cli space invite spaces/abc --invitee users/alice --role MEMBER
memos-cli space members spaces/abc
```

### me — 当前用户与实例

| 命令            | 说明                             |
| --------------- | -------------------------------- |
| `me get`        | 当前登录用户                     |
| `me stats`      | 用户统计（笔记类型、标签分布等） |
| `me instance`   | 实例信息（版本、访问模式）       |

```bash
memos-cli me get
memos-cli me stats --user users/alice
memos-cli me instance
```

## 开发

```bash
pnpm --filter @tnnevol/memos-cli build   # 构建到 dist/
pnpm --filter @tnnevol/memos-cli test    # 构建后跑 vitest（需环境里已有真实实例凭据）
```

测试直接打真实实例，凭据**只从环境变量读取**，不出现在仓库内任何文件里：

```bash
# 写进 ~/.zshrc（或对应 shell 的配置文件）后重开终端
export MEMOS_BASE_URL="https://memos.example.com"
export MEMOS_ACCESS_TOKEN="memos_pat_xxx"
```

> 禁止在仓库里创建 `.env`、`.env.example` 或任何含令牌的文件；CI 请用 secrets 注入环境变量。

## 许可证

AGPL-3.0
