# 命令行与 profile

本文整理 apps/cli/reference/README.zh.md、docs/development.zh.md 和用户指南中的可操作内容。命令、配置键和环境变量保持源项目原名；解释使用中文。

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

pnpm dsh 通过 node --import tsx/esm 运行 apps/cli/src/bin.ts。新检出或缺少构建产物时，先执行 pnpm run build；构建完成后缺少前端产物会在启动时明确提示继续构建。源码入口不会检查产物是否新鲜，旧产物可能继续提供旧版浏览器代码。

## Profile 启动

~~~sh
dsh --profile <name>
dsh web
dsh --profile headless "执行一项任务"
~~~

web 是 --profile web 的固定别名。web 和 headless 在首次使用时从随发行版提供的模板自动初始化；其他不存在的 profile 需要先执行插件管理命令安装组合包。

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

随附 profile 的参数如下：

| profile | 参数 |
| --- | --- |
| web | --host、--port、可重复的 --trusted-host |
| headless | 一条作为位置参数的任务文本 |

启动器自身会消费一个 --。如果应用必须收到字面量 --，需要写成 -- --。dsh --help 显示启动器帮助；dsh web --help 显示 Web 应用帮助并且不启动应用。

无头任务会创建一个新的持久 Agent，提交任务，等待完全停稳，刷新会话，然后从持久事件区间读取最后一段非空 assistant 文本。没有任务文本属于用法错误；成功完成退出 0，其他结束原因退出 1。该 profile 不启动 HTTP 服务器、Web 运行时或浏览器客户端。

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

成功执行后，dsh 会根据安装状态重建 dsh.profile.bundles：依赖的 manifest 声明了 dsh.bundle.patch 时，它的 patch 会加入组合层；没有组合声明的依赖仍会保留为普通依赖并提示一次；被移除的依赖会从组合层移除。

Git 插件如果依赖 prepare 构建脚本，pnpm 10+ 可能要求在 profile 的 pnpm-workspace.yaml 中允许该构建。首次安装失败时，按照 pnpm 输出的 allowBuilds 键添加后重试；已经构建好的压缩包或本地检出通常不需要该许可。

## Web 行为

~~~sh
dsh web
dsh web --patch ./extra.cordis.yml
dsh web --trusted-host example.com
~~~

默认服务地址为 http://127.0.0.1:3080。--host 和 --port 覆盖保留了命令行表达式的配置行；--trusted-host 可重复传入。当前 CLI 不接受 --host 0.0.0.0，需要按错误提示修正。

所有模式都以当前调用目录作为默认 workspace 根目录，并读取适用的 AGENTS.md 或 CLAUDE.md。新会话默认使用 workspace-write 权限预设；DSH_PERMISSION_MODE 可改变进程级回退值，DSH_TOOLS_MODE 只接受 native、code 或 both。

## 凭证与环境

基础组合会从继承环境、$DSH_HOME/.credentials.yaml、当前目录 .env、$DSH_HOME/.env 解析提供方凭证。凭据文件不会写回 process.env。常用变量：

~~~sh
export DEEPSEEK_API_KEY=sk-...
export DEEPSEEK_BASE_URL=https://...
~~~

DEEPSEEK_BASE_URL 可选。不要提交真实密钥。遥测默认关闭；显式启用遥测前要确认会话文本、工具参数、结果和工作区路径可能被导出，并通过 DSH_TELEMETRY_DISABLED 设置硬性关闭。

## 源码开发检查

~~~sh
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
pnpm run docs:check
~~~

不要每次都盲目运行全部命令；根据修改的包、运行时入口、文档或快照选择最小相关集合。仓库的 pre-push 会运行类型检查，文档改动重点检查 pnpm run doc-sync 和对应链接、配对与生成目录门禁。

线上参考：[快速开始](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)、[开发入口](https://deepseek-harness.github.io/deepseek-harness/develop/basic/)。CLI 的完整行为说明见本文件前文；线上站点暂未单独发布 CLI 参考页。
