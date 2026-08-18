# 架构与运行时

本文整理 docs/architecture.zh.md、docs/cordis-primer.zh.md、docs/agent-lifecycle.zh.md、docs/tool-execution-pipeline.zh.md 和 docs/capability-seams.zh.md 的稳定规则。改动 packages/ 前先阅读源项目当前版本的架构文档。

## Cordis 基础

Cordis 是 dsh 的插件运行时：

- 插件向共享 Context 贡献服务、事件和可逆副作用。
- 服务通过稳定的 ctx.<key> 暴露，消费方通过 inject 声明依赖，不直接绑定具体提供方。
- 事件通过 TypeScript 声明合并获得类型；分发模式包括 emit、parallel、serial 和 waterfall。
- ctx.on()、注册表和 ctx.effect() 建立的注册属于插件生命周期；卸载和 HMR 时必须撤销。
- 没有需要修改的特权内核，新增能力应作为插件挂载到现有树中。

waterfall 是环绕式中间件。只做观察或标注的监听器必须调用 next()；不调用代表有意短路并接管决策。对 agent/request、agent/pre-step、llm/stream 和工具流水线尤其要遵守这一点。

## Profile、组合包与 patch

运行中的 dsh 是一棵插件树。profile 是 Harness home 中具名的组合，组合包是可以被上层 patch 覆盖的 Cordis 配置与代码分发单元。

核心组合通常包括：

| 组合包 | 作用 |
| --- | --- |
| @deepseek-ai/dsh-base | 模型、工具、持久化、沙箱、审批、设置、凭据和基础遥测 |
| @deepseek-ai/dsh-web-app | 浏览器应用与 Web 运行时 |
| @deepseek-ai/dsh-headless | 一次性任务运行器，不带服务器 |

配置层按以下顺序生效：组合包列表 → profile 的 cordis.patch.yml → $DSH_HOME/cordis.patch.yml → 命令行 --patch。各层按顺序应用，同一行后应用的层覆盖前层；patch 替换整行 config，不是递归合并。因此修改时要保留依赖注入、!!js 表达式和其他未改动字段。

## 服务、事件与能力 seam

一个可替换能力由三种角色组成：

1. Service Definition：定义接口、类型和事件契约。
2. Service Provider：提供具体实现，例如本地文件系统、DeepSeek 模型或 SQLite 持久化。
3. Consumer：使用该能力，常见形式是工具、agent 驱动器或 UI 适配器。

先找已有 seam，再决定是否新增接口。常用服务和归属：

