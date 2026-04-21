# 禅道 Skill — 安装配置指南

## 1. 环境变量

需要配置 3 个环境变量：

```bash
export CHANDAO_URL=https://your-chandao.com
export CHANDAO_ACCOUNT=your-account
export CHANDAO_PASSWORD=your-password
```

**推荐方式**：在 shell 配置文件（`.bashrc` / `.zshrc`）中设置。

**替代方式**：在 skill 目录创建 `.env` 文件（确保已加入 `.gitignore`）：

```env
CHANDAO_URL=https://your-chandao.com
CHANDAO_ACCOUNT=admin
CHANDAO_PASSWORD=your-password
```

## 2. 认证说明

Token 由系统自动管理，用户无需手动操作：

- **首次请求** — 自动用账号密码登录，获取 Token
- **Token 缓存** — 保存到本地文件，跨会话复用
- **自动刷新** — Token 过期后自动重新登录，用户无感知

## 3. 验证安装

```bash
# 检查认证
cd skills/chandao/scripts
node auth.cjs status

# 测试登录
node auth.cjs login

# 测试查询
node actions/query.cjs users
node actions/query.cjs products
node actions/query.cjs projects
```

## 4. 安全注意事项

- **不要提交** `.env` 文件到版本库
- **不要暴露** Token 值
- **脱敏输出** — 密码、手机号、邮箱自动打码

## 5. 常见问题

| 问题 | 解决 |
|------|------|
| `CONFIG_MISSING` | 检查环境变量是否设置正确 |
| 登录失败 | 确认账号密码是否正确 |
| Token 过期 | 系统自动刷新，无需手动操作 |
| 无数据 | 确认账号有对应模块的查看权限 |
