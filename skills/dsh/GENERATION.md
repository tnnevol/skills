# Generation Info

skills/dsh 的参考文件依据 `sources/dsh`（deepseek-ai/deepseek-harness 子模块，
sparse 检出 `docs/`）的快照手工提炼维护，不复制原文。

- **Source:** `sources/dsh`
- **Pinned tag:** `dsh-v0.2.1-rc.4`
- **Git SHA:** `504a01a9578abc2c6f1fb896b1dc322c9fe24f66`
- **Synced:** 2026-10-29
- **Skill version:** `1.2.0`
- **语言范围:** 仅简体中文（`*.zh.md`）。上游英文页与 `.i18n.yaml` 配对文件不纳入本技能。

## v0.2.1-rc.4 同步记录（2026-10-29）

从 `dsh-v0.2.1-rc.2` 同步到 `dsh-v0.2.1-rc.4`。`docs/` 下 15 个文件、+96 / −42，全部变更集中在 rc.3，rc.4 的 `docs/` 无改动。

### 已纳入技能

- `references/cli.md`：DeepSeek 模型列表改为「跟随官方发布列表」与「自定义模型目录」两种来源，补内置兜底目录与每十分钟后台刷新的说明。
- `references/user-guide.md`：新增「DeepSeek 模型列表跟随官方发布（rc.3 起）」一节，覆盖卡片与选择器不一致、恢复默认模型和排查方向。
- `references/extension.md`：新增「客户端 Slots 与『更多』菜单」一节，记录 `sidebar.panellist.actions`、`conversation.session.header.views.actions`、`sidebar.right.tab.guide.actions` 三个 root list 槽位、`active` 与 Pin 状态相互独立、以及内存内收起状态；模型目录发现段落补 `ModelListingConfig` 与账号路由不再依赖 `timeout` 包。
- `references/docs-map.md`：补 `docs/upgrade-guide/v0.2.1-rc.2/new-session-blank-reuse/` 索引行（新会话复用空白 Session）。

### 一并修正

- 版本引用统一为 `0.2.1-rc.4`：`SKILL.md` 正文与末尾来源 tag 原写作 `0.2.0-rc.2` / `dsh-v0.2.0-rc.2`（后者是错误 tag），`references/cli.md`、`references/docs-map.md` 原停留在 `0.2.0-rc.2` / `0.2.1-rc.2`。
- `SKILL.md` frontmatter 版本由 `1.0.5` 对齐到 `1.2.0`（此前与本文档记录的 `1.1.0` 不一致）。

### 未纳入

- 新增包 `client-ui-entry-customization` 与 `module-graph` 的包清单变化属生成型目录，未复制进技能，需要时读子模块 `docs/module-graph.zh.md`。
- `docs/upgrade-guide/v0.2.1-rc.2/new-session-blank-reuse/` 全文未摘录，只在 `docs-map.md` 保留索引。

## v0.2.1-rc.2 同步记录（2026-10-19）

从 `dsh-v0.2.0-rc.2` 同步到 `dsh-v0.2.1-rc.2`，跨越 7 个 tag；`docs/` 下 460 个文件、+46374 / -6970，其中中文（`*.zh.md`）151 个。

### 已纳入技能

新增 `references/user-guide.md`，覆盖两项**用户可感知的新功能**：

| 新功能 | 源页面 | 要点 |
| --- | --- | --- |
| **插件市场** | `docs/user/guide/plugin-market.zh.md`（新增 148 行） | 实验性「自定义插件市场」bundle；JSON 索引源必须 `http:`/`https:` 且不含凭据或 `#`；`http:` 索引任何人可改，不受控网络应使用 `https:`；推荐版本 = 兼容且非预发布的最高版；安装前有来源确认框；索引违规时**拒绝整个索引**并给出违规值的 JSON 路径；参考生成器**只下载读取、从不执行代码** |
| **反向代理后发布 Web UI** | `docs/user/guide/public-deployments.zh.md`（新增 37 行） | `--public-url` 只是**公告**，`--trusted-host` 才**接纳** authority；`--public-url` 归一化为以 `/` 结尾；代理须保留 `Host`、剥离挂载前缀、转发 WebSocket 升级、改写 cookie `Path`；`/ui/` 是唯一入口；authority 不匹配时**每个 API 都 403**；`--tls-cert`/`--tls-key` 相对工作目录解析、**只读一次**、无效则启动失败不回退 HTTP；**公告 URL 与栅栏都不保护监听端口本身**；打印 URL 含进程凭据 |

同步更新：SKILL.md 路由表新增该页；`references/docs-map.md` 索引版本改为 `0.2.1-rc.2` 并新增两行索引。

### 未纳入技能（需时直读子模块）

| 目录 | 原因 |
| --- | --- |
| `docs/persistence-changes/`（13 份新增） | 会话持久化格式的内部迁移记录，面向维护者而非使用者 |
| `docs/upgrade-guide/`（22 份） | 逐版本升级指引，查阅官方即可，静态快照易过期 |
| `docs/defensive-patterns/`（6 份新增） | 开发规范，技能已有「关键规则」覆盖核心约束 |
| `docs/subsystems/*.zh.md`、`docs/user/guide/{providers,github-review,python-sdk,schedule}.zh.md` | 有改动但属小幅修订（如 i18n 时间戳），核心语义未变，已核对 |

> 技能定位是**面向使用者的速查与约束提炼**，不是源文档镜像。上游变动以上述判断为准，若某内部文档开始影响用户行为，再按需提炼。

## 同步流程

首次 clone 后 `pnpm install` 会通过 `prepare` 脚本自动初始化子模块
（浅克隆 + 仅检出 `docs/`）；也可手动执行 `git submodule update --init sources/dsh`。

1. `pnpm start check dsh` 查看当前锁定与上游新 tag。
2. `pnpm start sync dsh <tag|latest>` 移动子模块指针（脚本会自动 `git add`；
   注意 latest 会立即移动指针，非幂等预览）。
3. `cd sources/dsh && git log --oneline <旧sha>..<新sha> -- docs/` 圈定文档差异。
4. 按差异改写 `skills/dsh/SKILL.md` 与 `references/`，更新本文件的
   Pinned tag / Git SHA / Synced / Skill version。
5. 子模块指针与技能改动一并提交。
