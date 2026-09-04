# 架构与运行时

本文整理 docs/architecture.zh.md、docs/cordis-primer.zh.md、docs/agent-lifecycle.zh.md、docs/tool-execution-pipeline.zh.md、docs/capability-seams.zh.md、docs/api-gateway.zh.md、docs/subsystems/persistence.zh.md 和 docs/subsystems/session-projection.zh.md 的稳定规则。改动 packages/ 前先阅读源项目当前版本的架构文档。

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
| @deepseek-ai/dsh-sdk-app | 通过标准输入输出提供 SDK 运行时 |
| @deepseek-ai/dsh-sdk-minimal | 独立的极简 SDK 运行时，固定完整权限 |
| @deepseek-ai/dsh-acp-app | 通过标准输入输出提供 ACP 运行时 |

配置层按以下顺序生效：组合包列表 → profile 的 cordis.patch.yml → $DSH_HOME/cordis.patch.yml → 命令行 --patch。各层按顺序应用，同一行后应用的层覆盖前层；patch 替换整行 config，不是递归合并。因此修改时要保留依赖注入、!!js 表达式和其他未改动字段。

## 服务、事件与能力 seam

一个可替换能力由三种角色组成：

1. 服务定义（Service Definition）：定义接口、类型和事件契约。
2. 服务提供方（Service Provider）：提供具体实现，例如本地文件系统、DeepSeek 模型或 JSONL 持久化。
3. 使用方（Consumer）：使用该能力，常见形式是工具、智能体驱动器或 UI 适配器。

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
| 添加 @file 补全 | 使用 ctx.fileReferences，并挂载与 read 工具一致的文件引用提供方 |
| 添加跨会话读取 | 使用 ctx.sessionQuery 或 ctx.sessionReferenceResolver |
| 持久化会话日志 | 使用 ctx.sessionPersistence 获取 SessionHandle，并由持久化提供方写入 |
| 添加会话派生状态 | 使用 ctx.sessionProjections 注册投影单元，并由 stateOf() 或 snapshot() 读取 |
| 添加宿主端与客户端 API | 宿主端控制器使用 @Remote，客户端通过 ctx.remote 调用生成契约 |

## 宿主端、客户端与 Remote

dsh 把运行时分为宿主端和客户端两个 aggregate。宿主端拥有模型、工具、会话、工作区、设置和文件等实际能力；客户端只持有浏览器状态、渲染模型和对宿主端的调用代理。不要因为两侧都有同名 Context 就把它们放进同一个 TypeScript program，否则会产生声明合并冲突。

跨边界能力按以下路径流动：

~~~text
宿主端 Service / Controller
  @Remote 或 @RemoteScope
    -> Typert 生成客户端投影
      -> 客户端 api-remotes 挂载 ctx.remote
        -> Connection 负责认证、连接代际、相关性和流式载荷
          -> Gateway 负责分发、取消、逻辑流和转发事件
            -> 客户端模型与 UI 适配器
~~~

宿主端的控制器只声明可安全暴露的方法，生成的 `/remote` 类型和运行时贡献由构建流程维护。客户端应通过 `ctx.remote` 或作用域中的 `agentCtx.remote` 调用，不要自行拼接 HTTP 请求或直接暴露宿主服务。设置、文件引用、会话导出和对话节点都遵循这条边界。

能力事件属于已有 seam 的策略扩展点，不要为了一个拦截器复制整个提供方。完整服务、包和事件关系见文档索引中的子系统与生成目录。

### Remote 结果与失败

Remote 端点是面向一元调用的类型化契约。客户端方法返回 `RemoteResult<T>`，不会因为宿主端业务失败而拒绝；调用方应在 `if (!result.ok)` 分支中检查 `error.code`，需要把失败交给上层时再 `throw result.error`。Remote 失败统一使用 `RemoteError`，通过 `RemoteErrorDetailsMap` 声明 `<domain>/<reason>` 错误码；Gateway 未归类的异常才折叠为 `gateway/internal`，取消一元调用使用 `gateway/cancelled`。不要创建异常类家族，也不要用 `instanceof` 判断传输协议失败。

客户端通过 `ctx.remote.<namespace>` 或作用域中的 `agentCtx.remote` 调用。固定宿主事实从 `ctx.remote.$host` 读取；它提供 `home` 和 `isLoopback` 普通值，不提供订阅或代际计数器。Remote 仍只覆盖一元方法，流式数据、分页、会话投影等使用各自的协议。新增端点时按[新增 Remote API 实操手册](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cookbook/adding-a-remote-api.zh.md)执行。

## 智能体轮次与工具流水线

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

## 会话持久化句柄

`ctx.sessionPersistence` 是会话日志的后端接缝，提供 `create()`、`open()`、`stat()` 和 `list()`；`create()` 与 `open(id, 'write')` 返回 `SessionHandle`。句柄统一提供 `read()`、`append()`、`flush()` 和 `close()`，避免消费方绕过后端直接按会话编号读写。

只有通过句柄获取的会话才会持久化。`append()` 是尽力写入，`flush()` 是耐久屏障并会物化空会话；写句柄采用进程内单写者所有权，读句柄不能变更，关闭是幂等的并会等待待写操作完成。当前唯一随附的提供方是 `dsh-session-persistence-jsonl`，默认每个会话使用一个 `.jsonl.zstd` 追加文件，`compression: 'none'` 时使用换行文本。

恢复时不要把中断轮次直接截断原始日志；agent-loop 通过写句柄补写合成的关闭事件，查询侧只在内存中平衡冷日志。新增持久化消费方时应覆盖句柄读写、单写者、刷盘和关闭语义。

