# OpenList CLI 首次安装引导

本引导用于帮助 AI Agent 或用户完成 OpenList CLI 的首次安装、认证和基础验证。完成后，AI Agent 可通过 `openlist-cli` 管理文件与目录、创建分享、查看用户信息以及进行后台管理（用户/存储/元信息/设置/驱动/索引）。

## 前置要求

- 已安装 Node.js（≥ 20.0.0）和 npm/npx。
- 已拥有可访问的 OpenList 服务地址（Base URL）与一个 API Token。
- 如需后台管理操作，请确保该 Token 对应账号具备相应权限。

## Step 1: 安装或升级 CLI

```bash
npm install -g @tnnevol/openlist-cli
```

如果国外镜像源下载较慢或安装异常，可切换为 npm 淘宝源重试：

```bash
npm i -g @tnnevol/openlist-cli@latest --registry=https://registry.npmmirror.com/
```

安装后检查版本：

```bash
openlist-cli --version
```

> 也可免安装运行：`npx -y @tnnevol/openlist-cli <command>`。

## Step 2: 获取 API Token

在 OpenList Web 管理界面中获取 Token：

1. 登录 OpenList 管理后台。
2. 打开「管理 → 设置」。
3. 进入「其他」，找到「令牌 / Token」。
4. 复制令牌（或使用永久令牌）。

安全要求：不要把 Token 写入普通日志、聊天记录或仓库文件。

## Step 3: 登录 CLI

在真实终端中可以使用交互式登录，Token 输入时不会回显。如果配置文件中已有服务地址或 Token，直接回车会继续使用原配置；没有配置时不能为空。填写完成后交互输入会立即结束，再校验 Token；校验失败时不会保存配置：

```bash
openlist-cli auth login
```

也可以使用参数登录，适合脚本和 CI：

```bash
openlist-cli auth login --base-url <BASE_URL> --token <TOKEN>
```

登录信息保存到 `~/.openlist/config.json`。例如：

```bash
openlist-cli auth login --base-url http://localhost:5244 --token <TOKEN>
```

## Step 4: 记录默认服务配置（推荐）

`auth login` 已将 `baseUrl` 与 `token` 持久化到 `~/.openlist/config.json`，后续命令会自动读取。

若在项目工作区中供 AI Agent 使用，也可用环境变量（优先级：CLI 选项 > 环境变量 > 配置文件）：

```bash
export OPENLIST_BASE_URL="http://localhost:5244"
export OPENLIST_TOKEN="<TOKEN>"
```

或写入工作区 `.env`（供 dotenv 加载）：

```dotenv
OPENLIST_BASE_URL=http://localhost:5244
OPENLIST_TOKEN=<TOKEN>
```

建议确保 `.gitignore` 忽略含密钥的文件，避免提交泄露：

```gitignore
.env
*.private.*
```

## Step 5: 验证安装和登录状态

查看可用命令：

```bash
openlist-cli --help
```

查看当前登录身份（相当于 whoami）：

```bash
openlist-cli me get
```

进一步验证资源查询命令，例如列出根目录：

```bash
openlist-cli fs list /
```

或查看登录状态：

```bash
openlist-cli auth status
```

## Step 6: 安装 AI Agent Skill（!强制必需）

安装 OpenList AI Agent Skill，让 AI Agent 知道如何正确使用 openlist-cli：

### 通用方式（skills CLI）

```bash
npx -y skills add tnnevol/skills --skill=openlist
```

该命令会进入交互流程，可按需选择目标 AI Agent 和安装范围。全局安装可加 `-g`。

### Hermes Agent

```bash
# 1. 添加 tap（GitHub 仓库）
hermes skills tap add tnnevol/skills
# 2. 查看已配置的 taps
hermes skills tap list
# 3. 从 tap 安装具体 skill
hermes skills install tnnevol/skills/openlist
```

如果当前环境无法访问安装源，请按所用 AI Agent 的规则手动安装：将本仓库 `skills/openlist/`（含 `SKILL.md` 与 `references/`）复制到 AI Agent 的技能目录。

## 常见问题

| 现象                              | 处理                                                                                      |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| `openlist-cli: command not found` | 重新执行全局安装，并确认 npm global bin 在 PATH 中；或改用 `npx -y @tnnevol/openlist-cli` |
| 提示服务地址未配置 / Token 未配置 | 重新执行 `openlist-cli auth login --base-url <url> --token <token>`，或设置环境变量       |
| 认证失败 / 401                    | 确认 Token 有效、`--base-url` 正确、账号具备相应权限                                      |
| 命令参数不确定                    | 执行 `openlist-cli <group> <command> --help` 查看最新用法                                 |
| Node 版本过低                     | 升级到 Node.js ≥ 20                                                                       |
