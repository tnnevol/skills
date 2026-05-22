# AI Agent 安装指南

本指南帮助 AI Agent 安装和配置 `halo-cli` 及 `halo` skill，以便通过自然语言管理 Halo 博客文章。

## 前置条件

- Node.js >= 18
- npm 或 pnpm
- Halo CMS 站点访问权限
- Personal Access Token (PAT)

## 安装步骤

### 1. 安装 halo-cli

```bash
# 全局安装（推荐）
npm install -g @tnnevol/halo-cli

# 或使用 pnpm
pnpm add -g @tnnevol/halo-cli

# 验证安装
halo-cli version
```

### 2. 配置环境变量

创建配置文件 `~/.config/halo/.env`：

```bash
mkdir -p ~/.config/halo
cat > ~/.config/halo/.env << 'EOF'
HALO_BASE_URL=https://your-halo-instance.com
HALO_PAT=pat_your-personal-access-token
EOF
```

或导出环境变量：

```bash
export HALO_BASE_URL=https://your-halo-instance.com
export HALO_PAT=pat_your-personal-access-token
```

### 3. 安装 halo skill

将 skill 目录复制到 Agent 的 skills 目录：

```bash
# 假设 Agent skills 目录为 ~/.hermes/skills/
SKILL_DIR="${HOME}/.hermes/skills/halo"

# 创建目录
mkdir -p "$SKILL_DIR/references"

# 下载 SKILL.md
curl -fsSL "https://raw.githubusercontent.com/tnnevol/skills/main/skills/halo/SKILL.md" \
  -o "$SKILL_DIR/SKILL.md"

# 下载参考文档（如有）
curl -fsSL "https://raw.githubusercontent.com/tnnevol/skills/main/skills/halo/references/setup.md" \
  -o "$SKILL_DIR/references/setup.md" 2>/dev/null || true
```

### 4. 验证安装

```bash
# 验证 CLI
halo-cli --help

# 验证 skill（在 Agent 中执行）
# Agent 应能识别 /halo 命令并调用 halo-cli
```

## 使用示例

安装完成后，AI Agent 可以通过以下命令管理 Halo 博客：

```bash
# 查看帮助
/halo help

# 列出文章
/halo list

# 查看文章详情
/halo get <article-name>

# 创建文章（Markdown）
/halo create --title="文章标题" --raw="# 内容\n\n正文内容..."

# 创建并发布文章
/halo create --title="文章标题" --raw="内容" --publish

# 创建公开文章
/halo create --title="文章标题" --raw="内容" --public

# 更新文章
/halo update <name> --title="新标题"
/halo update <name> --raw="新内容"

# 发布文章
/halo publish <name>

# 取消发布
/halo unpublish <name>

# 删除文章
/halo delete <name>
```

## 命令对照表

| 用户输入 | 实际执行 |
|---------|---------|
| `/halo help` | `halo-cli help` |
| `/halo list` | `halo-cli list` |
| `/halo get <name>` | `halo-cli get <name>` |
| `/halo create --title=... --raw=...` | `halo-cli create --title=... --raw=...` |
| `/halo update <name> ...` | `halo-cli update <name> ...` |
| `/halo delete <name>` | `halo-cli delete <name>` |
| `/halo publish <name>` | `halo-cli publish <name>` |
| `/halo unpublish <name>` | `halo-cli unpublish <name>` |

## 故障排查

### 命令未找到

```
command not found: halo-cli
```

**解决方案**：重新安装 CLI

```bash
npm install -g @tnnevol/halo-cli
```

### 认证失败

```
Error: 401 Unauthorized
```

**解决方案**：检查 PAT 配置

```bash
cat ~/.config/halo/.env
# 确认 HALO_BASE_URL 和 HALO_PAT 正确
# 确认 PAT 未过期且有足够权限
```

### Skill 未加载

Agent 无法识别 `/halo` 命令。

**解决方案**：
1. 确认 skill 目录结构正确
2. 重启 Agent 或重新加载 skills
3. 检查 SKILL.md 格式是否正确

### Markdown 转换问题

创建文章时内容格式异常。

**解决方案**：
- 使用 `--raw` 参数传入 Markdown 内容（自动转 HTML）
- 使用 `--content` 参数传入预渲染的 HTML 内容
- 确保 Markdown 语法正确

## 相关链接

- [halo-cli npm](https://www.npmjs.com/package/@tnnevol/halo-cli)
- [halo skill 源码](https://github.com/tnnevol/skills/tree/main/skills/halo)
- [Halo 官网](https://halo.run)
- [Halo 文档](https://docs.halo.run)
