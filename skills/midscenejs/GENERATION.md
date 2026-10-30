# Generation Info

skills/midscenejs 的参考文件提炼自 **Midscene 主仓库的中文文档源**
（`apps/site/docs/zh/`，rspress 驱动 midscenejs.com 的同一份源码）。

- **Source:** `sources/midscenejs`
- **Pinned tag:** `v1.17.3`（npm release，与文档同 commit 发布）
- **Git SHA:** `05028dafd764b2d4a1eca187149f1dde1a15102d`
- **Skill version:** `1.3.0`
- **Synced:** 2026-10-30
- **语言范围:** 仅简体中文（`apps/site/docs/zh`）。上游英文页（`docs/en`）不纳入本技能。

## 快照范围

仓库 `apps/site/docs/zh/` 共 66 个页面。其中 44 个内容页映射到本技能参考文件：

| 参考文件 | 主要来源页面 |
| --- | --- |
| `references/overview.md` | `index`、`basics`、`model-selection`（概念部分） |
| `references/model-config.md` | `model-api-setup`、`model-config`、`model-selection`、`chatgpt-subscription`、`common/setup-env` |
| `references/integration.md` | `basics`、`reference/index`、`integrate-with-playwright`、`integrate-with-puppeteer`、`integrate-with-any-interface`、`sdk/{standalone,playwright,chrome-bridge,vitest}` |
| `references/platforms.md` | `platforms/{index,android,ios,harmonyos,desktop,web}`、`sdk/{android,ios,harmonyos,desktop}`、`quick-start` |
| `references/skills.md` | `skills`、`mcp` |
| `references/yaml-runner.md` | `yaml-script-runner`、`automate-with-scripts-in-yaml`、`migrate-to-midscene-test` |
| `references/midscene-test/use.md` | `midscene-test/use` |
| `references/midscene-test/writing.md` | `midscene-test/writing` |
| `references/midscene-test/builtin-nodes.md` | `midscene-test/builtin-nodes` |
| `references/midscene-test/configuration.md` | `midscene-test/configuration` |
| `references/midscene-test/execution.md` | `midscene-test/execution` |
| `references/midscene-test/running.md` | `midscene-test/running` |
| `references/midscene-test/extend.md` | `midscene-test/extend` |
| `references/midscene-test/overview.md` | `midscene-test/overview`、`common/test-philosophy` |
| `references/faq.md` | `faq`、`caching`、`consume-report-file`、`data-privacy` |

`midscene-test/` 下 8 个参考文件与上游页面**一一对应**，便于逐页比对同步。
`common/*` 四页是跨页复用的嵌入片段（SDK 前置条件、平台选择器、测试理念与工作流），不是独立主题页；
`reference/index` 是完整 API 参考，本技能按「分类 + 高频 API」提炼，不逐条复制。

**未纳入**的页面及其原因：

| 页面 | 原因 |
| --- | --- |
| `changelog` | 版本流水账，查阅官方即可，不适合做静态快照 |
| `*benchmark-report*` | Benchmark 成绩单，结果性内容会过期；关键数字已在 overview 中摘录 |
| `showcases*`、`awesome-midscene` | 视频与社区项目清单，维护频率高、时效性强 |
| `advanced/bdd-style-scripts-with-gherkin` | Beta 特性，面向特定场景，用户问到时再查源码 |
| `bridge-mode`、`llm-txt`、`common/*`、`blog-*` | 要点已并入其他参考页 |

## v1.17.3 同步记录（2026-10-30）

从 `v1.17.2` 同步到 `v1.17.3`。中文文档 17 个文件（+1201 / −917），主体是 **Midscene Test 文档拆分**。

### 上游结构变化

原 5 页拆为 8 页：`use`（560→132 行，只讲建项目）、`configuration`（重写，只讲配置与 Node 注册），新增 `writing`（用例编写）、`execution`（生命周期与并发）、`running`（运行与报告）、`builtin-nodes`（Node 清单）；**删除 `midscene-test/github-actions.mdx`**，CI 内容并入 `running`。

