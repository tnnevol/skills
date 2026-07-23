# OpenList CLI 接口对照清单

> 数据来源：OpenList 官方 Apifox 文档（项目 `8612113`，共 **87** 个接口）+ 真实服务端 `v4.2.3` 实测。
> 说明：本项目坚持"以真实服务端行为为准"。经实测，该 Apifox 文档在多处与真实服务端不符（见"差异详解"），凡文档与服务端冲突处，实现以服务端为准。

## 一、总览

| 分组            | 文档接口数  | 已对接 | 说明                                                  |
| --------------- | ----------- | ------ | ----------------------------------------------------- |
| fs 文件         | 20          | 18     | 未接：`add_offline_download`（已按需求移除）、`other` |
| fs 压缩包       | （含于 fs） | 3      | decompress / meta / list                              |
| share 分享      | 7           | 7      | 全覆盖                                                |
| me 用户         | 5           | 1      | 仅 `me get`；update/sshkey-* 已按需求移除             |
| public 公开     | 3           | 0      | 已按需求移除整个 public 命令组                        |
| admin 后台      | 35          | 约 15  | 泛型包装覆盖 CRUD，部分类型/专用操作未接或有误        |
| auth 登录       | 8           | 0      | CLI 用 Token 本地保存，未调用登录接口                 |
| authn(WebAuthn) | 6           | 0      | 不适合 CLI（见"不可做"）                              |
| 内部代理 `/@*`  | 3           | 0      | 内部签名校验路由（见"不可做"）                        |

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

### admin — 后台（泛型 `--type` 包装，部分有误）

CLI 用 `admin list/get/create/update/delete --type <user|storage|driver|setting|meta|index>` 统一映射到 `/api/admin/{type}/{op}`，并另有 `index-build/stop/clear/progress`。

| 类型    | 已覆盖                                | 未覆盖 / 问题                                                                                                                                                                                           |
| ------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| user    | list / get / create / update / delete | 未接：`cancel_2fa`、`del_cache`、`sshkey/list`、`sshkey/delete`                                                                                                                                         |
| storage | list / get / create / update / delete | 未接：`enable`、`disable`、`load_all`                                                                                                                                                                   |
| meta    | list / get / create / update / delete | 完整                                                                                                                                                                                                    |
| index   | build / stop / clear / progress       | 未接：`update`                                                                                                                                                                                          |
| driver  | list                                  | ❗`get/create/update/delete` 映射到**不存在的路径**（driver 仅有 `info/list/names`）；未接：`info`、`names`                                                                                              |
| setting | list                                  | ❗`get`/`delete` 用 `?id=`/`{id}`，实际需 **`key`**（实测 `admin get version --type setting` → `record not found`）；❗`create/update` 映射到不存在路径（setting 用 `save`）；未接：`save`、`reset_token` |

---

## 三、重点差异详解

1. **Apifox 文档不可靠**：经实测，文档在 `share/create`（paths vs files）、`share/update`、`archive/decompress`（name string vs []string）等处与真实服务端不符。凡冲突，均以服务端为准。
2. **已按服务端修正并有测试**：`archive/decompress`、`archive/list`、`share/*`。
3. **admin 泛型包装器缺陷**（可做优化）：
   - `setting` 的 `get`/`delete` 应按 `key` 而非 `id`；`create`/`update` 应为 `save`。
   - `driver` 只有 `info/list/names`，泛型的 `get/create/update/delete` 对 driver 无效。

---

## 四、可以做的需求（建议按需实现）

| 需求                                  | 对应接口                                                           | 说明                                                       |
| ------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| 用户名+密码登录换取 Token             | POST /api/auth/login、login/hash、login/ldap；GET /api/auth/logout | 现 `auth login` 仅本地保存 Token，可增加真正登录换取 Token |
| 存储启用/禁用/重载                    | /api/admin/storage/{enable,disable,load_all}                       | 补全 storage 管理                                          |
| 用户 2FA 取消 / 清缓存 / SSH 公钥管理 | /api/admin/user/{cancel_2fa,del_cache,sshkey/list,sshkey/delete}   | 补全 user 管理                                             |
| 设置保存 / 重置令牌                   | /api/admin/setting/{save,reset_token}                              | 并修正 setting 的 get/delete 用 key                        |
| 驱动信息 / 驱动名列表                 | /api/admin/driver/{info,names}                                     | 补全 driver 只读查询                                       |
| 索引配置更新                          | /api/admin/index/update                                            | 补全 index                                                 |
| 获取文件其它信息                      | /api/fs/other                                                      | 某些驱动的额外元数据                                       |
| 修正 admin 泛型包装器                 | —                                                                  | 针对 setting/driver 的特殊路径与参数做适配                 |

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
