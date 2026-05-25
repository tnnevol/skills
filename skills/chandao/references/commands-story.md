# 需求管理命令

## ⚠️ 重要：spec/verify 字段格式要求

需求描述（`--spec`）和验收标准（`--verify`）字段**必须使用 HTML 格式**，不可使用 Markdown。

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
| `/chandao story list [--product <id>] [--project <id>] [--execution <id>] [--browse-type all\|unclosed\|bysearch] [--order-by <field>] [--limit N] [--page N]` | 列出需求（支持按产品/项目/执行筛选） |
| `/chandao story get <id>` | 获取需求详情 |
| `/chandao story create --product <id> --title <title> [--spec <desc>] [--verify <criteria>] [--module <id>] [--parent <id>] [--pri 1-4] [--category <type>] [--source <source>] [--assigned <user>] [--reviewer <account>] [--estimate <hours>] [--project <id>] [--execution <id>]` | 创建需求 |
| `/chandao story update <id> [--title <title>] [-S <spec>] [--module <id>] [--parent <id>] [--pri 1-4] [--category <type>] [--source <source>] [--assigned <user>] [--status <status>]` | 更新需求 |
| `/chandao story review <id> --result pass\|reject\|revert [--comment <text>]` | 评审需求 |
| `/chandao story close <id> --reason done\|subdivided\|duplicate\|postponed\|willnotdo\|cancel\|bydesign [--comment <text>]` | 关闭需求（**必须**指定 `--reason`） |
| `/chandao story activate <id> [--assigned <user>] [--comment <text>]` | 激活已关闭的需求 |
| `/chandao story delete <id>` | 删除需求 |
| `/chandao story change <id> --reviewer <account> [--title <title>] [--spec <desc>] [--verify <criteria>]` | 变更需求（**必须**指定 `--reviewer`） |
