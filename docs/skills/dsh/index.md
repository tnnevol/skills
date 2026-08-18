---
title: dsh
name: dsh
description: DeepSeek Harness 插件化智能体运行时技能，支持运行、配置和扩展 dsh。
metadata:
  author: Tnnevol
  version: "2026.08.15"
---

# dsh

DeepSeek Harness（简称 dsh）是插件化的智能体运行时，支持 Web 界面、无头任务、profile 组合、Cordis 插件、工具和模型适配器开发。

## 安装

### 使用 Skills 安装

~~~bash
npx skills add tnnevol/skills --skill=dsh -g -y
~~~

### 使用已发布的 dsh

~~~bash
npx @deepseek-ai/dsh web
~~~

真实模型调用需要配置 DEEPSEEK_API_KEY。源码开发需要 Node.js 22.19+ 或 24+：

~~~bash
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
~~~

更多安装和使用说明见 [DeepSeek Harness 在线文档](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)。

## 使用

首次使用可运行 Web 界面或一次性无头任务：

~~~bash
dsh web
dsh --profile headless "总结当前工作区"
dsh --profile web --dump-config
dsh plugin --profile <name> add <package-or-git-spec>
~~~

dsh web 默认监听 127.0.0.1:3080。无头任务接收一条任务文本；启动器参数必须放在应用参数之前，后续参数由 profile 处理。

开发插件时先判断需求对应的服务、事件、工具、会话或其他能力 seam，再阅读[开发文档](https://deepseek-harness.github.io/deepseek-harness/develop/basic/)和[参考文档](https://deepseek-harness.github.io/deepseek-harness/reference/)。不要凭记忆猜测配置字段，优先使用 --help 和 --dump-config。

## 功能

- 运行 profile：组合 Web、无头和自定义 profile，按顺序叠加组合包与 patch。
- Cordis 插件：开发插件、服务、事件、配置和可逆生命周期资源。
- 模型能力：注册 LLM 适配器，处理流式响应、工具调用、用量、取消和错误。
- 工具扩展：注册模型工具、参数校验、执行策略、后台任务和界面展示。
- 智能体与会话：处理轮次、步骤、实时事件、持久会话日志和可回放上下文。
- 能力替换：接入文件系统、shell、终端、沙箱、审批、子智能体、Web、存储和持久化提供方。
- 插件分发：通过 dsh.bundle 和 dsh.profile 将扩展安装到 profile。

常见意图包括“启动 dsh Web 界面”“执行一次无头任务”“查看 profile 配置”“添加工具”“接入模型适配器”和“解释 Cordis 生命周期”等。
