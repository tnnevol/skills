# Memos CLI 首次安装引导

本引导用于帮助 AI Agent 或用户完成 Memos CLI 的首次安装、认证和基础验证。完成后，AI Agent 可通过 `memos-cli` 管理笔记、评论、标签、表情、关联、附件、分享以及空间。

> 若当前环境已经登录（`memos-cli me get` 或 `memos-cli auth status` 能正常返回当前用户），则无需再次引导，直接执行业务命令即可。

## 前置要求

- 已安装 Node.js（≥ 20.0.0）和 npm/npx。
- 已有一个可访问的 Memos 实例地址（Base URL），且版本为 v0.29 及以上。
- 一个 Memos 访问令牌（Access Token）。

## Step 1: 安装或升级 CLI

```bash
npm install -g @tnnevol/memos-cli
```

如果国外镜像源下载较慢或安装异常，可切换为 npm 淘宝源重试：

```bash
npm i -g @tnnevol/memos-cli@latest --registry=https://registry.npmmirror.com/
```

安装后检查版本：

```bash
memos-cli --version
```

> 也可免安装运行：`npx -y @tnnevol/memos-cli <command>`。

## Step 2: 获取访问令牌

在 Memos Web 界面中生成个人访问令牌：

1. 登录 Memos。
2. 打开「设置 → 访问令牌（Access tokens）」。
3. 新建令牌并复制（只在创建时显示一次）。

安全要求：不要把令牌写入普通日志、聊天记录或仓库文件。CLI 的配置保存在用户主目录，
不要把它复制进项目仓库。

## Step 3: 登录 CLI

真实终端中的 `auth login` 会进入交互式流程：先填写服务地址，再以隐藏输入方式填写令牌，
地址与令牌会在提交后用 `/auth/me` 校验；校验失败会继续提示重新输入，校验通过才保存配置。

```bash
memos-cli auth login
```

也可以使用参数登录，适合脚本和 CI（同样会先校验再保存）：

```bash
memos-cli auth login --base-url <BASE_URL> --token <TOKEN>
```

登录信息保存到 `~/.memos/config.json`。

> **API 路径前缀**：v0.29–v0.31 使用 `/api/v1`（默认）。若实例是 v0.32 及以上（上游 main 将
> 路径改为 `/api`），请在登录时追加 `--api-path /api`。

## Step 4: 记录默认服务配置（推荐）

`auth login` 会把 `baseUrl`、`token` 和 `apiPath` 持久化到 `~/.memos/config.json`，后续命令自动读取。

若在项目工作区中供 AI Agent 使用，也可用环境变量（优先级：CLI 选项 > 环境变量 > 配置文件）：

```bash
export MEMOS_BASE_URL="https://memos.example.com"
export MEMOS_ACCESS_TOKEN="<TOKEN>"
# 仅 v0.32+ 需要
# export MEMOS_API_PATH="/api"
```

写入 shell 配置文件（推荐 `~/.zshrc` 或对应 shell 的启动文件），重开终端后生效：

```bash
echo 'export MEMOS_BASE_URL="https://memos.example.com"' >> ~/.zshrc
echo 'export MEMOS_ACCESS_TOKEN="<TOKEN>"' >> ~/.zshrc
```

::: warning 不要把凭据放进仓库
禁止在项目仓库里创建 `.env`、`.env.example` 或任何含令牌的文件——即使它被 `.gitignore` 忽略。
凭据只放在用户主目录（`~/.zshrc`、`~/.memos/config.json`）或 CI secrets 里。
:::

## Step 5: 验证安装和登录状态

```bash
memos-cli --help          # 查看命令分组
memos-cli me get          # 确认身份（相当于 whoami）
memos-cli me instance     # 确认实例版本
memos-cli memo list -n 3  # 读取最近笔记
```

全部返回 `{"success":true,...}` 即表示配置可用。

## Step 6: 安装 AI Agent Skill（!强制必需）

安装 Memos AI Agent Skill，让 AI Agent 知道如何正确使用 memos-cli：

### 通用方式（skills CLI）

```bash
npx -y skills add tnnevol/skills --skill=memos
```

该命令会进入交互流程，可按需选择目标 AI Agent 和安装范围。全局安装可加 `-g`。

### Hermes Agent

```bash
# 1. 添加 tap（GitHub 仓库）
hermes skills tap add tnnevol/skills
# 2. 查看已配置的 taps
hermes skills tap list
# 3. 从 tap 安装具体 skill
hermes skills install tnnevol/skills/memos
```

如果当前环境无法访问安装源，请按所用 AI Agent 的规则手动安装：将本仓库 `skills/memos/`
（含 `SKILL.md` 与 `references/`）复制到 AI Agent 的技能目录。

## 常见问题

| 现象                                | 处理                                                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| `memos-cli: command not found`      | 重新执行全局安装，并确认 npm global bin 在 PATH 中；或改用 `npx -y @tnnevol/memos-cli`   |
| 提示服务地址/令牌未配置             | 重新执行 `memos-cli auth login`，或设置 `MEMOS_BASE_URL` / `MEMOS_ACCESS_TOKEN`          |
| `authentication required`（code 16）| 令牌无效或已撤销，重新生成并登录                                                         |
| `memo not found`（code 5）          | 检查笔记 ID；`memos/xxx` 与纯 `xxx` 都接受，但必须属于当前用户可见范围                   |
| 接口全 404                          | API 路径前缀不匹配：v0.29–v0.31 用 `/api/v1`，v0.32+ 用 `/api`（`--api-path`）           |
| `invalid filter: unsupported value expression` | 标签过滤要用 `"tag" in tags`，不是 `tags == ["tag"]`；直接用 `--tag` 即可      |
| 命令参数不确定                      | 执行 `memos-cli <group> <command> --help` 查看最新用法                                   |
| Node 版本过低                       | 升级到 Node.js ≥ 20                                                                      |
