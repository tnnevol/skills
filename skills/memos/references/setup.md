# Setup — 安装、认证与配置

## 安装

```bash
npm install -g @tnnevol/memos-cli
```

安装前要求 Node.js ≥ 20。首次安装的完整引导见
[apps/memos-cli/memos-cli-installation-guide.md](https://github.com/tnnevol/skills/blob/main/apps/memos-cli/memos-cli-installation-guide.md)。

验证安装：

```bash
memos-cli --version
memos-cli --help
```

## 配置优先级

**CLI 选项 > 环境变量 > 配置文件（`~/.memos/config.json`）**。

### 配置文件

`memos-cli auth login` 写入：

```json
{
  "baseUrl": "https://memos.example.com",
  "token": "memos_pat_xxx",
  "apiPath": "/api/v1"
}
```

`apiPath` 可省略（省略时按 `/api/v1` 处理）。

### 环境变量

| 变量                 | 必填 | 说明                                                    |
| -------------------- | ---- | ------------------------------------------------------- |
| `MEMOS_BASE_URL`     | 是   | 实例地址，如 `https://memos.example.com`（不带尾斜杠）  |
| `MEMOS_ACCESS_TOKEN` | 是   | 个人访问令牌（`memos_pat_...`）                         |
| `MEMOS_API_PATH`     | 否   | 路径前缀，默认 `/api/v1`；v0.32+ 用 `/api`              |

```bash
# 写入 shell 配置文件（如 ~/.zshrc），重开终端后生效
export MEMOS_BASE_URL=https://memos.example.com
export MEMOS_ACCESS_TOKEN=memos_pat_xxx
```

环境变量适合 CI/脚本；交互式使用推荐 `auth login` 存到 `~/.memos/config.json`，避免令牌落在 shell 历史里。

> **不要把凭据写进项目仓库**：仓库内（包括被 `.gitignore` 忽略的路径）不存放 `.env`、`.env.example`
> 或任何含令牌的文件。凭据只放用户主目录或 CI secrets。

### 全局选项

任何命令都可携带，优先级最高：

```bash
memos-cli --base-url https://memos.example.com --token memos_pat_xxx me get
memos-cli --api-path /api me instance
memos-cli memo list -n 5 --pretty
```

## 认证

所有请求使用 Bearer Token：

```text
Authorization: Bearer <MEMOS_ACCESS_TOKEN>
Accept: application/json
```

令牌在 Memos Web 界面「设置 → 访问令牌（Access tokens）」创建，只在创建时显示一次。

### 交互式登录

真实终端里直接运行：

```bash
memos-cli auth login
```

流程：询问服务地址（带格式校验）→ 隐藏输入令牌 → 用 `/auth/me` 校验 → 失败继续提示 → 通过后写入
`~/.memos/config.json`。地址变更时会丢弃配置里的旧令牌，避免拿错令牌去校验。

### 非交互式登录

```bash
memos-cli auth login --base-url https://memos.example.com --token memos_pat_xxx
# 或
MEMOS_BASE_URL=... MEMOS_ACCESS_TOKEN=... memos-cli auth login
```

非交互模式同样会先校验再保存；缺地址或令牌会直接报错，不会阻塞等待输入。

### 查看与清除

```bash
memos-cli auth status    # 显示 loggedIn / source(config|env) / baseUrl / apiPath / user
memos-cli auth logout    # 删除 ~/.memos/config.json
```

## API 路径前缀

| memos 版本    | 前缀      | 说明                                        |
| ------------- | --------- | ------------------------------------------- |
| v0.29 – v0.31 | `/api/v1` | 默认值，绝大多数现存实例都是这一代          |
| main / v0.32+ | `/api`    | 上游去掉了 `v1` 段，需要显式改前缀          |

实测：v0.31.0 实例 `/api/v1/auth/me` → 200，`/api/auth/me` → 404。

不确定版本时先跑 `memos-cli me instance`（该命令也走同一前缀，若前缀错会直接 404，此时换前缀再试）。

## 运行时说明

CLI 是编译后的单文件 ESM（`dist/cli.js`），依赖 `commander` 与 `undici`，需要 Node.js ≥ 20。
仓库开发态可绕过全局安装：

```bash
pnpm --filter @tnnevol/memos-cli build
node apps/memos-cli/dist/cli.js me get
```

## 错误与退出码

- 成功：stdout 输出 `{ "success": true, "operation": "...", "data": ... }`，退出码 0。
- 失败：stderr 输出 `{ "success": false, "message": "...", "code": <gRPC状态码>, "httpStatus": <HTTP状态码> }`，退出码非 0。

常见 `code`：`3` INVALID_ARGUMENT、`5` NOT_FOUND、`7` PERMISSION_DENIED、`16` UNAUTHENTICATED。
