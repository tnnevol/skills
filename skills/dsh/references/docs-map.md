# 文档索引

本技能不把生成型 API 目录和全部教程机械复制进 SKILL.md，而是把稳定规则提炼到参考文件，并保留官方文档索引。需要当前实现、完整类型声明或精确配置字段时，读取本地 deepseek-harness/docs 的中文文件；没有本地检出时使用下列线上文档页面。

## 按任务查找

| 任务 | 首选文档 | 说明 |
| --- | --- | --- |
| 运行命令、profile、patch、插件安装 | [在线快速开始](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart) | 线上页面覆盖基础启动；CLI 的完整行为见本技能的命令行参考 |
| 安装源码、贡献者检查和日常命令 | [开发入口](https://deepseek-harness.github.io/deepseek-harness/develop/basic/) | 线上开发教程入口；源码门禁见本技能的命令行参考 |
| 了解整体结构 | [架构](https://deepseek-harness.github.io/deepseek-harness/reference/) | Cordis、profile、核心包、事件和能力归属 |
| 了解轮次、步骤和错误恢复 | [Agent 生命周期](https://deepseek-harness.github.io/deepseek-harness/reference/agent-lifecycle) | 持久事件与实时事件的边界 |
| 了解工具执行顺序 | [工具执行流水线](https://deepseek-harness.github.io/deepseek-harness/reference/tool-execution-pipeline) | 分类、屏障、策略、执行、规范化和结果 |
| 了解 Service、Provider、Consumer | [能力服务](https://deepseek-harness.github.io/deepseek-harness/reference/capability-seams) | 能力 seam 和依赖图 |
| 从零写 Cordis 插件 | [Cordis 框架教程](https://deepseek-harness.github.io/deepseek-harness/develop/cordis-tutorial/) | 七章可运行教程：插件、生命周期、服务、事件、配置、HMR、接入 harness |
| 写第一个 Harness 插件 | [第一个 Harness 插件](https://deepseek-harness.github.io/deepseek-harness/develop/basic/) | 在 Web UI 中加载本地插件 |
| 写工具 | [开发一个 Tool](https://deepseek-harness.github.io/deepseek-harness/develop/basic/tool) 与 [工具编写参考](https://deepseek-harness.github.io/deepseek-harness/reference/cookbook/adding-a-tool) | 先看最小示例，再看执行和展示约定 |
| 写配置、服务或事件 | [插件配置](https://deepseek-harness.github.io/deepseek-harness/develop/basic/config)、[服务与依赖](https://deepseek-harness.github.io/deepseek-harness/develop/framework/service)、[事件系统](https://deepseek-harness.github.io/deepseek-harness/develop/framework/events) | schema、依赖注入、事件分发和自动清理 |
| 写模型适配器 | [添加 LLM 适配器](https://deepseek-harness.github.io/deepseek-harness/reference/cookbook/adding-an-llm-adapter) | 流式协议、工具调用、取消和错误 |
| 接入 Web 对话节点 | [添加 Web 对话节点](https://deepseek-harness.github.io/deepseek-harness/reference/cookbook/adding-a-conversation-node) | 可回放事件族和三条摄入路径 |
| 发布和安装插件 | [打包与安装插件](https://deepseek-harness.github.io/deepseek-harness/develop/basic/publish) | dsh.bundle、dsh.profile 和安装顺序 |
| 使用 Web UI 配置模型 | [使用 Web UI](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)、[配置模型](https://deepseek-harness.github.io/deepseek-harness/guide/providers) | 模型、提供方、凭据和工作区 |
| 使用 Python SDK | [Python SDK](https://deepseek-harness.github.io/deepseek-harness/guide/python-sdk) | SDK 安装、示例、会话和工作区隔离 |
| 排查并发、清理和安全问题 | [本技能的架构与运行时](architecture.md) | 线上站点暂未单独发布防御性模式页面 |
| 选择测试层级 | [本技能的主文档](../SKILL.md#排错与验证) | 线上站点暂未单独发布测试策略页面 |

## Cordis API

需要查询 Cordis 原生接口时按主题读取：

- [Context](https://deepseek-harness.github.io/deepseek-harness/reference/cordis-api/context)：上下文、插件、服务和 effect。
- [Events](https://deepseek-harness.github.io/deepseek-harness/reference/cordis-api/events)：事件声明和分发。
- [Fiber](https://deepseek-harness.github.io/deepseek-harness/reference/cordis-api/fiber)：插件实例生命周期。
- [Service](https://deepseek-harness.github.io/deepseek-harness/reference/cordis-api/service)：服务注册和依赖。
- [Plugin Registry](https://deepseek-harness.github.io/deepseek-harness/reference/cordis-api/registry)：注册表和作用域。

从零学习时按 docs/cordis-tutorial/01 到 07 顺序阅读，不要跳过第 2 章的清理、第 3 章的依赖和第 4 章的事件。

## 子系统与生成目录

docs/subsystems/ 每个页面负责一个子系统，包含数据结构、服务、事件和生成的 Cordis API。常用页面包括：

- core：agent 接口、agent handle 和循环驱动。
- session、persistence、session-query：会话事件、持久化、检索和回放。
- llm-streaming：消息、内容块、流式分片和适配器。
- tools、approval、user-questions：工具注册、执行策略和用户交互。
- filesystem、shell、subprocess、terminal、sandbox：进程与文件能力。
- extensions、skills、subagent、workflow：动态扩展、技能、子 agent 和工作流。
- settings、credentials、storage、workspace：配置、凭据、非会话存储和工作区。
- web、web-server、client-modules：网络提供方、HTTP 路由和浏览器插件图。

完整列表见[子系统中文索引](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/)。这类页面可能由源码生成；遇到类型漂移时运行源项目的 pnpm run verify-type-equiv，不要在技能仓库中手工复制整个目录。

docs/config-catalog.zh.md、docs/tool-catalog.zh.md、docs/persistence-catalog.zh.md、docs/module-graph.zh.md、docs/graph-atlas.zh.md 和 docs/event-producer-consumer.zh.md 属于配置、工具、持久化、模块、关系图和生产消费关系目录。它们适合查具体键名或关系，不能替代架构文档。

## 文档维护约束

- 中文页面与英文页面成对维护；源项目的生成器和配对检查拥有最终规则。
- 普通文档写当前状态和操作方法，历史背景放在 postmortem 或 Agent Note，不要混入技能的使用规则。
- 一个事实只保留一个权威位置；本技能只复制稳定且高频的操作规则，其余通过索引指向源文档。
- 需要更新本技能时，先更新或拉取 deepseek-harness，再比较本文档中的命令、配置层和事件顺序。
