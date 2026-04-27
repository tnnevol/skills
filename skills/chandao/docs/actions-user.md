# Actions — User

## 列出用户

```bash
node scripts/api.cjs get /users --limit=20
```

**查询参数：**
| 参数 | CLI flag | 描述 |
|------|----------|------|
| browseType | `--browseType=inside\|outside` | 内部/外部用户 |
| orderBy | `--orderBy=id_asc\|realname_asc\|account_asc` | 排序方式 |
| recPerPage | `--limit=N` | 每页数量（默认 20，最大 1000） |
| pageID | `--page=N` | 页码（从 1 开始） |

**响应字段（users[]）：**
id, company, type, dept, account, role, realname, superior, email, mobile, phone, weixin, dingding, status, createdDate 等

## 获取用户详情

```bash
node scripts/api.cjs get /users/:id
```

返回单个用户的完整信息。
