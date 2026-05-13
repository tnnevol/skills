# AI Agent 安装指南

本指南帮助 AI Agent 安装和配置 `chandao-cli` 及 `chandao` skill，以便通过自然语言操作禅道系统。

## 前置条件

- Node.js >= 18
- npm 或 pnpm
- 禅道实例访问权限

## 安装步骤

### 1. 安装 chandao-cli

```bash
# 全局安装（推荐）
npm install -g @tnnevol/chandao-cli

# 或使用 pnpm
pnpm add -g @tnnevol/chandao-cli

# 验证安装
chandao-cli version
```

### 2. 配置环境变量

创建配置文件 `~/.config/chandao/.env`：

```bash
mkdir -p ~/.config/chandao
cat > ~/.config/chandao/.env << 'EOF'
CHANDAO_URL=https://your-zentao-instance.com
CHANDAO_ACCOUNT=your-username
CHANDAO_PASSWORD=your-password
EOF
```

或导出环境变量：

```bash
export CHANDAO_URL=https://your-zentao-instance.com
export CHANDAO_ACCOUNT=your-username
export CHANDAO_PASSWORD=your-password
```

### 3. 安装 chandao skill

根据你使用的 Agent 平台，选择对应的安装方式：

#### Claw

```bash
npx skills add tnnevol/skills@chandao -g -y
```

#### Hermes

```bash
hermes skills install tnnevol/skills/skills/chandao -y
```

#### 手动安装（其他平台）

```bash
SKILL_DIR="${HOME}/.hermes/skills/chandao"
mkdir -p "$SKILL_DIR/references"

curl -fsSL "https://raw.githubusercontent.com/tnnevol/skills/main/skills/chandao/SKILL.md" \
  -o "$SKILL_DIR/SKILL.md"

curl -fsSL "https://raw.githubusercontent.com/tnnevol/skills/main/skills/chandao/references/setup.md" \
  -o "$SKILL_DIR/references/setup.md"

curl -fsSL "https://raw.githubusercontent.com/tnnevol/skills/main/skills/chandao/references/help.md" \
  -o "$SKILL_DIR/references/help.md"
```

### 4. 验证安装

```bash
# 验证 CLI
chandao-cli help

# 验证 skill（在 Agent 中执行）
# Agent 应能识别 /chandao 命令并调用 chandao-cli
```

## 使用示例

安装完成后，AI Agent 可以通过以下命令操作禅道：

```bash
# 查看帮助
/chandao help

# 列出用户
/chandao user list

# 列出产品
/chandao product list

# 列出项目
/chandao project list

# 查看 Bug 详情
/chandao bug get <bug-id>
```

## 故障排查

### 命令未找到

```
command not found: chandao-cli
```

**解决方案**：重新安装 CLI

```bash
npm install -g @tnnevol/chandao-cli
```

### 登录失败

```
Error: 登录失败
```

**解决方案**：检查配置文件

```bash
cat ~/.config/chandao/.env
# 确认 CHANDAO_URL、CHANDAO_ACCOUNT、CHANDAO_PASSWORD 正确
```

### Skill 未加载

Agent 无法识别 `/chandao` 命令。

**解决方案**：
1. 确认 skill 目录结构正确
2. 重启 Agent 或重新加载 skills
3. 检查 SKILL.md 格式是否正确

## 相关链接

- [chandao-cli npm](https://www.npmjs.com/package/@tnnevol/chandao-cli)
- [chandao skill 源码](https://github.com/tnnevol/skills/tree/main/skills/chandao)
- [禅道官网](https://www.zentao.net/)
