# Setup：安装、登录与版本配置

## 1. 安装

仓库内：

```bash
pnpm --filter @tnnevol/chandao-cli build
node apps/chandao-cli/dist/cli.js --version
```

全局（发布后）：

```bash
pnpm add -g @tnnevol/chandao-cli
chandao-cli --version
```

要求 Node.js >= 20。

## 2. 登录

```bash
chandao-cli auth login \
  --base-url http://192.168.0.19:8890 \
  --account mizen
# 交互输入密码；非交互用 --password 或 CHANDAO_PASSWORD
```

> 站点部署在子路径时，`--base-url` 要带上子路径（如 `http://chandao.freetek.cc/zentao`）。`auth login` 在根地址探测失败时会自动尝试 `/zentao`、`/pms`，命中后写回正确地址（输出 `subpathDetected: true`）。

登录时 CLI 会：

1. 请求 v2：`POST /api.php/v2/users/login`
2. 请求 v1：`POST /api.php/v1/tokens`
3. 两套 token 都加密保存到 `~/.chandao/`
4. `auto` 模式优先使用 v2

登录成功输出示例：

```json
{"success":true,"operation":"auth.login","data":{"baseUrl":"http://192.168.0.19:8890","account":"mizen","apiVersion":"auto","detectedVersion":"v2","login":{"v1":true,"v2":true}}}
```

## 3. 环境变量

| 变量 | 用途 |
| --- | --- |
| `CHANDAO_URL` | 站点地址（可带 `/api.php`） |
| `CHANDAO_ACCOUNT` | 账号 |
| `CHANDAO_PASSWORD` | 密码（仅登录用） |
| `CHANDAO_TOKEN` | 本次请求覆盖当前版本 token |
| `CHANDAO_TOKEN_V1` / `CHANDAO_TOKEN_V2` | 分别覆盖 v1/v2 token |
| `CHANDAO_API_VERSION` | `auto` / `v1` / `v2` |
| `CHANDAO_CLI_NO_KEYCHAIN=1` | 私钥改用本地文件（600） |

优先级：**命令行参数 > `~/.chandao/config.json` > 环境变量**。

登录成功后配置文件优先，避免 shell 里遗留的 `CHANDAO_URL` / `CHANDAO_ACCOUNT` 旧账号覆盖新配置；没有配置或刚 `logout` 时才回退到环境变量。

## 4. 版本切换

```bash
chandao-cli auth status --verify       # 查看探测结果并实测
chandao-cli auth use v1                # 默认改 v1
chandao-cli auth use auto              # 恢复自动（优先 v2）
chandao-cli product list --api-version v2   # 单次强制
```

强制版本不支持某操作会直接失败：

```bash
chandao-cli --api-version v1 execution start --id 1
# {"success":false,"message":"操作在当前强制版本 v1 上未提供（支持：v2）..."}
```

## 5. 配置与安全

- 配置目录 `~/.chandao/`（目录 700，配置 600）。
- `tokenV1` / `tokenV2` 加密保存；密码不落盘。
- 重新登录会覆盖旧 token；`auth logout` 清除配置。
- 私钥优先放在系统钥匙串；非交互环境降级为 `private.pem`。

## 6. 常见问题

| 现象 | 处理 |
| --- | --- |
| `禅道地址未配置` | 传 `--base-url` 或设置 `CHANDAO_URL`，或先登录 |
| `鉴权失败（HTTP 401/403）` | `auth login` 重新登录；确认账号有模块权限 |
| 解密配置失败 | 私钥丢失/换机器，重新 `auth login` |
| 登录探测 v1/v2 都失败 | 检查地址、账号密码；确认站点 `/api.php/v1/tokens` 可访问 |
| 非交互登录报缺少参数 | 传 `--password` 或设置 `CHANDAO_PASSWORD` |
