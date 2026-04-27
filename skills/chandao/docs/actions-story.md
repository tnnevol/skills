# Actions — Story（需求管理）

## 需求列表

```bash
node scripts/actions/story.cjs list-story --product=1 --limit=20
```

**查询参数：**
| 参数 | CLI flag | 描述 |
|------|----------|------|
| product | `--product=N` | 所属产品 ID |
| project | `--project=N` | 所属项目 ID |
| status | `--status=active\|changed\|closed` | 状态筛选 |
| assignedTo | `--assignedTo=xxx` | 指派给 |
| priority | `--priority=1\|2\|3\|4` | 优先级（1=紧急，4=低） |
| recPerPage | `--limit=N` | 每页数量（默认 20，最大 1000） |
| pageID | `--page=N` | 页码（从 1 开始） |

**响应核心字段（stories[]）：**
id, title, product, productName, pri, status, assignedTo, createdBy, createdDate, spec, estimate, consumed

## 需求详情

```bash
node scripts/actions/story.cjs get-story 123
```

## 创建需求

```bash
node scripts/actions/story.cjs create-story --product=1 --title="需求标题" --spec="详细描述" --priority=3
```

**必填参数：**
- `--product=N` — 所属产品 ID
- `--title=xxx` — 需求标题（2-100 字符）

**可选参数：**
- `--spec=xxx` — 需求描述
- `--priority=N` — 优先级（1-4，默认 3）
- `--assignedTo=xxx` — 指派给
- `--module=N` — 所属模块
- `--estimate=N` — 预计工时
- `--project=N` — 所属项目
- `--execution=N` — 所属执行
- `--category=xxx` — 分类（feature/interface/performance/safe/experience/improve/other）
- `--source=xxx` — 来源（customer/user/po/market/service/operation/support/competitor/partner/dev/tester/bug/forum/other）

## 更新需求

```bash
node scripts/actions/story.cjs update-story 123 --title="新标题" --priority=2
```

**可选参数：**
- `--title=xxx` — 标题（2-100 字符）
- `--spec=xxx` — 描述
- `--priority=N` — 优先级（1-4）
- `--assignedTo=xxx` — 指派给
- `--module=N` — 所属模块
- `--estimate=N` — 预计工时

## 评审需求

```bash
node scripts/actions/story.cjs review-story 123 --result=pass --reason="描述清晰"
```

**必填参数：**
- `--result=pass|reject` — 评审结果

**可选参数：**
- `--reason=xxx` — 评审意见

## 关闭需求

```bash
node scripts/actions/story.cjs close-story 123 --reason="已完成" --yes
```

**可选参数：**
- `--reason=xxx` — 关闭原因
- `--yes` — 跳过二次确认
