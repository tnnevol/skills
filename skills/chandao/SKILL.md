---
name: chandao
displayName: chandao
slug: chandao
description: 通过 chandao-cli 操作禅道（ZenTao）：产品、项目、执行、需求、任务、Bug、测试用例、测试单、用户与附件上传。强制需求 spec+verify 双 HTML 字段、测试用例纯文本步骤、创建时补齐产品/项目/执行/需求关联，并遵循“先上传附件、再把文件地址回显到 HTML”的图文 workflow。
metadata:
  author: Tnnevol
  version: "2.4.4"
---

# SKILL: chandao（禅道）

让 AI Agent 通过 `chandao-cli` 操作禅道：查询/创建/更新产品、项目、需求、任务、执行、Bug、测试用例与用户，并正确处理**富文本 HTML 内容**与**附件/图片**。

> 本 skill 已不再包含 `scripts/`。所有操作统一走 `apps/chandao-cli`，它内置 v1/v2 自动探测、鉴权持久化与版本强制。
>
> 首次安装、登录与验证见 [installation-guide.md](installation-guide.md)。

## 快速开始

```bash
# 1) 构建（仓库内）或全局安装
pnpm --filter @tnnevol/chandao-cli build
# 全局：pnpm add -g @tnnevol/chandao-cli

# 2) 登录（自动探测 v2/v1，优先 v2；token 加密持久化到 ~/.chandao）
chandao-cli auth login --base-url http://192.168.0.19:8890 --account <账号>
# 非交互：--password 或 CHANDAO_PASSWORD

# 3) 验证
chandao-cli auth status --verify
chandao-cli product list --limit 5
```

仓库内未全局安装时，用 `node apps/chandao-cli/dist/cli.js ...` 代替 `chandao-cli`。

> 站点在子路径（如 `/zentao`）时，`--base-url` 要包含子路径；`auth login` 会尝试自动补 `/zentao`、`/pms`，并在结果里标 `subpathDetected: true`。

### 版本选择

- 默认 `auto`：优先 v2；某个操作在当前版本未实现时自动回退另一版本，输出带 `fallback: true`。
- 强制：全局加 `--api-version v1|v2`，或 `chandao-cli auth use v1|v2|auto`。
- 强制版本不支持该操作会直接报错，不会静默换版本。

## 安全准则

1. 账号、密码、token 不得出现在对话、文件、提交或日志中。
2. 所有禅道请求必须通过 `chandao-cli`，不要手写 curl 绕过鉴权与版本处理。
3. 删除类命令必须显式 `--yes`，并先向用户确认删除目标。
4. 写操作前先读取当前数据（`get`/`list`），不要凭猜测传 ID。
5. 不执行 `auth logout` 之外的配置清理；不读取/打印 `~/.chandao/config.json` 的密文。

## 内容格式规则（最高优先级）

禅道的富文本字段保存的是 **HTML 片段**。生成内容时必须遵守（写之前先读 [content-formatting.md](references/content-formatting.md)；含附件先读 [attachment-workflow.md](references/attachment-workflow.md)）：

| 场景 | 字段 | 格式 |
| --- | --- | --- |
| 需求描述 | `story create/update --spec` | **HTML 片段** |
| 需求验收标准 | `story create/update --verify` | **HTML 片段** |
| Bug 重现步骤 | `bug create/update --steps` | **HTML 片段** |
| 任务描述 | `task create/update --desc` | **HTML 片段** |
| 文档正文 | 文档 content | **HTML 片段**（本实例暂无写 API，见下文） |
| 测试用例步骤/预期 | `testcase --steps` | **纯文本**，禁止 HTML / Markdown |
| 标题、名称、备注、关闭原因 | `--title` / `--name` / `--comment` / `--reason` | 纯文本 |

