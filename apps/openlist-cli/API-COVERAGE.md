# OpenList CLI 接口对照清单

> 数据来源：OpenList 官方 Apifox 文档（项目 `8612113`，共 **87** 个接口）+ 真实服务端 `v4.2.3` 实测。
> 说明：本项目坚持"以真实服务端行为为准"。经实测，该 Apifox 文档在多处与真实服务端不符（见"差异详解"），凡文档与服务端冲突处，实现以服务端为准。

## 一、总览

| 分组            | 文档接口数  | 已对接 | 说明                                                               |
| --------------- | ----------- | ------ | ------------------------------------------------------------------ |
| fs 文件         | 20          | 18     | 未接：`add_offline_download`（已按需求移除）、`other`              |
| fs 压缩包       | （含于 fs） | 3      | decompress / meta / list                                           |
| share 分享      | 7           | 7      | 全覆盖                                                             |
| me 用户         | 5           | 1      | 仅 `me get`；update/sshkey-* 已按需求移除                          |
| public 公开     | 3           | 0      | 已按需求移除整个 public 命令组                                     |
| admin 后台      | 35          | 20     | 按资源子命令树；user/storage/meta/setting/driver/index（按需子集） |
| auth 登录       | 8           | 0      | CLI 用 Token 本地保存，未调用登录接口                              |
| authn(WebAuthn) | 6           | 0      | 不适合 CLI（见"不可做"）                                           |
| 内部代理 `/@*`  | 3           | 0      | 内部签名校验路由（见"不可做"）                                     |

---

## 二、已对接接口清单与差异

### fs — 文件管理（与文档一致）

| CLI 命令               | 接口                                | 与文档差异                            |
| ---------------------- | ----------------------------------- | ------------------------------------- |
| `fs list`              | POST /api/fs/list                   | 一致                                  |
| `fs get`               | POST /api/fs/get                    | 一致                                  |
| `fs dirs`              | POST /api/fs/dirs                   | 一致                                  |
| `fs search`            | POST /api/fs/search                 | 一致（额外传 `password`，服务端接受） |
| `fs mkdir`             | POST /api/fs/mkdir                  | 一致                                  |
| `fs rename`            | POST /api/fs/rename                 | 一致                                  |
| `fs move`              | POST /api/fs/move                   | 一致                                  |
| `fs copy`              | POST /api/fs/copy                   | 一致（跨驱动为异步任务）              |
| `fs remove`            | POST /api/fs/remove                 | 一致                                  |
| `fs batch-rename`      | POST /api/fs/batch_rename           | 一致                                  |
| `fs regex-rename`      | POST /api/fs/regex_rename           | 一致                                  |
| `fs recursive-move`    | POST /api/fs/recursive_move         | 一致                                  |
| `fs remove-empty-dirs` | POST /api/fs/remove_empty_directory | 一致                                  |
| `fs put`               | PUT /api/fs/put                     | 一致（File-Path 头 + 流式 body）      |
| `fs form`              | PUT /api/fs/form                    | 一致（multipart）                     |

### fs — 压缩包

| CLI 命令                | 接口                            | 与文档差异                                                                                                |
| ----------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `fs archive-meta`       | POST /api/fs/archive/meta       | 一致（`{path}`）                                                                                          |
| `fs archive-list`       | POST /api/fs/archive/list       | 一致（apifox 参数 `{path, archive_path}` 与当前实现一致）                                                 |
| `fs archive-decompress` | POST /api/fs/archive/decompress | 字段一致（`{src_dir, name, dst_dir}`）；仅 `name` 类型不同：apifox 标为 string，实现按服务端用 `[]string` |

### share — 分享（❗文档错误，实现以服务端为准）

| CLI 命令        | 接口                       | 与文档差异                                                                                                                               |
| --------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `share list`    | POST /api/share/list       | 一致                                                                                                                                     |
| `share get`     | GET /api/share/get?id=     | 一致                                                                                                                                     |
| `share create`  | POST /api/share/create     | ❗文档 `paths`+`password`+`expiration`；实际 **`files`+`pwd`+`expires`**（文档字段均错，`expiration` 传了也被忽略；见 GitHub issue #306） |
| `share update`  | POST /api/share/update     | ❗文档仅需 `id`+`password`；实际 **必须带 `files`，密码字段为 `pwd`，过期为 `expires`（RFC3339）**                                        |
| `share delete`  | POST /api/share/delete?id= | ❗必须用 **query `?id=`**；请求体传 `{id}` 会报 `WHERE conditions required`                                                               |
| `share enable`  | POST /api/share/enable     | 一致（`{id}`）                                                                                                                           |
| `share disable` | POST /api/share/disable    | 一致（`{id}`）                                                                                                                           |

### me — 当前用户

| CLI 命令 | 接口        | 与文档差异 |
| -------- | ----------- | ---------- |
| `me get` | GET /api/me | 一致       |

