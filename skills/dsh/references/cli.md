# 命令行与 profile

本文整理 apps/cli/reference/README.zh.md、docs/development.zh.md 和用户指南中的可操作内容。命令、配置键和环境变量保持源项目原名；解释使用中文。

当前源项目版本为 `0.1.2-rc.1`。源码开发要求 Node.js 22.19+ 或 24+，仓库当前固定使用 `pnpm@11.7.0`。执行 `corepack enable` 后使用仓库声明的 pnpm 版本，不要凭全局 pnpm 版本判断兼容性。

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
dsh web
dsh --profile headless "执行一项任务"
~~~

web 是 `--profile web` 的固定别名。`web`、`headless`、`sdk`、`sdk-minimal` 和 `acp` 在首次使用时从随发行版提供的模板自动初始化；其他不存在的 profile 需要先执行插件管理命令安装组合包。随附组合包还包括 `@deepseek-ai/dsh-sdk-app`、`@deepseek-ai/dsh-sdk-minimal` 和 `@deepseek-ai/dsh-acp-app`。

各内置 profile 的运行边界如下：

| profile | 运行方式 | 主要特点 |
| --- | --- | --- |
| `web` | HTTP 与浏览器客户端 | 提供 Web UI，支持实时 patch |
| `headless` | 一次性命令 | 接收一条任务文本，不启动 HTTP 服务 |
| `sdk` | 标准输入输出 JSON-RPC | 使用完整基础组合，适合 SDK 调用 |
| `sdk-minimal` | 标准输入输出 JSON-RPC | 独立组合，固定 `danger-full-access`，不发现指令、不使用 SQLite |
| `acp` | 标准输入输出 Agent Client Protocol | 通过 ACP 接入智能体 |

profile 的 `patchReload` 行为也按入口区分：自定义默认配置支持实时重载，`web` 支持实时重载；`headless`、`sdk`、`sdk-minimal` 和 `acp` 只在启动时读取配置，修改后需要重启进程。

profile 的有效配置树按以下顺序叠加到空根节点：

1. profile manifest 中 dsh.profile.bundles 列出的组合包 patch。
2. profile 自身的 cordis.patch.yml。
3. home 级 $DSH_HOME/cordis.patch.yml。
4. 命令行中按顺序传入的每个 --patch <path>。

后应用的层优先级更高。patch 按 id 定位配置行，可以插入新行，也可以替换目标行；替换时整个 config 值都会被替换，不会做深度合并。组合包从 dsh 安装目录或 profile 的依赖中解析，普通 patch 中的裸插件名从 profile 目录按 Node 模块规则向上查找。

## 应用参数边界

启动器参数必须放在第一个无法识别的令牌之前；从边界开始的内容通过 ctx.cmdlineArgs 原样交给已启动的 profile。

~~~sh
dsh --profile web --port 3080
dsh web --host 127.0.0.1 --port 3080
dsh --profile headless "检查测试并修复失败项"
~~~

使用 `dsh -V` 或 `dsh --version` 查看启动器版本；这两个参数必须位于应用参数边界之前。

随附 profile 的参数如下：

| profile | 参数 |
| --- | --- |
| web | `--host`、`--port`、可重复的 `--trusted-host`、`--no-open` |
| headless | 一条作为位置参数的任务文本 |
| sdk | 无选项；标准输入输出承载 JSON-RPC |
| sdk-minimal | 无选项；标准输入输出承载相同的 JSON-RPC |
| acp | 无选项；标准输入输出承载 Agent Client Protocol |

启动器自身会消费一个 --。如果应用必须收到字面量 --，需要写成 -- --。dsh --help 显示启动器帮助；dsh web --help 显示 Web 应用帮助并且不启动应用。

无头任务会创建一个新的持久智能体，提交任务，等待完全停稳，刷新会话并读取最终的 `turn/end` 原因，然后从持久事件区间读取最后一段非空 assistant 文本。非空的提供方推理会以 `dsh: reasoning:` 前缀流式写入 stderr，最终文本只写入 stdout；没有任务文本属于用法错误，成功完成退出 0，其他结束原因退出 1。该 profile 不启动 HTTP 服务器、Web 运行时或浏览器客户端。

## 配置查看

~~~sh
dsh --profile web --dump-default-config
dsh --profile web --patch ./extra.yml --dump-config
dsh web --dump-config
~~~

- --dump-default-config 只显示组合包层。
- --dump-config 还显示 profile、home 和命令行 overlay。
- 输出带有每行来源和被哪些 overlay 修改的注释。
- !!js 表达式保持未求值。
- 未匹配的 patch 目标输出到标准错误。
- dump 不运行应用参数提供方；带应用参数的 dump 会被拒绝。

需要改配置时，先保存 dump 结果，再以最小 patch 覆盖目标行，避免无意删除组合包提供的字段或运行时表达式。

## 插件管理

