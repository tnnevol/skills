---
name: dsh
description: >-
  用户需要安装、运行、配置、排错或扩展 DeepSeek Harness（dsh）时使用，包括 profile 组合、Web 界面、工作区、智能体模式预设、无头任务、插件、Cordis、工具、模型适配器、会话、设置卡片、图片附件、子代理和能力接缝。
metadata:
  author: Tnnevol
  version: "2026.08.18"
---

# dsh 技能

使用本技能处理 DeepSeek Harness（简称 dsh）的安装、使用、配置和开发问题。它依据本地 deepseek-harness 项目中的中文文档整理；需要精确的类型、配置字段或当前实现时，优先读取用户工作区中的源项目文档和源码。

## 何时使用

- 用户提到 dsh、DeepSeek Harness、Cordis、profile、组合包或 Harness 插件。
- 用户需要运行 Web 界面、选择工作区或智能体模式预设、一次性无头任务、源码版本或 Python SDK。
- 用户需要添加工具、模型适配器、服务、事件、会话节点、文件系统或其他可替换能力。
- 用户需要解释智能体轮次、工具流水线、会话日志、配置覆盖、插件生命周期、Web 设置卡片、图片附件、子代理或排错方法。

## 安装

### 使用已发布版本

~~~sh
npx @deepseek-ai/dsh web
~~~

真实模型调用需要 DEEPSEEK_API_KEY。不要把密钥写入提交内容、对话或日志；可使用环境变量或项目根目录中被忽略的 .env 文件。

### 使用源码

源码开发要求 Node.js 22.19+ 或 24+，并使用仓库固定的 pnpm 版本：

~~~sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
corepack enable
pnpm install
pnpm run typecheck
pnpm run build
pnpm dsh web
~~~

仓库当前固定使用 `pnpm@11.7.0`；启用 Corepack 后不要用其他 pnpm 主版本替换它。

源码运行前，首次检出或构建产物需要更新时先执行 pnpm run build。开发态启动器 pnpm dsh 会直接运行 TypeScript 入口；已发布版本使用构建后的入口。

## 使用

先根据任务读取对应参考：

| 任务 | 必读参考 |
| --- | --- |
| 运行 profile、Web、无头任务、插件管理或查看配置 | [命令行与 profile](references/cli.md) |
| 理解 Cordis、事件、会话、工具流水线或能力归属 | [架构与运行时](references/architecture.md) |
| 编写插件、工具、服务、事件、模型适配器或 Web 节点 | [扩展开发](references/extension.md) |
| 查找项目文档、子系统和生成目录 | [文档索引](references/docs-map.md) |

常用命令：

~~~sh
dsh web
dsh --profile web --dump-config
dsh --profile headless "总结当前工作区"
dsh plugin --profile <name> add <package-or-git-spec>
dsh --version
~~~

dsh web 是 --profile web 的别名，默认监听 127.0.0.1:3080。无头模式接收一条任务文本，成功完成时退出码为 0，其他结束原因退出码为 1。启动器参数必须出现在应用参数之前；应用参数从第一个无法识别的令牌开始交给 profile。

首次打开 Web 界面时，先在“设置 → 模型”中保存模型配置，再选择工作区；未选择工作区前不能输入任务。内置智能体模式包括标准模式、PTC 模式、极简模式和创造模式：标准模式功能完整，PTC 模式通过代码模式 SDK 组合多步操作，极简模式只提供持久 bash 与 `str_replace_editor`，创造模式用于编写自定义智能体预设。

## 关键规则

