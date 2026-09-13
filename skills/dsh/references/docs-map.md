# 文档索引

本技能不把生成型 API 目录和全部教程机械复制进 SKILL.md，而是把稳定规则提炼到参考文件，并保留官方文档索引。本索引按源项目 `0.1.5-rc.2` 整理。需要当前实现、完整类型声明或精确配置字段时，读取本地 deepseek-harness/docs 的中文文件；没有本地检出时使用下列线上文档页面。

## 按任务查找

| 任务 | 首选文档 | 说明 |
| --- | --- | --- |
| 运行命令、profile、patch、插件安装 | [在线快速开始](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart) | 线上页面覆盖基础启动；CLI 的完整行为见本技能的命令行参考 |
| 安装源码、贡献者检查和日常命令 | [开发入口](https://deepseek-harness.github.io/deepseek-harness/develop/basic/) | 线上开发教程入口；源码门禁见本技能的命令行参考 |
| 了解整体结构 | [架构](https://deepseek-harness.github.io/deepseek-harness/reference/) | Cordis、profile、核心包、事件和能力归属 |
| 了解轮次、步骤和错误恢复 | [智能体生命周期](https://deepseek-harness.github.io/deepseek-harness/reference/agent-lifecycle) | 持久事件与实时事件的边界 |
| 了解工具执行顺序 | [工具执行流水线](https://deepseek-harness.github.io/deepseek-harness/reference/tool-execution-pipeline) | 分类、屏障、策略、执行、规范化和结果 |
| 了解 API Gateway | [API Gateway](https://deepseek-harness.github.io/deepseek-harness/reference/api-gateway) | Remote 声明、对象查找、Gateway、Connection 与生成流程 |
| 新增 Remote API | [GitHub 源文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cookbook/adding-a-remote-api.zh.md) | 五步实现、RemoteError、RemoteResult、测试和 `build:lib`；当前在线文档目录尚未单独发布此页 |
| 了解服务、提供方和使用方 | [能力服务](https://deepseek-harness.github.io/deepseek-harness/reference/capability-seams) | 能力 seam 和依赖图 |
| 配置出站网络代理 | [网络代理指南](https://deepseek-harness.github.io/deepseek-harness/guide/network-proxy) | `HTTP_PROXY`、`HTTPS_PROXY`、`NO_PROXY`、企业 CA、直连范围和验证方法 |
| 配置模型与自定义提供方 | [模型配置](https://deepseek-harness.github.io/deepseek-harness/guide/providers) | 内置和自定义提供方、三种协议、模型目录探测、推理等级、图片能力与 `settings.yaml` |
| 使用 Python SDK | [Python SDK](https://deepseek-harness.github.io/deepseek-harness/guide/python-sdk) | SDK 安装、`sdk`/`sdk-minimal`、工作区、home、会话和显式启用编辑器 |
| 通过 GitHub Webhook 创建评审会话 | [GitHub 评审会话](https://deepseek-harness.github.io/deepseek-harness/guide/github-review) | 可选 overlay、签名校验、只读评审 Session 和专用端点 |
| 安排会话内提醒 | [会话内提醒](https://deepseek-harness.github.io/deepseek-harness/guide/schedule) | 可选 Schedule overlay、一次性和重复提醒、时区与恢复行为 |
| 接入记忆 MCP | [记忆 MCP](https://deepseek-harness.github.io/deepseek-harness/guide/mcp-memory) | 默认关闭的 stdio/Streamable HTTP 示例、安装前置条件和安全边界 |
| 从零写 Cordis 插件 | [Cordis 框架教程](https://deepseek-harness.github.io/deepseek-harness/develop/cordis-tutorial/) | 七章可运行教程：插件、生命周期、服务、事件、配置、HMR、接入 harness |
| 写第一个 Harness 插件 | [第一个 Harness 插件](https://deepseek-harness.github.io/deepseek-harness/develop/basic/) | 在 Web UI 中加载本地插件 |
| 写工具 | [开发一个 Tool](https://deepseek-harness.github.io/deepseek-harness/develop/basic/tool) 与 [工具编写参考](https://deepseek-harness.github.io/deepseek-harness/reference/cookbook/adding-a-tool) | 先看最小示例，再看执行和展示约定 |
| 写配置、服务或事件 | [插件配置](https://deepseek-harness.github.io/deepseek-harness/develop/basic/config)、[服务与依赖](https://deepseek-harness.github.io/deepseek-harness/develop/framework/service)、[事件系统](https://deepseek-harness.github.io/deepseek-harness/develop/framework/events) | schema、依赖注入、事件分发和自动清理 |
| 选择扩展层级 | [能力的三层拆分](https://deepseek-harness.github.io/deepseek-harness/develop/practice/) | 基础包、运行时 overlay 和面向模型能力的边界 |
| 编写 LLM 适配器实战 | [LLM 适配器](https://deepseek-harness.github.io/deepseek-harness/develop/practice/llm-adapter) | 从 `ctx.llm` 注册到流式协议和测试 |
| 编写运行时 Cordis 工具 | [运行时 Cordis 工具](https://deepseek-harness.github.io/deepseek-harness/develop/practice/dynamic-cordis) | 在会话中动态挂载受信任工具及其生命周期 |
| 写模型适配器 | [添加 LLM 适配器](https://deepseek-harness.github.io/deepseek-harness/reference/cookbook/adding-an-llm-adapter) | 流式协议、工具调用、取消和错误 |
| 发现模型目录 | 本地源项目 `packages/llm/llm-pi-ai/README.zh.md` | `openai-completions`、`openai-responses`、`anthropic-messages` 的模型列表发现和响应规范化；当前线上未单独发布包页 |
| 管理 Session 格式 | 本地源项目 `docs/session-format-status.zh.md`、`docs/cookbook/adding-a-session-format-version.zh.md` | V3 当前格式、发布状态、相邻迁移链、规范信封和不可变 generation；当前线上未单独发布此页 |
| 接入 Web 对话节点 | [Conversation 组装](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/conversation) | 可回放事件族、客户端适配和三条摄入路径 |
| 使用会话持久化 | [会话持久化](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/persistence) | `ctx.sessionPersistence`、`SessionHandle`、JSONL 提供方、刷盘和单写者约束 |
| 使用会话投影 | [会话投影](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/session-projection) | `ctx.sessionProjections`、状态折叠、客户端快照和变更流 |
| 添加 Web 设置卡片 | [新增设置卡片](https://deepseek-harness.github.io/deepseek-harness/reference/cookbook/adding-a-settings-card) | 宿主端配置命名空间、客户端卡片、凭据和版本号 |
| 支持图片和文件附件 | 本地源项目 `docs/subsystems/attachment.zh.md`、`packages/attachment/attachment/README.zh.md` | 图片校验与规范化、通用文件原样保存、文件上传凭证、读取和可回放引用 |
| 声明文件交付 | 本地源项目 `packages/fs/tool-present/README.zh.md`、`packages/client/ui-deliverables/README.zh.md` | `present`、交付卡片、右侧 Sidebar 预览和宿主默认应用打开 |
| 预览工作区文件 | [工作区](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/workspace) | `workspaceFiles` 的文本分页、字节窗口、目录列举、变更流和 Session 授权；详细 API 见本地 `packages/api/workspace-files/README.zh.md` |
| 使用用户反馈 | 本地源项目 `docs/subsystems/feedback.zh.md`、`packages/feedback/command-feedback/README.zh.md` 和 `packages/feedback/message-feedback/README.zh.md` | `/feedback`、Session 反馈、逐消息反馈、固定分类和版本冲突；当前线上文档清单未单独发布此页 |
| 提供 Web 客户端 API | [Web Client 架构](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/web-client)、[客户端 Slots](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/slots) | 宿主端 Remote、Connection、Gateway、客户端状态和类型化槽位 |
| 使用客户端资源和右侧 Sidebar | [客户端资源](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/client-resources)、[右侧 Sidebar](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/sidebar-right) | `dsh-resource://`、资源订阅、tab 导航、文件预览和面板组合 |
| 使用 `@file` 文件引用 | [会话引用](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/session-reference)，本地源项目 `packages/context/file-reference/README.zh.md`、`packages/context/file-reference-local/README.zh.md` | 仅含路径的补全、命名空间匹配和 `read` 工具衔接；当前线上文档清单未发布包页 |
| 使用子代理和后台任务 | [子代理](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/subagent)、[后台任务](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/jobs) | 一次性子代理、可继续激活、能力检查和任务生命周期 |
| 使用实验性智能体团队 | 本地源项目 `docs/subsystems/agent-team.zh.md`、`packages/experimental/agent-team/README.zh.md` 和 `packages/experimental/tool-agent-team/README.zh.md` | Lead 会话、成员、持久邮箱、共享任务板、`Steer` 投递和比较并交换；显式安装两个实验性包，当前线上文档清单未单独发布此页 |
| 导出 Web 会话 | 本地源项目 `packages/session-query/session-log-export/README.zh.md` | `/export`、认证下载路由、会话树和附件 ZIP；当前线上文档清单未发布此页面 |
| 查看内置智能体模式 | 本地源项目 `apps/cli/config/agent-presets/` 和 `packages/bundle/base/README.zh.md` | 标准、PTC、极简和创造模式的名称、工具集合与提示词；base 默认文件工具为 `read`、`write`、`edit` |
| 发布和安装插件 | [打包与安装插件](https://deepseek-harness.github.io/deepseek-harness/develop/basic/publish) | dsh.bundle、dsh.profile 和安装顺序 |
| 使用 Web UI 配置模型 | [使用 Web UI](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)、[配置模型](https://deepseek-harness.github.io/deepseek-harness/guide/providers) | 模型、提供方、凭据和工作区 |
| 使用 SDK 或 ACP | [Python SDK](https://deepseek-harness.github.io/deepseek-harness/guide/python-sdk)、本技能的[命令行与 profile](cli.md) | SDK、极简 SDK、标准输入输出协议和 ACP profile |
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
- session-projection：按提交事件维护领域状态，并生成客户端可见快照。
- llm-streaming：消息、内容块、流式分片和适配器。
- tools、approval、user-questions：工具注册、执行策略和用户交互。
- filesystem、shell、subprocess、terminal、sandbox：进程与文件能力。
- extensions、skills、subagent、workflow、jobs：动态扩展、技能、子 agent、工作流和后台任务。
- web-client、slots、client-resources、sidebar-right、conversation：宿主端与客户端架构、资源订阅、右侧面板、类型化槽位和对话组装。
- session-reference：`@file` 文件引用、会话引用和模型可见路径约定。
- attachment：持久图片和文件附件、规范化、上传和不透明引用；请读取线上对应的子系统页面。
- agent-team：实验性成员、邮箱、`Steer` 投递和共享任务板；当前线上文档清单未发布此页面，请读取本地源项目文档。
- settings、credentials、storage、workspace：配置、凭据、非会话存储和工作区。
- web、web-server、client-modules：网络提供方、HTTP 路由和浏览器插件图。

完整列表见[子系统中文索引](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/)。这类页面可能由源码生成；遇到类型漂移时运行源项目的 pnpm run verify-type-equiv，不要在技能仓库中手工复制整个目录。

docs/config-catalog.zh.md、docs/tool-catalog.zh.md、docs/persistence-catalog.zh.md、docs/module-graph.zh.md、docs/graph-atlas.zh.md 和 docs/event-producer-consumer.zh.md 属于配置、工具、持久化、模块、关系图和生产消费关系目录。它们适合查具体键名或关系，不能替代架构文档。

## 文档维护约束

- 中文页面与英文页面成对维护；源项目的生成器和配对检查拥有最终规则。
- 普通文档写当前状态和操作方法，历史背景放在 postmortem 或 Agent Note，不要混入技能的使用规则。
- 一个事实只保留一个权威位置；本技能只复制稳定且高频的操作规则，其余通过索引指向源文档。
- 需要更新本技能时，先更新或拉取 deepseek-harness，再比较本文档中的 CLI 命令、profile 初始化、配置层、默认工具、Remote 契约、会话格式、会话持久化、文件交付、反馈和事件顺序。当前技能对应源项目 `0.1.5-rc.2`。
