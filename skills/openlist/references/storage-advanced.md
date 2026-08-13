# 存储与高级设置

本参考只提取官方[“添加存储”通用项](https://github.com/OpenListTeam/OpenList-Docs/blob/main/pages/guide/drivers/common.md)和“高级设置”中能直接通过当前 `openlist-cli` 操作的内容。驱动专属字段以服务端 `admin driver info` 返回的模板为准，不要把网页表单或其他版本的字段硬编码到请求中。

## 添加存储

### 创建流程

1. 使用 `openlist-cli admin driver names` 确认驱动名称。
2. 使用 `openlist-cli admin driver info <driver>` 获取通用字段和驱动专属字段，优先收集 `required: true` 的字段。
3. 组装存储对象；`addition` 必须是驱动专属配置的 JSON 字符串，不是嵌套对象。
4. 创建前向用户回显非敏感参数并二次确认；密码、令牌等敏感字段只确认“已填写”，不得回显。
5. 创建后使用 `admin storage get <id>` 或 `admin storage list` 验证，必要时执行 `admin storage load-all` 重新加载全部存储。

官方网页中的“添加存储”对应 CLI 的 `admin storage create`；网页上的驱动表单不是固定 API。必须先查询当前服务的驱动模板，再将通用字段和 `addition` 合并提交。

```bash
openlist-cli admin driver names
openlist-cli admin driver info SMB
openlist-cli admin storage create --data '{"mount_path":"/smb","driver":"SMB","order":0,"addition":"{\"address\":\"...\",\"username\":\"...\",\"password\":\"...\"}"}'
```

### 通用字段规则

- `mount_path` 必填且必须唯一；挂载到根目录使用 `/`。重复挂载路径会导致数据库唯一性错误。
- `order` 用于挂载顺序，数值越小越靠前，也可以使用负数。
- `remark` 用于备注。部分驱动支持引用已有存储的认证信息：备注第一行使用 `ref:/已有挂载路径`，其中 `ref:/` 必须小写。适用范围以官方文档和当前服务版本为准。
- `driver` 是驱动名称，必须来自 `admin driver names`；`addition` 是驱动专属字段的 JSON 字符串。不要把 `addition` 写成对象，也不要把网页表单标签直接当作字段名。
- `disabled` 控制存储是否停用；通常优先使用 `admin storage enable/disable <id>`，不要在创建请求中无意覆盖状态。
- `cache_expiration` 是目录结构缓存时间，单位为分钟。`custom_cache_policies` 可按路径设置缓存，例如 `/剧集/已完结/*:60`；`*` 匹配一层目录，`**` 匹配多层目录。
- `disable_index: true` 可禁止该存储参与索引；适合不需要搜索或不适合建立索引的存储。
- `enable_sign: true` 只对当前存储启用直链签名。签名范围遵循“全局签名 > 元信息目录加密 > 单存储签名”。
- `web_proxy: true` 让网页预览、下载和直链经过中转；启用后建议确认站点地址已配置。
- `webdav_policy` 只影响 WebDAV：`302_redirect` 为重定向，`use_proxy_url` 为使用下载代理地址，`native_proxy` 为本机中转。它与 `web_proxy` 是不同配置。
- `down_proxy_url` 是下载代理地址，启用代理但不填写时默认使用本机；地址末尾不要带 `/`。
- `proxy_range: true` 控制代理是否支持范围请求；只有确认代理服务支持断点或范围请求时才启用。
- `disable_proxy_sign: true` 可关闭下载代理 URL 的签名校验；这会降低代理链路的保护能力，修改前必须向用户说明风险。
- `order_by`、`order_direction`、`extract_folder` 控制列表排序；部分驱动可能使用自己的排序方式。

`id`、`status`、`modified` 属于服务端返回信息，通常不需要放入创建请求。读取存储详情时可以使用 `admin storage get <id>` 获取这些字段。

### 高级创建场景

- 链路负载均衡：主存储使用普通挂载路径，其他同源存储使用 `主挂载路径.balance任意后缀`，例如 `/media`、`/media.balance1`、`/media.balance2`。这些存储仍通过 `admin storage create/update` 管理。
- 别名、分块等组合驱动：先用 `admin driver info Alias` 或对应驱动模板获取 `addition`，再按模板创建；不要凭记忆拼装冲突策略字段。
- 修改存储时使用 `admin storage update <id> --data/--file`。修改挂载路径前确认不会与现有路径冲突；停用、删除或覆盖已有存储属于破坏性操作，必须先征得用户确认。

## 高级设置

### 设置项读写

先用 `admin setting get <key>` 读取当前值，再用 `admin setting save` 保存 JSON 数组。只提交需要修改的设置项，并保留服务端要求的 `key` 和 `value`；不要直接删除未知设置。

```bash
openlist-cli admin setting get sign_all
openlist-cli admin setting save --data '[{"key":"sign_all","value":"false"}]'
```

适合通过 CLI 调整的全局设置包括：

- `hide_files`：隐藏文件的正则表达式，每行一条。
- `package_download`：是否允许前端打包下载。
- `link_expiration`：带密码直链的有效期，单位为小时，`0` 表示不失效。
- `sign_all`：是否为所有文件直链添加签名；关闭前先评估公开站点的文件保护风险。
- `forward_direct_link_params`、`ignore_direct_link_params`：直链参数转发和忽略规则。
- `share_preview`、`share_archive_preview`、`share_force_proxy`：分享文件预览和代理策略。

设置项名称和可选值可能随服务版本变化。无法确认时先使用 `admin setting list` 或 `admin setting get`，不要用网页显示名称替代设置键名。

### 搜索与索引

搜索相关设置由 `admin setting` 管理，索引动作由 `admin index` 管理：

- `search_index`：可选 `database`、`database_non_full_text`、`bleve`、`meilisearch`、`none`。使用 MySQL 时优先考虑 `database_non_full_text`；`meilisearch` 还需要先准备外部服务。
- `auto_update_index`：是否自动更新索引，默认关闭。
- `ignore_paths`：索引忽略路径，一行一个路径。
- `max_index_depth`：索引最大深度，默认值通常为 20。

推荐流程：先保存搜索设置，再构建并查看进度；只更新局部路径时使用 `update --paths`。

```bash
openlist-cli admin setting save --data '[{"key":"search_index","value":"database"},{"key":"ignore_paths","value":"/临时目录"}]'
openlist-cli admin index build
openlist-cli admin index progress
openlist-cli admin index update --paths /媒体,/备份
```

`sqlite` 构建索引期间避免同时进行后台写操作；`bleve` 对增量更新支持有限，遇到新文件或删除文件未反映时优先重新构建。`admin index stop`、`clear` 会中止或清除索引，执行前必须确认影响范围。

### 元信息

元信息通过 `admin meta` 管理，字段对应官方“元信息”高级设置：

- `path` 必填且唯一；`password` 配合 `p_sub` 控制密码是否应用到子目录。
- `read_users`、`write_users` 使用用户 ID 数组；`read_users_sub`、`write_users_sub` 控制是否对子目录生效。
- `write`、`w_sub` 控制开放写入；扩大到子目录前必须确认会放宽上传、新建、重命名、移动和删除权限。
- `hide` 为隐藏规则，`h_sub` 控制是否对子目录生效；`readme`、`r_sub` 和 `header`、`header_sub` 用于目录说明。

先用 `admin user list` 获取用户 ID，再创建或更新元信息。元信息密码对 WebDAV 不生效；隐藏规则与索引组合使用时，仍需确认搜索结果是否会暴露隐藏路径。

```bash
openlist-cli admin meta create --data '{"path":"/private","password":"已通过安全输入提供","p_sub":true,"hide":".*","h_sub":true}'
```

上例中的密码仅表示字段位置，实际操作不得把真实密码写入命令历史、日志或对话。

### 用户权限

`admin user create/update` 的 `permission` 是位掩码，不是权限名称数组。需要修改权限时先读取用户当前值，再按需求计算新值并二次确认。官方高级设置中的常用位如下：

| 位 | 权限 |
| --- | --- |
| 0 | 查看隐藏文件 |
| 1 | 无密码访问 |
| 2 | 添加离线下载任务 |
| 3 | 新建目录和上传 |
| 4-7 | 重命名、移动、复制、删除 |
| 8-11 | WebDAV 读取、WebDAV 写入、FTP/SFTP 读取、FTP/SFTP 写入 |
| 12-15 | 读取压缩包、解压、分享、自定义分享标识 |

权限变更和停用用户属于高影响操作，必须向用户说明变更内容并确认后执行。
