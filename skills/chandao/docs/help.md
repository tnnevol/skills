# 禅道 Skill 使用指南

## 目录

- [如何配置禅道连接？](#如何配置禅道连接)
- [支持哪些模块和操作？](#支持哪些模块和操作)
- [如何使用 CLI 帮助？](#如何使用-cli-帮助)
- [Token 过期了怎么办？](#token-过期了怎么办)
- [返回的数据安全吗？](#返回的数据安全吗)
- [常见问题](#常见问题)

## 如何配置禅道连接？

设置三个环境变量：

```bash
export CHANDAO_URL="https://your.chandao.server"
export CHANDAO_ACCOUNT="your-username"
export CHANDAO_PASSWORD="your-password"
```

或在 `skills/chandao/.env` 文件中创建配置（**不要提交到 Git**）：

```
CHANDAO_URL=https://your.chandao.server
CHANDAO_ACCOUNT=your-username
CHANDAO_PASSWORD=your-password
```

## 支持哪些模块和操作？

| 模块 | 操作 | 文档 |
|------|------|------|
| 用户 | `list-user` / `get-user` | `docs/actions-user.md` |
| 产品 | `list-product` / `get-product` / `create-product` / `update-product` / `close-product` | `docs/actions-product.md` |
| 项目 | `list-project` / `get-project` | `docs/actions-project.md` |
| 需求 | `list-story` / `get-story` / `create-story` / `update-story` / `review-story` / `close-story` | `docs/actions-story.md` |
| 任务 | `list-task` / `get-task` / `create-task` / `update-task` / `close-task` / `delete-task` | `docs/actions-task.md` |

所有写操作都通过 `scripts/validate.cjs` 进行参数校验，详见 `docs/actions-validate.md`。

## 如何使用 CLI 帮助？

每个模块都有独立的 `actions/*.cjs` 脚本，支持 `--help` 参数：

```bash
node skills/chandao/scripts/actions/task.cjs --help
node skills/chandao/scripts/actions/project.cjs --help
```

或参考各模块文档：

- 任务管理：`docs/actions-task.md`
- 项目管理：`docs/actions-project.md`
- 需求管理：`docs/actions-story.md`
- 用户管理：`docs/actions-user.md`
- 产品管理：`docs/actions-product.md`

## Token 过期了怎么办？

系统会自动处理。遇到 401 时会自动重新登录，用户无需手动干预。

## 返回的数据安全吗？

是的，所有输出都会经过脱敏处理，密码、Token、手机号、邮箱等敏感信息不会暴露。

## 常见问题

### Q: 如何配置禅道连接？
A: 设置三个环境变量：`CHANDAO_URL`、`CHANDAO_ACCOUNT`、`CHANDAO_PASSWORD`，或在 skill 目录下创建 `.env` 文件。

### Q: Token 过期了怎么办？
A: 系统会自动处理。遇到 401 时会自动重新登录，用户无需手动干预。

### Q: 支持哪些操作？
A: P0 阶段支持查询类操作：用户、产品、项目的列表和详情。后续将支持创建和状态流转。

### Q: 返回的数据安全吗？
A: 是的，所有输出都会经过脱敏处理，密码、Token、手机号、邮箱等敏感信息不会暴露。
