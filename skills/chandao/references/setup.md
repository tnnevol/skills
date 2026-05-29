# Setup — chandao skill scripts

## 配置

脚本自动从环境变量加载配置：

```bash
export CHANDAO_URL=https://your-chandao.com
export CHANDAO_ACCOUNT=your-username
export CHANDAO_PASSWORD=***
```

## 认证机制

- 首次请求自动 POST `/api.php/v2/users/login` 获取 Token
- Token 缓存在 `~/.cache/chandao-skill/token.json`
- 遇到 401 自动重新登录，用户无感知
- Token 通过请求头 `token: xxx` 传递（**非** Bearer 格式）

## 验证配置

```bash
node scripts/auth.js --action list-products
```

如果看到产品列表，说明配置正确。如果报错，请检查：
1. `CHANDAO_URL` 是否正确（不应包含 `/api/v2` 后缀）
2. 账号密码是否正确
3. 禅道实例是否可达

## 脚本列表

| 脚本 | 模块 | 操作 |
|------|------|------|
| `auth.js` | 认证 | `login` / `get-token` / `list-products` |
| `product.js` | 产品 | `list` / `get` / `create` / `update` / `delete` / `list-by-program` |
| `project.js` | 项目 | `list` / `get` / `create` / `update` / `delete` / `list-by-program` |
| `story.js` | 需求 | `list` / `get` / `create` / `update` / `close` / `activate` / `change` / `delete` |
| `task.js` | 任务 | `list` / `get` / `create` / `update` / `start` / `finish` / `close` / `activate` / `delete` |
| `execution.js` | 执行 | `list` / `get` / `create` / `update` / `start` / `suspend` / `close` / `link-products` / `delete` |
| `bug.js` | Bug | `list` / `get` / `create` / `update` / `resolve` / `close` / `activate` / `delete` |
| `testcase.js` | 测试用例 | `list` / `get` / `create` / `update` / `delete` |

## 帮助

所有脚本支持 `--help` 查看用法（部分脚本在文件头部注释中）：

```bash
head scripts/<module>.js
```
