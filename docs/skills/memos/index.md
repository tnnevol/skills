---
title: memos
name: memos
description: 通过 memos-cli 操作自建时间线式笔记服务，支持笔记、标签、评论、附件、分享、表情、关联和空间。
compatibility:
  runtime: node >= 20（memos-cli）
  dependencies: '@tnnevol/memos-cli'
  environment: MEMOS_BASE_URL、MEMOS_ACCESS_TOKEN
---


# memos

Memos 是时间线式笔记服务，不使用文件夹组织笔记，适合快速记录、稍后整理和按标签检索。

## 安装

```bash
# 安装技能
npx skills add tnnevol/skills --skill=memos -g -y

# 安装命令行工具
npm install -g @tnnevol/memos-cli
```

配置 Memos 地址和访问令牌：

```bash
memos-cli auth login
# 或非交互式
memos-cli auth login --base-url https://memos.example.com --token <TOKEN>
```

也可用环境变量：

```bash
export MEMOS_BASE_URL="https://your-memos.example.com"
export MEMOS_ACCESS_TOKEN="your-access-token"
```

## 使用

首次使用先确认 CLI 可用且已认证：

```bash
memos-cli --version
memos-cli me get
```

之后所有操作都通过 `memos-cli` 完成，不要直接使用 `curl` 或其他客户端访问服务。

根据用户意图选择对应命令：

```text
查看笔记 → memos-cli memo list
创建笔记 → memos-cli memo create --content "..."
添加评论 → memos-cli comment create <memo> --content "..."
上传附件 → memos-cli attachment upload <file> --memo <memo>
创建分享 → memos-cli share create <memo>
```

没有明确操作时先展示帮助（`memos-cli --help`）；删除笔记、评论、附件或分享前确认目标。
笔记优先使用标签整理，不要按文件夹思路引导用户。

## 功能

- 笔记：列表、过滤、创建、查询、更新、删除、置顶。
- 标签：汇总标签、按标签列出笔记。
- 评论：查看、添加、更新和删除评论。
- 用户与实例：当前用户、用户统计、实例版本与访问模式。
- 附件：查询、上传、改关联、删除和批量删除；上传返回的永久路径用于笔记正文。
- 分享：创建、查询、撤销分享链接，按 token 读取公开笔记。
- 表情与关联：添加、移除表情，建立和解除笔记关联。
- 空间：空间 CRUD、成员与邀请管理（v0.31+）。

常见意图包括「记录想法」「查看我的笔记」「显示标签」「给笔记添加评论」「上传附件」
「分享这条笔记」等，技能会将自然语言映射到对应命令。

## 命令参考

完整命令与参数见 [memos-cli 文档](/cli/memos-cli)。
