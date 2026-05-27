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

通过 Node.js script 执行：

```
node scripts/halo.mjs <action> [name] [options]
```

## 命令参考

| 命令 | 示例 | 说明 |
|------|------|------|
| `help` | `node scripts/halo.mjs help` | 显示帮助信息 |
| `list` | `node scripts/halo.mjs list` | 列出文章（默认20条） |
| `list` | `node scripts/halo.mjs list --limit=10 --page=2` | 分页列出，每页10条 |
| `list` | `node scripts/halo.mjs list --keyword=xxx` | 按关键词搜索 |
| `get` | `node scripts/halo.mjs get <name>` | 获取文章详情 |
| `create` | `node scripts/halo.mjs create --title=标题 --content=内容` | 创建文章（默认 PRIVATE + HTML 格式） |
| `create` | `node scripts/halo.mjs create --title=标题 --content=内容 --publish --public` | 创建并立即发布，公开可见 |
| `create` | `node scripts/halo.mjs create --title=标题 --content-file=path.html` | 从本地 HTML 文件创建 |
| `update` | `node scripts/halo.mjs update <name> --title=新标题` | 更新文章标题 |
| `update` | `node scripts/halo.mjs update <name> --content=新内容` | 更新文章内容 |
| `update` | `node scripts/halo.mjs update <name> --content-file=path.html` | 从本地 HTML 文件更新 |
| `delete` | `node scripts/halo.mjs delete <name>` | 删除文章 |
| `publish` | `node scripts/halo.mjs publish <name>` | 发布文章 |
| `unpublish` | `node scripts/halo.mjs unpublish <name>` | 取消发布 |
