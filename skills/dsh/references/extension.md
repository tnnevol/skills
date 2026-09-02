# 扩展开发

本文把 Cordis 教程和 cookbook 转成面向实现的步骤。代码示例只保留最小形态；具体类型、配置字段和生成目录以当前源码为准。

## 第一个插件

插件通常导出 name、可选的 inject 和 apply：

~~~ts
import type { Context } from '@deepseek-ai/cordis'

export const name = 'my-plugin'

export function apply(ctx: Context) {
  console.log('plugin loaded')
}
~~~

在本地 patch 中用绝对路径加载：

~~~yaml
- insert:
    - id: my-plugin
      name: /absolute/path/to/my-plugin.ts
~~~

然后运行：

~~~sh
pnpm dsh web --patch ./cordis.patch.yml
~~~

路径解析由 profile 目录和 Node 模块规则负责；patch 只贡献配置，不改变模块解析根。

## 生命周期与依赖

需要服务时声明 inject，框架会在服务就绪后才运行 apply：

~~~ts
export const inject = ['tools']

export function apply(ctx: Context) {
  ctx.tools.register(/* ... */)
}
~~~

由 ctx.on()、服务注册表和子插件产生的注册会自动随 fiber 卸载。定时器、网络连接和 watcher 等外部资源要使用 ctx.effect() 并返回 disposer：

~~~ts
export function apply(ctx: Context) {
  ctx.effect(() => {
    const timer = setInterval(() => {}, 5_000)
    return () => clearInterval(timer)
  })
}
~~~

需要提供能力时使用 Service 子类，并通过 TypeScript 声明合并给 Context 增加类型；消费方只依赖服务名，不导入具体实现。可选能力不要写入硬性 inject，应该在使用处通过 ctx.get() 探测。

## 配置

导出同名的配置类型和 Schemastery schema，在 schema 中提供默认值和约束：

~~~ts
export interface Config {
  timeoutMs: number
}

export const Config = Schema.object({
  timeoutMs: Schema.number().default(30_000),
})

export function apply(ctx: Context, config: Config) {
  // config 已经完成校验
}
~~~

不同部署可能改变的值必须配置化，不能硬编码。无效配置应在插件加载时明确失败；配置变更会触发 HMR，旧实例的 effect 必须完整清理。

## Web 设置卡片

需要把插件配置放进 Web 设置页时，宿主端和客户端两侧必须使用同一个设置命名空间：

1. Host 侧通过 `installSettingsSection` 注册 schema、当前配置、校验和变更回调；秘密字段使用 `role('secret')`，或者通过 `credentials` 领域引用凭据。
2. 客户端在 `settings.plugin.item` 中注册同名卡片，通过 `ctx.settingsScope` 读取和写入设置，并使用读取时的版本号防止覆盖并发修改。
3. 宿主端放在 `src/`，浏览器端放在 `src/client/`，通过 `./client` 导出并在 package.json 中声明 `dsh.client`；客户端代码可使用 `import type { Context as ClientContext } from '@deepseek-ai/cordis'`，不要直接把浏览器代码塞进宿主端。

