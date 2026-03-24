---
name: core-concepts
description: 钉钉文档系统核心概念
---

# 核心概念

了解钉钉文档系统的基本概念是进行有效操作的前提。

## 主要概念

- **知识库（Workspace）**：文档容器，有 `workspaceId` 和 `rootNodeId`
- **节点（Node）**：文件或文件夹，`type` 为 `FILE` 或 `FOLDER`
- **文档标识（用于 `/v1.0/doc/suites/documents/{id}`）**：可用 `docKey` 或 `dentryUuid`
  - 创建文档响应会返回：`docKey`、`dentryUuid`、`nodeId`
  - 其中 `docKey` / `dentryUuid` 可用于读写正文；`nodeId` 用于删除和文档管理类接口
  - `wiki/nodes` 返回的 `nodeId` 实际上是 `dentryUuid`，可直接用于正文读写
- **operatorId**：所有接口必须的 unionId 参数，通过辅助脚本自动转换

## 身份标识说明

| 标识 | 说明 |
|---|---|
| `userId`（= `staffId`） | 企业内部员工 ID，可通过管理后台 -> 通讯录 -> 成员管理 -> 点击姓名查看 |
| `unionId` | 跨企业/跨应用唯一标识，可通过辅助脚本获取 |

## 关键要点

- 所有操作都需要有效的 operatorId（unionId）
- 文档标识有多种形式，需要根据具体 API 要求使用正确的格式
- 知识库是文档的顶层容器