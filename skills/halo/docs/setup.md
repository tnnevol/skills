# Setup

## Configuration

环境变量加载优先级（高覆盖低）：

1. **环境变量**（最高优先级，推荐）
2. **Skill 目录 `.env`**
3. **项目根目录 `.env`**

所需变量：

```bash
export HALO_BASE_URL=https://your-halo-instance.com
export HALO_PAT=pat_your-personal-access-token
```

或在 skill 目录创建 `.env` 文件（确保在 `.gitignore` 中）：

```
HALO_BASE_URL=https://your-halo-instance.com
HALO_PAT=pat_xxx
```

### 获取 Personal Access Token

1. 登录 Halo 后台
2. 进入 **系统** → **用户** → 当前用户
3. 找到 **个人访问令牌** 区域
4. 创建新令牌，复制 `pat_xxx` 值（仅显示一次）

## Mental Model

技能由多个脚本组成，各司其职：

- `scripts/api.cjs` — 主入口，路由分发到各操作
- `scripts/env.cjs` — 加载并验证环境变量
- `scripts/utils.cjs` — 公共工具（API 调用、格式化、slug 生成）
- `scripts/actions/post.cjs` — 文章 CRUD 操作实现

## Authentication

所有 API 请求使用 Bearer Token：

```
Authorization: Bearer <HALO_PAT>
Content-Type: application/json
```

## Runtime Detection

技能使用纯 JavaScript，无外部依赖。检测可用运行时：

```bash
API_SCRIPT="${CLAUDE_SKILL_DIR}/scripts/api.cjs"

if command -v bun &>/dev/null; then RUNTIME="bun"; \
elif command -v node &>/dev/null; then RUNTIME="node"; \
elif command -v deno &>/dev/null; then RUNTIME="deno run --allow-net --allow-read --allow-env"; \
else echo "ERROR: No JS runtime found" >&2; exit 1; fi
```

调用方式：

```bash
$RUNTIME "$API_SCRIPT" <ACTION> [ARGS...]
```

### Action 与 API 映射

| Action | 使用的 API | 端点 |
|--------|-----------|------|
| `list` | Extension API | GET `/apis/content.halo.run/v1alpha1/posts` |
| `get` | Extension API | GET `/apis/content.halo.run/v1alpha1/posts/{name}` |
| `create` | Console API | POST `/apis/api.console.halo.run/v1alpha1/posts` |
| `update` | Extension API | PUT `/apis/content.halo.run/v1alpha1/posts/{name}` |
| `delete` | Extension API | DELETE `/apis/content.halo.run/v1alpha1/posts/{name}` |
| `publish` | Console API | PUT `/apis/api.console.halo.run/v1alpha1/posts/{name}/publish` |

**为什么 update 用 Extension API？**
- Console API `PUT /posts/{name}` 需要完整 PostRequest（嵌套格式 + 有效 content），不带有效 content 会返回 500
- Extension API `PUT /posts/{name}` 只需平铺的 spec，不需要 content
- 如果用户传了 `--raw`/`--content`，先调用 Console API `/posts/{name}/content` 更新内容，再用 Extension API 更新元数据

## Error Handling

- API 返回 401/403 → 检查 HALO_PAT 是否有效
- API 返回 404 → 文章不存在，确认 name 是否正确
- 脚本输出 `[CONFIG_MISSING]` → 停止重试，提示用户配置环境变量
- API 返回 409 → 版本冲突（乐观锁），脚本会自动重新获取最新版本

## 文章内容类型

- `raw`: 原始内容（Markdown），推荐创建时使用
- `content`: 渲染后的 HTML
- `rawType`: `"MARKDOWN"` 或 `"HTML"`

## 搜索建议

在线搜索 Halo 文档时使用 `site:docs.halo.run` 避免游戏内容污染。