设置卡片的完整流程见[新增设置卡片](https://deepseek-harness.github.io/deepseek-harness/reference/cookbook/adding-a-settings-card)。

## 工具插件

工具通过 ctx.tools.register(defineTool(...)) 注册。最小约定是：

- parameters 描述模型参数，注册表会在执行前校验。
- output.schema 描述规范 JSON 结果；execute 只返回该结果，不返回面向人的内容块。
- output.render 负责模型可见内容；presentationMeta、presentCall 和 presentResult 负责可回放 UI 展示。
- execute 必须遵守 exec.signal，异常或无效返回值代表失败。
- 长任务使用 ctx.jobs.start() 和任务自己的取消信号；不要把已经发布的后台任务错误绑定到外层调用信号。
- 策略、超时、重试和审计优先放到 tools/pre-execute、tools/execute、tools/post-execute 或 tools/result，不要复制执行器。

~~~ts
export const name = 'greet-tool'
export const inject = ['tools']

export function apply(ctx: Context) {
  ctx.tools.register(defineTool({
    name: 'greet',
    description: '向指定的人问候',
    parameters: {
      name: { type: 'string', required: true },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args, exec) {
      exec.signal.throwIfAborted()
      return '你好，' + args.name + '！'
    },
  }))
}
~~~

工具的 PTC 模式会直接调用规范 JSON 结果，不能依赖渲染后的自然语言解析标识符。工具的展示函数必须是纯函数，不做 I/O、不读会话状态、不使用时间或随机数。

## 模型适配器

实现 LlmAdapter 的 stream()，在 ctx.llm 注册提供方路由。必须遵守：

- usage 在 finish 之前发出，finish 之后不再发出内容。
- 工具调用参数以原始 JSON 字符串和 argumentsDelta 分片传递。
- 按首次出现顺序分配 block index，同一 block 后续分片复用该索引。
- 传递 options.signal；不支持的生成字段抛出带稳定错误码的 LlmError。
- 不支持的生成选项使用稳定的 `UNSUPPORTED_OPTION` 错误码；模型路由应通过 `resolveModel` 等当前适配器约定解析，不要仅凭 provider 和 model 名称猜测能力。
- 传输或协议故障抛出异常；提供方带内失败以 finish { kind: 'error' | 'aborted' } 结束，并保持消费方可区分。
- 后续请求所需的响应 ID、签名等原生状态放入最小可回放的 `finish.replayState`。如果适配器返回 `ReplayEnvelope`，要让 envelope 的 blocks 与已组装的响应 blocks 一一对应，并在裁剪响应时同步裁剪 replay state；不要仅凭 provider 和 model 名称猜测恢复状态。

密钥使用 Cordis 配置和环境变量回退，不要自行读取约定的密钥文件。

## 图片附件

需要支持用户图片或模型图片输出时，使用 `ctx.attachments` 的 `validateImage`、`admitEncodedImages`、`saveImage`、`saveImages`、`readImage`、`readImageRequest` 和 `imageHostPath`。`saveImages` 必须先校验整个批次，再开始写入；只有持久化成功后才能追加所属会话事件。协议边界的 `EncodedImageAttachment` 可以使用规范 Base64，但会话和模型只保存 `ImageAttachmentRef` 及其 `ImageBlock` 元数据，不要保存浏览器对象 URL、提供方 URL 或未经抽象的路径。

`readImageRequest` 用明确的像素和字节策略生成确定性的模型请求版本；`imageHostPath` 只返回附件提供方持有的宿主位置，调用方仍须确认当前执行文件系统能够读取该位置。图片规范化与批量限制以源项目 `docs/subsystems/attachment.zh.md` 为准。

## 子代理与后台任务

子代理是可选能力接缝，不属于智能体循环。使用前先检查 `ctx.subagents` 已注册的提供方和 `SubagentCapabilities`，再按需求选择一次性启动或可继续的后台子代理；可继续子代理以持久会话和激活状态承载后续消息，不要自行再造一套队列或任务包装层。

`SubagentCapabilities.agentOptions` 为真时，`SubagentStartRequest.agentOptions` 才能覆盖 provider、model、reasoningEffort 和 token 限制；in-process 提供方在父配置上合并，SDK 提供方在默认值上合并，ACP、Codex 和 Claude Code 提供方会拒绝这些选项。当前提供方包名包括 `@deepseek-ai/dsh-subagent-spawn-in-process`、`@deepseek-ai/dsh-subagent-fork-in-process`、`@deepseek-ai/dsh-subagent-acp`、`@deepseek-ai/dsh-subagent-codex`、`@deepseek-ai/dsh-subagent-claude-code` 和 `@deepseek-ai/dsh-subagent-dsh-sdk`。

生产 dsh 默认不安装 Codex 或 Claude Code 提供方，需要在 profile 中独立安装 `@deepseek-ai/dsh-subagent-codex` 或 `@deepseek-ai/dsh-subagent-claude-code`，并在宿主组合中挂载一次。添加、移除或更新 Bundle 后必须重启 profile；新 Agent 还要在复制出的 Preset 中启用对应工具行。所有子代理操作都要检查父子关系、权限、取消信号和清理时机。

## 文件引用与 `@file`

需要在 Web 或终端中提供文件补全时，挂载 `@deepseek-ai/dsh-file-reference` 以及与实际 `read` 工具使用同一命名空间的提供方。常用本地提供方是 `@deepseek-ai/dsh-file-reference-local`。

`ctx.fileReferences.list(agent, query, signal)` 只返回路径候选；选中后插入 `@path` 或 `@"path with spaces"`，不会读取或附带文件内容。模型必须通过生效的 `read` 工具查看文件；提供方若与工具命名空间不一致，补全将不能代表模型实际可访问的路径。

## 宿主端 Remote 与客户端适配

需要把宿主端能力提供给浏览器时，在宿主服务或控制器上使用 `@Remote`、`@RemoteScope` 声明方法，让 Typert 生成客户端投影；客户端通过 `ctx.remote` 或 `agentCtx.remote` 调用，不要自行拼接 HTTP 请求。Connection 负责认证、连接代际、请求相关性和流式载荷，Gateway 负责分发、取消、逻辑流与转发事件。

### 新增 Remote API

按当前实操手册分五步实现：

1. 宿主端服务继承 `TypertRemoteService`，绑定服务键与命名空间，用 `@Remote` 暴露方法；lookup 对象只能占顶层参数，协作式取消的 `signal: AbortSignal` 放在最后。
2. 用一个 `RemoteError` 表达跨传输协议失败，通过 TypeScript 声明合并把 `<domain>/<reason>` 加入 `RemoteErrorDetailsMap`。直接抛出业务域错误；只有需要把任意提供方异常归一化时才捕获并保留 `cause`。`gateway/bad-request`、`gateway/cancelled` 和 `gateway/internal` 已由基础设施提供，不要重复声明。
3. 在 Loader 入口包中注册生成入口，维护 `./typert` 与 `./remote` 导出；签名、错误码、命名空间或导出名改变后运行 `pnpm run build:lib`。
4. 客户端调用方在 `inject` 中同时声明 `remote` 与 `remote.<namespace>`，直接调用 `ctx.remote.<namespace>.<method>()`。返回值是 `RemoteResult<T>`，按 `result.ok` 和 `error.code` 分支；不要手写客户端方法签名、不要窄化成 `Pick`、不要用 `instanceof` 判断远程失败。需要向上层转成异常时抛出 `result.error`，捕获时用 `isRemoteFailure` 区分 Remote 失败和本地缺陷。
5. 宿主端测试用 `remoteErrorOf` 检查 `code` 和 `details`，客户端测试用 `@deepseek-ai/dsh-client-test-runtime` 提供的 `RemoteError` 与 `TestRemote`。固定宿主信息通过 `ctx.remote.$host` 读取；取消一元调用时检查 `gateway/cancelled` 错误分支。

完整步骤和示例见[新增 Remote API 实操手册](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cookbook/adding-a-remote-api.zh.md)与[API Gateway 参考](https://deepseek-harness.github.io/deepseek-harness/reference/api-gateway)。

设置控制器的远程读取必须使用 `redactSecrets: true`。配置写入优先使用 settings service 的 `update`、`replace` 或带 `expectedRevision` 的 `mutate`；打开设置文档和用户 preset 目录时使用 `openSettingsDocument`、`openAgentPresetDirectory`，这两个方法不接受浏览器传入的宿主路径。

## 实验性智能体团队

需要多个可继续的成员共享任务板时，选择实验性的 `@deepseek-ai/dsh-experimental-agent-team` 与 `@deepseek-ai/dsh-experimental-tool-agent-team`。通过 `ctx.agentTeams` 使用 `spawnTeammate`、`sendMessage`、`createTask`、`updateTask`、`waitForChange` 和 `interrupt` 等 API；成员、消息和任务快照由 Lead 会话持久化，任务更新必须携带预期 `revision`，`writeScopes` 只是提示性范围而不是锁。创建或中断成员仅允许 Lead，所有恢复、取消和权限错误都应按团队返回的类型处理。

源码 checkout 中需要把 `@deepseek-ai/dsh-experimental-agent-team-profile` 添加到已有的 `dsh-base` profile；它负责启用 Team domain 和 Team-scoped 工具。Web profile 还要在 `dsh-web-app` 与 Host 团队层之后添加 `@deepseek-ai/dsh-experimental-agent-team-web-profile`，以提供 roster、任务板和成员导航。两个 profile 层只在源码 checkout 中提供，正式发布不包含它们。

## Web 客户端对话节点

需要新增 Web 对话业务节点时：

1. 先设计可以持久化和回放的事件族。
2. 实现 ConversationNodeDefinition 和类型化 Chat payload。
3. 只在节点 start 阶段读取较早的业务上下文。
4. 区分持久日志、实时通知和页面重连时的回放路径。
5. 验证回放、分页、渲染和旧日志兼容性。

不要把一次性 UI 状态偷偷放进模型规范结果或只存在浏览器内存中。

## 发布为 profile 插件

先确认需求是本地 --patch 试验，还是可安装的 workspace 包：

1. 新包放入正确的 packages/<aggregate>/ 目录，只进入 Host 或 Client 一个 aggregate。
2. 配置 package.json、tsconfig、入口导出和包 README。
3. 组合包在 manifest 中声明 dsh.bundle.patch；profile 通过 dsh.profile.bundles 声明组合层。
4. 运行 pnpm dsh plugin --profile <name> add <package> 安装并验证组合层。
5. 使用 dsh --profile <name> --dump-config 确认 patch 顺序、依赖和命令行表达式。

新增 vendored 包时，先阅读 vendor/README.md 和对应 cookbook；除源码、路径映射、Host 引用外，还要维护 vendor manifest。

## 测试与文档

- 注册表扩展至少覆盖卸载、HMR 和重复注册错误。
- 影响模型、协议或用户界面的改动要通过真实组合入口测试；仅手动构造 Context 不够。
- 会话和 UI 行为变化要增加或更新无密钥快照；需要真实服务时再运行带密钥 e2e。
- 测试必须验证外部结果、持久日志或文件，不要只检查 agent 自己的文字描述。
- 文档写当前状态，避免把历史决策写成运行规则；中英文文档保持配对，生成目录不要手工改。

## 对应源文档

- [第一个插件](https://deepseek-harness.github.io/deepseek-harness/develop/basic/)
- [插件配置](https://deepseek-harness.github.io/deepseek-harness/develop/basic/config)
- [开发一个工具](https://deepseek-harness.github.io/deepseek-harness/develop/basic/tool)
- [添加 workspace 包](https://deepseek-harness.github.io/deepseek-harness/reference/cookbook/adding-a-package)
- [工具编写参考](https://deepseek-harness.github.io/deepseek-harness/reference/cookbook/adding-a-tool)
- [添加 LLM 适配器](https://deepseek-harness.github.io/deepseek-harness/reference/cookbook/adding-an-llm-adapter)
- [新增设置卡片](https://deepseek-harness.github.io/deepseek-harness/reference/cookbook/adding-a-settings-card)
- [API Gateway](https://deepseek-harness.github.io/deepseek-harness/reference/api-gateway)
- [新增 Remote API 实操手册](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cookbook/adding-a-remote-api.zh.md)
- [扩展插件形态](https://deepseek-harness.github.io/deepseek-harness/reference/cookbook/extension-cookbook)
- [Web 客户端架构](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/web-client)
- [客户端 Slots](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/slots)
- [Conversation 组装](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/conversation)
- [添加 Web 客户端对话节点](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/conversation)
- [子代理子系统](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/subagent)
- [设置子系统](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/settings)
- [会话引用](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/session-reference)
- [打包与安装插件](https://deepseek-harness.github.io/deepseek-harness/develop/basic/publish)
