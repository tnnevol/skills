---
title: 禅道
name: chandao
description: 通过脚本操作禅道项目管理系统，支持项目、产品、需求、任务、迭代、缺陷和测试用例管理。
metadata:
  author: Tnnevol
  version: "2026.05.29"
---

# 禅道

通过自然语言和 Node.js 脚本操作禅道项目管理系统，所有接口请求统一由技能脚本完成。

## 安装

```bash
npx skills add tnnevol/skills --skill=chandao -g -y
```

安装后配置禅道地址、账号和密码：

```bash
export CHANDAO_URL="https://your-zentao.example.com"
export CHANDAO_ACCOUNT="your-account"
export CHANDAO_PASSWORD="your-password"
```

## 使用

首次使用先验证配置：

```bash
node scripts/auth.js --action list-products
```

业务命令格式：

```bash
node scripts/<module>.js --action <action> [--参数]
```

代理根据用户意图选择对应模块和操作。更新前先读取当前数据，创建时一次性传入用户已提供的全部参数；删除等破坏性操作需要先确认。

## 功能

- 认证：自动登录、缓存令牌、处理认证失败和令牌刷新。
- 产品与项目：查询、创建、更新、删除，以及按项目集筛选。
- 需求：查询、创建、更新、关闭、激活、变更和删除。
- 任务：查询、创建、更新、开始、完成、关闭、激活和删除。
- 迭代：查询、创建、更新、开始、暂停、关闭、关联产品和删除。
- 缺陷：查询、创建、更新、解决、关闭、激活和删除。
- 测试用例：查询、创建、更新和删除。
- 通用能力：分页、预览写操作、删除确认、自然语言意图识别，以及禅道接口兼容性处理。

常见意图包括“查看项目”“创建需求”“开始任务”“关闭缺陷”“查看测试用例”等，技能会将其转换为对应脚本命令。
