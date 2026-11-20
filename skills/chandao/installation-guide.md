# 禅道 CLI 首次安装引导

本引导用于帮助 AI Agent 或用户完成 `chandao-cli` 的首次安装、登录和基础验证。完成后，AI Agent 可通过 CLI 管理产品、项目、执行、需求、任务、Bug、测试用例、测试单、用户与附件。

> 若当前环境已经登录（`chandao-cli auth status --verify` 能正常返回），则无需再次引导，直接执行业务命令即可。

## 前置要求

- 已安装 Node.js（≥ 20.0.0）和 npm/npx。
- 已有一个可访问的禅道实例地址（Base URL），支持 v1 或 v2 REST API。
- 一个可登录的禅道账号；建议使用专门的自动化账号，并按最小权限分配角色/分组。
- 如果站点部署在子路径（如 `/zentao`），Base URL 需要带上子路径，或交给 `auth login` 自动探测。

## Step 1: 安装或升级 CLI

```bash
npm install -g @tnnevol/chandao-cli
```

如果国外镜像源下载较慢或安装异常，可切换为 npm 淘宝源重试：

```bash
npm i -g @tnnevol/chandao-cli@latest --registry=https://registry.npmmirror.com/
```

安装后检查版本：

```bash
chandao-cli --version
```

> 也可免安装运行：`npx -y @tnnevol/chandao-cli <command>`。

## Step 2: 准备账号与实例信息

禅道 REST API 使用**账号密码换取 Token**，不需要在 Web 端手动生成个人令牌。CLI 登录时会同时探测：

- v2：`POST /api.php/v2/users/login`
- v1：`POST /api.php/v1/tokens`

两个版本都成功时优先使用 **v2**，并把两套 Token 一起加密保存；某个版本不可用时自动回退另一个版本。

登录前请确认：

1. 站点地址能打开（如 `https://zentao.example.com` 或 `http://host/zentao`）；
2. 账号有对应模块的访问权限（产品/项目/执行/需求等）；
3. 账号未被锁定、未开启强制二次验证（如有，需要先在 Web 完成验证）。

安全要求：不要把账号密码写入普通日志、聊天记录或仓库文件；自动化场景使用专用的低权限账号。

## Step 3: 登录 CLI

真实终端中的 `auth login` 会进入交互式流程：依次填写站点地址、账号、密码（密码隐藏输入），登录成功后保存配置。

```bash
chandao-cli auth login
```

也可以使用参数登录，适合脚本和 CI：

```bash
chandao-cli auth login \
  --base-url http://192.168.0.19:8890 \
  --account <账号> \
  --password '<密码>'
```

常用选项：

| 选项 | 说明 |
| --- | --- |
| `--base-url <url>` | 站点地址，可带 `/api.php` 或子路径 `/zentao` |
| `--account <account>` | 登录账号 |
| `--password <password>` | 密码；不推荐写进命令历史，CI 用环境变量 |
| `--api-version <auto\|v1\|v2>` | 写入默认版本偏好，默认 `auto` |

登录信息保存到 `~/.chandao/config.json`，Token 使用 RSA + AES 混合加密；私钥优先存系统钥匙串，非交互环境降级为 600 权限文件。

### 子路径部署

如果 `http://host/` 首页正常、但 `/api.php` 返回 404，通常禅道部署在子目录。可以直接把子路径作为 Base URL：

```bash
chandao-cli auth login --base-url http://host/zentao --account <账号>
```

`auth login` 在根地址探测失败时也会自动尝试 `/zentao`、`/pms`，命中后输出 `subpathDetected: true` 并写回正确地址。

### 旧版实例

旧版禅道（如 18.x）可能没有可用的 v2 API（v2 路由返回 PHP Fatal）。CLI 的 `auto` 会自动回退 v1，登录结果中 `detectedVersion` 为 `v1`；强制 `--api-version v2` 会返回明确错误。

## Step 4: 环境变量（可选）

如果希望不落盘配置，或在 CI 中注入，可使用环境变量（优先级：命令行参数 > 环境变量 > 配置文件）：

```bash
export CHANDAO_URL="http://192.168.0.19:8890"
export CHANDAO_ACCOUNT="<账号>"
export CHANDAO_PASSWORD="<密码>"
# 需要固定版本时
# export CHANDAO_API_VERSION="v2"
```

其他变量：

| 变量 | 用途 |
| --- | --- |
| `CHANDAO_TOKEN` | 临时覆盖当前使用版本的 Token |
| `CHANDAO_TOKEN_V1` / `CHANDAO_TOKEN_V2` | 分别覆盖 v1/v2 Token |
| `CHANDAO_CLI_NO_KEYCHAIN=1` | 禁用系统钥匙串，私钥改用本地文件 |

