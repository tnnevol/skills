# Pitfalls — 真实接口契约与踩坑

以下均为对真实 OpenList 服务端（v4.2.3）实测得出的结论。**Apifox 文档在多处与真实服务端不符**，凡冲突以真实服务端为准。CLI 已按真实契约封装，此处供排查与理解。

## 1. 输出与判定

- 成功：`{ success:true, operation, data }`；失败：`{ success:false, message, code }`（stderr + 非零退出）。
- 解析脚本请以 `success` 判定，不要只看退出码。

## 2. 跨驱动操作是异步任务

- 同驱动内 `copy` 通常同步完成；**跨驱动**（如 SMB → 夸克网盘）`copy`/`move`/`archive-decompress` 返回**异步任务**（`data.task` 或 `data.tasks`）。
- 需**轮询目标目录**（`fs list <dst> --refresh`）确认产物落地，不能只看命令返回成功。
- `move` 的“删除源”滞后于“落地”，任务队列繁忙时可能明显延迟。

## 3. share 字段（文档错误重灾区）

| 文档（错）            | 真实服务端（对）                                        |
| --------------------- | ------------------------------------------------------- |
| `paths`               | **`files`**（数组）                                     |
| `password`            | **`pwd`**                                               |
| `expiration`          | **`expires`**（RFC3339 时间字符串；传数字报 400）       |
| delete 用 body `{id}` | **query `?id=`**（body 报 `WHERE conditions required`） |

- `share update` 服务端要求**必须带 `files`**，且未传密码会把 `pwd` 清空——CLI 的 update 因此要求 `--path`；要保留密码需重带 `--password`。
- CLI 已把 `--path`→`files`、`--password`→`pwd`、`--expires`→`expires`、delete→`?id=` 封装好。

## 4. 压缩包 archive

- `archive-decompress` 服务端字段：`{ src_dir, name, dst_dir }`，其中 **`name` 是 `[]string`（数组）**，文档标为 string 有误；CLI 已自动把文件名包成数组。
- **目标目录必须已存在**，否则报 `failed to get dst dir: object not found`——先 `fs mkdir <dst>`。
- 含 `.` 顶层条目的 tar.gz（如 `tar czf x.tar.gz .` 打包）解压会失败：`illegal file path: .`——**服务端解压器限制，非 CLI 问题**；规范 zip / `tar czf x.tar.gz *` 正常。
- `archive-list` 用 `archive_path` 表示包内路径（文档写 `inner_path` 有误，CLI 已修正）。
- 大包（如 75MB tar.gz）`archive-meta`/`archive-list` 是同步解析，可能耗时数分钟。

## 5. admin 参数风格

- `get` / `delete` / `storage enable` / `storage disable` 走 **query `?id=`**（文档标 body `{id}` 有误，body 会报 `strconv.Atoi: parsing "": invalid syntax`）。
- `setting` 按 **`key`**：`get <key>` → `?key=`、`delete <key>` → `?key=`（不是 id）。
- `setting` 没有 create/update，用 **`save`**（POST body，设置项数组）。
- `driver` 只有 `list`/`names`/`info`（`info` 用 `?driver=<name>`），没有增删改。
- `create`/`update`/`save` 用 `--file`/`--data` 传 JSON；CLI 的 `update <id>` 会把 id 合并进 body。

## 6. 上传 put/form 可选头

- `--overwrite false` 对已存在文件会返回 `file exists`(403)——可用于“不覆盖”场景。
- `--as-task` 会让响应返回后台任务对象（`data.task`），文件稍后落地。
- `--md5/--sha1/--sha256`、`--last-modified` 在部分存储（如 SMB）**被接受但不校验/不应用**（不同驱动行为不同）。

## 7. 分片上传：参数走 HTTP 头，不是 JSON body（v4.2.9+）

`/api/fs/multipart/*` 的入参全部来自**请求头**（源码 `server/handles/multipart.go`），
按 JSON body 传会得到 400。CLI 已封装，直接用 `multipart` 分组即可。

| 接口 | 关键参数 |
| --- | --- |
| `init` | `File-Path`（**URL 编码**的远端路径）、`X-File-Size`；可选 `X-Chunk-Size`、`Overwrite`、`X-File-Md5/Sha1/Sha256` |
| `chunk` | `X-Upload-Id`、`X-Chunk-Index`，body 为分片**原始字节** |
| `complete` / `abort` | `X-Upload-Id` |
| `status` | query：`upload_id`，或 `path` + `size`（用于恢复中断的上传） |

- 需要实例开启分片上传，否则 **403 `multipart upload is disabled`**。
- 分片是**幂等**的，可乱序并发；返回码语义：**429** = 窗口已满（稍后重试）、**409** = 同一分片正在另一连接上传。
- 空文件不能走分片（`X-File-Size` 必须为正），改用 `fs put`。
- `init` 返回体里 `upload_id` 的字段名可能是 `upload_id` 或 `uploadId`，两种都要认。

## 8. 媒体库与种子（v4.2.9+）

- `media` 分组依赖实例**启用媒体库并完成扫描**；未启用时相册等接口返回 404 或空列表，这不是 CLI 故障。
- `seed capabilities` 等接口**必填 `seed_data`**（解析后的种子数据），只传 `path` 会得到 400 `seed_data is required`。
- `seed quick-save` / `rapid-upload` / `offline-download` 在服务端是**同一个实现**，参数一致。
- `admin media export` 与 `admin media import` 用 `--file` 传完整 JSON。

## 9. 认证

- `auth login` 的 `--base-url`/`--token` 与全局同名选项曾冲突，现已通过读取全局选项修复；正常可用。
- 未配置服务地址时命令直接报错退出；Token 可选，服务允许无 Token 访问时可省略。

## 10. 文档来源

- Apifox 文档：`https://openlist.apifox.cn`，仅作参考，字段以真实服务端为准。
- 相关社区记录：OpenList-Docs issue #306（share 参数 paths vs files）。
