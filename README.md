# Tnnevol Skills

[Agent Skills](https://agentskills.io/home) 实用合集，用于 AI 辅助开发，涵盖常用工具、API 集成和最佳实践。

当前包含：禅道项目管理、飞牛应用开发、Halo CMS 博客管理、Memos 笔记、OpenList 网盘管理、DeepSeek Harness 开发、Midscene 自动化、VitePress Mermaid 渲染和 YonBuilder（APICloud）客户端 API 文档等技能。

## 安装

```bash
pnpx skills add tnnevol/skills --skill='*'
```

或全局安装所有技能：

```bash
pnpx skills add tnnevol/skills --skill='*' -g
```

了解更多 CLI 用法请参考 [skills](https://github.com/vercel-labs/skills)。

## Agent 集成

CLI 工具可直接被 AI Agent 调用，实现自动化管理。

| CLI 工具    | 说明         | 接入指南                                             |
| ----------- | ------------ | ---------------------------------------------------- |
| chandao-cli | 禅道项目管理 | [Agent Setup Guide](apps/chandao-cli/agent-setup.md) |

## 技能列表

### 技能

| Skill                           | Description                                                          |
| ------------------------------- | -------------------------------------------------------------------- |
| [chandao](skills/chandao)       | 禅道项目管理 - 任务、需求、Bug、产品 API 操作 - Tnnevol              |
| [halo](skills/halo)             | Halo CMS 博客管理 - 创建、查询、更新、删除、发布文章 - Tnnevol       |
| [memos](skills/memos)           | Memos 自建笔记工具 - 通过 memos-cli 管理笔记、评论、附件、分享 - Tnnevol |
| [fnnas-docs](skills/fnnas-docs) | 飞牛 fnOS 应用开发文档 - 快速开始、开发指南、开放 API、CLI 工具 - Tnnevol |
| [openlist](skills/openlist)     | OpenList 网盘聚合 - 通过 openlist-cli 管理文件、分享、后台 - Tnnevol |
| [dsh](skills/dsh)               | DeepSeek Harness - 运行、配置和插件扩展 - Tnnevol                         |
| [midscenejs](skills/midscenejs) | Midscene.js - GUI Agent 与 AI 驱动 E2E 测试：功能、模型配置、五平台接入 - Tnnevol |
| [vitepress-mermaid-renderer](skills/vitepress-mermaid-renderer) | VitePress Mermaid 渲染 - 安装、配置、工具栏、示例和排错 - Tnnevol |
| [yonyou-doc](skills/yonyou-doc) | YonBuilder 移动开发（APICloud）客户端 API - 方法参数、平台可用性、MTL 原生插件 - Tnnevol |

## 文档源

部分技能从上游开源项目的文档提炼而成，上游仓库以 git submodule 挂在 `sources/`（只读原材料，不随技能发布）。贡献者 clone 后 `pnpm install` 会自动浅初始化子模块；同步流程见 [AGENTS.md](AGENTS.md) 的「文档源」章节。

| 子模块                               | 上游                                                                                            | 锁定版本          |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- | ----------------- |
| `sources/dsh`                        | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)                 | `dsh-v0.2.1-rc.2` |
| `sources/vitepress-mermaid-renderer` | [sametcn99/vitepress-mermaid-renderer](https://github.com/sametcn99/vitepress-mermaid-renderer) | `v1.2.2`          |
| `sources/midscenejs` | [web-infra-dev/midscene](https://github.com/web-infra-dev/midscene) | `v1.16.0` |

上游没有 git 仓库的技能改用抓取脚本 + 状态文件同步，`pnpm start check` 也会一并报告：

| 技能 | 上游 | 同步命令 |
| ---- | ---- | -------- |
| [yonyou-doc](skills/yonyou-doc) | <https://developer.yonyou.com/docs> | `python3 skills/yonyou-doc/scripts/sync_docs.py` |

## License

本仓库的技能及脚本均采用 [非商业使用许可证](LICENSE.md)。

引入的第三方技能保留原始许可证 - 详见对应目录。

本仓库基于 [tnnevol/skills](https://github.com/tnnevol/skills) 创建。
