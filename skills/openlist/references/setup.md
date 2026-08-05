# Setup — 安装、认证与环境变量

首次安装请先阅读并遵循 [openlist-cli 首次安装引导](https://github.com/tnnevol/skills/blob/main/apps/openlist-cli/openlist-cli-installation-guide.md)，根据当前环境完成安装或升级，再进行认证配置。

## 安装 openlist-cli

```bash
# 全局安装
npm i -g @tnnevol/openlist-cli
# 或 pnpm
pnpm add -g @tnnevol/openlist-cli

# 免安装直接运行
npx -y @tnnevol/openlist-cli <command>

# 本仓库开发态（monorepo 内）
pnpm --filter @tnnevol/openlist-cli build
node apps/openlist-cli/dist/cli.js <command>
```

验证：`openlist-cli --version`。

## 认证（三选一，优先级：CLI 选项 > 环境变量 > 配置文件）

### 1. 环境变量

```bash
export OPENLIST_BASE_URL="http://localhost:5244"
export OPENLIST_TOKEN="<your-api-token>"
```

也可放入项目 `.env`（若用 dotenv 加载环境）。

### 2. 全局选项（单次覆盖）

```bash
openlist-cli --base-url http://localhost:5244 --token <token> fs list /
```

### 3. 登录保存到配置文件

```bash
openlist-cli auth login --base-url http://localhost:5244 --token <token>
# 写入 ~/.openlist/config.json（{ baseUrl, token }）
openlist-cli auth status    # 查看当前登录状态（会调用 /api/me 校验）
openlist-cli auth logout    # 清除本地配置
```

## Token 获取

在 OpenList Web 管理界面获取 API Token（永久令牌见「管理 → 设置 → 其他」）。

## 安全

1. **不要**在对话、日志、文件、提交中回显 `OPENLIST_TOKEN`。
2. 认证信息只经由环境变量 / `auth login` 配置文件传递，不要硬编码进脚本或命令历史。
3. `auth login` 的 token 保存在 `~/.openlist/config.json`，注意该文件权限。

## 全局选项

| 选项               | 说明                                     |
| ------------------ | ---------------------------------------- |
| `--base-url <url>` | OpenList 服务地址（覆盖 env / 配置文件） |
| `--token <token>`  | API Token（覆盖 env / 配置文件）         |
| `--pretty`         | 美化 JSON 输出                           |

## 输出格式

- 成功：`{ "success": true, "operation": "<group>.<cmd>", "data": <结果> }`
- 失败：`{ "success": false, "message": "<原因>", "code": <HTTP码> }`（写入 stderr，进程非零退出）

解析建议：读取 `success` 判断成败，`data` 取结果，`message`/`code` 取错误信息。
