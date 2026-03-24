---
name: directory-query
description: 钉钉目录查询功能
---

# 目录查询

查询钉钉用户和群组信息的功能。

## 功能特性

- 查询钉钉用户列表
- 查询钉钉群组列表
- 获取用户/群组详细信息
- 搜索特定用户或群组

## 代码示例

```javascript
// 获取用户列表
const users = await directory.listPeers();

// 获取群组列表  
const groups = await directory.listGroups();

// 获取特定用户信息
const userInfo = await directory.getUserInfo(userId);

// 获取特定群组信息
const groupInfo = await directory.getGroupInfo(groupId);
```

## 关键要点

- 需要有相应的目录查询权限
- 返回的用户和群组信息可能受限于隐私设置
- 用户和群组 ID 是进行其他操作的关键标识符
- 某些信息可能需要额外的权限才能获取