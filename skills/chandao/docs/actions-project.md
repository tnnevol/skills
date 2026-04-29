# Actions — Project

## 列出项目

```bash
node scripts/api.cjs get /projects --limit=20
```

**查询参数：**
| 参数 | CLI flag | 描述 |
|------|----------|------|
| browseType | `--browseType=all\|undone\|wait\|doing` | 全部/未完成/未开始/进行中 |
| orderBy | `--orderBy=id_asc\|name_asc\|begin_asc\|end_asc` | 排序方式 |
| recPerPage | `--limit=N` | 每页数量（默认 20，最大 1000） |
| pageID | `--page=N` | 页码（从 1 开始） |

**响应核心字段（projects[]）：**
id, model(scrum/waterfall/kanban), type, name, code, begin, end, status, progress, PM(负责人), PO, QD, RD, parent(所属项目集), storyCount, executionCount, teamCount 等

## 获取项目详情

```bash
node scripts/api.cjs get /projects/:id
```

返回单个项目的完整信息，包括关联产品、执行、需求、任务等统计信息。
