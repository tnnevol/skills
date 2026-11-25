# 踩坑记录（chandao-cli 版）

## 1. spec/verify/steps/desc 必须是 HTML 片段

需求描述、验收标准、Bug 重现步骤、任务描述、文档正文保存的都是 HTML。**不能用 Markdown**，否则页面原样显示 `#`、`-`、`**`。

测试用例步骤是唯一例外：`--steps` 用纯文本 JSON，禁止 HTML/Markdown。

详见 [content-formatting.md](content-formatting.md)。

## 2. 图片/附件必须先上传再回显 URL

不能写本地路径、base64、外链。正确顺序：上传 → 拿 `url` → 放进 `<img src>`/`<a href>` → 保存内容。

```bash
chandao-cli file upload --file ./a.png --object-type story --object-id 12
# url: /index.php?m=file&f=read&t=png&fileID=37
```

详见 [attachment-workflow.md](attachment-workflow.md)。

## 3. v2 上传必须绑定 objectType + objectID

v2 `POST /files` 在缺少 `objectType`/`objectID` 时返回 **HTTP 200 空响应**（不是错误 JSON）。CLI 会直接拒绝并提示。

- 已有对象：`--object-type story --object-id <id>`；
- 不想绑定：走 v1（auto 模式无绑定时自动 v1）；
- 新建对象：先创建骨架拿 ID，再上传绑定，最后 update 回显。

## 4. 新建对象的图文顺序

对象不存在时无法绑定附件。流程固定为：

1. 创建骨架（必填字段 + 占位内容）
2. `file upload --object-type ... --object-id <新id>`
3. `update` 写入含图片 URL 的完整 HTML

## 5. PUT 会重置未提交字段

禅道 `PUT` 会把请求体中缺失的字段重置为默认值。CLI 的 `update` 已实现“先 GET 当前值 → 回填已知字段 → 再 PUT”，但仍建议只传需要修改的字段。

## 6. v2 创建字段名带 `ID` 后缀

| 资源 | 字段 |
| --- | --- |
| 任务 | `executionID` |
| 需求 | `productID` |
| Bug | `productID` |
| 执行 | `project`（例外，无 ID 后缀） |
| 项目 | `model` / `begin` / `end` |

CLI 已封装；绕过 CLI 直接调 API 时才会踩到。

## 7. 参数名错误表现为 403

`{"status":"fail","message":"Not allowed"}` 可能不是权限问题，而是字段名写错。确认字段名后再排查角色/权限。

## 8. 403 排查顺序

1. `user get <id>` 看 `role` 是否为空；
2. `group list` 看用户所属分组；
3. 确认目标产品/项目权限；
4. 用 `--api-version` 另一版本对比；
5. 仍失败再查服务端日志。

## 9. Bug 状态必须用专用命令

`bug update --status` 无效（静默忽略）。用 `bug resolve` / `close` / `activate` / `confirm`。

## 10. Bug resolve 建议传 assignedTo + resolvedBuild

不传 `assignedTo` 可能清空指派人；不传 `resolvedBuild` 可能报错。

## 11. 任务完成必须传 consumed

`task finish --id <id> --consumed <小时>`；缺 `--consumed` 会失败。

## 12. 需求关闭/变更的必填参数

- `story close --reason`：`done` / `subdivided` / `duplicate` / `postponed` / `willnotdo` / `cancel` / `bydesign`
- `story change --reviewer`：逗号分隔账号

## 13. 版本差异：执行生命周期只有 v2

`execution start/suspend/close` 仅 v2。强制 v1 会报“该操作在 v1 未提供”。

## 14. 分组/部门：v1、v2 都有

`group list`、`dept list/get` 在 v1 和 v2 都有实现；auto 优先 v2，v2 不可用时回退 v1。

注意两类 token 的生命周期不同：**v1 token 是 `session_id()`，会话级、几小时后可能失效**；v2 token 才能长期使用。v1 报 401 时重登即可，不要把它当长期凭证。

## 15. 修改角色权限没有 REST API

`group list` 只读。授权需 Web 会话（`index.php?m=group&f=managePriv`）或直接操作 `zt_grouppriv`。不要声称 CLI 能改权限。

## 16. 部门只能查

禅道 v1/v2 都没有创建部门的 REST 接口；`dept list/get` 只读。新建部门需 Web/DB。

## 17. 文档 API 受限

- v1：`/v1/doclibs` 可读；无文档创建接口；
- v2：`/v2/doc/*` 在本实例返回 200 空（未实现）；
- 文档正文仍按 HTML 片段生成，但创建/更新目前只能走 Web。

## 18. 图片打开需要登录

`/index.php?m=file&f=read&...` 未登录会 302 到登录页。curl 拿到 302 不代表上传失败；浏览器登录后正常显示。