> 已按需求移除：`me update`、`me sshkey-list/add/delete`（对应 `/api/me/update`、`/api/me/sshkey/*`）。

### public — 公开信息

> 已按需求**移除整个 public 命令组**（`settings`、`archive-extensions`，对应 `/api/public/*`）。

### admin — 后台（按资源子命令树）

CLI 采用按资源的子命令树 `admin <资源> <操作>`，每类资源按真实接口实现（已实测校验参数风格）。

| 资源    | 已实现操作                                                          | 关键参数（实测）                                      |
| ------- | ------------------------------------------------------------------- | ----------------------------------------------------- |
| user    | list / get / create / update / delete                               | get/delete 用 `?id=`；create/update 用 body           |
| storage | list / get / create / update / delete / enable / disable / load-all | get/delete/enable/disable 用 `?id=`；load-all 无 body |
| meta    | list / get / create / update / delete                               | get/delete 用 `?id=`                                  |
| setting | list / get / save / delete / reset-token                            | get/delete 用 **`?key=`**；save 用 body（数组）       |
| driver  | list / names / info                                                 | info 用 `?driver=`                                    |
| index   | build / stop / clear / progress / update                            | build/stop/clear 无 body；update 可带 `{paths}`       |

> 本轮已将原“泛型 `--type`”重写为上述子命令树，并修正：setting 改用 `key`、driver 仅保留 info/list/names、补齐 storage enable/disable/load-all、setting save/reset-token、index update。delete/enable/disable 均改为服务端真实要求的 `?id=` 查询（apifox 标为 body，实测有误）。

---

## 三、重点差异详解

1. **Apifox 文档不可靠**：经实测，文档在 `share/create`（paths vs files）、`share/update`、`archive/decompress`（name string vs []string）等处与真实服务端不符。凡冲突，均以服务端为准。
2. **已按服务端修正并有测试**：`archive/decompress`、`archive/list`、`share/*`。
3. **admin 已重构为子命令树**（不再用 `--type`）：修正了 setting（key）与 driver（仅 info/list/names），并补齐 storage/setting/index 缺失操作；delete/enable/disable 按实测改用 `?id=` 查询。

---

## 四、可以做的需求（建议按需实现）

| 需求                                  | 对应接口                                                           | 说明                                                       |
| ------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| 用户名+密码登录换取 Token             | POST /api/auth/login、login/hash、login/ldap；GET /api/auth/logout | 现 `auth login` 仅本地保存 Token，可增加真正登录换取 Token |
| 用户 2FA 取消 / 清缓存 / SSH 公钥管理 | /api/admin/user/{cancel_2fa,del_cache,sshkey/list,sshkey/delete}   | 补全 user 管理（当前 admin user 仅 CRUD）                  |
| 获取文件其它信息                      | /api/fs/other                                                      | 某些驱动的额外元数据                                       |

---

## 五、不可以做的需求（及原因）

| 需求                          | 接口                                                                                | 不可做原因                                                                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| SSO 单点登录                  | /api/auth/sso、sso_callback                                                         | 需浏览器重定向 + 回调 URL 交互，CLI 无法完成浏览器登录流程                                                                                |
| WebAuthn / Passkey 注册与登录 | /api/authn/webauthn_begin/finish_{login,registration}、getcredentials、delete_authn | 需浏览器 + 硬件/平台认证器完成凭证仪式，CLI 无法执行                                                                                      |
| 2FA 生成/验证                 | /api/auth/2fa/{generate,verify}                                                     | 技术可调，但 generate 返回密钥/二维码需用户用 App 扫码、verify 需用户输入动态码，纯自动化意义有限（如需仅作辅助命令可做，但依赖人工输入） |
| 内部签名/代理路由             | /@file/{...}、/@path/{...}、/@user/{...}                                            | 内部文件访问签名校验/路径/用户验证路由，非面向用户的管理 API，做成命令无意义                                                              |
| 离线下载                      | /api/fs/add_offline_download、/api/public/offline_download_tools                    | **已按产品决策移除**（非技术不可行）                                                                                                      |

---

## 六、已知限制（非 CLI 缺陷）

- **tar.gz 含 `.` 顶层条目**：服务端解压器报 `illegal file path: .`（如 `tar czf x.tar.gz .` 打包的包）。规范 zip / `tar czf x.tar.gz *` 正常。属服务端解压器限制。
- **跨驱动 copy/move/decompress 为异步任务**：接口立即返回 task，需轮询目标目录确认落地；源删除（move）在任务队列繁忙时可能明显滞后。
- **大包 meta/list 同步解析慢**：如 75MB tar.gz 的 `archive-meta` 需整包下载解压，可能耗时数分钟。

---

*生成方式：`apifox endpoint list/get --project 8612113` 拉取文档契约 + 真实服务端实测比对。*
