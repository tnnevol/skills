# Generation Info

skills/midscenejs 的参考文件提炼自 **Midscene 官方文档站的中文原始 Markdown 源**（`https://midscenejs.com/zh/<page>.md`）。

- **Source:** https://midscenejs.com/zh/
- **上游项目:** [web-infra-dev/midscene](https://github.com/web-infra-dev/midscene)
- **Skill version:** `1.0.0`
- **Synced:** 2026-10-12

## 快照范围

同步时抓取文档站 sitemap（`https://midscenejs.com/sitemap.xml`）中全部 **50 个中文页面** 的 `.md` 源，全部 HTTP 200。其中 38 个内容页映射到本技能的参考文件：

| 参考文件 | 主要来源页面 |
| --- | --- |
| `references/overview.md` | `introduction`、`basics`、`model-strategy`（概念部分） |
| `references/model-config.md` | `model-common-config`、`model-config`、`model-strategy`、`common/setup-env` |
| `references/integration.md` | `basics`、`integrate-with-playwright`、`integrate-with-puppeteer`、`integrate-with-any-interface` |
| `references/platforms.md` | `platforms/android`、`platforms/ios`、`platforms/harmonyos`、`platforms/desktop`、`quick-start` |
| `references/skills.md` | `skills`、`mcp` |
| `references/yaml-runner.md` | `yaml-script-runner`、`automate-with-scripts-in-yaml`、`migrate-to-midscene-test` |
| `references/midscene-test/*` | `midscene-test/overview`、`use`、`configuration`、`extend` |
| `references/faq.md` | `faq`、`caching`、`consume-report-file`、`data-privacy` |

**未纳入**的页面及其原因：

| 页面 | 原因 |
| --- | --- |
| `changelog` | 版本流水账，查阅官方即可，不适合做静态快照 |
| `android-world-benchmark-report`、`mobile-world-benchmark-report`、`app-control-bench-report` | Benchmark 成绩单，结果性内容会过期；关键数字已在 overview 中摘录 |
| `showcases*`、`awesome-midscene` | 视频与社区项目清单，维护频率高、时效性强 |
| `advanced/bdd-style-scripts-with-gherkin` | GDD/Beta 特性，面向特定场景，用户问到时再查官方文档 |
| `bridge-mode`、`llm-txt`、`common/*` | 要点已并入其他参考页（bridge 模式见 skills.md / yaml-runner.md） |

文档站提供 `https://midscenejs.com/llms.txt` 作为全站索引，可用于发现新增页面。

## 不建子模块的原因

- Midscene 文档站是**在线站点**，其文档源码不在 `web-infra-dev/midscene` 仓库中可稳定 sparse 检出的路径上。
- Midscene 主仓库**没有对齐文档站的 release tag** 可锁定；`midscene-test` 章节本身处于 Beta，API 演进很快。
- 与 `openlist`、`fnnas-docs` 的处理方式一致：**URL 直链引用 + GENERATION.md 记录来源**，不建子模块。

## 抓取方式

文档站为 VitePress，中文路径的 `.html` 会 308 重定向，**直接用 `/zh/<page>.md` 获取原始 Markdown 源**：

```bash
curl -sL https://midscenejs.com/sitemap.xml \
  | grep -oE 'https://midscenejs\.com/zh/[^<]*' \
  | sed 's#https://midscenejs.com/zh/##;s/\.html$//' | sort -u

# 单页
curl -s https://midscenejs.com/zh/basics.md
```

不要抓取 `.html`（会重定向且丢失代码块完整性）。

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

Midscene 迭代很快，模型名单与 CLI 参数尤其易变。升级用户项目或发现文档变化时：

1. 重新抓取 sitemap 与上述页面 `.md` 源，与 `references/` 做 diff。
2. 重点核对易变项：模型名称与 `MIDSCENE_MODEL_FAMILY` 取值、CLI 参数、平台包名与 Agent 构造函数、Midscene Test 的 `defineTestProject` 字段与 Node 名称。
3. 按差异改写参考文件，更新本文件的 **Synced** 日期与 SKILL.md 的 `version`。
4. 若用户项目版本高于文档快照，以其 `node_modules` 类型定义和锁文件为准，并在回答中标注版本差异。

## 相关上游资料（非本技能范围）

- 官方 Agent Skills（平台 CLI 自动化，**不覆盖** SDK/模型/Test 配置）：https://midscenejs.com/skills
- Skills 仓库：https://github.com/web-infra-dev/midscene-skills
- 示例项目：https://github.com/web-infra-dev/midscene-example
- 英文文档站：https://midscenejs.com/
