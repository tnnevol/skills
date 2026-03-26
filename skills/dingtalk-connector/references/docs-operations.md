---
name: docs-operations
description: 钉钉文档操作功能
---

# 文档操作

对钉钉文档进行创建、读取、追加、搜索、列举等操作的功能。

## 功能特性

- 创建新文档
- 读取文档内容
- 追加内容到现有文档
- 搜索文档
- 列出空间下的文档
- 获取文档元信息

## 代码示例

```javascript
// 创建文档
const doc = await docs.createDoc(spaceId, "新文档", "# 初始内容");

// 读取文档内容
const content = await docs.readDoc(nodeId, operatorId);

// 追加内容到文档
await docs.appendToDoc(docId, "\n## 新增内容");

// 搜索文档
const docsList = await docs.searchDocs("关键词", spaceId);

// 列出空间下的文档
const docsList = await docs.listDocs(spaceId);

// 获取文档信息
const docInfo = await docs.getDocInfo(spaceId, docId);
```

## 关键要点

- 需要适当的文档操作权限
- 文档操作需要有效的空间ID和节点ID
- 支持 Markdown 格式的文档内容
- 搜索功能支持关键词搜索
- 文档操作依赖于有效的访问令牌
- 操作员ID（operatorId）通常是用户的unionId