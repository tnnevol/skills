# Setup — 安装、认证与配置

## 安装

```bash
npm install -g @tnnevol/memos-cli
```

安装前要求 Node.js ≥ 20。首次安装的完整引导见
[installation-guide.md](../installation-guide.md)。

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
| `MEMOS_API_PATH`     | 否   | 路径前缀，默认 `/api/v1`；26.10+ 用 `/api`              |

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

| memos 版本 | 前缀 | 说明 |
| --- | --- | --- |
| v0.29 – v0.31 | `/api/v1` | 默认值；现存老实例是这一代 |
| **26.10.0 及以后** | `/api` | 上游改用日历版本号并去掉 `v1` 段；`/api/v1` 返回 **410 Gone** |

实测：v0.31.0 实例 `/api/v1/auth/me` → 200、`/api/auth/me` → 404；26.11.0 实例 `/api/auth/me` → 200、`/api/v1/auth/me` → 410。

> v0.31.0 之后**没有 v0.32**：上游在 2026-10 切换到日历版本号，下一版直接是 `26.10.0`。

不确定版本时先跑 `memos-cli me instance`（该命令也走同一前缀，前缀错会直接失败），或看错误码：**410** 说明是 26.10+，换成 `--api-path /api` 即可。

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

## 配置文件加密（2.4.0+）

`~/.memos/config.json` 中的**凭证字段加密存储**，`baseUrl` 等非敏感字段保持明文。
**环境变量（`MEMOS_BASE_URL` / `MEMOS_ACCESS_TOKEN`）始终是明文**，不参与加解密。

- 算法：混合加密 —— RSA-3072-OAEP(SHA-256) 包裹 AES-256-GCM 数据密钥，密文以 `enc:v1:` 前缀标识
- 公钥 `~/.memos/public.pem` 明文存放（公钥泄露无风险），私钥优先存**系统钥匙串**
  （macOS `security` / Linux `secret-tool`），不可用时降级为 `~/.memos/private.pem`（权限 600）
- 旧版明文配置会在首次读取时**自动迁移**为密文，无需手动操作
- 私钥丢失会导致解密失败并明确报错，此时重新执行 `memos-cli auth login` 即可重建

### 关于 macOS 钥匙串

- **非交互环境（CI、SSH、沙箱、管道）不会调用钥匙串**，直接走文件降级，
  避免出现 `User interaction is not allowed` 或系统授权弹窗阻塞进程
- 可用 `MEMOS_CLI_NO_KEYCHAIN=1` 强制走文件降级
- 交互式终端首次访问钥匙串可能要求一次授权，除非给条目配置了 partition list
  （`security set-generic-password-partition-list -S "apple-tool:,apple:"`）。这是 macOS 的设计，不是 CLI 缺陷
- `~/.memos/keymeta.json` 记录实际使用的存储方式（`keychain` 或 `file`），便于排查
