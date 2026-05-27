# 史诗管理命令

## ⚠️ 重要：spec/verify 字段格式要求

史诗描述（`--spec`）和验收标准（`--verify`）字段**必须使用 HTML 格式**，不可使用 Markdown。

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
| `/chandao epic list --product <id> [--browse <type>] [--limit N] [--page N]` | 列出史诗（**必须**指定 `--product`） |
| `/chandao epic list-by-product --product <id> [--browse <type>] [--limit N] [--page N]` | 按产品列出史诗 |
| `/chandao epic get <id>` | 史诗详情 |
| `/chandao epic create --product <id> --title <title> [--spec <desc>] [--verify <criteria>] [--module <id>] [--pri 1-4] [--source <source>] [--assigned <user>] [--estimate <hours>]` | 创建史诗 |
| `/chandao epic update <id> [--title <title>] [--desc <desc>] [--module <id>] [--pri 1-4] [--assigned <user>] [--status <status>]` | 更新史诗 |
| `/chandao epic change <id> --reviewer <account> [--title <title>] [--spec <desc>] [--verify <criteria>]` | 变更史诗（**必须**指定 `--reviewer`） |
| `/chandao epic close <id> --reason done\|duplicate\|postponed\|willnotfix\|bydesign` | 关闭史诗（**必须**指定 `--reason`） |
| `/chandao epic activate <id>` | 激活已关闭的史诗 |
| `/chandao epic delete <id>` | 删除史诗 |

### ⚠️ 更新操作前必须先获取当前值

**问题**：禅道 API 的 PUT 请求会将未包含的字段重置为默认值。

**正确流程**：
1. 先执行 `<module> get <id>` 获取当前值
2. 保留需要保持不变的字段值
3. 只修改需要更新的字段
4. 将所有字段一起发送更新请求

**详见**：`references/pitfalls.md` 第 23 条
