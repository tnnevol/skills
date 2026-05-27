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
| `/chandao story close <id> --reason done\|subdivided\|duplicate\|postponed\|willnotdo\|cancel\|bydesign [--comment <text>]` | 关闭需求（**必须**指定 `--reason`） |
| `/chandao story activate <id> [--assigned <user>] [--comment <text>]` | 激活已关闭的需求 |
| `/chandao story delete <id>` | 删除需求 |
| `/chandao story change <id> --reviewer <account> [--title <title>] [--spec <desc>] [--verify <criteria>]` | 变更需求（**必须**指定 `--reviewer`） |

### ⚠️ 更新需求前必须先获取当前值

**问题**：禅道 API 的 PUT 请求会将未包含的字段重置为默认值。例如：需求优先级为2，只更新标题后优先级会变成默认值3。

**正确流程**：
1. 先执行 `story get <id>` 获取当前需求的所有字段值
2. 保留需要保持不变的字段值
3. 只修改需要更新的字段
4. 将所有字段一起发送更新请求

**示例**：
```bash
# 1. 获取当前需求
chandao story get 38
# 返回: {"pri": 2, "title": "原标题", "category": "feature", ...}

# 2. 更新标题时，保留优先级等其他字段
chandao story update 38 --title "新标题" --pri 2 --category feature
```

**错误示例（会导致字段被覆盖）**：
```bash
# ❌ 只更新标题，优先级会被重置为默认值3
chandao story update 38 --title "新标题"
```

### 字段枚举值

| 字段 | 枚举值 | 说明 |
|------|--------|------|
| `--category` | `feature` 功能 · `interface` 接口 · `performance` 性能 · `safe` 安全 · `experience` 体验 · `improve` 改进 · `other` 其他 | 需求类别 |
| `--source` | `customer` 客户 · `user` 用户 · `po` 产品经理 · `market` 市场 · `service` 客服 · `operation` 运营 · `support` 技术支持 · `competitor` 竞争对手 · `partner` 合作伙伴 · `dev` 开发人员 · `tester` 测试人员 · `bug` · `forum` 论坛 · `other` 其他 | 需求来源 |
| `--pri` | `1` 紧急 · `2` 高 · `3` 中 · `4` 低 | 优先级（默认 3） |
| `--reason` | `done` 已完成 · `subdivided` 已细分 · `duplicate` 重复 · `postponed` 延期 · `willnotdo` 不做 · `cancel` 取消 · `bydesign` 设计如此 | 关闭原因（close 时必填） |
