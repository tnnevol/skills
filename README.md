# Tnnevol Skills

[Agent Skills](https://agentskills.io/home) 实用合集，用于 AI 辅助开发，涵盖常用工具、API 集成和最佳实践。

当前包含：禅道项目管理、飞牛应用开发、Halo CMS 博客管理、Memos 笔记和 OpenList 网盘管理等技能。

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
| [memos](skills/memos)           | Memos 自建笔记工具 - CRUD + 标签 API - Tnnevol                       |
| [fnnas-docs](skills/fnnas-docs) | 飞牛 fnOS 应用开发文档 - 快速开始、开发指南、开放 API、CLI 工具 - Tnnevol |
| [openlist](skills/openlist)     | OpenList 网盘聚合 - 通过 openlist-cli 管理文件、分享、后台 - Tnnevol |

## License

本仓库的技能及脚本均采用 [非商业使用许可证](LICENSE.md)。

引入的第三方技能保留原始许可证 - 详见对应目录。

本仓库基于 [tnnevol/skills](https://github.com/tnnevol/skills) 创建。
