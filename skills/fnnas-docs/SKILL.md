---
name: fnnas-docs
description: 飞牛 fnOS 应用开发文档 - 快速开始、开发指南、CLI 工具参考。当用户询问飞牛应用开发、fnOS 应用打包上架、Manifest 配置、应用权限、Docker 构建等问题时使用此技能。
metadata:
  author: Tnnevol
  version: "2026.05.14"
---

# SKILL: fnnas-docs (飞牛应用开发文档)

飞牛 fnOS 应用开发完整文档索引。基于飞牛应用开放平台 (https://developer.fnnas.com/docs/) 整理。

## Quick Start

```bash
# 文档来源
https://developer.fnnas.com/docs/

# 技能目录
skills/skills/fnnas-docs/

# 更新文档（如需同步最新内容）
cd skills/skills/fnnas-docs && python3 scripts/fetch-docs.py
```

## 使用场景

- 用户询问飞牛应用开发相关问题
- 需要查阅 fnOS 开发文档
- 了解应用打包、上架流程
- 配置 Manifest、环境变量、应用权限
- 构建 Native/Docker 应用

## Core References

| 分类 | 文档数 | 说明 | 入口 |
|------|--------|------|------|
| 快速开始 | 4 篇 | 环境准备、创建/测试/上架应用 | [quick-started/](references/quick-started/) |
| 开发指南-基础 | 7 篇 | 架构、Manifest、权限、入口等 | [core-concepts/](references/core-concepts/) |
| 开发指南-进阶 | 5 篇 | 网关、认证、依赖、中间件、运行时 | [core-concepts/](references/core-concepts/) |
| 开发指南-实战 | 2 篇 | Native/Docker 应用构建 | [core-concepts/](references/core-concepts/) |
| 开发指南-规范 | 1 篇 | 图标规范 | [core-concepts/](references/core-concepts/) |
| CLI 工具 | 2 篇 | fnpack、appcenter-cli | [cli/](references/cli/) |

## 文档索引

### 🚀 快速开始

| 文档 | 说明 | 链接 |
|------|------|------|
| 准备工作 | 环境要求、系统要求、技术栈 | [prerequisites.md](references/quick-started/prerequisites.md) |
| 创建应用 | 应用创建流程 | [create-application.md](references/quick-started/create-application.md) |
| 测试应用 | 应用测试与调试 | [test-application.md](references/quick-started/test-application.md) |
| 上架应用 | 应用发布上架流程 | [publish-application.md](references/quick-started/publish-application.md) |

### 📘 开发指南 - 基础

| 文档 | 说明 | 链接 |
|------|------|------|
| 架构概述 | fnOS 应用架构 | [framework.md](references/core-concepts/framework.md) |
| Manifest | 应用配置清单 | [manifest.md](references/core-concepts/manifest.md) |
| 环境变量 | 应用环境变量配置 | [environment-variables.md](references/core-concepts/environment-variables.md) |
| 应用权限 | 权限声明与管理 | [privilege.md](references/core-concepts/privilege.md) |
| 应用资源 | 资源配置与使用 | [resource.md](references/core-concepts/resource.md) |
| 应用入口 | 应用入口配置 | [app-entry.md](references/core-concepts/app-entry.md) |
| 用户向导 | 用户引导流程 | [wizard.md](references/core-concepts/wizard.md) |

### 📘 开发指南 - 进阶

| 文档 | 说明 | 链接 |
|------|------|------|
| 统一网关注册 | 网关注册机制 | [gateway-registration.md](references/core-concepts/gateway-registration.md) |
| 登录认证 | 认证集成 | [gateway-authentication.md](references/core-concepts/gateway-authentication.md) |
| 应用依赖关系 | 依赖管理 | [dependency.md](references/core-concepts/dependency.md) |
| 中间件服务 | 中间件使用 | [middleware.md](references/core-concepts/middleware.md) |
| 运行时环境 | 运行时配置 | [runtime.md](references/core-concepts/runtime.md) |

### 📘 开发指南 - 实战

| 文档 | 说明 | 链接 |
|------|------|------|
| Native 应用构建 | 原生应用开发 | [native.md](references/core-concepts/native.md) |
| Docker 应用构建 | Docker 容器应用 | [docker.md](references/core-concepts/docker.md) |

### 📘 开发指南 - 规范

| 文档 | 说明 | 链接 |
|------|------|------|
| 图标 Icon | 应用图标规范 | [icon.md](references/core-concepts/icon.md) |

### 🔧 CLI 开发工具

| 文档 | 说明 | 链接 |
|------|------|------|
| fnpack | 应用打包工具 | [fnpack.md](references/cli/fnpack.md) |
| appcenter-cli | 应用中心命令行工具 | [appcenter-cli.md](references/cli/appcenter-cli.md) |

## 意图识别规则

### 入门相关
- "飞牛怎么开发" / "如何开发飞牛应用" / "fnOS 开发" → [prerequisites.md](references/quick-started/prerequisites.md)
- "环境要求" / "系统要求" / "准备工作" / "开发环境" → [prerequisites.md](references/quick-started/prerequisites.md)
- "系统架构" / "内核版本" / "支持的架构" → [prerequisites.md](references/quick-started/prerequisites.md)
- "技术栈" / "支持什么语言" / "用什么开发" → [prerequisites.md](references/quick-started/prerequisites.md)

### 应用创建相关
- "创建应用" / "新建应用" / "怎么创建应用" → [create-application.md](references/quick-started/create-application.md)
- "应用开发流程" / "开发步骤" → [create-application.md](references/quick-started/create-application.md)

### 测试相关
- "测试应用" / "调试应用" / "怎么测试" → [test-application.md](references/quick-started/test-application.md)
- "本地测试" / "实机测试" → [test-application.md](references/quick-started/test-application.md)

### 上架相关
- "上架应用" / "发布应用" / "提交审核" / "应用商店" → [publish-application.md](references/quick-started/publish-application.md)
- "怎么发布" / "如何上架" → [publish-application.md](references/quick-started/publish-application.md)

### 架构与配置相关
- "应用架构" / "fnOS 架构" / "框架" → [framework.md](references/core-concepts/framework.md)
- "Manifest" / "应用配置" / "manifest.json" / "配置文件" → [manifest.md](references/core-concepts/manifest.md)
- "环境变量" / "env" / "配置变量" / "ENV" → [environment-variables.md](references/core-concepts/environment-variables.md)
- "权限" / "应用权限" / "权限声明" / "privilege" → [privilege.md](references/core-concepts/privilege.md)
- "资源" / "应用资源" / "资源配置" / "resource" → [resource.md](references/core-concepts/resource.md)
- "入口" / "应用入口" / "入口配置" / "entry" → [app-entry.md](references/core-concepts/app-entry.md)
- "向导" / "用户向导" / "引导页" / "wizard" → [wizard.md](references/core-concepts/wizard.md)

### 进阶功能相关
- "网关" / "网关注册" / "统一网关" / "gateway" → [gateway-registration.md](references/core-concepts/gateway-registration.md)
- "登录" / "认证" / "单点登录" / "SSO" / "authentication" → [gateway-authentication.md](references/core-concepts/gateway-authentication.md)
- "依赖" / "应用依赖" / "依赖关系" / "dependency" → [dependency.md](references/core-concepts/dependency.md)
- "中间件" / "中间件服务" / "middleware" → [middleware.md](references/core-concepts/middleware.md)
- "运行时" / "运行环境" / "runtime" → [runtime.md](references/core-concepts/runtime.md)

### 构建相关
- "Native" / "原生应用" / "本地构建" / "原生构建" → [native.md](references/core-concepts/native.md)
- "Docker" / "容器应用" / "Docker 构建" / "容器化" → [docker.md](references/core-concepts/docker.md)
- "图标" / "Icon" / "应用图标" / "logo" → [icon.md](references/core-concepts/icon.md)

### CLI 工具相关
- "fnpack" / "打包" / "应用打包" / "打包工具" → [fnpack.md](references/cli/fnpack.md)
- "appcenter-cli" / "appcenter" / "命令行工具" / "CLI" → [appcenter-cli.md](references/cli/appcenter-cli.md)
- "install-local" / "本地安装" / "快速安装" → [appcenter-cli.md](references/cli/appcenter-cli.md)

## 技术栈

fnOS 基于 Linux (Debian) 内核，支持：
- **服务端**：Node.js、Python、Java、Go 等
- **前端**：HTML/JavaScript/CSS 及现代框架
- **架构**：x86_64 (AMD64)
- **内核版本**：6.12.18
- **系统版本要求**：fnOS 0.9.27 及以上

## CLI 工具速查

| 工具 | 用途 | 安装 |
|------|------|------|
| `fnpack` | 应用打包 | 下载对应平台二进制文件：[fnpack-1.2.1-darwin-amd64](https://static2.fnnas.com/fnpack/fnpack-1.2.1-darwin-amd64) / [fnpack-1.2.1-darwin-arm64](https://static2.fnnas.com/fnpack/fnpack-1.2.1-darwin-arm64)，放到 PATH 中 |
| `appcenter-cli` | 应用管理（安装/卸载/日志） | fnOS 设备预装 |

## References

| 文件 | 说明 |
|------|------|
| [references/quick-started/](references/quick-started/) | 快速开始文档（4 篇） |
| [references/core-concepts/](references/core-concepts/) | 开发指南文档（15 篇） |
| [references/cli/](references/cli/) | CLI 工具文档（2 篇） |
| [scripts/fetch-docs.py](scripts/fetch-docs.py) | 文档抓取脚本（用于同步更新） |
