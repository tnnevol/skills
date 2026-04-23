---
name: zentao
description: Assistant for 禅道 (ZenTao) project management system via RESTful API v2. Use when the user asks about 禅道, lists/creates/updates projects, products, users, tasks, bugs, or manages project workflows via natural language commands.
---

# SKILL: 禅道 (ZenTao) Skill

让 AI Agent 通过自然语言操作禅道系统，实现项目管理全流程自动化。

基于禅道官方 RESTful API v2.0。

## 如何执行

1. **首次使用** — 读 `docs/setup.md` 了解环境变量配置
2. **认证自动管理** — 首次请求自动登录，Token 缓存，过期自动刷新
3. **匹配命令** — 从下方命令表中匹配用户意图
4. **执行脚本** — 通过 `scripts/actions/query.cjs` 执行对应操作

## 环境变量

```bash
export CHANDAO_URL=https://your-chandao.com
export CHANDAO_ACCOUNT=admin
export CHANDAO_PASSWORD=your-password
```

## P0 命令清单

| 命令 | 描述 | 输出格式 |
|------|------|----------|
| `/chandao users [--page=N] [--limit=N]` | 列出用户 | 表格：账号\|姓名\|角色\|部门\|手机 |
| `/chandao products [--page=N] [--limit=N]` | 列出产品 | 表格：ID\|名称\|类型\|负责人\|状态 |
| `/chandao projects [--page=N] [--limit=N]` | 列出项目 | 表格：ID\|名称\|模式\|起止\|状态 |
| `/chandao user <id>` | 用户详情 | 卡片（含联系方式、部门等） |
| `/chandao product <id>` | 产品详情 | 卡片（含负责人、创建时间等） |
| `/chandao project <id>` | 项目详情 | 卡片（含进度、团队、负责人等） |

## 意图识别规则

**列表类：**
- "查用户" / "用户列表" / "有哪些用户" → `users`
- "查产品" / "产品列表" / "有哪些产品" → `products`
- "查项目" / "项目列表" / "有哪些项目" → `projects`

**详情类：**
- "用户详情" / "看看用户 X" → `user <id>`
- "产品详情" / "看看产品 X" → `product <id>`
- "项目详情" / "看看项目 X" → `project <id>`

**翻页：**
- "下一页" / "第 2 页" → `--page=2`
- "显示 50 条" → `--limit=50`

## 认证说明

- Token 由系统自动获取和管理，用户无需手动操作
- 首次请求自动登录，Token 缓存到本地文件
- Token 过期后自动重新登录，用户无感知
- 如遇 401 错误，会自动重试

## 脱敏规则

- 密码、Token → `***`
- 手机号 → `138****5678`（保留前3后4）
- 邮箱 → `tes***@test.com`（保留前3字符 + @域名）

## 目录结构

```
zentao/
├── SKILL.md                    # 本文件：主入口 + 命令定义
├── scripts/
│   ├── api.cjs                 # HTTP 请求封装
│   ├── auth.cjs                # Token 管理
│   ├── sanitize.cjs            # 脱敏
│   ├── env.cjs                 # 环境变量加载
│   └── actions/
│       └── query.cjs           # 6 个查询命令
├── docs/
│   ├── setup.md                # 安装配置
│   └── actions-query.md        # 查询命令文档
└── references/
    └── api-mapping.md          # API 映射表
```

## 错误处理

- 配置缺失 → 提示用户设置环境变量
- 登录失败 → 提示检查账号密码
- 无数据 → "📭 暂无数据"
- 网络错误 → 友好提示，不暴露内部错误
