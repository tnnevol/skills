# 禅道 Skill 使用指南

## 目录

- [如何安装和配置？](#如何安装和配置)
- [支持哪些模块和操作？](#支持哪些模块和操作)
- [如何使用帮助？](#如何使用帮助)
- [Token 过期了怎么办？](#token-过期了怎么办)
- [常见问题](#常见问题)

## 如何安装和配置？

```bash
npm i -g @tnnevol/chandao-cli
```

配置禅道连接信息到 `~/.config/chandao/.env`：

```ini
CHANDAO_URL=https://your-chandao.com
CHANDAO_ACCOUNT=your-username
CHANDAO_PASSWORD=***
```

详细步骤见 `references/setup.md`。

## 支持哪些模块和操作？

chandao-cli 覆盖禅道 19 个模块的 CRUD 和业务操作：

| 模块 | 主要操作 | 命令详情 |
|------|----------|----------|
| 用户 | 列表/详情/创建/更新/删除 | [commands-user.md](commands-user.md) |
| 产品 | 列表/详情/创建/更新/删除/按项目集列出 | [commands-product.md](commands-product.md) |
| 项目 | 列表/详情/创建/更新/删除/按项目集列出 | [commands-project.md](commands-project.md) |
| 需求 | 列表/详情/创建/更新/评审/关闭/激活/变更 | [commands-story.md](commands-story.md) |
| 任务 | 列表/详情/创建/更新/开始/完成/关闭/激活 | [commands-task.md](commands-task.md) |
| 执行/迭代 | 列表/详情/创建/更新/启动/暂停/关闭/关联产品 | [commands-execution.md](commands-execution.md) |
| Bug | 列表/详情/创建/更新/解决/关闭/激活 | [commands-bug.md](commands-bug.md) |
| 测试用例 | 列表/详情/创建/更新/删除 | [commands-testcase.md](commands-testcase.md) |
| 测试单 | 列表/按产品/按项目/按执行/创建/更新/删除 | [commands-testtask.md](commands-testtask.md) |
| 史诗 | 列表/详情/创建/更新/关闭/激活/变更 | [commands-epic.md](commands-epic.md) |
| 用户需求 | 列表/详情/创建/更新/关闭/激活/变更 | [commands-requirement.md](commands-requirement.md) |
| 文件/附件 | 上传/编辑/删除 | [commands-file.md](commands-file.md) |
| 项目集 | 列表/详情/创建/更新/删除 | [commands-program.md](commands-program.md) |
| 构建/版本 | 列表/按项目/按执行/创建/更新/删除 | [commands-build.md](commands-build.md) |
| 发布 | 列表/按产品/创建/更新/删除 | [commands-release.md](commands-release.md) |
| 产品计划 | 列表/详情/创建/更新/删除 | [commands-productplan.md](commands-productplan.md) |
| 系统 | 列表/详情/创建/更新 | [commands-system.md](commands-system.md) |

## 如何使用帮助？

```bash
# 查看所有模块
chandao-cli help

# 查看模块用法
chandao-cli <module> help

# 查看具体操作参数
chandao-cli <module> <action> --help
```

## Token 过期了怎么办？

系统会自动处理。遇到 401 时会自动重新登录，无需手动干预。

## 常见问题

### Q: 没有 chandao-cli 命令？
A: 运行 `npm i -g @tnnevol/chandao-cli` 安装。

### Q: 如何配置禅道连接？
A: 创建 `~/.config/chandao/.env` 文件，填写 `CHANDAO_URL`、`CHANDAO_ACCOUNT`、`CHANDAO_PASSWORD` 三项。

### Q: 支持哪些操作？
A: 19 个模块的查询、创建、更新、删除及业务状态流转操作。详见命令表。

### Q: 所有操作都会直接执行吗？
A: 写操作支持 `--dry-run`，可预览操作结果。直接调用时会实际执行。

### Q: 如何解决 Bug 并保留原指派人？
A: 先用 `chandao-cli bug get <id>` 获取当前指派人，然后在 `bug resolve` 时使用 `--assigned-to` 参数指定原指派人。详见 [commands-bug.md](commands-bug.md)。
