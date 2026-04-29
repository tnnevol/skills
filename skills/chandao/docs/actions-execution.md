# 执行/迭代管理

禅道 Skill 支持对执行/迭代（Execution）进行管理，支持列出、获取、创建、更新、删除、启动、暂停、关闭等操作。

## 列出执行

```bash
/memos list-execution [--project=<ID>] [--product=<ID>] [--status=<wait|doing|suspended|closed>] [--limit=<N>] [--offset=<N>]
```

**示例：**

```bash
# 列出所有执行
/memos list-execution

# 列出指定项目的执行
/memos list-execution --project=1

# 列出进行中的执行
/memos list-execution --status=doing

# 分页查询
/memos list-execution --limit=10 --offset=0
```

## 获取执行详情

```bash
/memos get-execution <execution_id>
```

**示例：**

```bash
/memos get-execution 2
```

## 创建执行

```bash
/memos create-execution --name=<name> --begin=<date> --end=<date> --project=<ID> --product=<ID> [--model=<水流程|敏捷|Scrum|看板>] [--desc=<描述>] [--owner=<负责人>]
```

**示例：**

```bash
/memos create-execution --name="2026年Q2迭代" --begin=2026-04-01 --end=2026-06-30 --project=1 --product=1 --model=agile --desc="Q2版本迭代"
```

## 更新执行

```bash
/memos update-execution <execution_id> [--name=<name>] [--begin=<date>] [--end=<date>] [--project=<ID>] [--product=<ID>] [--model=<水流程|敏捷|Scrum|看板>] [--desc=<描述>] [--owner=<负责人>]
```

**示例：**

```bash
/memos update-execution 2 --name="2026年Q2迭代（修订版）"
```

## 删除执行

```bash
/memos delete-execution <execution_id> [--dry-run]
```

**示例：**

```bash
/memos delete-execution 2
```

## 启动执行

```bash
/memos start-execution <execution_id>
```

**示例：**

```bash
/memos start-execution 2
```

## 暂停执行

```bash
/memos suspend-execution <execution_id>
```

**示例：**

```bash
/memos suspend-execution 2
```

## 关闭执行

```bash
/memos close-execution <execution_id>
```

**示例：**

```bash
/memos close-execution 2
```

## 执行状态说明

- `wait` - 待启动
- `doing` - 进行中
- `suspended` - 已暂停
- `closed` - 已结束

## 执行模式说明

- `waterfall` - 水流程
- `agile` - 敏捷
- `scrum` - Scrum
- `kanban` - 看板