::: warning 不要把凭据放进仓库
禁止在项目仓库里创建 `.env`、`.env.example` 或任何含密码/Token 的文件——即使它被 `.gitignore` 忽略。凭据只放在用户主目录（`~/.zshrc`、`~/.chandao/config.json`）或 CI secrets 里。
:::

## Step 5: 验证安装和登录状态

```bash
chandao-cli --help                 # 查看命令分组
chandao-cli auth status --verify   # 查看登录配置并实际请求一次
chandao-cli product list --limit 3 # 读取产品列表
```

`auth status --verify` 返回类似：

```json
{"success":true,"data":{"baseUrl":"http://192.168.0.19:8890","detectedVersion":"v2","effectiveVersion":"v2","verify":{"ok":true,"version":"v2"}}}
```

全部返回 `{"success":true,...}` 即表示配置可用。

如果登录成功但业务命令 403，通常是账号角色/分组缺少目标模块权限，见「常见问题」。

## Step 6: 安装 AI Agent Skill（!强制必需）

安装禅道 AI Agent Skill，让 AI Agent 知道如何正确使用 chandao-cli（内容格式、附件 workflow、关联关系、版本规则）：

### 通用方式（skills CLI）

```bash
npx -y skills add tnnevol/skills --skill=chandao
```

该命令会进入交互流程，可按需选择目标 AI Agent 和安装范围。全局安装可加 `-g`。

### Hermes Agent

```bash
# 1. 添加 tap（GitHub 仓库）
hermes skills tap add tnnevol/skills
# 2. 查看已配置的 taps
hermes skills tap list
# 3. 从 tap 安装具体 skill
hermes skills install tnnevol/skills/chandao
```

如果当前环境无法访问安装源，请按所用 AI Agent 的规则手动安装：将本仓库 `skills/chandao/`（含 `SKILL.md`、`installation-guide.md` 与 `references/`）复制到 AI Agent 的技能目录。

## 常用验证命令

```bash
# 产品 / 项目 / 执行
chandao-cli product list --limit 5
chandao-cli project list --limit 5
chandao-cli execution list --project <项目ID> --limit 5

# 需求 / Bug / 用例 / 任务
chandao-cli story list --product <产品ID> --limit 5
chandao-cli bug list --product <产品ID> --limit 5
chandao-cli testcase list --product <产品ID> --limit 5
chandao-cli task list --execution <执行ID> --limit 5

# 分组 / 部门（仅 v1）
chandao-cli group list
chandao-cli dept list

# 版本与历史内容
chandao-cli story get --id <需求ID>                 # 默认最新
chandao-cli story get --id <需求ID> --spec-version 1 # 仅 v2
chandao-cli testcase get --id <用例ID> --spec-version 1 # v1/v2 都支持
```

## 版本与内容注意事项

- 默认 `auto`：优先 v2，v1-only 的操作自动回退；强制版本可用 `--api-version v1|v2` 或 `chandao-cli auth use`。
- 需求/用例有内容版本：默认返回最新版；需求历史版本仅 v2 支持，用例 v1/v2 都支持，输出 `requestedVersion` 标识请求版本。
- 需求必须同时写 `--spec` 与 `--verify`（都是 HTML 片段）；测试用例步骤必须是纯文本。
- v2 上传附件必须绑定 `--object-type` + `--object-id`；v1 只上传不绑定。
- 旧版 v1 的 `story update` 可能失败，改用 `story change --reviewer <账号>`。

更多内容规范、附件 workflow 和关联关系见 skill 的 `references/`。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| `chandao-cli: command not found` | 重新执行全局安装，确认 npm global bin 在 PATH；或改用 `npx -y @tnnevol/chandao-cli` |
| 提示禅道地址/账号未配置 | 重新 `auth login`，或设置 `CHANDAO_URL` / `CHANDAO_ACCOUNT` / `CHANDAO_PASSWORD` |
| `鉴权失败（HTTP 401/403）` | Token 失效或权限不足：重新登录；403 再查账号角色/分组权限 |
| 站点首页 200 但 API 404 | 多半是子路径部署，Base URL 改为 `http://host/zentao` |
| v2 返回 PHP Fatal / 非 JSON | 旧版实例没有 v2，保持 `auto` 或用 `--api-version v1` |
| `v2 上传必须提供 --object-type 与 --object-id` | v2 附件必须绑定对象；只上传文件可用 `--api-version v1` |
| 需求 `--spec-version` 在 v1 报错 | v1 story 不支持按版本读取；用例 v1 支持 |
| 登录成功但列表为空 | 确认过滤条件（需求/任务需要 product/project/execution），以及账号可见范围 |
| 命令参数不确定 | 执行 `chandao-cli <group> <command> --help` 查看最新用法 |
| Node 版本过低 | 升级到 Node.js ≥ 20 |
| 想退出登录 | `chandao-cli auth logout` 清除本地配置 |
| 无法解密配置 | 私钥丢失/换机器：重新 `auth login` |
