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

## 7. 认证

- `auth login` 的 `--base-url`/`--token` 与全局同名选项曾冲突，现已通过读取全局选项修复；正常可用。
- 未配置服务地址/Token 时命令直接报错退出，引导用户配置而非猜测。

## 8. 文档来源

- Apifox 文档：`https://openlist.apifox.cn`，仅作参考，字段以真实服务端为准。
- 相关社区记录：OpenList-Docs issue #306（share 参数 paths vs files）。