### 已纳入技能

- `midscene-test/` 重建为 8 个文件与上游一一对应：
  - 新增 `writing.md`：术语（Workflow Document / Case / Step / Hook）、**用例设计约定**（线性执行、Step 无状态、不能用“上一步”指代）、Node 调用、粒度建议。
  - 新增 `builtin-nodes.md`：字符串简写 vs 对象传参、核心 AI Node、原子操作（不推荐细粒度编排）、Web/移动端预置 Node、`setCookies` 禁写真实 Cookie。
  - 新增 `execution.md`：`setup → fileSetup → beforeAll` 层级、四个 YAML 钩子、**并发两个维度**、超时三项、取消与清理。
  - 新增 `running.md`：运行命令、两类产物、退出码（清理失败也是 1）、环境变量注入（`model verify` 反例）、GitHub Actions 与 Action 输出表。
  - 重写 `use.md`：压缩为「创建项目 → 配模型环境 → 运行 → 改第一条用例」+ 创建命令参考。
  - `configuration.md`：补 `defineFileSetup()` 用法；并发章节从已移除的 `maxConcurrency` 改为 `maxConcurrentFiles`/`maxConcurrentProjects`；超时/取消收敛为指向 `execution.md`。
  - `extend.md`：补 `stringInputKey` 字符串简写声明。
  - 删除 `github-actions.md`（源页已删），其 Action 输出表并入 `running.md`。
- `SKILL.md`：版本 1.3.0、tag 改 v1.17.3；**修正 `test.maxConcurrency` 已移除的错误描述**、补文件并发必须配 `fileSetup`、补「每条 AI 指令要自身完整」约定；路由表按 8 个文件重列；检查清单补并发与用例独立性两条。

### 事实修正（重要）

v1.17.2 及更早的 `configuration.md` 写「并发单位是执行项目，`test.maxConcurrency` 默认 1」。**该字段在 v1.17.3 已被移除**，配置里留着会直接报错，且不能简单改名成 `maxConcurrentFiles`（原字段控制项目级并发）。本轮已全面改写。

### 未纳入

- `midscene-test/github-actions.mdx` 已从上游删除，本技能不再保留独立页，仅保留 Action 用法与输出表。
- `changelog`、`*benchmark-report*`、`showcases*`、`blog-*`、`llm-txt` 按既定原因不纳入。

## v1.17.2 同步记录（2026-10-29）

从 `v1.16.0` 同步到 `v1.17.2`。中文文档差异 48 个文件（+4920 / −4642），新增 13 页、删除 3 页、改名 1 页。

### 上游结构调整

| v1.16.0 页面 | v1.17.2 状态 |
| --- | --- |
| `introduction` | 删除，内容并入 `basics` |
| `model-strategy` | 删除，概念部分并入 `model-selection` |
| `model-common-config` | 改名 `model-api-setup`（只讲 API Key 接入） |
| `model-debugging-observability` | 删除，并入 `model-config` |

新增 `model-selection`（模型选择指南）、`platforms/web`、8 个 `sdk/*`（standalone / playwright / chrome-bridge / android / ios / harmonyos / desktop / vitest）与 4 个 `common/*` 片段；`reference/index.mdx` 重写为完整 API 参考。

### 已纳入技能

- `references/integration.md` 补齐此前缺失的三个 API：
  - `aiLocate()` —— 只定位不操作，优先用返回的 `center` 点击；`rect` 在按点定位模型（AutoGLM）下会退化成 8x8 方块。
  - `startObserving()` —— 录帧后对帧序列断言，解决 Toast/横幅/转场这类短命 UI；观测对象不支持 `domIncluded`，帧源按平台走 scrcpy / WDA MJPEG / CDP Screencast。
  - `runYaml()` —— SDK 内执行旧版 `tasks` 脚本并取回 `aiQuery` 结果。
