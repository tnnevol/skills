# Commands — 命令与参数详解

所有命令支持 `--help`。全局选项 `--base-url` / `--token` / `--pretty` 可加在任意命令前。

> 分页：列表命令（`fs list` / `fs search` / `share list` / `admin user|storage|meta list`）默认 `--page` 1、`--per-page` 30（`fs list` / `share list` 上限 100）；输出在 `data` 同级附带 `pagination`（`page` / `perPage` / `total` / `totalPages`，其中 `totalPages = ⌈total / perPage⌉`）。

## auth — 认证

| 命令          | 说明                              | 选项                                            |
| ------------- | --------------------------------- | ----------------------------------------------- |
| `auth login`  | 登录并保存配置                    | `--base-url <url>`、可选 `--token <token>`、`--interactive` |
| `auth logout` | 清除本地配置                      | —                                               |
| `auth status` | 查看登录状态（调用 /api/me 校验） | —                                               |

授权缺失时默认使用终端交互式登录。代理应运行 `openlist-cli auth login`，明确告知用户需要在提示中填写服务地址、是否允许无 Token 访问和 Token，并等待用户完成输入；不要直接代用户拼接认证参数。只有用户明确要求非交互式登录，或当前环境无法提供交互终端时，才使用参数、环境变量或配置文件。

在真实终端中运行 `openlist-cli auth login` 始终进入交互式流程，即使配置文件已有值也会显示提示，并将配置值作为默认值。服务地址和 Token 会在提交后校验，填写 Token 后校验失败会继续提示；不填写 Token 时会直接调用授权接口，并返回接口的真实错误信息。若输入地址与配置地址不一致，会清除配置中的旧 Token；选择 `n` 后输入 Token，留空时会通过授权接口校验并返回真实错误。服务是否允许无 Token 访问默认是 `n`，直接回车表示 `n`；非空输入只接受 `y` 或 `n`，其他输入会继续提示。选择 `y` 会跳过 Token 输入和校验。参数模式下 `--token` 可省略：提供 Token 时校验 `/api/me`，省略 Token 时跳过 Token 校验。管道、脚本和 CI 等非交互环境至少需要显式提供 `--base-url`。

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

创建存储不要凭空拼参数，按[存储与高级设置](storage-advanced.md)中的官方通用项和以下步骤执行，并**创建前二次确认**：

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

## media — 媒体库（v4.2.9+）

需实例启用媒体库；未启用时相册接口返回 404 或空列表。

| 命令 | 说明 | 关键参数 |
| --- | --- | --- |
| `media albums` | 列出相册 | `-p/--page`、`-n/--per-page` |
| `media album <id>` | 相册详情 | `--id` |
| `media list` | 列出媒体条目 | `--path`、`--type`（image/video/audio） |
| `media item <id>` | 条目详情 | |
| `media folders` | 媒体所在目录 | |
| `media favorites` | 收藏列表 | 分页 |
| `media favorite <id>` | 收藏/取消（`--off`） | |
| `media progress` / `media set-progress <id> <pos>` | 查询 / 上报播放进度 | `--duration` |
| `media resume` | 可续播列表 | |
| `media annotations` / `media set-annotations <id>` | 查询 / 写入批注 | `-c` 或 `-f` |
| `media strm` / `media stream-url` / `media userdata` | STRM、播放地址、用户数据 | `--id` |
| `media scan-paths` | 扫描目录（用户视角） | |

## multipart — 分片上传（v4.2.9+）

参数走 **HTTP 头**（服务端约定），JSON body 传参一律 400。CLI 已封装。

```bash
# 一键上传（自动 init → chunk → complete）
openlist-cli multipart upload ./big.iso /backup/big.iso --chunk-size 8388608

# 手动分步
openlist-cli multipart init --path /backup/big.iso --size 104857600
openlist-cli multipart status --upload-id <id>
openlist-cli multipart chunk --upload-id <id> --index 0 --file ./part0.bin
openlist-cli multipart complete --upload-id <id>
openlist-cli multipart abort --upload-id <id>
```

- 实例未开启分片上传 → `403 multipart upload is disabled`。
- 分片幂等、可乱序并发；`429` 表示窗口已满需重试，`409` 表示该分片正在另一连接上传。
- 空文件不能分片上传（`X-File-Size` 必须为正），用 `fs put`。

## seed — 种子文件（v4.2.9+）

| 命令 | 说明 | 关键参数 |
| --- | --- | --- |
| `seed parse` | 解析种子 | `--seed-data` 或 `--seed-file`，`--format`、`--file-name` |
| `seed upload-parse <path>` | 上传并解析 | `--target` |
| `seed generate` | 为目录生成种子 | `--paths`（必填）、`--format`/`--formats`、`--name`、`--comment`、`--piece-size`、`--save-path` |
| `seed convert` | 转换容器格式 | `--target-format`（必填） |
| `seed diagnose` | 诊断种子 | `--seed-data`/`--seed-file` |
| `seed capabilities` | 能力与容量估算 | `--path`/`--paths`；**必填 `seed_data`** |
| `seed update` | 更新元信息 | `--comment`、`--trackers`、`--output-path` |
| `seed update-channels` | 替换公开频道 | `--channels`（JSON 数组） |
| `seed quick-save` / `rapid-upload` / `offline-download` | 保存种子到目录（服务端同一实现） | `--path`（必填）、`--files`、`--tool`、`--transit-path`、`--overwrite` |

> 复杂结构统一可用 `--file <json>` 传完整请求体，命令行参数会覆盖其中的同名键。

## appkey — 接口凭证

```bash
openlist-cli appkey list
openlist-cli appkey create --name "手机端"
openlist-cli appkey delete <id>
```

`delete` 的服务端参数是 query `?id=`，CLI 已处理。

## public — 公开信息（免登录）

```bash
openlist-cli public settings          # 含实例 version，可用于确认服务端版本
openlist-cli public init-status       # {"initialized": true}
openlist-cli public offline-tools
openlist-cli public archive-extensions
```

## admin media / admin scan / admin transcode（v4.2.9+）

```bash
# 媒体库
openlist-cli admin media config-list
openlist-cli admin media config-save --file config.json
openlist-cli admin media items --page 1 --per-page 30
openlist-cli admin media scan-start --paths /media,/movies
openlist-cli admin media scan-progress
openlist-cli admin media scrape-start --ids 1,2,3
openlist-cli admin media scan-paths
openlist-cli admin media scan-path-create --path /media --name 影视
openlist-cli admin media export > media-backup.json
openlist-cli admin media import --file media-backup.json

# 手动扫描
openlist-cli admin scan start --path /
openlist-cli admin scan progress
openlist-cli admin scan stop

# 转码
openlist-cli admin transcode jobs
openlist-cli admin transcode workers
openlist-cli admin transcode cancel <jobId>
```