~~~sh
dsh plugin --profile <name> add <package-or-git-spec>
dsh plugin --profile <name> remove <package>
dsh plugin --profile <name> why <package>
dsh plugin --profile <name> update
dsh --profile <name>
~~~

dsh plugin 在 profile 不存在时初始化它，然后在 profile 目录中把后续参数转发给 pnpm。相对路径 spec（例如 .、../plugin、file:、link:）优先相对于调用目录解析。

成功执行后，dsh 会根据安装状态重建 dsh.profile.bundles：依赖的 manifest 声明了 dsh.bundle.patch 时，它的 patch 会加入组合层；没有组合声明的依赖仍会保留为普通依赖并提示一次；被移除的依赖会从组合层移除。该命令支持后续的所有 pnpm 子命令，不限于 add、remove、why 和 update。

Git 插件如果依赖 prepare 构建脚本，pnpm 10+ 可能要求在 profile 的 pnpm-workspace.yaml 中允许该构建。首次安装失败时，按照 pnpm 输出的 allowBuilds 键添加后重试；已经构建好的压缩包或本地检出通常不需要该许可。

Codex 与 Claude Code 是彼此独立的可选子代理组合包，可以单独安装或移除：

~~~sh
dsh plugin --profile <name> add @deepseek-ai/dsh-subagent-codex
dsh plugin --profile <name> add @deepseek-ai/dsh-subagent-claude-code
dsh plugin --profile <name> remove @deepseek-ai/dsh-subagent-codex
~~~

添加、移除或更新 Bundle 后，正在运行的 profile 仍保留启动时的 Bundle 集合，必须重启 profile。新启动的 Agent 还需要在复制出的 Preset 中启用对应工具行；只安装 provider 并不会自动让现有 Agent 看到工具。

## Web 行为

~~~sh
dsh web
dsh web --patch ./extra.cordis.yml
dsh web --trusted-host example.com
dsh web --no-open
~~~

默认服务地址为 `http://127.0.0.1:3080`。`--host` 和 `--port` 覆盖保留了命令行表达式的配置行；`--trusted-host` 可重复传入，用于增加浏览器 `/api` 信任边界中的具名 authority；`--no-open` 只对本次调用关闭默认浏览器交接。当前 CLI 不接受 `--host 0.0.0.0`，需要按错误提示修正。

本机启动时，Web 服务会在 Loader 完整结算后用默认浏览器打开规范宿主机 URL；设置 `SSH_CONNECTION` 或 `SSH_TTY` 时会跳过浏览器交接但仍打印 URL。浏览器交接失败不会停止服务，stderr 会提供诊断和手动访问地址。插件树退出时最多等待 5 秒完成 dispose；首次 `SIGTERM` 以 0 退出，首次 `SIGINT` 报告 130，第二次信号直接强制退出。

基于 base 的模式都以当前调用目录作为默认工作区根目录，并以 65,536 字节预算读取适用的 AGENTS.md 或 CLAUDE.md；会话索引使用内存 SQLite。独立的 `sdk-minimal` 以当前调用目录作为文件系统与沙箱根目录，但不发现指令、不使用 SQLite，权限固定为 `danger-full-access`，也不挂载审批或权限设置服务。

新会话默认使用 `workspace-write` 权限预设；`DSH_PERMISSION_MODE` 可改变进程级回退值。`DSH_TOOLS_MODE` 只接受 `native`、`ptc` 或 `both`，其他值会导致启动失败。

首次打开 Web 界面时，先在“设置 → 模型”中保存模型配置，再选择工作区；未选择工作区前不能输入任务。内置智能体模式包括标准模式、PTC 模式、极简模式和创造模式：标准模式提供完整编码能力，PTC 模式默认不提供 `workflow` 工具，而是通过 PTC SDK 组合多步 TypeScript 操作，极简模式只提供持久 bash 与 `str_replace_editor`，创造模式用于编写自定义智能体预设。极简模式固定使用 `You are a helpful software engineer assistant.` 作为完整系统提示词，不包含其他提示词段落。

## 凭证与环境

基础组合会从继承环境、$DSH_HOME/.credentials.yaml、当前目录 .env、$DSH_HOME/.env 解析提供方凭证。凭据文件不会写回 process.env。常用变量：

~~~sh
export DEEPSEEK_API_KEY=sk-...
export DEEPSEEK_BASE_URL=https://...
export DEEPSEEK_SEARCH_BASE_URL=https://...
~~~

`DEEPSEEK_BASE_URL` 和 `DEEPSEEK_SEARCH_BASE_URL` 可选。搜索和 HTTP fetch 仍会拒绝非公网目标。不要提交真实密钥。