- 新增「Chrome Bridge」节：`AgentOverChromeBridge` 启动本地 Bridge Server、单实例单标签页、模型配置由 Node 进程读取而非插件。
- 新增「用 Vitest 组织测试」节：移动端官方推荐做法，含 `fileParallelism: false` + `sequence.concurrent: false` 与每用例建/销 Agent 的模式。
- Playwright 三个 Agent 类（`PlaywrightPageAgent` / `PlaywrightAgent` 兼容别名 / `PlaywrightBrowserAgent`）补成表格。
- `SKILL.md`：版本 1.2.0、锁定 tag 改 v1.17.2、上游链接由已删除的 `introduction.html` 改为站点根、工作流与路由表补新入口、检查清单补 `startObserving`/`aiLocate` 两条。

### 未纳入 / 无需改动

- 模型清单（含 GPT-6 家族、`gpt-6-astra/sol/luna`、Fast mode `service_tier`、DeepSeek-V4-Pro 不可用）在 v1.16.0 时已跟进，本轮 `model-api-setup` 拆分后内容一致，未改动。
- `changelog`、`*benchmark-report*`、`showcases*`、`blog-*`、`llm-txt` 等页面按既定原因不纳入。

## v1.16.0 同步记录（2026-10-19）

从 `v1.15.1` 同步到 `v1.16.0`，中文文档差异 21 个文件（+981 / -228），技能已改写：

| 变更 | 影响 | 落到哪个参考文件 |
| --- | --- | --- |
| **新增 Locate 模型角色**（`MIDSCENE_LOCATE_MODEL_*`） | 模型职责从 3 种变 4 种；默认模型改为「必填、提供所有能力」；Locate 模型不逐字段继承、失败不自动切换；各模型 `_STREAM_MODE` 独立 | `model-config.md`、`SKILL.md` |
| **新增 Jev 实验性模型** | `MIDSCENE_MODEL_FAMILY="jev"`；不能作默认模型；用 System One 而非 OpenAI 协议；图像最长边 ≤1568px | `model-config.md` |
| **新增 Puppeteer Test Node** | `PuppeteerAgent` 等可传入 `createMidsceneNodes()`；与 Playwright 共用 Web Node Schema；`networkidle` 映射为 `networkidle0`；专用 `waitUntil` 值混用报错 | `midscene-test/configuration.md`、`SKILL.md` |
| **清理与资源隔离强化** | 超时后等操作退出最多 30s；清理两段等待（1s / 10s）；超限记 `cleanup pending` 且资源仍隔离；资源异常中止重试并停止调度该项目后续文件 | `midscene-test/configuration.md`、`use.md`、`SKILL.md` |
| **报告重构** | Project → File → Case 三层；新增 `passed after retry` 标记（Passed 的子集，不重复计数） | `midscene-test/use.md` |
| **`create` 命令改为交互式引导** | 新增 `--yes`/`--skip-install` 等参数；CI 必须给目录和 `--platform` | `midscene-test/use.md` |
| **示例模板换成在线 TodoMVC** | 五平台模板改用 TodoMVC；Web 模板带 `nodes/todo.ts`；串行 + `test.bail: 1` | `midscene-test/use.md` |
| iOS 新增 `WDA_BASE_URL` / `WDA_MJPEG_*` | 网关连接与远程视频流配置方式 | `midscene-test/use.md` |
| `chatgpt-subscription` 独立成页 | SIWC 流程从 `model-common-config` 拆出；`model-config` 的 Codex 锚点随之迁移 | 已并入 `model-config.md` |

### ⚠️ 快照未覆盖的页面

`midscene-test/github-actions` **线上已发布但 v1.16.0 的 release 尚未包含该源文件**（`git ls-tree v1.16.0` 中不存在），因此不在子模块快照内。本技能已单独建 `references/midscene-test/github-actions.md`，内容取自线上页面并在页首标注该情况。待上游 release 包含后再并入子模块范围。

