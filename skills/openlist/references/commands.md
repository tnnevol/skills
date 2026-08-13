# Commands — 命令与参数详解

所有命令支持 `--help`。全局选项 `--base-url` / `--token` / `--pretty` 可加在任意命令前。

> 分页：列表命令（`fs list` / `fs search` / `share list` / `admin user|storage|meta list`）默认 `--page` 1、`--per-page` 30（`fs list` / `share list` 上限 100）；输出在 `data` 同级附带 `pagination`（`page` / `perPage` / `total` / `totalPages`，其中 `totalPages = ⌈total / perPage⌉`）。

## auth — 认证

| 命令          | 说明                              | 选项                                            |
| ------------- | --------------------------------- | ----------------------------------------------- |
| `auth login`  | 登录并保存配置                    | `--base-url <url>`、`--token <token>`、`--interactive` |
| `auth logout` | 清除本地配置                      | —                                               |
| `auth status` | 查看登录状态（调用 /api/me 校验） | —                                               |

在真实终端中运行 `openlist-cli auth login` 会交互式询问缺少的服务地址和 API Token，Token 输入时不会回显。如果配置文件中已有对应信息，直接回车会继续使用原配置；没有配置时不能为空。填写完成后交互输入会立即结束，再调用 `/api/me` 校验 Token；校验失败时不会写入配置。管道、脚本和 CI 等非交互环境必须显式提供 `--base-url` 与 `--token`。

## fs — 文件与目录

| 命令                          | 说明               | 选项                                                                                           |
| ----------------------------- | ------------------ | ---------------------------------------------------------------------------------------------- |
| `fs list <path>`              | 列出目录           | `-p/--password`、`--page`(1)、`--per-page`(30)、`--refresh`                                    |
| `fs get <path>`               | 文件/目录信息      | `-p/--password`                                                                                |
| `fs search`                   | 搜索               | `-k/--keywords`(必填)、`-p/--parent`(/)、`--scope`(0)、`--page`(1)、`--per-page`(30)、`-P/--password` |
| `fs dirs <path>`              | 目录树             | —                                                                                              |
| `fs mkdir <path>`             | 新建目录           | —                                                                                              |
| `fs rename <path> <name>`     | 重命名             | —                                                                                              |
| `fs move`                     | 移动               | `--src-dir`、`--dst-dir`、`--names`（逗号分隔，均必填）                                        |
| `fs copy`                     | 复制               | `--src-dir`、`--dst-dir`、`--names`（均必填）                                                  |
| `fs remove`                   | 删除               | `--dir`、`--names`（逗号分隔，均必填）                                                         |
| `fs put <local> <remote>`     | 流式上传           | 见下「上传可选头」                                                                             |
| `fs form <local> <remote>`    | 表单上传           | 见下「上传可选头」                                                                             |
| `fs batch-rename`             | 批量重命名         | `--src-dir`、`--rename-objects <json>`                                                         |
| `fs regex-rename`             | 正则重命名         | `--src-dir`、`--src-name-regex`、`--new-name-regex`                                            |
| `fs recursive-move`           | 聚合移动（扁平化） | `--src-dir`、`--dst-dir`                                                                       |
| `fs remove-empty-dirs <path>` | 删除空目录         | —                                                                                              |
| `fs archive-meta <path>`      | 压缩包元信息       | —（大包同步解析较慢）                                                                          |
| `fs archive-list`             | 列出压缩包内容     | `--path`(必填)、`--inner-path`(/)                                                              |
| `fs archive-decompress`       | 解压               | `--path`(必填, 压缩包完整路径)、`--dst-dir`(必填, 目标目录须已存在)                            |

### 上传可选头（put / form 共用）

| 选项                   | 对应 header   | 说明                                                           |
| ---------------------- | ------------- | -------------------------------------------------------------- |
| `--as-task`            | As-Task       | 作为后台任务上传（响应含 `task`）                              |
| `--overwrite <bool>`   | Overwrite     | 是否覆盖，默认 true；`false` 时同名文件返回 `file exists`(403) |
| `--last-modified <ms>` | Last-Modified | 修改时间（Unix 毫秒）                                          |
| `--md5 <hash>`         | X-File-Md5    | 文件 MD5                                                       |
| `--sha1 <hash>`        | X-File-Sha1   | 文件 SHA1                                                      |
| `--sha256 <hash>`      | X-File-Sha256 | 文件 SHA256                                                    |

### 示例

