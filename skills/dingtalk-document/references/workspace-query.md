---
name: workspace-query
description: 查询知识库和节点信息
---

# 查询知识库

查询钉钉知识库和节点信息的功能。

## 功能特性

- 查询知识库列表
- 查询知识库详细信息
- 查询节点列表
- 查询单个节点信息
- 通过 URL 查询节点

## 代码示例

```bash
#!/bin/bash
set -e
HELPER="./scripts/dt_helper.sh"
NEW_TOKEN=$(bash "$HELPER" --token)
OPERATOR_ID=$(bash "$HELPER" --get DINGTALK_MY_OPERATOR_ID)

# 查询知识库列表
WORKSPACES=$(curl -s -X GET "https://api.dingtalk.com/v2.0/wiki/workspaces?operatorId=${OPERATOR_ID}&maxResults=20" \
  -H "x-acs-dingtalk-access-token: $NEW_TOKEN")
echo "知识库列表: $WORKSPACES"
```

## API 调用方法

使用以下命令从 API 参考中提取详细信息：

```bash
# 查询知识库列表
grep -A 30 "^## 1. 查询知识库列表" references/api.md

# 查询知识库信息
grep -A 10 "^## 2. 查询知识库信息" references/api.md

# 查询节点列表
grep -A 35 "^## 3. 查询节点列表" references/api.md

# 查询单个节点
grep -A 10 "^## 4. 查询单个节点" references/api.md

# 通过 URL 查询节点
grep -A 15 "^## 5. 通过 URL 查询节点" references/api.md
```

## 关键要点

- 需要有效的 operatorId
- 知识库查询通常需要分页处理
- 节点信息包含类型（文件/文件夹）信息