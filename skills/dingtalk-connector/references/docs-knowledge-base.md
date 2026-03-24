---
name: docs-knowledge-base
description: 钉钉知识库管理功能
---

# 知识库管理

管理和操作钉钉知识库及其文档结构的功能。

## 功能特性

- 列举知识库中的文档
- 创建和删除知识库
- 管理知识库结构和层级
- 批量文档操作

## 代码示例

```javascript
// 列举知识库中的文档
const documents = await docs.listDocs(spaceId);

// 获取知识库信息
const spaceInfo = await docs.getSpaceInfo(spaceId);
```

## 关键要点

- 需要知识库管理权限
- 知识库操作会影响整个团队的文档访问
- 支持多种文档格式
- 知识库结构需要合理规划以提高检索效率