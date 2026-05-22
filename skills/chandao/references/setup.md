# Setup — chandao-cli 禅道 CLI

## 安装

```bash
# 全局安装
npm i -g @tnnevol/chandao-cli
```

安装后验证：

```bash
chandao-cli version
```

## 配置

CLI 自动从以下位置加载配置（优先级从高到低）：

1. **环境变量**（最高优先级）
2. **`~/.config/chandao/.env`**（推荐方式）
3. **当前目录 `.env`**

### 方式一：环境变量（推荐 CI/临时使用）

```bash
export CHANDAO_URL=https://your-chandao.com
export CHANDAO_ACCOUNT=your-username
export CHANDAO_PASSWORD=***
```

### 方式二：配置文件（推荐日常使用）

创建 `~/.config/chandao/.env`：

```bash
mkdir -p ~/.config/chandao
```

写入配置：

```ini
CHANDAO_URL=https://your-chandao.com
CHANDAO_ACCOUNT=your-username
CHANDAO_PASSWORD=***
```

**注意：** 配置文件包含敏感信息，请确保文件权限安全：

```bash
chmod 600 ~/.config/chandao/.env
```

## 认证机制

- 首次请求自动 POST `/api/v2/users/login` 获取 Token
- Token 缓存在内存中，后续请求复用
- 遇到 401 自动重新登录，用户无感知
- Token 通过请求头 `token: xxx` 传递（**非** Bearer 格式）

## 验证配置

```bash
# 查看帮助
chandao-cli help

# 列出用户（验证连接是否正常）
chandao-cli user list --limit 3
```

如果看到用户列表，说明配置正确。如果报错，请检查：
1. `CHANDAO_URL` 是否正确（不应包含 `/api/v2` 后缀）
2. 账号密码是否正确
3. 禅道实例是否可达

## 帮助

所有模块都支持 `--help` 查看详细参数：

```bash
chandao-cli help
chandao-cli <module> help
chandao-cli <module> <action> --help
```

## Monorepo 本地开发

chandao-cli 在 skills monorepo 的 `apps/chandao-cli/` 目录下。本地开发时：

```bash
# 1. 在 skills 根目录安装依赖
cd /path/to/skills
pnpm install

# 2. 编译 chandao-cli
cd apps/chandao-cli
make build-all

# 3. 用新编译的二进制测试
./target/release/chandao version
./target/release/chandao user list --limit 3
```

**注意**：
- 不要在子目录下 `npm install`，用根目录 `pnpm install` 统一管理
- 子目录不应有 `package-lock.json`
- 编译产物在 `target/` 和 `bin/`，已在根 `.gitignore` 中排除
