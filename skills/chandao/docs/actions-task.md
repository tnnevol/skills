# Actions — Task（任务管理）

## 任务列表

```bash
node scripts/actions/task.cjs list-task --project=1 --limit=20
```

**查询参数：**
| 参数 | CLI flag | 描述 |
|------|----------|------|
| project | `--project=N` | 所属项目 ID |
| assignedTo | `--assignedTo=xxx` | 指派给 |
| type | `--type=design\|devel\|test\|study\|discuss\|bug` | 任务类型 |
| status | `--status=wait\|doing\|done\|canceled` | 任务状态 |
| recPerPage | `--limit=N` | 每页数量（默认 20，最大 1000） |
| pageID | `--page=N` | 页码（从 1 开始） |

**响应核心字段（tasks[]）：**
id, name, project, projectName, type, assignedTo, status, progress, deadline, openedBy, openedDate, estStarted, realStarted, finishedBy, finishedDate, closedBy, closedDate, cancelDate

## 任务详情

```bash
node scripts/actions/task.cjs get-task 123
```

## 创建任务

```bash
node scripts/actions/task.cjs create-task --project=1 --name="任务标题" --type=devel --assignedTo=zhangsan
```

**必填参数：**
- `--project=N` — 所属项目 ID
- `--name=xxx` — 任务名称（2-50 字符）
- `--type=xxx` — 任务类型（design/devel/test/study/discuss/bug）
- `--assignedTo=xxx` — 指派给（用户名）

**可选参数：**
- `--desc=xxx` — 任务描述
- `--status=xxx` — 初始状态（wait/doing/done/canceled，默认 wait）
- `--priority=1\|2\|3\|4` — 优先级（1=紧急，4=低，默认 3）
- `--estimate=N` — 预计工时（小时）
- `--deadline=YYYY-MM-DD` — 截止日期
- `--order=N` — 排序权重（同 AssginTo 下的排序号）

## 更新任务

```bash
node scripts/actions/task.cjs update-task 123 --name="新标题" --priority=2
```

**可选参数：**
- `--name=xxx` — 任务名称（2-50 字符）
- `--desc=xxx` — 任务描述
- `--type=xxx` — 任务类型
- `--assignedTo=xxx` — 指派给
- `--status=xxx` — 任务状态
- `--priority=1\|2\|3\|4` — 优先级
- `--estimate=N` — 预计工时
- `--deadline=YYYY-MM-DD` — 截止日期
- `--finishedDate=YYYY-MM-DD` — 完成日期
- `--closedBy=xxx` — 关闭人
- `--closedDate=YYYY-MM-DD` — 关闭日期

## 关闭任务

```bash
node scripts/actions/task.cjs close-task 123 --reason="已完成" --yes
```

**可选参数：**
- `--reason=xxx` — 关闭原因
- `--yes` — 跳过二次确认

## 删除任务

```bash
node scripts/actions/task.cjs delete-task 123
```

---

## 校验层文档

请参考 `scripts/validate.cjs` 中的校验器：

| 校验器 | 用途 | 示例 |
|--------|------|------|
| `required(value, fieldName)` | 必填校验 | `required(id, '任务 ID')` |
| `length(value, fieldName, min, max)` | 长度校验 | `length(name, '任务名称', 2, 50)` |
| `email(value, fieldName)` | 邮箱格式校验 | `email(email, '邮箱')` |
| `date(value, fieldName)` | 日期格式校验 | `date(deadline, '截止日期')` |
| `enumVal(value, fieldName, allowedValues)` | 枚举值校验 | `enumVal(type, '类型', ['devel', 'test'])` |
| `range(value, fieldName, min, max)` | 数字范围校验 | `range(priority, '优先级', 1, 4)` |
| `id(value, fieldName)` | ID 格式校验 | `id(taskId, '任务 ID')` |

**使用示例：**
```javascript
const { validate, required, length, enum: enumVal } = require('../validate.cjs');

validate({
  name: { validator: required, args: ['任务名称'] },
  type: { validator: enumVal, args: ['任务类型', ['devel', 'test']] },
  estimate: { validator: range, args: ['预计工时', 0, 999] }
});
```
