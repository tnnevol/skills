---
title: openlist
name: openlist
description: 通过 openlist-cli 操作 OpenList，支持文件、目录、分享、存储和后台管理。
metadata:
  author: Tnnevol
  version: "2026.07.24"
---

# openlist

通过 `openlist-cli` 管理 OpenList 多存储文件列表和网盘聚合服务。命令输出结构化 JSON，参数和接口契约以命令帮助和参考文档为准。

## 安装

### 使用 Skills 安装

```bash
npx skills add tnnevol/skills --skill=openlist -g -y
```

### 使用 Agent 安装

#### 通过 AI Agent 安装

将以下提示词发送给 AI Agent：

```text
阅读说明并帮我安装 openlist-cli：https://github.com/tnnevol/skills/blob/main/apps/openlist-cli/openlist-cli-installation-guide.md
```

#### 通过 SkillHub 安装

将以下提示词发送给支持 SkillHub 的 Agent：

```text
请根据 https://skillhub.cn/install/skillhub.md，安装 @user_5c85a23c/openlist。
```

## 使用

首次处理 OpenList 任务时先确认工具和认证状态：

```bash
openlist-cli --version
openlist-cli me get
```

如果提示未配置，默认必须通过终端交互式授权。代理应运行 `openlist-cli auth login`，明确告知用户需要在提示中填写服务地址、是否允许无 Token 访问和 Token，并等待用户完成输入；不要直接代用户拼接 `--base-url`、`--token` 或写入环境变量。只有用户明确要求非交互式登录，或当前环境无法提供交互终端时，才改用参数、环境变量或配置文件。

常用命令：

```bash
openlist-cli fs list /
openlist-cli fs search -k 关键词 -p /
openlist-cli fs put ./本地文件 /目标目录
openlist-cli share create --path /目录
```

根据用户意图选择文件、分享、用户、存储、设置、驱动或索引命令。删除、覆盖移动、删除分享和后台修改等破坏性操作必须先确认；跨存储复制、移动和解压是异步任务，需要轮询目标位置确认结果。

登录时默认使用交互式授权，由用户填写服务地址、是否允许无 Token 访问和 Token；服务允许无 Token 访问时可以省略 Token，提供 Token 才执行 Token 校验。

## 功能

- 文件与目录：列出、获取、搜索、新建、重命名、移动、复制、删除、上传、批量整理和解压。
- 分享：创建、查询、更新、删除、启用和禁用分享。
- 当前用户：查询当前账号信息。
- 后台管理：管理用户、存储、元信息、设置、驱动和搜索索引。
- 认证配置：支持命令参数、环境变量和本地配置文件，提供登录、状态查看和退出登录。
- 结果处理：统一输出 JSON，列表结果包含分页信息，所有命令支持 `--help` 和 `--pretty`。
- 意图引导：将“列目录”“搜索文件”“上传文件”“创建分享”“查看存储”等自然语言转换为对应命令，并在参数不明确时继续询问。
