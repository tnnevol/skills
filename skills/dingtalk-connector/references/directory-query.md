---
name: directory-query
description: 钉钉目录查询功能
---

# 目录查询

查询钉钉用户和群组信息的功能。

## 功能特性

- 查询钉钉用户信息
- 查询钉钉群组信息
- 实时和静态目录查询
- 支持模糊搜索
- 用户和群组列表管理

## 代码示例

```javascript
// 查询用户列表
const users = await directory.listPeers({
  query: "张三",
  limit: 10
});

// 查询群组列表
const groups = await directory.listGroups({
  query: "项目组",
  limit: 10
});

// 实时查询用户列表
const liveUsers = await directory.listPeersLive({
  query: "销售部",
  limit: 20
});

// 实时查询群组列表
const liveGroups = await directory.listGroupsLive({
  query: "技术",
  limit: 20
});
```

## 查询类型

- `listPeers`: 查询用户列表（静态）
- `listGroups`: 查询群组列表（静态）
- `listPeersLive`: 实时查询用户列表
- `listGroupsLive`: 实时查询群组列表

## 查询参数

- `query`: 搜索关键词（可选）
- `limit`: 结果数量限制（可选）
- `accountId`: 账号ID（可选）

## 支持的查询

- 按姓名搜索用户
- 按群名称搜索群组
- 支持模糊匹配
- 支持精确匹配

## 关键要点

- 需要适当的目录查询权限
- 查询结果包含用户/群组的基本信息
- 实时查询返回最新的目录信息
- 静态查询可能使用缓存数据
- 搜索结果受权限限制影响
- 查询功能依赖于钉钉的用户目录服务