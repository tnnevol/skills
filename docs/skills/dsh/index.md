---
title: dsh
name: dsh
description: DeepSeek Harness 插件化智能体运行时技能，支持运行、配置和扩展 dsh。
metadata:
  author: Tnnevol
  version: "2026.08.18"
---

# dsh

DeepSeek Harness（简称 dsh）是插件化的智能体运行时，支持 Web 界面、工作区、智能体模式预设、无头任务、profile 组合、Cordis 插件、工具、模型适配器、设置卡片、图片附件和子代理开发。

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
corepack enable
pnpm install
pnpm run build
pnpm dsh web
~~~

源码仓库当前固定使用 `pnpm@11.7.0`。真实模型调用需要配置 `DEEPSEEK_API_KEY`。

更多安装和使用说明见 [DeepSeek Harness 在线文档](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)。

## 使用

首次使用可运行 Web 界面或一次性无头任务：

~~~bash
dsh web
dsh --profile headless "总结当前工作区"
dsh --profile web --dump-config
dsh plugin --profile <name> add <package-or-git-spec>
~~~

dsh web 默认监听 127.0.0.1:3080。首次打开 Web 界面时，先在“设置 → 模型”中保存模型配置，再选择工作区；未选择工作区前不能输入任务。无头任务接收一条任务文本；启动器参数必须放在应用参数之前，后续参数由 profile 处理。

开发插件时先判断需求对应的服务、事件、工具、会话或其他能力 seam，再阅读[开发文档](https://deepseek-harness.github.io/deepseek-harness/develop/basic/)和[参考文档](https://deepseek-harness.github.io/deepseek-harness/reference/)。不要凭记忆猜测配置字段，优先使用 --help 和 --dump-config。

## 功能

- 运行 profile：组合 Web、无头和自定义 profile，按顺序叠加组合包与 patch。
- 智能体模式：使用标准、PTC、极简和创造模式，分别满足完整编码、代码模式多步组合、最小工具集和自定义预设创作需求。
- Cordis 插件：开发插件、服务、事件、配置和可逆生命周期资源。
- 模型能力：注册 LLM 适配器，处理流式响应、工具调用、用量、取消和错误。
- 工具扩展：注册模型工具、参数校验、执行策略、后台任务和界面展示。
- 智能体与会话：处理轮次、步骤、实时事件、持久会话日志和可回放上下文。
- Web 与富内容：通过设置卡片公开配置和凭据，通过持久图片附件引用支持模型与会话回放。
- 能力替换：接入文件系统、shell、终端、沙箱、审批、子智能体、Web、存储和持久化提供方。
- 插件分发：通过 dsh.bundle 和 dsh.profile 将扩展安装到 profile。

常见意图包括“启动 dsh Web 界面”“配置工作区或智能体模式”“执行一次无头任务”“查看 profile 配置”“添加工具”“接入模型适配器”“新增设置卡片或图片附件”“使用子代理”和“解释 Cordis 生命周期”等。