## 源文件格式注意

- 页面以 **`.mdx` 为主**（45/50）：diff 与改写时注意后缀，不要按 `.md` 找文件。
- 源文件含 **MDX 组件引用**（如 `<LegacyYamlNotice />`），组件本体在同目录
  `common/`（如 `common/legacy-yaml-notice.mdx`）内以 `:::info` 容器书写，
  提炼时需一并读入展开后的内容。
- 文档站的 `https://midscenejs.com/zh/<page>.md` 是 rspress **构建产物**
  （组件已展开、list marker 被改写 `-`→`*`），与仓库源文件语义一致但文本不同；
  子模块锁定后以**仓库源文件为准**，站点 URL 仅用于在线查阅。

## 不建子模块的历史结论（已被推翻）

本技能初版（2026-10-12）曾依据三点理由不建子模块：文档源不在主仓库可
sparse 检出的路径上、无对齐文档站的 release tag、依赖站点 `.md` 直抓。
经实测，三点均不成立——源码就在 `apps/site/docs/zh/`、`v*` release tag
与 master 的 docs 内容零差异、浅 sparse 克隆仅约 2MB。故升级为子模块锁定。

## 提炼原则

参考文件按技能需求**重写**，而非逐字复制：

- 按**用户意图**重组（官方按产品线组织，本技能按「是什么 / 配模型 / 写测试 / 接平台 / 排错」组织），保留可直接粘贴的代码示例与关键表格。
- 合并跨页重复内容（如模型配置散落在三页、`aiAct` 语义在 basics 与 introduction 重复）。
- 把**易错约束显式前置**，例如：
  - `MIDSCENE_MODEL_FAMILY` 决定坐标处理方式，填错会**点击偏移**
  - `BASE_URL` 不要自己拼 `/chat/completions` 或 `/responses`
  - GPT UI 定位**至少 5.4**；**DeepSeek-V4-Pro 不支持视觉输入**
  - `.env` 与 Shell 变量优先级，以及 `model verify` 是**反向例外**
  - 即时交互 API 的提示词是**元素描述**而非工作流
  - Windows **UIPI 权限级别不一致会静默丢弃输入**
  - Midscene Test：显式注册 Node、以 `nodes` 说明书为准、Cookie 引用式传入
- **不维护 API/模型完整签名表**：官方要求以用户项目类型定义为准，参考文件只给分类语义与常用示例，避免过期。

## 同步方式

Midscene 迭代很快，模型名单与 CLI 参数尤其易变：

1. `pnpm start check midscenejs` 查看当前锁定与上游新 tag。
2. `pnpm start sync midscenejs <tag|latest>` 移动子模块指针（脚本会自动
   `git add`；注意 latest 会立即移动指针，非幂等预览）。
3. `cd sources/midscenejs && git log --oneline <旧sha>..<新sha> -- apps/site/docs/zh` 圈定差异。
4. 重点核对易变项：模型名称与 `MIDSCENE_MODEL_FAMILY` 取值、CLI 参数、
   平台包名与 Agent 构造函数、Midscene Test 的 `defineTestProject` 字段与 Node 名称。
5. 按差异改写参考文件，更新本文件的 **Pinned tag / Git SHA / Synced / Skill version**
   与 SKILL.md 的 `version`，子模块指针与技能改动一并提交。

## 相关上游资料（非本技能范围）

- 官方 Agent Skills（平台 CLI 自动化，**不覆盖** SDK/模型/Test 配置）：https://midscenejs.com/skills
- Skills 仓库：https://github.com/web-infra-dev/midscene-skills
- 示例项目：https://github.com/web-infra-dev/midscene-example
- 在线文档（查阅用，同步以上述子模块为准）：https://midscenejs.com/zh/
