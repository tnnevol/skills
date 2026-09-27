# 命令行与 profile

本文整理 apps/cli/reference/README.zh.md、docs/development.zh.md 和用户指南中的可操作内容。命令、配置键和环境变量保持源项目原名；解释使用中文。

当前源项目版本为 `0.1.7-rc.2`。项目仍处于开发者预览阶段，未来可能包含破坏性变更。源码开发要求 Node.js 22.19+ 或 24+，仓库当前固定使用 `pnpm@11.7.0`。执行 `corepack enable` 后使用仓库声明的 pnpm 版本，不要凭全局 pnpm 版本判断兼容性。

## 运行方式

### 已发布版本

~~~sh
npx @deepseek-ai/dsh web
~~~

### 源码版本

~~~sh
pnpm install
pnpm run build
pnpm dsh web
~~~

pnpm dsh 通过 `node --import tsx/esm` 运行 `apps/cli/src/bin.ts`。新检出或缺少构建产物时，先执行 `pnpm run build`；构建完成后缺少前端产物会在启动时明确提示继续构建。源码入口不会检查产物是否新鲜，旧产物可能继续提供旧版浏览器代码。`HTTP_PROXY` 和 `HTTPS_PROXY` 会在启动时读取，不需要额外设置 Node 代理开关。

### 网络代理

dsh 会为模型、Web 搜索、Web 抓取和 HTTP MCP 服务器请求读取标准代理变量：

- `HTTP_PROXY`、`HTTPS_PROXY` 可以在启动环境或 `$DSH_HOME/.env` 中配置；启动环境优先，项目 `.env` 不能控制 dsh 的出站流量。
- `NO_PROXY` 支持主机名、子域名、带端口的主机、`*`、`.` 和 `*.` 规则；不支持 CIDR，回环地址始终绕过代理。
- 不支持 SOCKS 代理地址；请改用 HTTP 代理端点。TLS 检查代理可在启动前设置 `NODE_EXTRA_CA_CERTS=/path/to/corporate-ca.pem`。
- dsh 启动的工具会继承代理变量；Node 22.21+ 的子进程才会按这些变量自动使用代理，较旧 Node 子进程可能直连。