| 需求 | 主要机制 |
| --- | --- |
| 添加模型提供方 | 在 ctx.llm 注册适配器 |
| 添加面向模型的能力 | 在 ctx.tools 注册工具 |
| 改变会话的能力集合 | 组装 agent preset，并按需隔离 realm |
| 添加 shell 或终端 | 注册 ctx.shell、ctx.terminals 后端 |
| 添加用户命令 | 在 ctx.commands 注册 |
| 添加后台任务 | 在 ctx.jobs 注册，使用任务工具消费或停止 |
| 添加文件系统或策略 | 注册 ctx.fs 提供方，或监听 fs/* 事件 |
| 限制进程 | 使用 ctx.sandbox 后端或策略事件 |
| 添加审批或人工问题 | 使用 ctx.approval、ctx.userQuestions |
| 添加压缩、目标或计划 | 使用 ctx.compaction、ctx.goals、ctx.planMode |
| 添加 Web 检索 | 注册 ctx.web 提供方 |
| 添加 Web 会话节点 | 注册 ConversationNodeDefinition 和对应渲染器 |
| 添加 Web 设置卡片 | 宿主端注册设置区块，客户端在同一设置命名空间注册设置项 |
| 添加图片附件 | 使用 ctx.attachments 负责校验、持久化和读取 |
| 添加跨会话读取 | 使用 ctx.sessionQuery 或 ctx.sessionReferenceResolver |

能力事件属于已有 seam 的策略扩展点，不要为了一个拦截器复制整个提供方。完整服务、包和事件关系见文档索引中的子系统与生成目录。

## Agent 轮次与工具流水线

一个步骤是一轮模型请求及其工具调用；一个轮次包含一个或多个步骤。典型顺序如下：

~~~text
turn/start
  领取下一步输入
  agent/pre-step
  step/start
  user/message
  system-prompt/assemble
  agent/request -> llm/stream -> assistant/chunk* -> assistant/message
  tool/call* -> tools/pre-execute -> tools/execute -> tools/post-execute -> tool/result*
  step/end
  agent/turn-stopping
turn/end
~~~

持久会话事件包括 turn/*、step/*、user/message、assistant/*、tool/* 和 compaction/*；实时 agent/* 事件负责队列、状态、输入、请求、拦截、继续执行和错误恢复。需要模型可见事实时，监听 session/event 并检查事件类型，而不是只读取实时状态。

工具调用会先分类并按 barrier（屏障）和有界滚动池调度，再按顺序执行前置策略、并发主体和后置处理。执行过程中应使用单调 guard 防止后续监听器撤销拒绝；规范结果、错误和展示内容必须分别处理。新增工具时不要让 UI 卡片格式污染模型结果。

## 会话日志与可回放性

会话日志是模型所见上下文的唯一来源，deriveMessages() 从日志生成模型历史。模型请求中的每项输入都必须能从日志重建；如果新增模型可见上下文，应：

1. 扩展 SessionEventMap。
2. 让日志渲染逻辑派生该内容。
3. 用恢复、fork、快照或真实组合测试证明回放一致。

实时 agent/* 事件可以协调工作，但不能代替需要持久化的 session 事件。agent.followup() 的回执不是完成结果，不要用单次 agent/status 或 whenIdle() 推断某条消息已经完成。

## 图片附件与富内容

图片附件属于持久化的跨层能力，不要把临时浏览器地址、文件路径或 Base64 直接塞进会话事件或模型消息。通过 `ctx.attachments` 完成以下操作：

- 使用 `validateImage` 校验 PNG、JPEG、WebP 或 GIF；批量上传使用 `saveImages` 时，先完成全部校验，再开始任何写入。
- 使用 `saveImage` 或 `saveImages` 持久化图片，使用 `readImage` 读取内容；默认存储在 `<DSH_HOME>/attachments/v1`。
- 会话事件和模型输入只携带不透明的 `ImageAttachmentRef`，跨层传递时转换成 `ImageBlock`；不要暴露存储路径或底层提供方地址。

需要扩展图片能力时，先确认附件是否已经持久化，再设计事件、恢复和前端渲染路径；不能只在浏览器状态中保存图片。

## 生命周期与防御性规则

- inject 是持续依赖；提供方消失时消费方应卸载，提供方恢复后再加载。
- 外部连接、定时器、watcher、子进程必须由 ctx.effect() 持有 disposer；退出时等待异步工作完全停稳。
- 异步结果的 timedOut、signal、exitCode 等独立事实要分别报告。
- 不把环境变量、凭据、可预测临时路径或未脱敏工具输出交给不可信模型内容。
- 监听器异常要隔离，不能饿死后续监听器或破坏核心分发器。
- 对可能是符号链接或 junction 的路径使用安全的 lstat 与 unlink 语义，避免递归删除跟随链接。

## 精确参考

- [架构](https://deepseek-harness.github.io/deepseek-harness/reference/)
- [Cordis 入门](https://deepseek-harness.github.io/deepseek-harness/reference/cordis-primer)
- [Agent 生命周期](https://deepseek-harness.github.io/deepseek-harness/reference/agent-lifecycle)
- [工具执行流水线](https://deepseek-harness.github.io/deepseek-harness/reference/tool-execution-pipeline)
- [能力 seam](https://deepseek-harness.github.io/deepseek-harness/reference/capability-seams)
