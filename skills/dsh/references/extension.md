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

工具的 Code Mode 会直接调用规范 JSON 结果，不能依赖渲染后的自然语言解析标识符。工具的展示函数必须是纯函数，不做 I/O、不读会话状态、不使用时间或随机数。

## 模型适配器

实现 LlmAdapter 的 stream()，在 ctx.llm 注册提供方路由。必须遵守：

- usage 在 finish 之前发出，finish 之后不再发出内容。
- 工具调用参数以原始 JSON 字符串和 argumentsDelta 分片传递。
- 按首次出现顺序分配 block index，同一 block 后续分片复用该索引。
- 传递 options.signal；不支持的生成字段抛出带稳定错误码的 LlmError。
- 传输或协议故障抛出异常；提供方带内失败以 finish { kind: 'error' | 'aborted' } 结束，并保持消费方可区分。
- 后续请求所需的响应 ID、签名等原生状态放入最小可回放的 finish.replayState，不要仅凭 provider 和 model 名称猜测恢复状态。

密钥使用 Cordis 配置和环境变量回退，不要自行读取约定的密钥文件。

## Web Client Conversation Node

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
- [扩展插件形态](https://deepseek-harness.github.io/deepseek-harness/reference/cookbook/extension-cookbook)
- [添加 Web Client Conversation Node](https://deepseek-harness.github.io/deepseek-harness/reference/cookbook/adding-a-conversation-node)
- [打包与安装插件](https://deepseek-harness.github.io/deepseek-harness/develop/basic/publish)
