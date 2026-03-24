---
name: document-management
description: 钉钉文档管理操作
---

# 文档管理

管理钉钉文档的操作，包括删除等。

## 功能特性

- 删除文档
- 文档属性管理

## API 调用方法

使用以下命令从 API 参考中提取详细信息：

```bash
# 删除文档
grep -A 10 "^## 7. 删除文档" references/api.md
```

## 管理流程

1. 确保必要的配置已设置
2. 获取有效的访问令牌
3. 使用 nodeId 标识目标文档（注意：删除操作使用 nodeId，不是 docKey）
4. 调用相应的管理 API

## 关键要点

- 删除操作使用 nodeId，而不是 docKey 或 dentryUuid
- nodeId 通常在创建文档或节点查询时获得
- 删除操作不可逆，请谨慎使用
- 管理操作需要相应的文档管理权限