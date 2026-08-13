---
title: memos
name: memos
description: 通过安全脚本操作自建时间线式笔记服务，支持笔记、标签、评论、附件、分享和关联。
compatibility:
  runtime: node >= 18（或 bun、deno）
  dependencies: 无（使用原生 fetch）
  environment: MEMOS_BASE_URL、MEMOS_ACCESS_TOKEN
---

# memos

Memos 是时间线式笔记服务，不使用文件夹组织笔记，适合快速记录、稍后整理和按标签检索。

## 安装

```bash
npx skills add tnnevol/skills --skill=memos -g -y
```

配置 Memos 地址和访问令牌：

```bash
export MEMOS_BASE_URL="https://your-memos.example.com"
export MEMOS_ACCESS_TOKEN="your-access-token"
```

## 使用

首次使用先配置环境变量，确认环境变量可用。所有接口调用必须通过技能脚本完成，不要直接使用 `curl` 或其他客户端访问服务。

根据用户意图选择对应操作并执行：

```text
查看笔记 → 笔记操作
添加评论 → 评论操作
上传附件 → 附件操作
创建分享 → 分享操作
```

没有明确操作时先展示帮助；删除笔记、附件或分享前确认目标。笔记优先使用标签整理，不要按文件夹思路引导用户。

## 功能

- 笔记：列表、过滤、创建、查询、更新、删除和置顶。
- 标签：查询标签、按标签筛选和维护标签。
- 评论：查看、添加、更新和删除评论。
- 用户：查看当前用户和用户统计。
- 附件：查询、上传、关联、删除和批量删除附件；上传前按服务要求获取存储策略和分组信息。
- 分享：创建、查询和撤销分享链接。
- 表情与关联：添加、切换、取消表情，建立和解除笔记关联。
- 安全处理：统一认证、错误处理、敏感信息清理和脚本化调用。

常见意图包括“记录想法”“查看我的笔记”“显示标签”“给笔记添加评论”“上传附件”“分享这条笔记”等，技能会将自然语言映射到对应操作。
