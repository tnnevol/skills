# 查询类命令文档

## 用户模块

### `/chandao users` — 列出用户

```bash
node scripts/actions/query.cjs users [--page=N] [--limit=N] [--browseType=inside|outside]
```

**输出格式**：表格

```
| 账号    | 姓名   | 角色   | 部门   | 手机        |
|---------|--------|--------|--------|-------------|
| admin   | 管理员 | admin  | 技术部 | 138****5678 |
| zhangsan| 张三   | dev    | 开发部 | 139****1234 |
```

**参数**：
- `--page=N` — 页码，默认 1
- `--limit=N` — 每页数量，默认 20
- `--browseType=inside` — 内部用户（默认），`outside` 外部用户

### `/chandao user <id>` — 用户详情

```bash
node scripts/actions/query.cjs user <user_id>
```

**输出格式**：卡片

```
📋 用户: 张三
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  账号: zhangsan
  姓名: 张三
  角色: dev
  部门: 开发部
  手机: 139****1234
  邮箱: zha***@example.com
  加入日期: 2024-01-15
  状态: 正常
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 产品模块

### `/chandao products` — 列出产品

```bash
node scripts/actions/query.cjs products [--page=N] [--limit=N] [--browseType=all|noclosed|closed]
```

**输出格式**：表格

```
| ID | 名称       | 类型   | 负责人 | 状态   |
|----|------------|--------|--------|--------|
| 1  | 禅道开源版 | normal | admin  | normal |
| 2  | 禅道企业版 | normal | zhangs | normal |
```

### `/chandao product <id>` — 产品详情

```bash
node scripts/actions/query.cjs product <product_id>
```

**输出格式**：卡片

```
📋 产品: 禅道开源版
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ID: 1
  名称: 禅道开源版
  类型: normal
  状态: 正常
  负责人: admin
  测试负责人: lisi
  发布负责人: wangwu
  创建时间: 2024-01-01
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 项目模块

### `/chandao projects` — 列出项目

```bash
node scripts/actions/query.cjs projects [--page=N] [--limit=N] [--browseType=all|undone|wait|doing]
```

**输出格式**：表格

```
| ID | 名称       | 模式   | 起止时间        | 状态   |
|----|------------|--------|-----------------|--------|
| 1  | 禅道15.0   | scrum  | 2024-01-01 ~    | doing  |
| 2  | 禅道16.0   | scrum  | 2024-03-01 ~    | wait   |
```

### `/chandao project <id>` — 项目详情

```bash
node scripts/actions/query.cjs project <project_id>
```

**输出格式**：卡片

```
📋 项目: 禅道15.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ID: 1
  名称: 禅道15.0
  模式: scrum
  类型: project
  状态: 进行中
  开始日期: 2024-01-01
  结束日期: 2024-12-31
  项目负责人: admin
  进度: 65%
  团队人数: 8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
