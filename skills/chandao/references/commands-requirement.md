# 用户需求管理命令

## ⚠️ 重要：spec/verify 字段格式要求

用户需求描述（`--spec`）和验收标准（`--verify`）字段**必须使用 HTML 格式**，不可使用 Markdown。

**正确示例：**
```html
<h2>目标</h2>
<p>实现用户登录功能</p>
<h3>功能要求</h3>
<ul>
<li>支持用户名/密码登录</li>
<li>支持邮箱登录</li>
</ul>
```

**错误示例（不可使用）：**
```markdown
# 目标
实现用户登录功能
### 功能要求
- 支持用户名/密码登录
- 支持邮箱登录
```

---

| 命令 | 描述 |
|------|------|
| `/chandao requirement list --product <id> [--browse <type>] [--limit N] [--page N]` | 列出用户需求（**必须**指定 `--product`） |
| `/chandao requirement list-by-product --product <id> [--browse <type>] [--limit N] [--page N]` | 按产品列出用户需求 |
| `/chandao requirement get <id>` | 用户需求详情 |
| `/chandao requirement create --product <id> --title <title> [--spec <desc>] [--verify <criteria>] [--module <id>] [--pri 1-4] [--source <source>] [--assigned <user>] [--estimate <hours>]` | 创建用户需求 |
| `/chandao requirement update <id> [--title <title>] [--desc <desc>] [--module <id>] [--pri 1-4] [--assigned <user>] [--status <status>]` | 更新用户需求 |
| `/chandao requirement change <id> --reviewer <account> [--title <title>] [--spec <desc>] [--verify <criteria>]` | 变更需求（**必须**指定 `--reviewer`） |
| `/chandao requirement close <id> --reason done\|duplicate\|postponed\|willnotfix\|bydesign` | 关闭用户需求（**必须**指定 `--reason`） |
| `/chandao requirement activate <id>` | 激活已关闭的需求 |
| `/chandao requirement delete <id>` | 删除用户需求 |
