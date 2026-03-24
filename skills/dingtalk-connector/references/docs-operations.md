---
name: docs-operations
description: 钉钉文档操作功能
---

# 文档操作

对钉钉文档进行创建、读取、写入等操作的功能。

## 功能特性

- 创建新文档
- 读取文档内容
- 追加/覆盖写入文档内容
- 搜索文档
- 管理文档成员权限

## 代码示例

```javascript
// 创建文档
const doc = await docs.createDoc(spaceId, "新文档", "# 初始内容");

// 读取文档
const content = await docs.readDoc(nodeId, operatorId);

// 追加内容
await docs.appendToDoc(docId, "\n## 新增内容");

// 更新文档
await docs.updateDoc(docId, "新的完整内容");
```

## 关键要点

- 需要适当的文档操作权限
- 文档操作需要有效的空间ID和节点ID
- 支持 Markdown 格式的文档内容
- 文档权限管理需要管理员权限