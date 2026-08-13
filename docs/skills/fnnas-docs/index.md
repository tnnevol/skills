---
title: fnnas-docs
name: fnnas-docs
description: 飞牛 fnOS 应用开发文档技能，提供开发指南、开放接口、命令行工具和应用案例。
metadata:
  author: Tnnevol
  version: "2026.08.06"
---

# fnnas-docs

飞牛 fnOS 应用开发文档技能，基于飞牛官方在线文档索引和完整文档，为应用开发、调试、打包和发布提供查询与引导。

## 安装

```bash
npx skills add tnnevol/skills --skill=fnnas-docs -g -y
```

技能文档来源：

- [在线文档索引](https://developer.fnnas.com/llms.txt)
- [完整文档](https://developer.fnnas.com/llms-full.txt)
- [开放接口概览](https://developer.fnnas.com/api/overview/)

## 使用

首次使用根据问题阅读对应文档，再给出开发方案或执行命令。同步官方文档时运行：

```bash
cd skills/fnnas-docs
python3 scripts/fetch-docs.py
```

开发应用时优先遵循以下规则：

- 创建原生应用不使用 `--template`，创建 Docker 应用必须使用 `--template docker`。
- 不删除应用模板文件，只在基础模板上修改或新增文件。
- 框架环境变量目录只在 `cmd/install_callback` 阶段生成，该阶段也是应用正式安装阶段。
- `cmd/main` 用于框架进程检测；应用可使用非守护进程，或改为检测自身状态和实际进程号。
- 生命周期脚本直接输出日志，不单独维护日志文件。

## 功能

- 快速开始：环境准备、创建应用、测试应用和发布上架。
- 开发指南：应用框架、Manifest、环境变量、权限、资源、入口、网关、向导、依赖、中间件、运行时和图标规范。
- 开放接口：调用方式、文件授权、路径转换、页面路由、页面交互、平台配置和错误码。
- 命令行工具：`fnpack` 应用打包工具和 `appcenter-cli` 应用管理工具。
- 应用案例：原生应用和 Docker 应用的完整示例。
- 文档同步：从飞牛线上文档获取更新，并保留更新日志。

用户询问创建应用、权限、Manifest、文件访问、页面能力、Docker 构建、生命周期或发布流程时，技能会先识别意图，再引导到对应文档和工具。详细内容见左侧分类。