模型目录发现支持 `openai-completions`、`openai-responses` 和 `anthropic-messages`。OpenAI 协议请求 `{baseURL}/models`；Anthropic 协议请求 `/v1/models?limit=1000`，使用 `x-api-key` 和 `anthropic-version: 2023-06-01`。响应可以是标准 `data` 数组或 `models` 对象映射；Anthropic 只读取前 1000 条，不跟随 `has_more`。配置 profile 的 headers 会参与发现，类型化密钥优先。

基础组合包默认挂载原生 DeepSeek 适配器、设置与凭据提供方、稳定的 `web_search` 和 `web_fetch`、仅限公网的 HTTP 抓取提供方，以及按反馈门控的会话遥测。Web 应用会禁用基础工具配置项，再通过 `cordis`、`ptc` 与 `standard` 智能体预设暴露相同工具。已启用的抓取调用会在所有沙箱与审批模式下执行，无需逐次确认；提供方会在连接前拒绝非公开目的地址。

遥测默认按反馈门控：用户记录 `/feedback` 前不上传数据，每条反馈会上传尚未共享的会话记录；恢复的会话只共享当前生命周期。通过环境变量覆盖时：

- `DSH_TELEMETRY_MODE=FULL`：以 OTLP/HTTP 日志流式发送每条已投影的会话事件。
- `DSH_TELEMETRY_MODE=DISABLED`：全部数据留在本地。
- `DSH_TELEMETRY_OTLP_URL`：指定其他 collector。
- 非空的 `DSH_TELEMETRY_DISABLED`：最终强制关闭遥测，优先级最高。

基础配置没有默认脱敏规则，导出内容可能包含会话文本、工具参数、工具结果和工作区路径。默认不会启用 MCP 服务；CLI 虽然随附 `@deepseek-ai/dsh-mcp-client`，但通过 patch 启用的 MCP 服务器命令会在智能体沙箱之外作为受信任进程运行，启用前应确认来源和权限。

## SDK、极简 SDK 与 ACP

`sdk` 和 `sdk-minimal` profile 都通过标准输入输出承载 JSON-RPC；`acp` profile 通过标准输入输出承载 Agent Client Protocol。`sdk-minimal` 是独立组合，不继承基础 profile 的指令发现、SQLite 会话索引、审批和权限设置，权限固定为 `danger-full-access`，因此只适合明确受信任的调用方。

Python SDK 支持 Linux x64/arm64、macOS arm64 14+ 和 Windows x64，要求 Python 3.10+。`deepseek-harness-sdk` 包含匹配的原生运行时 wheel 和 `dsh`，通常不需要另装 Node；使用 `--workspace`、`--dsh-home` 和 `--session-id` 可隔离工作区、配置目录和会话。完整安装与 API 示例见 [Python SDK](https://deepseek-harness.github.io/deepseek-harness/guide/python-sdk)。

Linux 与 macOS 使用虚拟环境安装；Windows PowerShell 使用 `py -3.10 -m venv .venv`、`.venv\Scripts\Activate.ps1` 和 `python -m pip install deepseek-harness-sdk`。SDK 选定的 home 会保存 `sdk-minimal` profile、插件和 `sessions/` 下的 JSONL，不会静默读取 `~/.dsh`。

## Remote API 与会话投影

Remote 是当前宿主端向客户端公开一元方法的契约。调用结果是 `RemoteResult<T>`，Remote 失败统一由 `RemoteError` 表示，错误码使用 `<domain>/<reason>`；客户端按 `result.ok` 和 `error.code` 处理，不要依赖 `instanceof`。取消一元调用时错误分支使用 `gateway/cancelled`，固定宿主信息从 `ctx.remote.$host` 读取。

需要新增 Remote API 时，按“声明方法、声明失败、在包上注册、在客户端消费、写测试”执行；签名、错误码、命名空间或导出名变化后运行 `pnpm run build:lib`，然后再做类型检查和两侧测试。会话派生状态使用 `ctx.sessionProjections`，通过 `stateOf()` 读取宿主状态、通过 `snapshot()` 读取客户端视图；`SessionSeq` 事件序号与 `SessionLogOffset` 日志读取偏移必须分开。

## 会话持久化

持久会话日志通过 `ctx.sessionPersistence` 管理：`create()`、`open()`、`stat()` 和 `list()` 负责会话生命周期，`create()` 与 `open(id, 'write')` 返回 `SessionHandle`。句柄提供 `read()`、`append()`、`flush()` 和 `close()`；`append()` 是尽力写入，`flush()` 才是耐久屏障，写句柄遵守单写者约束，关闭操作会等待待写内容完成。

只有通过句柄获取的会话才会持久化；仅调用 `ctx.sessions.create` 再执行 `session/flush` 不会写入持久会话日志。当前唯一随附的提供方是 `dsh-session-persistence-jsonl`，默认使用每个会话一个 `.jsonl.zstd` 文件，配置 `compression: 'none'` 时使用换行文本。会话持久化日志与基础 profile 的内存 SQLite 会话索引是两层不同能力。

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