```bash
openlist-cli fs list / --per-page 50
openlist-cli fs put ./report.pdf /docs/report.pdf --overwrite true
openlist-cli fs copy --src-dir /a --dst-dir /b --names f1.txt,f2.txt
openlist-cli fs regex-rename --src-dir /photos --src-name-regex "IMG_(\d+)" --new-name-regex "Photo_$1"
openlist-cli fs mkdir /out && openlist-cli fs archive-decompress --path /data.zip --dst-dir /out
```

## share — 分享

| 命令                 | 说明     | 选项                                                                        |
| -------------------- | -------- | --------------------------------------------------------------------------- |
| `share list`         | 列出分享 | `--page`(1)、`--per-page`(30)                                                      |
| `share get <id>`     | 分享详情 | —                                                                           |
| `share create`       | 创建分享 | `--path`(必填, 逗号分隔可多个)、`--password`、`--expires <RFC3339>`         |
| `share update <id>`  | 更新分享 | `--path`(必填)、`--password`、`--expires`（**未带 --password 会清空密码**） |
| `share delete <id>`  | 删除分享 | —                                                                           |
| `share enable <id>`  | 启用     | —                                                                           |
| `share disable <id>` | 禁用     | —                                                                           |

```bash
openlist-cli share create --path /shared --password secret --expires 2027-01-01T00:00:00Z
openlist-cli share update abc123 --path /shared --password newpass   # 更新须重带 --path
```

## me — 当前用户

| 命令     | 说明             |
| -------- | ---------------- |
| `me get` | 获取当前用户信息 |

## admin — 后台（按资源子命令树）

增删改用 `--file <path>` 或 `--data <json>` 传 JSON 体；`update <id>` 会把 id 合并进请求体。

| 资源            | 命令                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| `admin user`    | `list [--page --per-page]` / `get <id>` / `create` / `update <id>` / `delete <id>`                           |
| `admin storage` | `list` / `get <id>` / `create` / `update <id>` / `delete <id>` / `enable <id>` / `disable <id>` / `load-all` |
| `admin meta`    | `list` / `get <id>` / `create` / `update <id>` / `delete <id>`                                               |
| `admin setting` | `list [--group]` / `get <key>` / `save` / `delete <key>` / `reset-token`                                     |
| `admin driver`  | `list` / `names` / `info <name>`                                                                             |
| `admin index`   | `build` / `stop` / `clear` / `progress` / `update [--paths a,b]`                                             |

```bash
openlist-cli admin user list
openlist-cli admin setting get version
openlist-cli admin storage create --file ./storage.json
openlist-cli admin storage enable 1
openlist-cli admin index progress
```

### admin storage create 工作流（重要）

创建存储不要凭空拼参数，按以下步骤，并**创建前二次确认**：

1. **确定驱动**：驱动值取自 `admin driver names`（返回驱动名数组，如 `SMB`、`Local`、`123Pan`…）。
   - **若用户未明确指定驱动 → 先提问用户使用哪个驱动**（可先跑 `admin driver names` 列出可选项供选择）。
2. **获取表单参数**：`admin driver info <driver>` 返回该驱动配置模板，含 `common`（通用字段，如 `mount_path`）与 `additional`（驱动专属字段）；每个字段带 `name`/`type`/`required`/`default`/`options`。
   - 据此**告知用户需要填写哪些参数**（重点是 `required` 字段），并说明类型/默认/可选值。
3. **组装请求体**：storage 对象含通用字段（`mount_path`、`driver`、`order`、`remark`、`cache_expiration`、`web_proxy`、`webdav_policy` 等）+ **`addition`**——驱动专属字段的 **JSON 字符串**（注意是字符串，不是对象）。
4. **二次确认**：若上下文已凑齐参数，**创建前必须把完整参数回显给用户二次确认**，确认后再执行。
5. **执行**：`admin storage create --data '<json>'` 或 `--file <path.json>`。

```bash
# 1. 列出可用驱动名
openlist-cli admin driver names
# 2. 查看某驱动需要填写的字段（common + additional）
openlist-cli admin driver info SMB
# 3. 二次确认参数后创建（addition 为驱动专属字段的 JSON 字符串）
openlist-cli admin storage create --data '{"mount_path":"/smb","driver":"SMB","order":0,"addition":"{\"address\":\"...\",\"username\":\"...\",\"password\":\"...\"}"}'
```

> 注意：`get`/`delete`/`enable`/`disable` 内部用 `?id=` 查询；`setting` 用 `?key=`；这些由 CLI 封装，用户只需给位置参数 `<id>`/`<key>`。
