# 配置指南

## 环境变量

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

## 使用方式

通过 npm 包调用 CLI 工具：

- **临时使用**: `npx @tnnevol/halo-cli <action>`
- **全局安装**: `npm install -g @tnnevol/halo-cli` 然后使用 `halo-cli <action>`

该 npm 包内部会根据操作系统自动选择合适的二进制文件：
- **Linux**: `halo-linux`
- **macOS**: `halo-macos` 
- **Windows**: `halo-windows.exe`

## API 映射参考

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