完整的直连范围、验证命令和安全注意事项见[网络代理指南](https://deepseek-harness.github.io/deepseek-harness/guide/network-proxy)。

## Profile 启动

~~~sh
dsh --profile <name>
dsh <name>
dsh web
dsh --profile headless "执行一项任务"
dsh --profile <name> --from-default-profile <template>
~~~

`dsh <name>` 是 `dsh --profile <name>` 的简写，但名称必须紧跟 `dsh`；`plugin` 仍表示插件管理命令，启动同名 profile 必须写成 `dsh --profile plugin`。`web` 是固定别名。`web`、`headless`、`sdk`、`sdk-minimal` 和 `acp` 在首次使用时从随发行版提供的模板自动初始化；其他不存在的 profile 需要先执行插件管理命令安装组合包，或使用 `--from-default-profile` 从随附模板创建。随附组合包还包括 `@deepseek-ai/dsh-sdk-app`、`@deepseek-ai/dsh-sdk-minimal` 和 `@deepseek-ai/dsh-acp-app`。

各内置 profile 的运行边界如下：

| profile | 运行方式 | 主要特点 |
| --- | --- | --- |
| `web` | HTTP 与浏览器客户端 | 提供 Web UI，支持实时 patch |
| `headless` | 一次性命令 | 接收一条任务文本，不启动 HTTP 服务 |
| `sdk` | 标准输入输出 JSON-RPC | 使用完整基础组合，适合 SDK 调用 |
| `sdk-minimal` | 标准输入输出 JSON-RPC | 独立组合，固定 `danger-full-access`，不发现指令、不使用 SQLite |
| `acp` | 标准输入输出 Agent Client Protocol | 通过 ACP 接入智能体 |

profile 的重载行为由 `dsh-hmr` 配置行决定：base 默认只监视配置的 HMR，`headless`、`sdk` 和 `acp` 禁用它，`sdk-minimal` 不包含它，profile patch 可以覆盖这些默认值。启用 HMR 时，修改 profile/home patch 会串行重组配置；未启用时需要重启进程。`desktop` 是 Electron 保留的 profile 名称，CLI 不负责启动、dump 或管理它。

profile 的有效配置树按以下顺序叠加到空根节点：

1. profile manifest 中 dsh.profile.bundles 列出的组合包 patch。
2. profile 自身的 cordis.patch.yml。
3. home 级 $DSH_HOME/cordis.patch.yml。
4. 命令行中按顺序传入的每个 --patch <path>。

后应用的层优先级更高。patch 按 id 定位配置行，可以插入新行，也可以替换目标行；替换时整个 config 值都会被替换，不会做深度合并。组合包从 dsh 安装目录或 profile 的依赖中解析，普通 patch 中的裸插件名从 profile 目录按 Node 模块规则向上查找。

使用 `dsh --profile <name> --from-default-profile <template>` 可以从 `web`、`headless`、`sdk`、`sdk-minimal` 或 `acp` 模板创建新的自定义 profile。目标名称不能是内置 profile，目标目录必须尚不存在；该命令只复制模板的 bundle 列表和 `patchReload`，不会复制模板依赖、用户 patch 或继承字段。创建成功后会继续启动目标 profile：

~~~sh
dsh --profile rescue --from-default-profile web
dsh --profile rescue
~~~

目标目录已经存在、模板未知或目标名称为 `desktop` 时，命令在修改或启动前失败。`--dump-config` 与 `--dump-default-config` 也接受该选项，会初始化并输出配置树但不启动应用；后续应用启动失败不会自动删除已创建的 profile。

## 应用参数边界

启动器参数必须放在第一个无法识别的令牌之前；从边界开始的内容通过 ctx.cmdlineArgs 原样交给已启动的 profile。

~~~sh
dsh --profile web --port 3080
dsh web --host 127.0.0.1 --port 3080
dsh --profile headless "检查测试并修复失败项"
~~~

使用 `dsh -V` 或 `dsh --version` 查看启动器版本；这两个参数必须位于应用参数边界之前。

`plugin` 仅在紧跟 `dsh` 时选择插件管理命令；选定 profile 后，`plugin` 和 `web` 都是普通应用参数。应用参数开始前重复指定 `--profile` 会被拒绝。应用帮助会直接退出，不会启动应用。

随附 profile 的参数如下：

| profile | 参数 |
| --- | --- |
| web | `--host`、`--port`、可重复的 `--trusted-host`、`--no-open` |
| headless | 一条作为位置参数的任务文本 |
| sdk | 无选项；标准输入输出承载 JSON-RPC |
| sdk-minimal | 无选项；标准输入输出承载相同的 JSON-RPC |
| acp | 无选项；标准输入输出承载 Agent Client Protocol |

启动器自身会消费一个 --。如果应用必须收到字面量 --，需要写成 -- --。dsh --help 显示启动器帮助；dsh web --help 显示 Web 应用帮助并且不启动应用。

无头任务会创建一个新的持久智能体，提交任务，等待完全停稳，刷新会话并读取最终的 `turn/end` 原因，然后从持久事件区间读取最后一段非空 assistant 文本。非空的提供方推理会以 `dsh: reasoning:` 前缀流式写入 stderr，最终文本只写入 stdout；没有任务文本属于用法错误，只有 `completed` 原因成功退出 0，其他结束原因退出 1，错误原因还会输出 `dsh: <code>: <message>`。该 profile 不启动 HTTP 服务器、Web 运行时或浏览器客户端。

## 配置查看

~~~sh
dsh --profile web --dump-default-config
dsh --profile web --patch ./extra.yml --dump-config
dsh --profile web --dump-config-schema
dsh web --dump-config
~~~

- --dump-default-config 只显示组合包层。
- --dump-config 还显示 profile、home 和命令行 overlay。
- 输出带有每行来源和被哪些 overlay 修改的注释。
- !!js 表达式保持未求值。
- 未匹配的 patch 目标输出到标准错误。
- dump 不运行应用参数提供方；带应用参数的 dump 会被拒绝。

需要改配置时，先保存 dump 结果，再以最小 patch 覆盖目标行，避免无意删除组合包提供的字段或运行时表达式。dump 初始化缺失的 profile 文件，但不会准备 `$DSH_HOME/profiles/node_modules` 的运行时后备链接；插入行中的相对插件名按对应 patch 文件所在目录解析。

### 配置 schema dump

`--dump-config-schema` 使用与 `--dump-config` 相同的组合包、profile、home 和 argv patch 层，支持重复 `--patch` 与 `--from-default-profile`，但不接受应用参数，也不能用于保留的 `desktop` profile。成功时 stdout 输出 JSON Schema 2020-12 文档：根 schema 描述配置 entry 列表，`$defs.patchList` 描述 profile、home 和 CLI overlay；它输出的是插件声明的 schema，不是实际配置值。

三种 dump flag 互斥。schema 收集或投影失败时可能输出部分 schema 并以退出码 1 结束，诊断写入 stderr；检查不受信任插件前，应把 schema dump 视为会导入并执行其配置声明的操作。需要来源文件和 overlay 标签时，使用 `--dump-config`。

### 启动诊断

必需插件激活失败时，CLI 会列出失败插件、等待中的插件和缺失服务，并在 `$DSH_HOME/logs/`（默认 `~/.dsh/logs/`）写入唯一的 `startup-<timestamp>-<uuid>.log`。诊断报告不脱敏，分享前必须检查其中的配置、路径和凭据内容；可选插件失败仅产生警告，通常不创建报告。

## 插件管理

~~~sh
dsh plugin --profile <name> add <package-or-git-spec>
dsh plugin --profile <name> remove <package>
dsh plugin --profile <name> why <package>
dsh plugin --profile <name> update
dsh --profile <name>
~~~

dsh plugin 在 profile 不存在时初始化它：有随附模板的 profile 使用对应模板，其他名称只安装 `@deepseek-ai/dsh-base`；然后在 profile 目录中把后续参数转发给 pnpm。相对路径 spec（例如 .、../plugin、file:、link:）优先相对于调用目录解析，因此在插件 checkout 中执行 `add .` 时安装的是当前 checkout。

成功执行后，dsh 会根据安装状态重建 dsh.profile.bundles：依赖的 manifest 声明了 `dsh.bundle.patch` 时，它的 patch 会加入组合层；依赖在 `update` 后新增该声明也会随即激活；没有组合声明的依赖仍会保留为普通依赖并提示一次；被移除的依赖会从组合层移除。该命令支持后续的所有 pnpm 子命令，不限于 add、remove、why 和 update。

Git 插件如果依赖 prepare 构建脚本，pnpm 10+ 可能要求在 profile 的 pnpm-workspace.yaml 中允许该构建。首次安装失败时，按照 pnpm 输出的 allowBuilds 键添加后重试；已经构建好的压缩包或本地检出通常不需要该许可。

安装和 profile 启动会按插件声明的 DSH peer 范围，检查插件是否兼容 `dsh --version` 的运行时版本。不兼容插件会被明确拒绝；只有用户明确确认精确版本豁免才允许继续。`version-exemptions`、`allow-version` 与 `revoke-version` 会持久化在 profile 插件配置中，使用前应理解其会绕过版本兼容门禁。

Codex 与 Claude Code 是彼此独立的可选子代理组合包，可以单独安装或移除：

~~~sh
dsh plugin --profile <name> add @deepseek-ai/dsh-subagent-codex
dsh plugin --profile <name> add @deepseek-ai/dsh-subagent-claude-code
dsh plugin --profile <name> remove @deepseek-ai/dsh-subagent-codex
~~~

添加、移除或更新 Bundle 后，正在运行的 profile 仍保留启动时的 Bundle 集合，必须重启 profile；普通 profile 或 home 的 `cordis.patch.yml` 修改则按 `patchReload` 设置处理。新启动的 Agent 还需要在复制出的 Preset 中启用对应工具行；只安装 provider 并不会自动让现有 Agent 看到工具。

## Web 行为

~~~sh
dsh web
dsh web --patch ./extra.cordis.yml
dsh web --trusted-host example.com
dsh web --no-open
~~~

默认服务地址为 `http://127.0.0.1:3080`。`--host` 和 `--port` 覆盖保留了命令行表达式的配置行；`--trusted-host` 可重复传入，用于增加浏览器 `/api` 信任边界中的具名 authority；`--no-open` 只对本次调用关闭默认浏览器交接。当前 CLI 不接受 `--host 0.0.0.0`，需要按错误提示修正。`dsh-hmr` 会在组合启用时统一监听 profile 与 home patch；`pnpm run dev:web` 先构建一次并持续重建客户端 bundle，`--no-serve` 只运行 watcher。

本机启动时，Web 服务会在 Loader 完整结算后用默认浏览器打开规范宿主机 URL；设置 `SSH_CONNECTION` 或 `SSH_TTY` 时会跳过浏览器交接但仍打印 URL。浏览器交接失败不会停止服务，stderr 会提供诊断和手动访问地址。插件树退出时最多等待 5 秒完成 dispose；首次 `SIGTERM` 以 0 退出，首次 `SIGINT` 报告 130，第二次信号直接强制退出。

基于 base 的模式都以当前调用目录作为默认工作区根目录，并以 65,536 字节预算读取适用的 AGENTS.md 或 CLAUDE.md；会话索引使用内存 SQLite。独立的 `sdk-minimal` 以当前调用目录作为文件系统与沙箱根目录，但不发现指令、不使用 SQLite，权限固定为 `danger-full-access`，也不挂载审批或权限设置服务。

新会话默认使用 `workspace-write` 权限预设；`DSH_PERMISSION_MODE` 可改变进程级回退值。`DSH_TOOLS_MODE` 只接受 `native`、`ptc` 或 `both`，其他值会导致启动失败。

首次打开 Web 界面时，先在“设置 → 模型”中保存模型配置，再选择工作区；未选择工作区前不能输入任务。默认模型为 `deepseek-official` / `deepseek-flash`。内置智能体模式包括标准模式、PTC 模式、极简模式和创造模式：标准模式提供完整编码能力，PTC 模式默认不提供 `workflow` 工具，而是通过 PTC SDK 组合多步 TypeScript 操作，极简模式只提供按平台选择的持久 shell，创造模式用于编写自定义智能体预设。基于 base 的默认文件编辑工具为 `read`、`write` 和 `edit`；`str_replace_editor` 需要显式通过 patch 启用。极简模式固定使用 `You are a helpful software engineer assistant.` 作为完整系统提示词，不包含其他提示词段落。

标准、PTC 和 Cordis preset 还提供 `present` 文件交付工具。模型创建或修改了用户需要接收的文件后，应在最终回复前调用 `present` 声明路径；该工具只记录文件路径和说明，不复制文件内容。Web 交付卡片可在右侧 Sidebar 预览文件，也可调用宿主默认应用打开。

Web 的文件预览通过 `workspaceFiles` 按 Session 身份读取：`read` 提供有界 UTF-8 行窗口，`readBytes` 提供有界原始字节窗口，`readAll` 与 `readRelated` 提供受限完整读取，`list` 与 `changes` 只作用于 Session 工作区。不要把宿主路径直接交给浏览器绕过 Session 授权。

随发行版 Web 组合保留 `schedule`、`ui-schedule` 和 `time-context` 配置行但默认禁用；需要提醒功能时必须在 profile patch 中显式启用三者，并确认模型工具和页面组合同时加载。当前 Web 还提供用户反馈、插件管理、工作区改动摘要和文件交付卡片。

## 凭证与环境

基础组合会从继承环境、$DSH_HOME/.credentials.yaml、当前目录 .env、$DSH_HOME/.env 解析提供方凭证。凭据文件不会写回 process.env。常用变量：

~~~sh
export DEEPSEEK_API_KEY=sk-...
export DEEPSEEK_BASE_URL=https://...
export DEEPSEEK_SEARCH_BASE_URL=https://...
~~~

`DEEPSEEK_BASE_URL` 和 `DEEPSEEK_SEARCH_BASE_URL` 可选。搜索和 HTTP fetch 仍会拒绝非公网目标。不要提交真实密钥。

模型配置可以使用已安装提供方目录，也可以在 `$DSH_HOME/settings.yaml` 中声明自定义提供方。协议支持 `openai-completions`、`openai-responses` 和 `anthropic-messages`；一个提供方只使用一种协议。模型目录中的 `models` 列表会整体替换该路由的目录，`modelOverrides` 用于只修改某个已安装模型，`reasoningEfforts`、`input` 和 `compat` 用于声明推理等级、图片能力和网关兼容性。

“获取可用模型”只对目录未描述的自定义路由发起网络请求：OpenAI 协议请求带 bearer 鉴权的 `GET {baseURL}/models`，Anthropic 协议请求 `/v1/models?limit=1000`，使用 `x-api-key` 和 `anthropic-version: 2023-06-01`；列表地址会规范化末尾的 `/v1`，模型请求仍使用配置中的原始 `baseURL`。响应可以是标准 `data` 数组或 `models` 对象映射；Anthropic 只读取前 1000 条，不跟随 `has_more`。配置 profile 的 headers 会参与发现，新填写的密钥优先于已存凭据。探测失败时手动填写模型 ID，结果等价。

`deepseek-official` 路由默认提供建议性目录：`deepseek-flash`、`deepseek-v4-flash-vision-exp`（支持图片）以及 `deepseek-v4-flash`、`deepseek-v4-pro`（仅文本），默认上下文窗口为 1,000,000 token。显式写入 `models` 会替换这份目录；已配置模型 ID 会原样发送到协议，因此网关必须实际支持所选 ID。DeepSeek 路由默认推理强度为 `high`，可选 `off`、`low`、`high` 和 `max`。

基于 base 的 Web 组合还提供可选的 DeepSeek 账号登录和 `deepseek-account` 模型路由。账号路由只使用本地账号授权，不会回退到 API key；未登录时返回 `ACCOUNT_SIGN_IN_REQUIRED`，无效 token 返回 `ACCOUNT_TOKEN_INVALID`，账号路由配额错误使用 `ACCOUNT_QUOTA`。账号控制器 Remote 只返回状态和操作结果，不把 token 或 PKCE 私密数据交给浏览器。

基础组合包默认挂载原生 DeepSeek 适配器、设置与凭据提供方、稳定的 `web_search` 和 `web_fetch`、仅限公网的 HTTP 抓取提供方、`present` 文件交付工具，以及 OTel 会话上传。Web 应用会禁用基础工具配置项，再通过 `cordis`、`ptc` 与 `standard` 智能体预设暴露相同工具。已启用的抓取调用会在所有沙箱与审批模式下执行，无需逐次确认；提供方会在连接前拒绝非公开目的地址。

反馈记录在会话日志中，不会启动模型工作。默认开启的 DeepSeek 会话日志贡献器会随之后的 DeepSeek 请求发送尚未确认接收的完整日志后缀；将其 `enabled` 设为 `false` 可关闭。OTel 会话上传默认对所有用户和提供方使用 `FEEDBACK_ONLY`：新的文本反馈、消息评分、编辑或撤回会释放截至该事件的完整规范日志前缀，包含存储的上下文；后续记录等待下一次显式反馈。两条路径分别配置，通过环境变量覆盖 OTel 时：

- `DSH_TELEMETRY_MODE=DISABLED`：禁止 OTel 捕获，全部数据留在本地。
- `DSH_TELEMETRY_MODE=FULL`：当前构建拒绝该值，不要用它开启全量上传。
- `DSH_TELEMETRY_OTLP_URL`：指定其他 collector。
- 非空的 `DSH_TELEMETRY_DISABLED`：最终强制关闭 OTel，优先级最高。

基础配置没有默认脱敏规则，导出内容可能包含会话文本、工具参数、工具结果和工作区路径。基础组合会挂载 MCP 资源能力，但默认不会启用任何 MCP 服务器或服务器工具；CLI 虽然随附 `@deepseek-ai/dsh-mcp-client`，但通过 patch 启用的 MCP 服务器命令会在智能体沙箱之外作为受信任进程运行，启用前应确认来源和权限。基础组合的 `read`、`write`、`edit` 是默认文件编辑工具，`str_replace_editor` 不再默认启用；`sdk-minimal` 只提供按平台选择的持久 shell，不包含文件系统工具、workspace 指令、skills、jobs 或 subagent。

## SDK、极简 SDK 与 ACP

`sdk` 和 `sdk-minimal` profile 都通过标准输入输出承载 JSON-RPC；`acp` profile 通过标准输入输出承载 Agent Client Protocol。`sdk` 基于 base，默认文件编辑工具是 `read`、`write`、`edit`；`sdk-minimal` 是独立组合，只提供按平台选择的持久 shell，以未压缩 JSONL 保存会话，不继承基础 profile 的指令发现、文件系统工具、SQLite 会话索引、审批、权限设置、skills、jobs 或 subagent，权限固定为 `danger-full-access`，因此只适合明确受信任且隔离的调用方。需要在 `sdk-minimal` 中使用 `str_replace_editor` 时，必须通过 patch 显式加入它及所需的文件系统提供方。

Python SDK 支持 Linux x64/arm64、macOS arm64 14+ 和 Windows x64，要求 Python 3.10+。`deepseek-harness-sdk` 包含匹配的原生运行时 wheel 和 `dsh`，通常不需要另装 Node；使用 `--workspace`、`--dsh-home` 和 `--session-id` 可隔离工作区、配置目录和会话。完整安装与 API 示例见 [Python SDK](https://deepseek-harness.github.io/deepseek-harness/guide/python-sdk)。

Linux 与 macOS 使用虚拟环境安装；Windows PowerShell 使用 `py -3.10 -m venv .venv`、`.venv\Scripts\Activate.ps1` 和 `python -m pip install deepseek-harness-sdk`。SDK 选定的 home 会保存 `sdk-minimal` profile、插件和 `sessions/` 下的 JSONL，不会静默读取 `~/.dsh`。

## Remote API 与会话投影

Remote 是当前宿主端向客户端公开一元方法的契约。调用结果是 `RemoteResult<T>`，Remote 失败统一由 `RemoteError` 表示，错误码使用 `<domain>/<reason>`；客户端按 `result.ok` 和 `error.code` 处理，不要依赖 `instanceof`。取消一元调用时错误分支使用 `gateway/cancelled`，固定宿主信息从 `ctx.remote.$host` 读取。

需要新增 Remote API 时，按“声明方法、声明失败、在包上注册、在客户端消费、写测试”执行；签名、错误码、命名空间或导出名变化后运行 `pnpm run build:lib`，然后再做类型检查和两侧测试。会话派生状态使用 `ctx.sessionProjections`，通过 `stateOf()` 读取宿主状态、通过 `snapshot()` 读取客户端视图；`SessionSeq` 事件序号与 `SessionLogOffset` 日志读取偏移必须分开。

## 会话持久化

持久会话日志通过 `ctx.sessionPersistence` 管理：`create()`、`open()`、`stat()` 和 `list()` 负责会话生命周期，`create()` 与 `open(id, 'write')` 返回 `SessionHandle`。句柄提供 `read()`、`append()`、`flush()` 和 `close()`；`append()` 是尽力写入，`flush()` 才是耐久屏障，写句柄遵守单写者约束，关闭操作会等待待写内容完成。

只有通过句柄获取的会话才会持久化；仅调用 `ctx.sessions.create` 再执行 `session/flush` 不会写入持久会话日志。当前唯一随附的提供方是 `dsh-session-persistence-jsonl`，默认使用每个会话一个 `.jsonl.zstd` 文件，配置 `compression: 'none'` 时使用换行文本。会话持久化日志与基础 profile 的内存 SQLite 会话索引是两层不同能力。

## 会话格式与迁移

当前写入格式由 `SESSION_FORMAT_VERSION` 标识为 V4；定稿状态为 `latestFinalizedVersion: 4`，发布记录仍以 `latestReleasedVersion: 3` 标识已公开发布基线。包版本、投影缓存版本和 fixture 文件名都不是会话格式的权威来源。

JSONL provider 使用 v0 的 `session.jsonl[.zstd]` 和 v1 及后续版本的 `session.vN.jsonl[.zstd]` generation。读取 `stat`、`list` 或 `open` 时会选择最高的规范 generation，并通过 v0→v1→v2→v3→v4 的相邻迁移链恢复当前逻辑记录；V3 到 V4 由 `@deepseek-ai/dsh-session-format-v3-to-v4` 负责。V4 将工具结果提升为 `tool` 角色消息，引入 `developer/message`、生产者来源、父目录证据和 `forked` 轮次结束原因；写入旧日志时在源文件旁排他发布最终版本命名的后继。已经发布的 generation 不重命名、不替换、不删除，未来格式必须明确拒绝。

V4 保留系统提示词 surface、`assistant/attempt`、内嵌 assistant stream、精确的 `request/header` 和工具来源语义。V3 到 V4 的迁移还会从直属子会话证据补齐父级 `subagent/catalog`，提升 canonical 工具结果并重映射受审计的序号引用；迁移不会修改设置或文件。格式开发应增加相邻迁移包、更新格式目录和发布状态，而不是直接改写已有会话文件。

## Web 文件与反馈能力

用户在 Web 中附加的图片会在消息接受前完成校验、规范化和持久化；通用文件按字节原样保存并以不透明引用传递，模型需要时通过文件工具读取。`fileUpload` 为 Session 提供有进度、可取消的流式上传和暂存凭证，凭证在 prompt 接纳时消费。

用户要求接收文件时，模型应在最终回复前调用 `present` 声明路径；`present` 只记录可访问文件，不复制文件内容。当前包为 `@deepseek-ai/dsh-tool-present`，最多一次声明 4 个重点文件。`@deepseek-ai/dsh-workspace-changes` 按顶层轮次记录 `workspace/changes` 摘要和文件对比，摘要及 diff 只在当前 Host/Session 存活期间提供；`workspaceFiles` 提供按 Session 授权的文本分页、字节窗口、完整文件读取、目录列举和变更流，文件读取遵循文件系统权限，`list` 与 `changes` 仍限制在工作区内。

Web 中的 `/feedback`、`sessionFeedback` 和消息反馈写入会话日志但不启动模型轮次。逐消息反馈的 `put`、`delete` 使用 `ifVersion` 做乐观并发校验，过期版本返回冲突；Session 级反馈只接受 live Session。

## PTC 运行时与代码工作工具

PTC 模式通过 `ctx.ptcRuntime` 执行模型编写的 TypeScript 程序。运行时先解析绑定、cwd、超时和沙箱能力，再执行程序并返回 JSON 值、按通道有序的日志或结构化错误；`dsh-ptc-runtime-node` 在受管 Node 进程中执行，程序失败作为结果返回，不把普通运行失败伪装成 Promise reject。代码工作工具是否可见由 preset 和 `DSH_TOOLS_MODE=native|ptc|both` 共同决定，用户界面中已将相关开关称为“代码工作工具”。

具备路由能力的 agent 可以在运行期间更新工具集合；更新以持久事件记录并在后续请求中重建 schema，工具增删会被客户端以准备/更新状态展示。扩展工具时不要只改实时 UI 状态，必须验证工具事件、请求重建和恢复后的行为。

## 用户问题、提醒与可选集成

`ask_user_question` 通过 `ctx.userQuestions` 暂停当前根 Agent 等待结构化回答；提供 `agent` 时必须是当前注册表中的精确运行时根，委托子 Agent 不能等待人类回答。`plan-review` 意图只改变 UI 呈现，不改变答案编码。

Schedule、时间上下文和 Web 提醒页面当前随发行版组合默认禁用；启用时使用 `schedule_create`、`schedule_list`、`schedule_update` 和 `schedule_delete`，并提供一次性、固定间隔、每日、每周和五字段 cron 目标。任务绑定原始 Session，投递为普通 follow-up，不中途 steer 当前轮次，也不代表模型已完成。

MCP 资源、Office 转 PDF、语音输入、浏览器/计算机操作、账号登录和账号模型路由都是可选能力，必须读取对应 bundle/子系统文档确认当前 profile 是否挂载，不要因为包存在就假设默认可用。

## 源码开发检查

~~~sh
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build:lib
pnpm run build
pnpm run doc-sync
~~~

不要每次都盲目运行全部命令；根据修改的包、运行时入口、文档或快照选择最小相关集合。仓库的 pre-push 会运行类型检查，文档改动重点检查 `pnpm run doc-sync`、对应链接、配对与生成目录门禁。

线上参考：[快速开始](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)、[开发入口](https://deepseek-harness.github.io/deepseek-harness/develop/basic/)。CLI 的完整行为说明见本文件前文；线上站点暂未单独发布 CLI 参考页。
