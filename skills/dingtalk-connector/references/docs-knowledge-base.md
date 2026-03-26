---
name: docs-knowledge-base
description: 钉钉知识库管理功能
---

# 知识库管理

管理钉钉知识库和文档结构的功能。

## 功能特性

- 创建和管理钉钉知识库空间
- 管理文档层级结构
- 搜索和检索知识库内容
- 文档分类和标签管理
- 知识库权限管理

## 代码示例

```javascript
// 列出空间下的文档
const docs = await docs.listDocs(spaceId);

// 列出空间下的文档（包括子目录）
const docsRecursive = await docs.listDocs(spaceId, parentId);

// 搜索知识库中的文档
const searchResults = await docs.searchDocs("关键词", spaceId);

// 获取文档详细信息
const docInfo = await docs.getDocInfo(spaceId, docId);
```

## 知识库结构

- 空间（Space）: 知识库的顶级容器
- 文档（Document）: 知识库中的具体内容
- 目录（Directory）: 用于组织文档的文件夹结构
- 节点（Node）: 知识库中的各种元素（文档、目录等）

## 管理功能

- 空间管理：创建、删除、修改知识库空间
- 文档管理：创建、编辑、删除知识库文档
- 层级管理：组织文档的目录结构
- 权限管理：控制知识库访问权限

## 搜索功能

- 关键词搜索：在指定空间中搜索相关内容
- 高级搜索：支持更复杂的搜索条件
- 结果排序：按相关性或其他标准排序

## 关键要点

- 需要适当的知识库管理权限
- 知识库操作需要有效的空间ID
- 支持层次化的文档组织结构
- 搜索功能可以帮助快速定位信息
- 权限管理确保知识库安全性
- 文档类型支持多种格式（文档、表格等）