**需求必须同时提供 `--spec`（需求描述）和 `--verify`（验收标准）**，两者都是独立字段、都存 HTML，缺一个就不是完整需求。标准模板见 [content-formatting.md](references/content-formatting.md#需求模板)。

### HTML 片段规范

- 只输出片段，不要 `<html>`、`<head>`、`<body>`、`<script>`、`<style>`、`<iframe>`。
- 段落用 `<p>`，换行用 `<br>`；列表用 `<ul>/<ol>/<li>`；强调用 `<strong>/<em>`。
- 表格用 `<table>/<tr>/<th>/<td>`；图片用 `<img>`；链接用 `<a href="...">`。
- **禁止 Markdown**（`#`、`-`、`**`、`[x](y)` 等不会被渲染，会原样显示）。
- 文本里的 `<`、`>`、`&` 必须转义为 `&lt;`、`&gt;`、`&amp;`；不要把未转义代码直接塞进 HTML。
- 图片必须来自附件上传返回的 URL（见下节），不要使用外链、base64 或本地路径。

推荐结构：

```html
<p>背景：……</p>
<p>目标：……</p>
<ul>
  <li>要点一</li>
  <li>要点二</li>
</ul>
<p><img src="/index.php?m=file&f=read&t=png&fileID=123" alt="图1：页面布局"></p>
```

### 测试用例步骤（唯一例外）

`testcase create/update --steps` 是 **JSON 数组 + 纯文本**，不能包含 HTML/Markdown：

```bash
chandao-cli testcase create --product 1 --title "登录成功" \
  --steps '[{"step":"打开登录页","expect":"显示账号密码输入框"},{"step":"输入正确账号密码并提交","expect":"进入工作台"}]'
```

## 图片 / 附件默认行为（必须遵守）

每次 `story get` / `bug get` / `task get` 后，先检查内容里有没有图片和附件：

| 对象 | 图片字段 | 附件字段 |
| --- | --- | --- |
| 需求 story | `spec`、`verify` | `files` |
| Bug | `steps` | `files` |
| 任务 task | `desc` | `files` |

1. **内容里有图片：默认立即下载，不需要询问用户。**
   ```bash
   chandao-cli story images --id <storyID> --dir ./story-images
   chandao-cli bug images --id <bugID> --dir ./bug-images
   chandao-cli task images --id <taskID> --dir ./task-images
   ```
   下载后必须实际查看图片内容（尺寸/文字/界面），再把图片内容纳入理解；不要只报告“已下载”。

2. **有附件：不要自动下载。**
   - 先完成正文阅读/总结；
   - 在回复里说明附件数量和文件名，明确询问用户：**“是否需要下载附件并查看内容？”**
   - 用户同意后，用 `file download --id <fileID> --output <path>` 下载，再读取/查看附件内容（PDF/Word 等用对应工具）；
   - 用户未同意时，只保留附件列表，不读取内容。

3. 图片 URL 是 Web 登录路由，不能直接 `curl`；下载必须走 CLI 的 v1 files 接口。

## 附件 / 图文 Workflow（必须按顺序）

涉及图片、截图、附件的需求/Bug/任务，**先上传附件拿到 URL，再把 URL 回显进 HTML 片段，最后保存内容**。禁止跳过上传直接写本地路径或 base64。

> 如果运行环境提供 workflow 编排工具，把本节当作固定 workflow 逐步执行；没有编排工具时也按同样顺序手工执行。

### A. 已有对象（推荐）

```bash
# 1) 上传并绑定到对象（v2；objectType: story | bug | task | testcase）
chandao-cli file upload --file ./mockup.png --object-type story --object-id 12
# 输出：{"data":{"version":"v2","associated":true,"data":{"id":37,"url":"/index.php?m=file&f=read&t=png&fileID=37"}}}

# 2) 用返回的 url 组装 HTML
#    <p><img src="/index.php?m=file&f=read&t=png&fileID=37" alt="页面布局"></p>

# 3) 更新内容（只传 --spec，CLI 会自动回填其他字段）
chandao-cli story update --id 12 --spec '<p>……</p><p><img src="/index.php?m=file&f=read&t=png&fileID=37" alt="页面布局"></p>'
```

### B. 新建对象

新建对象还没有 ID，v2 上传无法绑定。按以下顺序执行（仍然保证“附件先上传、URL 后回显”）：

```bash
# 1) 先创建骨架（只填必填字段，内容留空/占位）
chandao-cli story create --product 1 --title "支持导出" --spec "<p>...</p>" --verify "<ul><li>...</li></ul>"
# 记录返回的 id

# 2) 上传附件并绑定到新对象
chandao-cli file upload --file ./flow.png --object-type story --object-id <新id>

# 3) 用回显 URL 生成完整 HTML，再更新内容
chandao-cli story update --id <新id> --spec '<p>流程如下：</p><p><img src="....fileID=NN" alt="流程图"></p>'
```

### C. 纯附件（不需要绑定对象）

```bash
chandao-cli file upload --file ./report.pdf
# auto 模式下无对象绑定时走 v1，返回 id + url；适合随后嵌入任意 HTML 内容
```

### 关键细节

- 上传返回的 `url` 有两种形式：新版相对路径（`/index.php?m=file&f=read&t=png&fileID=37`）或旧版绝对地址（`http://host/zentao/file-read-37.png`）。**原样**放进 `src`/`href`，不要拼主机名、不要改写。
- v2 上传**必须**同时提供 `--object-type` 与 `--object-id`；缺少时禅道返回空响应（CLI 会直接报错）。
- v1 上传只接受文件本身（可选 `--uid`），**不绑定对象**；返回的 URL 仍可嵌入内容，但不会出现在对象的附件列表里。
- 图片 URL 的 `file read` 路由需要登录态，直接 `curl` 会 302/返回登录 HTML；下载图片请用 CLI（走 v1 `/files/{id}` 接口）：
  ```bash
  chandao-cli story images --id <storyID> --dir ./story-images
  chandao-cli file download --id <fileID> --output ./file.png
  ```
- 附件列表可用 `chandao-cli file get --id <fileID>` 校验（仅 v2 元数据）。
- 非图片附件用链接嵌入：`<p><a href="{url}">下载附件：report.pdf</a></p>`。

## 内容版本（读取/更新前必看）

禅道部分对象有内容版本，默认返回最新版本，但历史版本要显式指定：

| 对象 | 版本行为 | 读取历史版本 |
| --- | --- | --- |
| 需求 story | `story change` 生成新版本；`story update` 改当前版本（实测不递增） | `story get --id <id> --spec-version <n>`（仅 v2；v1 报错） |
| 测试用例 testcase | 每次 `update` 生成新版本 | `testcase get --id <id> --spec-version <n>`（v1/v2 都支持；v1 返回 `currentVersion` 标识实际读取版本） |
| 任务 task / Bug bug | 无内容版本历史，始终返回最新 | 不支持 `--spec-version` |

- 默认 `get`/`list` 返回**最新版本**内容；改之前先 `get` 一次，确认 `version` 与内容。
- 输出里 `data.version` 是当前版本号；按版本读取时 `data.requestedVersion` 是请求的版本号（实体 `version` 仍显示当前版本）。
- v1 的 story get 不接受 `version` 查询参数，CLI 在强制 v1 时会直接报错；
- v1 的 testcase get **支持** `?version=N`，返回的 `currentVersion` 是实际读取的版本。
- **v1 token 本质是 `session_id()`（会话级临时凭证），几小时后可能失效；不要把它当长期 token。** v1 功能 401 时重新 `auth login` 即可，v2 功能不受影响。

## 关联关系（创建前必须确认）

禅道数据靠「产品 → 项目 → 执行 → 需求 → 任务/Bug/用例/测试单」串联。创建时不填关联字段，后续列表/看板/测试单里查不到，等于孤岛数据。

| 对象 | 必填关联 | 建议关联 | CLI |
| --- | --- | --- | --- |
| 需求 | `--product` | v2：`--project` 或 `--execution`（二选一）；`--module` / `--parent` | `story create` |
| 任务 | `--execution` | `--story` / `--module` | `task create` |
| Bug | `--product` | `--project` / `--execution` / `--story` | `bug create` |
| 测试用例 | `--product` | `--project` / `--execution` / `--story` | `testcase create` |
| 测试单 | `project`+`product`+`execution`+`build` | `owner` / 起止日期 | 暂无 create，见 [relations.md](references/relations.md) |

执行顺序：**解析 ID → 创建 → `get` 自检关联字段**。不要用 `0` 占位，也不要在用户未给出上下文时瞎猜。

v2 的 `--project` 与 `--execution` 是不同关联：传 project 进项目需求池，传 execution 进迭代；同时传只有 execution 生效。完整字段与示例见 [relations.md](references/relations.md)。

## 命令速查

```text
auth     login | status [--verify] | use <auto|v1|v2> | logout
product  list | get | create | update | delete | list-by-program
project  list | get | create | update | delete | list-by-program
story    list | get | create | update | close | change | activate | delete | images
task     list | get | create | update | start | pause | restart | finish | close | activate | delete | images
execution list | get | create | update | start(v2) | suspend(v2) | close(v2) | delete
bug      list | get | create | update | resolve | close | activate | confirm | delete | images
testcase list | get | create | update | delete
user     list | get | create | update | delete
testtask list | get | delete        # 测试单（仅 v1 读）
file     upload | download | get     # 附件上传/下载
group    list
dept     list | get
api      <METHOD> <PATH>
```

通用参数：`--page`、`--limit`、`--order`、`--id`、`--yes`、`--pretty`、`--api-version`。

## 意图识别

### 环境与认证

| 用户说法 | 动作 |
| --- | --- |
| 配置/设置禅道、找不到禅道 | 引导 `auth login`（或设置 `CHANDAO_URL/ACCOUNT/PASSWORD`） |
| 登录失败、401/403 | `auth status --verify`；失败则重新 `auth login` |
| 切换 v1/v2 | `--api-version v1|v2` 或 `auth use` |

### 产品 / 项目

| 用户说法 | 命令 |
| --- | --- |
| 查/列产品 | `product list` |
| 产品详情 | `product get --id <id>` |
| 创建产品 | `product create --name <name> [--program <id>] [--PO <账号>]` |
| 更新/删除产品 | `product update --id <id> ...` / `product delete --id <id> --yes` |
| 项目集的产品 | `product list-by-program --program <id>` |
| 查/建/改/删项目 | `project list` / `create --name --model --begin --end` / `update` / `delete --yes` |
| 项目集的项目 | `project list-by-program --program <id>` |

### 需求

| 用户说法 | 命令 |
| --- | --- |
| 需求列表 | `story list --product <id>` 或 `--project` / `--execution` |
| 需求详情 | `story get --id <id>` |
| 创建需求 | `story create --product <id> --title <title> --spec "<html>" --verify "<html>"`（v2 可加 `--project` 或 `--execution`，二选一） |
| 更新需求 | `story update --id <id> --spec "<html>" --verify "<html>"`（旧版 v1 失败时改用 `story change --reviewer`） |
| 关闭需求 | `story close --id <id> --reason done --comment <text>` |
| 变更需求 | `story change --id <id> --reviewer <账号列表>` |
| 激活需求 | `story activate --id <id>` |
| 删除需求 | `story delete --id <id> --yes` |

### 任务

| 用户说法 | 命令 |
| --- | --- |
| 任务列表 | `task list --execution <id>` |
| 创建任务 | `task create --execution <id> [--story <id>] --name <name> [--desc "<html>"]` |
| 开始/暂停/继续 | `task start/pause/restart --id <id>` |
| 完成任务 | `task finish --id <id> --consumed <小时> [--left 0]` |
| 关闭/激活 | `task close --id <id>` / `task activate --id <id>` |
| 删除任务 | `task delete --id <id> --yes` |

### 执行

| 用户说法 | 命令 |
| --- | --- |
| 执行列表 | `execution list [--project <id>] [--status all]` |
| 创建执行 | `execution create --project <id> --name <name> --begin <date> --end <date>` |
| 启动/暂停/关闭 | `execution start/suspend/close --id <id>`（仅 v2） |
| 删除执行 | `execution delete --id <id> --yes` |

### Bug

| 用户说法 | 命令 |
| --- | --- |
| Bug 列表 | `bug list --product <id>`（或 `--project` / `--execution`） |
| 创建 Bug | `bug create --product <id> [--project/--execution/--story] --title <title> --severity <n> --steps "<html>"` |
| 更新 Bug | `bug update --id <id> --steps "<html>"` |
| 解决 Bug | `bug resolve --id <id> --resolution fixed [--resolvedBuild trunk]` |
| 关闭/激活/确认 | `bug close/activate/confirm --id <id>` |
| 删除 Bug | `bug delete --id <id> --yes` |

### 测试用例

| 用户说法 | 命令 |
| --- | --- |
| 用例列表 | `testcase list --product <id>` |
| 创建用例 | `testcase create --product <id> [--project/--execution/--story] --title <title> --steps '<json 纯文本>'` |
| 更新用例 | `testcase update --id <id> --steps '<json 纯文本>'` |
| 删除用例 | `testcase delete --id <id> --yes` |

### 测试单

| 用户说法 | 命令 |
| --- | --- |
| 测试单列表 | `testtask list --product <id>` / `--project <id>` |
| 测试单详情 | `testtask get --id <id>` |
| 删除测试单 | `testtask delete --id <id> --yes` |

### 附件

| 用户说法 | 命令 |
| --- | --- |
| 上传图片/附件 | `file upload --file <path> [--object-type story --object-id <id>]` |
| 下载附件/图片 | `file download --id <fileID> [--output <path>]` |
| 批量下载需求图片 | `story images --id <storyID> [--dir <dir>]` |
| 批量下载 Bug 图片 | `bug images --id <bugID> [--dir <dir>]` |
| 批量下载任务图片 | `task images --id <taskID> [--dir <dir>]` |
| 查附件信息 | `file get --id <fileID>`（v2 元数据） |

### 用户 / 角色 / 部门

| 用户说法 | 命令 |
| --- | --- |
| 用户列表/详情 | `user list` / `user get --id <id>` |
| 创建用户 | `user create --account --password --realname [--gender m] [--role po --dept 5 --group 5 --api-version v1]` |
| 更新用户 | `user update --id <id> [--gender m] [--group 5 --api-version v1]` |
| 删除用户 | `user delete --id <id> --yes` |
| 权限分组/角色 | `group list`（只读） |
| 部门 | `dept list` / `dept get --id <id>` |

## 业务工作流

### 需求图文

1. 建骨架（或确认已有需求）：`story create --product 1 --title ...`
2. 上传图片并绑定：`file upload --object-type story --object-id <id>`
3. 用 URL 生成 HTML（段落 + 图片）
4. `story update --id <id> --spec "<html>"`
5. `story get --id <id>` 校验 `spec` 中含 `fileID`

### Bug 带截图

1. `bug create --product 1 --title "..." --severity 2 --steps "<p>复现步骤...</p>"`
2. `file upload --file ./shot.png --object-type bug --object-id <id>`
3. `bug update --id <id> --steps "<p>复现步骤...</p><p><img src=...></p>"`
4. 修复后立即 `bug resolve --id <id> --resolution fixed --resolvedBuild trunk`

### 任务附件

1. `task create --execution 3 --name "联调" --desc "<p>说明</p>"`
2. `file upload --file ./api.pdf --object-type task --object-id <id>`
3. `task update --id <id> --desc '<p>说明：</p><p><a href="{url}">接口文档</a></p>'`

### 测试用例

1. `testcase create --product 1 --title "..." --steps '[{"step":"...","expect":"..."}]'`
2. 步骤/预期只用纯文本；不要 HTML、不要 Markdown
3. 若需附加截图，按附件 workflow 上传并绑定 `--object-type testcase`，但**步骤字段仍保持纯文本**

### 文档

- 文档正文同样按 **HTML 片段** 生成，图片用上传返回的 URL。
- 本实例限制：v1 没有文档创建接口，v2 `/v2/doc/*` 路由返回空（未实现）；因此文档创建/更新目前只能走 Web 界面。
- 只读可尝试：`chandao-cli api GET /v1/doclibs`、`chandao-cli api GET /v1/docs/<libID>`。

## 错误处理

| 现象 | 处理 |
| --- | --- |
| 未登录 / 401 / 403 | `auth login` 重新登录；403 检查账号模块权限 |
| 强制版本不支持 | 去掉 `--api-version` 或换成支持版本 |
| v2 上传返回空 | 必须提供 `--object-type` + `--object-id` |
| 图片在页面不显示 | 确认 HTML 中是上传返回的相对 URL；未登录访问 file read 会 302 |
| `PUT` 覆盖字段 | CLI 的 update 已自动 GET + 回填；仍建议只传需要改的字段 |
| 列表为空 | 确认过滤条件（需求/任务需要 product/project/execution） |

## 关键警告

> 详见 [references/pitfalls.md](references/pitfalls.md)

- ⚠️ **spec/verify/steps/desc/文档正文必须是 HTML 片段**，不能是 Markdown。
- ⚠️ **需求必须同时写 `--spec` 和 `--verify`**；只写一个字段视为内容不完整。
- ⚠️ **改需求/用例前先看版本**：默认取最新版；需要历史内容用 `--spec-version`（仅 v2），v1 不支持。
- ⚠️ **创建前先确认关联**：story 要 product（v2 加 project/execution）、task 要 execution、bug 要 product（+project/execution/story）、用例要 product（+project/execution/story）。
- ⚠️ **测试用例步骤/预期必须是纯文本**，禁止 HTML 和 Markdown。
- ⚠️ **附件先上传再回显**：v2 上传必须绑定 `--object-type` + `--object-id`；不要写本地路径/base64。
- ⚠️ 新建对象流程：建骨架 → 上传绑定 → update HTML。
- ⚠️ 旧版 v1 实例：`story update` 可能 400 `error`，改用 `story change --reviewer <账号> --spec ...`；`task create` 必须传 `--estStarted`。
- ⚠️ v2 创建字段名带 `ID` 后缀（如 `executionID`），CLI 已封装，不要绕过 CLI 直接改。
- ⚠️ Bug 状态流转用专用命令（`resolve/close/activate/confirm`），`bug update --status` 无效。
- ⚠️ `story close` 必须 `--reason`；`story change` 必须 `--reviewer`；`task finish` 必须 `--consumed`。
- ⚠️ `execution start/suspend/close` 仅 v2；`group list`、`dept list/get` 在 v1/v2 都可用。
- ⚠️ 修改角色权限（grouppriv）没有 REST API，只能 Web/DB。
- ⚠️ 删除必须 `--yes`。

## Core References

| Topic | Description | Reference |
| --- | --- | --- |
| Installation | 首次安装、登录、验证与排错 | [installation-guide.md](installation-guide.md) |
| Setup | CLI 构建、登录、版本配置 | [setup.md](references/setup.md) |
| Content Formatting | HTML 片段与纯文本规则 | [content-formatting.md](references/content-formatting.md) |
| Relations | 产品/项目/执行/需求/任务/Bug/用例/测试单关联 | [relations.md](references/relations.md) |
| Attachment Workflow | 上传 → URL → HTML 回显 | [attachment-workflow.md](references/attachment-workflow.md) |
| Workflows | 需求/Bug/任务/用例/文档场景 | [workflows.md](references/workflows.md) |
| Product | 产品命令 | [commands-product.md](references/commands-product.md) |
| Project | 项目命令 | [commands-project.md](references/commands-project.md) |
| Story | 需求命令 | [commands-story.md](references/commands-story.md) |
| Task | 任务命令 | [commands-task.md](references/commands-task.md) |
| Execution | 执行命令 | [commands-execution.md](references/commands-execution.md) |
| Bug | Bug 命令 | [commands-bug.md](references/commands-bug.md) |
| Testcase | 测试用例命令 | [commands-test.md](references/commands-test.md) |
| Fields | v2 字段速查 | [zentao-v2-api-fields.md](references/zentao-v2-api-fields.md) |
| API Quirks | v1/v2 差异与实例限制 | [zentao-api-v2-quirks.md](references/zentao-api-v2-quirks.md) |
| Permissions | 权限/角色/部门 | [zentao-api-permissions.md](references/zentao-api-permissions.md) |
| Pitfalls | 常见错误与修复 | [pitfalls.md](references/pitfalls.md) |
| Help | 常见问题 | [help.md](references/help.md) |
