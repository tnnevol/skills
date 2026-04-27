# Setup

## Configuration

Configuration is loaded in the following priority order (higher overrides lower):

1. **Environment variables** (highest priority, recommended)
2. **Skill directory `.env`** (next to SKILL.md)

Required variables:

```bash
export CHANDAO_URL=https://your-chandao.com
export CHANDAO_ACCOUNT=admin
export CHANDAO_PASSWORD=your-password
```

Alternatively, create a `.env` file in the skill directory (make sure it's in `.gitignore`).

## Mental Model

This skill uses several JavaScript modules with different responsibilities:

- `scripts/env.cjs` — 环境变量加载与校验（CHANDAO_URL / CHANDAO_ACCOUNT / CHANDAO_PASSWORD）
- `scripts/auth.cjs` — Token 获取、内存缓存、401 自动刷新
- `scripts/api.cjs` — HTTP 请求统一封装（GET/POST/PUT）、自动注入 Token、分页、错误处理
- `scripts/sanitize.cjs` — 输出脱敏（密码/手机号/邮箱）

## Authentication

禅道 v2 RESTful API 使用 Token 认证：

1. 首次请求自动 POST `/api/v2/users/login` 获取 Token
2. Token 缓存在内存中，后续请求复用
3. 遇到 401 自动重新登录，用户无感知
4. Token 通过请求头 `token: xxx` 传递（**非** Bearer 格式）

## Runtime Detection

The skill uses plain JavaScript with no external dependencies (only Node.js built-in `http`/`https`/`fs`).

```bash
API_SCRIPT="${CLAUDE_SKILL_DIR}/scripts/api.cjs"
node "$API_SCRIPT" <action> [args...]
```

### API Actions

| Action | CLI | Method | Endpoint |
|--------|-----|--------|----------|
| 获取用户列表 | `get /users` | GET | `/api/v2/users` |
| 获取用户详情 | `get /users/:id` | GET | `/api/v2/users/:id` |
| 获取产品列表 | `get /products` | GET | `/api/v2/products` |
| 获取产品详情 | `get /products/:id` | GET | `/api/v2/products/:id` |
| 获取项目列表 | `get /projects` | GET | `/api/v2/projects` |
| 获取项目详情 | `get /projects/:id` | GET | `/api/v2/projects/:id` |

### Pagination

- `recPerPage` — 每页数量（默认 20，最大 1000）
- `pageID` — 页码（从 1 开始）

```bash
node scripts/api.cjs get /users --limit=50
node scripts/api.cjs get /projects --page=2 --limit=10
```

## Error Handling

- `[CONFIG_MISSING]` — 缺少必须的环境变量，需设置 CHANDAO_URL / CHANDAO_ACCOUNT / CHANDAO_PASSWORD
- `[ERROR] 登录失败` — 账号密码错误或禅道实例不可达
- `[ERROR] 服务器错误 (HTTP 5xx)` — 禅道服务端异常
- 业务错误（`status=fail`）— 显示禅道返回的具体错误信息
- 敏感信息（密码、Token、手机号、邮箱）自动脱敏
