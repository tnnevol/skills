# Actions — Product

## 列出产品

```bash
node scripts/api.cjs get /products --limit=20
```

**查询参数：**
| 参数 | CLI flag | 描述 |
|------|----------|------|
| browseType | `--browseType=all\|noclosed\|closed` | 全部/未关闭/已关闭 |
| orderBy | `--orderBy=id_asc\|title_asc\|begin_asc\|end_asc` | 排序方式 |
| recPerPage | `--limit=N` | 每页数量（默认 20，最大 1000） |
| pageID | `--page=N` | 页码（从 1 开始） |

**响应核心字段（products[]）：**
id, program, name, code, type, status, PO(负责人), QD(测试负责人), createdDate, latestRelease, projects, executions 等

## 获取产品详情

```bash
node scripts/api.cjs get /products/:id
```

返回单个产品的完整信息，包括关联项目、执行、需求、Bug 等统计信息。
