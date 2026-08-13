---
title: halo
name: halo
description: 通过脚本操作 Halo 博客，支持文章、分类、标签和独立页面管理。
---

# halo

通过 Halo REST API 管理博客内容，所有接口请求必须通过技能目录中的脚本完成。

## 安装

```bash
npx skills add tnnevol/skills --skill=halo -g -y
```

配置 Halo 站点地址和个人访问令牌：

```bash
export HALO_BASE_URL="https://your-halo.example.com"
export HALO_PAT="your-personal-access-token"
```

## 使用

首次使用先确认站点配置，再通过脚本执行命令：

```bash
node scripts/halo.mjs list
node scripts/halo.mjs create --title="文章标题" --content="文章内容"
node scripts/halo.mjs list-tags
node scripts/halo.mjs list-singlepages
```

用户提出“查看文章”“发布文章”“创建标签”“修改分类”“管理单页”等请求时，技能会识别资源和操作，调用对应脚本。删除操作需要确认，更新操作会自动处理版本冲突。

## 功能

- 文章：查询、创建、获取、更新、删除、发布和取消发布。
- 分类：查询、创建、获取、更新和删除。
- 标签：查询、创建、获取、更新和删除。
- 单页：查询、创建、获取、更新、删除、发布和取消发布。
- 接口保护：统一认证、敏感信息清理、错误处理、版本锁和冲突重试。
- 文档参考：提供 [Halo API 参考](https://docs.halo.run/category/api-%E5%8F%82%E8%80%83)入口。
