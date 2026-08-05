# 常见问题

## Q: 如何配置禅道连接？

A: 设置环境变量 `CHANDAO_URL`、`CHANDAO_ACCOUNT`、`CHANDAO_PASSWORD`。

## Q: 如何验证配置是否正常？

A: `node scripts/auth.js --action list-products`，看到产品列表即可。

## Q: Token 过期了怎么办？

A: 系统会自动处理。遇到 401 时会自动重新登录，无需手动干预。

## Q: 如何查看脚本的用法？

A: 每个脚本文件头部注释中都有使用说明，例如 `head scripts/bug.js`。

## Q: 支持哪些操作？

A: 8 个模块的查询、创建、更新、删除及业务状态流转操作。详见 [SKILL.md](../SKILL.md)。

## Q: 所有操作都会直接执行吗？

A: 写操作支持 `--dry-run`，可预览操作结果。删除操作需要 `--yes` 确认。

## Q: 为什么有些 update 操作优先级变了？

A: 禅道 API 的 PUT 请求会将未包含的字段重置为默认值。脚本内部已自动先 GET 再合并，但确保脚本代码未被修改。详见 [pitfalls.md](./pitfalls.md) 第 23 条。