## 会话投影

`dsh-session-projection` 提供 `ctx.sessionProjections`。注册表只订阅一次 `session/event`，把每个已提交事件增量折叠到领域投影单元；领域贡献方只实现纯 `init` 与 `apply`，客户端收到的是已经计算好的完整视图，不需要自行折叠事件。

宿主侧用 `stateOf(session, key)` 读取类型化状态，载体用 `snapshot(session, keys)` 读取一致的客户端视图。消费方应在依赖中声明 `sessionProjections`，缺少注册表或必需投影键时明确失败；不能用静默默认值掩盖能力缺失。投影结果按 `Object.is` 判断是否真正变化，必要时通过 `viewKey` 或变更流驱动客户端更新。

会话的新类型约定还区分 `SessionSeq` 与 `SessionLogOffset`：前者表示事件在会话日志中的序号，后者表示日志范围、前缀长度或读取偏移。两种品牌虽然序列化后都是数字，但不能在 API、投影水位线或持久化边界中混用。

## 图片附件与富内容

图片附件属于持久化的跨层能力，不要把临时浏览器地址、路径或提供方 URL 直接塞进会话事件或模型消息。通过 `ctx.attachments` 完成以下操作：

- 使用 `validateImage` 校验 PNG、JPEG、WebP 或 GIF；批量上传使用 `saveImages` 时，先完成整个批次的校验，再开始任何写入。
- 使用 `saveImage` 或 `saveImages` 持久化规范化图片，使用 `readImage` 读取；默认存储在 `<DSH_HOME>/attachments/v1`。本地实现限制为每条消息最多 20 张、源图总量不超过 200 MiB、单张不超过 20 MiB、64,000,000 像素和单边 8192 像素，规范化默认长边 2048 像素且编码数据不超过 4 MiB。
- 只有协议边界的 `EncodedImageAttachment` 可以承载规范 Base64，入口使用 `admitEncodedImages`；会话事件和模型输入只携带不透明的 `ImageAttachmentRef` 及元数据。
- `readImageRequest` 按路由的像素和字节策略生成并缓存模型请求版本；`imageHostPath` 只询问提供方持有的宿主位置，不代表当前工具执行环境一定可读，使用前必须由当前执行文件系统判断。

需要扩展图片能力时，先确认附件已经持久化，再设计事件、恢复、规范化和前端渲染路径；不能只在浏览器状态中保存图片。

## 文件引用与 `@file`

文件引用 seam 只负责路径发现和 mention 格式，不拥有文件系统访问，也不会把文件内容附在提示词中。`ctx.fileReferences.list(agent, query, signal)` 返回指定工作区内仅含路径的候选；选中后格式化为 `@path` 或 `@"path with spaces"`。浏览器通过 `fileReferences/list` Remote 使用同一能力。

本地工作区使用 `@deepseek-ai/dsh-file-reference-local`，并确保它与实际生效的 `read` 工具使用同一命名空间。模型要查看被引用文件，仍必须显式调用 `read` 工具；`.gitignore` 不会自动改变补全范围，需使用提供方的排除目录配置。

## 实验性智能体团队（Agent Teams）

`ctx.agentTeams` 由持久化的 Lead 会话承载团队 roster、同伴邮箱和共享任务 DAG。成员拥有持久 Session id，消息先写入 Lead 会话再尝试投递；任务每次变更都会递增 `revision`，更新必须使用比较并交换，`writeScopes` 只是提示性路径前缀，不是文件锁。

团队服务提供 `membership`、`listMembers`、`spawnTeammate`、`sendMessage`、`createTask`、`getTask`、`listTasks`、`updateTask`、`waitForChange` 和 `interrupt` 等方法；Lead 才能创建或中断成员。团队消息写入 Lead 会话后统一尝试通过 `Steer` 投递：运行中的成员在最近步骤边界收到，空闲成员被唤醒，非活动成员冷恢复；调用方不能选择 quiet 或 followup 调度模式，工具包当前提供 9 个工具。该功能仍是实验性的，需要持久化会话和 `@deepseek-ai/dsh-experimental-tool-agent-team` 工具包，不能把它当作普通一次性子代理队列。

## 会话导出

`@deepseek-ai/dsh-session-log-export` 为 Web 提供 `Session log` 操作和 `/export` 命令。浏览器先对 `GET /api/session.export?sessionId=<id>&includeDescendants=true` 发起预检，再下载包含当前会话、子会话和附件的 ZIP；目标位置由浏览器选择，不会写入宿主路径，也不会创建模型轮次。

该能力依赖 Connection、命令注册表、会话查询与持久化、附件服务以及逐会话原始产物后端。导出读取 JSONL 原始产物，不是 SQLite 导出；活动根会话会在读取前 flush，冷会话不需要 flush。

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
- [智能体生命周期](https://deepseek-harness.github.io/deepseek-harness/reference/agent-lifecycle)
- [工具执行流水线](https://deepseek-harness.github.io/deepseek-harness/reference/tool-execution-pipeline)
- [能力 seam](https://deepseek-harness.github.io/deepseek-harness/reference/capability-seams)
- [API Gateway](https://deepseek-harness.github.io/deepseek-harness/reference/api-gateway)
- [会话投影](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/session-projection)
- [会话持久化](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/persistence)
- [网络代理指南](https://deepseek-harness.github.io/deepseek-harness/guide/network-proxy)
- [新增 Remote API 实操手册](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cookbook/adding-a-remote-api.zh.md)
