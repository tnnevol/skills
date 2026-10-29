---
title: memos-cli
---

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

如果国外镜像源下载较慢或安装异常，可切换为 npm 淘宝源重试：

```bash
npm i -g @tnnevol/memos-cli@latest --registry=https://registry.npmmirror.com/
```

安装后检查版本：

```bash
memos-cli --version
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

| 变量                 | 说明                                                            |
| -------------------- | --------------------------------------------------------------- |
| `MEMOS_BASE_URL`     | Memos 服务地址                                                  |
| `MEMOS_ACCESS_TOKEN` | 访问令牌（Memos 设置 → Access tokens 生成）                     |
| `MEMOS_API_PATH`     | API 路径前缀，默认 `/api/v1`；v0.32+ 改为 `/api`                |

### 全局选项

| 选项                | 说明                                            |
| ------------------- | ----------------------------------------------- |
| `--base-url <url>`  | Memos 服务地址                                  |
| `--token <token>`   | 访问令牌                                        |
| `--api-path <path>` | API 路径前缀，默认 `/api/v1`；v0.32+ 用 `/api`  |
| `--pretty`          | 美化 JSON 输出                                  |

::: tip API 路径前缀
v0.29–v0.31 的接口路径是 `/api/v1/...`，上游 main（v0.32 起）改成了 `/api/...`。
CLI 默认按稳定版走 `/api/v1`，连新版本实例时用 `--api-path /api` 或 `MEMOS_API_PATH=/api`。
:::

::: tip 分页
Memos 列表接口用 `pageSize` + `pageToken` 游标分页。列表命令输出在 `data` 同级附带
`pagination`（`pageSize` / `nextPageToken` / `hasMore`）；续页时把 `nextPageToken`
传给 `--page-token`。
:::

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

真实终端中直接运行 `memos-cli auth login` 会进入交互式流程：先问服务地址，再以隐藏输入
方式问令牌，并用 `/auth/me` 校验；校验失败会继续提示重新输入，只有校验通过才写入配置。
非交互环境必须显式提供 `--base-url` 与 `--token`（或对应环境变量），同样先校验再保存。

### memo — 笔记

| 命令                 | 说明                     |
| -------------------- | ------------------------ |
| `memo list`          | 列出笔记                 |
| `memo get <memo>`    | 获取单条笔记             |
| `memo create`        | 创建笔记                 |
| `memo update <memo>` | 更新内容或可见性         |
| `memo delete <memo>` | 删除笔记                 |
| `memo pin <memo>`    | 置顶                     |
| `memo unpin <memo>`  | 取消置顶                 |

```bash
memos-cli memo list -n 20 --tag ai
memos-cli memo list --state ARCHIVED --order-by "update_time desc"
memos-cli memo create --content "内容 #tag" --visibility PUBLIC
memos-cli memo create --content-file ./note.md
echo "来自管道的内容" | memos-cli memo create
memos-cli memo update memos/abc --content "新内容"
```

`<memo>` 接受 `memos/xxx` 或纯 ID，CLI 自动补前缀。

### comment — 评论

| 命令                       | 说明       |
| -------------------------- | ---------- |
| `comment list <memo>`      | 列出评论   |
| `comment create <memo>`    | 添加评论   |
| `comment update <comment>` | 更新评论   |
| `comment delete <comment>` | 删除评论   |

评论在数据模型上本身也是一条 memo，所以 `update`/`delete` 接受评论的 memo 资源名。

### tag — 标签

| 命令              | 说明                     |
| ----------------- | ------------------------ |
| `tag list`        | 汇总标签并按出现次数排序 |
| `tag memos <tag>` | 列出带某个标签的笔记     |

`tag list` 通过扫描笔记的 `tags` 字段汇总（服务端没有独立标签接口），默认最多
10 页 × 200 条；达到上限会返回 `truncated: true`，表示结果不完整。

### reaction — 表情回应

| 命令                                  | 说明                      |
| ------------------------------------- | ------------------------- |
| `reaction list <memo>`                | 列出表情                  |
| `reaction add <memo> <emoji>`         | 添加表情（同类型为覆盖）  |
| `reaction remove <memo> <reaction>`   | 移除表情                  |

### relation — 关联

| 命令                               | 说明                                       |
| ---------------------------------- | ------------------------------------------ |
| `relation list <memo>`             | 列出关联                                   |
| `relation add <memo> <related>`    | 建立关联（`--type` 默认 `REFERENCE`）      |
| `relation remove <memo> <related>` | 解除关联（可用 `--type` 只解指定类型）     |

服务端是整体覆盖语义，CLI 会先拉全量再回写，重复添加返回 `changed: false`。

### attachment — 附件

| 命令                              | 说明                       |
| --------------------------------- | -------------------------- |
| `attachment list`                 | 列出附件                   |
| `attachment get <attachment>`     | 附件详情                   |
| `attachment list-by-memo <memo>`  | 列出笔记的附件             |
| `attachment upload <file>`        | 上传（base64 内联）        |
| `attachment update <attachment>`  | 改文件名 / 重新关联笔记    |
| `attachment delete <attachment>`  | 删除附件                   |
| `attachment batch-delete <...>`   | 批量删除                   |
| `attachment set-memo <memo>`      | 设置笔记附件列表（覆盖）   |

```bash
memos-cli attachment upload ./pic.png --memo memos/abc
memos-cli attachment list-by-memo memos/abc
```

上传返回的 `permanentPath`（`{baseUrl}/file/attachments/...`）是笔记正文应使用的永久路径；
`externalLink` 是预签名 URL，会过期。

### share — 分享

| 命令                            | 说明                        |
| ------------------------------- | --------------------------- |
| `share list <memo>`             | 列出分享链接                |
| `share create <memo>`           | 创建分享（`--expire-time`） |
| `share delete <memo> <share>`   | 撤销分享                    |
| `share get <token>`             | 通过 token 读取公开笔记     |

### space — 空间（v0.31+）

| 命令                                     | 说明               |
| ---------------------------------------- | ------------------ |
| `space list` / `get` / `create` / `update` / `delete` | 空间 CRUD |
| `space members` / `member-update` / `member-remove`   | 成员管理  |
| `space invitations` / `invite` / `invitation-*`       | 邀请管理  |

### me — 当前用户与实例

| 命令          | 说明                             |
| ------------- | -------------------------------- |
| `me get`      | 当前登录用户                     |
| `me stats`    | 用户统计（笔记类型、标签分布等） |
| `me instance` | 实例信息（版本、访问模式）       |

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

::: warning 不要把凭据放进仓库
禁止在仓库里创建 `.env`、`.env.example` 或任何含令牌的文件；CI 请用 secrets 注入环境变量。
:::

## 许可证

AGPL-3.0