1. **所有能力都是插件。** 模型适配器、工具、会话、提示词、文件访问和 agent loop 都通过 Cordis 挂载；扩展优先新增插件或替换配置层，不要把功能硬编码进启动器或循环。
2. **改动 packages/ 前先读架构文档。** 先确定能力的 Service Definition、Provider 和 Consumer，再选择已有 seam 或事件扩展点。
3. **理解 patch 的整行替换语义。** profile 组合包、profile 自身的 cordis.patch.yml、$DSH_HOME/cordis.patch.yml 和命令行 --patch 按顺序叠加；后者覆盖前者。同一条配置行被 patch 时，config 是整体替换而不是深度合并，覆盖时必须保留需要的 !!js 表达式。
4. **模型可见内容必须可回放。** 进入模型请求的新增上下文要扩展 SessionEventMap 并从会话日志派生；不要只写实时 agent/* 状态。
5. **图片附件必须先校验并持久化。** 使用 `ctx.attachments` 的 `validateImage`、`saveImage`、`saveImages` 和 `readImage`；批量保存要先完成全部校验，事件和模型只传递不透明附件引用，不要传递浏览器地址、文件路径或 Base64。
6. **生命周期必须可逆。** 通过 ctx.on()、注册表或 ctx.effect() 建立的资源要能在插件卸载、HMR 和退出时清理；异步清理必须等待完全停稳。
7. **不要凭记忆猜配置和类型。** 优先运行 --help、--dump-config，再查看当前分支的配置目录、子系统页面或源码。

## 扩展开发工作流

1. 明确需求是运行配置、用户级插件，还是仓库内新包。
2. 用架构与运行时把需求映射到服务、事件、工具、会话、设置卡片、图片附件、子代理或 UI seam。
3. 阅读对应的中文教程或实操手册；复杂能力不要直接改 agent loop。
4. 为注册、卸载、错误路径和真实组合入口补充测试；模型可见或用户可见变化需要快照或端到端覆盖。
5. 运行与改动表面匹配的最小检查集；包或构建产物变化时再增加 pnpm run build、pnpm run typecheck、pnpm run lint 等检查。
6. 文档变更运行 pnpm run doc-sync，并保持中英文配对和生成目录同步。

## 功能概览

- **运行时组合**：用具名 profile、组合包和 patch 叠加出 Web 或无头运行时。
- **智能体模式**：使用标准、PTC、极简或创造模式，按需选择工具集合和扩展能力。
- **模型接入**：通过 ctx.llm 注册适配器，统一处理流式分片、工具调用、用量、取消和错误。
- **模型工具**：通过 ctx.tools.register() 注册 schema、执行器、策略钩子和 UI 展示投影。
- **会话与 agent**：通过持久会话事件记录模型可见事实，通过实时 agent 事件协调输入、步骤、请求、继续执行和错误恢复。
- **Web 扩展**：通过设置卡片暴露配置和凭据，通过可回放的图片附件引用传递富内容。
- **子代理与任务**：通过子代理 seam 启动一次性或可继续的后台工作，并检查能力、权限和任务生命周期。
- **能力替换**：文件系统、shell、终端、沙箱、审批、子 agent、Web、存储和持久化均通过可替换 seam 接入。
- **开发方式**：既可以用本地 cordis.yml 或 --patch 快速验证，也可以发布带 dsh.bundle 声明的插件包供 profile 安装。

## 排错与验证

- 启动失败：先用 dsh --profile <name> --dump-config 检查组合后的配置、patch 顺序和未匹配目标。
- 参数不生效：确认启动器参数位于应用参数边界之前，并检查 patch 是否整体替换掉了读取 ctx.cmdlineArgs 的 !!js 配置。
- Web 首次使用异常：确认已在设置中保存模型并选择工作区，再检查工作区中的 AGENTS.md、权限模式和工具模式。
- 插件不加载：检查模块路径、inject 服务是否存在、配置 schema 是否通过，以及是否误把 profile 参数交给了启动器。
- 运行时行为异常：先查看 session/event 持久日志，再区分实时 agent/* 事件、工具 tools/* 事件和模型 llm/stream 事件；需要搜索或遥测时核对 `DEEPSEEK_SEARCH_BASE_URL`、`DSH_TELEMETRY_MODE` 和 `DSH_TELEMETRY_DISABLED`。
- 图片显示或恢复异常：确认附件已经通过 `ctx.attachments` 校验并持久化，且会话事件保存的是不透明引用而不是临时路径或浏览器地址。
- 源码提交前：按改动范围运行相关单元测试、真实组合测试或快照；需要发布入口时使用构建产物验证，不要只验证 tsx 源码入口。

## 参考

- [DeepSeek Harness 在线文档](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)
- [命令行与 profile](references/cli.md)
- [架构与运行时](references/architecture.md)
- [扩展开发](references/extension.md)
- [文档索引](references/docs-map.md)
