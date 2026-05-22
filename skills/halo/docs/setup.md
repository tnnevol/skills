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

- **临时使用**: `npx -y @tnnevol/halo-cli <action>`
- **全局安装**: `npm install -g @tnnevol/halo-cli` 然后使用 `halo-cli <action>`

该 npm 包内部会根据操作系统自动选择合适的二进制文件：
- **Linux**: `halo-linux`
- **macOS**: `halo-macos` 
- **Windows**: `halo-windows.exe`

## CLI 命令参考

| 命令 | 示例 | 说明 |
|------|------|------|
| `list` | `npx -y @tnnevol/halo-cli list` | 列出文章（默认20条） |
| `list` | `npx -y @tnnevol/halo-cli list --limit=10 --page=2` | 分页列出，每页10条 |
| `list` | `npx -y @tnnevol/halo-cli list --keyword=xxx` | 按关键词搜索 |
| `get` | `npx -y @tnnevol/halo-cli get <name>` | 获取文章详情 |
| `create` | `npx -y @tnnevol/halo-cli create --title=标题 --raw=内容` | 创建文章（默认 PRIVATE + HTML 格式） |
| `create` | `npx -y @tnnevol/halo-cli create --title=标题 --raw=内容 --publish --public` | 创建并立即发布，公开可见 |
| `update` | `npx -y @tnnevol/halo-cli update <name> --title=新标题` | 更新文章标题 |
| `update` | `npx -y @tnnevol/halo-cli update <name> --raw=新内容` | 更新文章内容 |
| `delete` | `npx -y @tnnevol/halo-cli delete <name>` | 删除文章 |
| `publish` | `npx -y @tnnevol/halo-cli publish <name>` | 发布文章 |
| `unpublish` | `npx -y @tnnevol/halo-cli unpublish <name>` | 取消发布 |

> 所有调用走 `npx -y @tnnevol/halo-cli`，底层 API 细节已封装在 Go 二进制中。