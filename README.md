# Tnnevol Skills

[Agent Skills](https://agentskills.io/home) 实用合集，用于 AI 辅助开发，涵盖常用工具、API 集成和最佳实践。

当前包含：网盘自动保存、禅道项目管理、钉钉 Agent 通讯、Halo CMS 博客管理、Memos 笔记工具等技能。

## 安装

```bash
pnpx skills add tnnevol/skills --skill='*'
```

或全局安装所有技能：

```bash
pnpx skills add tnnevol/skills --skill='*' -g
```

了解更多 CLI 用法请参考 [skills](https://github.com/vercel-labs/skills)。

## 技能列表

### 技能

| Skill | Description |
|-------|-------------|
| [autosave](skills/autosave) | 开源网盘自动保存服务 - 任务管理、配置、API - Tnnevol |
| [chandao](skills/chandao) | 禅道项目管理 - 任务、需求、Bug、产品 API 操作 - Tnnevol |
| [ding](skills/ding) | 钉钉群聊中快速联系其他 Agent（demo1、demo2 等） - Tnnevol |
| [halo](skills/halo) | Halo CMS 博客管理 - 创建、查询、更新、删除、发布文章 - Tnnevol |
| [memos](skills/memos) | Memos 自建笔记工具 - CRUD + 标签 API - Tnnevol |

## License

本仓库的技能及脚本均采用 [非商业使用许可证](LICENSE.md)。

引入的第三方技能保留原始许可证 - 详见对应目录。

本仓库基于 [tnnevol/skills](https://github.com/tnnevol/skills) 创建。