## 19. 列表默认过滤可能返回空

部分列表有默认状态过滤（如只返回未关闭）。`story list` / `bug list` 默认可用；若为空，先确认过滤条件和产品/项目 ID。

## 20. 需求/任务列表必须带过滤条件

- `story list`：`--product` / `--project` / `--execution` 三选一；
- `task list`：必须 `--execution`；
- `bug` / `testcase list`：建议带 `--product` 或 `--project`/`--execution`。

## 21. 删除必须 --yes

所有 `delete` 都需要 `--yes`；删除前先向用户确认。

## 22. 非交互登录需要密码参数

CI/Agent 环境没有 TTY：传 `--password` 或设置 `CHANDAO_PASSWORD`，否则报缺少参数。

## 23. 私钥/配置迁移

token 加密保存；换机器或私钥丢失时解密失败，重新 `auth login`。不要手动编辑 `config.json`。

## 24. v2 未实现模块会返回空 200

除 doc 外，工作流、反馈、工单等企业版模块在实例上也可能返回空 200。CLI 会把空响应视为错误；不要把它当成功。

## 25. 旧版实例可能只有 v1 可用

实测 `chandao.freetek.cc`（ZenTao 18.x）：

- v1 登录/接口正常；
- v2 登录及其它路由返回 PHP Fatal（`Class 'userEntry'/'productsEntry' not found`），HTTP 200 + HTML。

CLI 的 `auto` 会自动回退 v1；强制 `--api-version v2` 会返回“接口返回了非 JSON 响应”的错误（不会把 HTML 当成功）。该实例部署在 `/zentao` 子路径，`auth login` 用根地址时会自动探测并纠正。

## 26. 旧版 v1 的 story update 可能不可用

`PUT /stories/{id}` 可能返回 400 `error`（草稿/评审状态下更常见）。内容变更改用：

```bash
chandao-cli story change --id <id> --reviewer <账号> --spec '<p>...</p>'
```

代价是会生成新版本并进入评审流程。

## 27. 旧版 v1 创建接口必填字段更多

| 资源 | v1 必填（旧版） | CLI 处理 |
| --- | --- | --- |
| 需求 | `title` + `pri` + `category` + `branch` + `product` | 默认 `pri=3`、`category=feature`、`branch=0` |
| Bug | `title` + `product` + `type` + `openedBuild` | 默认 `type=codeerror`、`openedBuild=trunk` |
| 用例 | `title` + `type` + `pri` + `steps` | 默认 `type=feature`、`pri=3`，steps 自动转对象数组 |
| 任务 | `name` + `execution` + `estStarted`（+`deadline`） | 不设默认日期，必须显式传 |

## 28. 上传 URL 有相对/绝对两种形式

- 新版：`/index.php?m=file&f=read&t=png&fileID=37`
- 旧版：`http://host/zentao/file-read-37.png`

两者都直接放进 `src`/`href`，不要改写或拼接。

## 29. 需求只写 spec 不写 verify

需求有「需求描述（spec）」和「验收标准（verify）」两个独立 HTML 字段。只写 spec 会显示为验收标准空白，像是没写完的需求。创建/更新时两个字段都要给，且 verify 要写成可逐条判定的条件。

## 30. 创建时不填关联，数据会查不到

禅道按产品/项目/执行/需求串联：

- 需求：必填 `--product`；v2 建议带 `--project`/`--execution`；
- 任务：必填 `--execution`，建议 `--story`；
- Bug：必填 `--product`，建议 `--project`/`--execution`/`--story`；
- 用例：必填 `--product`，建议 `--project`/`--execution`/`--story`；
- 测试单：`project`+`product`+`execution`+`build` 缺一不可（CLI 暂无 create）。

不确定时先 `product/project/execution/story list` 取真实 ID，不要用 0 占位。

## 31. 旧版 v1 需求无法直接关联项目/执行

旧版 `POST /stories` 只接受 product/plan/branch/module，不支持 project/execution；需要在项目里用 Web 关联，或使用支持 v2 的实例。

## 32. 需求/用例有多个版本，默认只返回最新

- `story change` 会生成新版本（`version` 递增）；`story update` 修改当前版本，不递增。
- `testcase update` 每次生成新版本。
- 默认 `get`/`list` 返回最新内容；要读历史版本用 `--spec-version <n>`：需求仅 v2 支持；测试用例 v1/v2 都支持（v1 返回 `currentVersion` 标识读取版本）。
- 输出 `data.version` 是当前版本号；按版本读取时 `data.requestedVersion` 才是请求的版本。
- 任务和 Bug 没有内容版本历史，始终返回最新。

改内容前先 `get` 最新版本，避免基于旧版本覆盖；改完再 `get` 核对 `version`。
