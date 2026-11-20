# 常见问题（help）

## 安装与登录

**Q：`chandao-cli: command not found`？**

A：仓库内用 `node apps/chandao-cli/dist/cli.js`；或先 `pnpm --filter @tnnevol/chandao-cli build`，再全局安装。

**Q：非交互环境登录失败？**

A：传 `--base-url`、`--account`、`--password`，或设置 `CHANDAO_URL` / `CHANDAO_ACCOUNT` / `CHANDAO_PASSWORD`。

**Q：登录提示 v1/v2 都失败？**

A：确认地址可访问（`/api.php/v1/tokens`）、账号密码正确、站点未被防火墙拦截。

**Q：怎么确认当前用的是 v1 还是 v2？**

```bash
chandao-cli auth status --verify
# 返回 effectiveVersion / verify.version
```

## 版本

**Q：为什么 `group list` 用 v2 报错？**

A：分组只有 v1；auto 会自动回退，强制 v2 会失败。去掉 `--api-version v2`。

**Q：为什么 `execution start` 在 v1 报错？**

A：执行启动/暂停/关闭只有 v2；改用 auto 或 `--api-version v2`。

**Q：能一直用 v1 吗？**

A：可以，但 v2 的部分能力（执行生命周期）没有 v1 实现；建议默认 auto。

## 内容

**Q：需求描述里写 Markdown 为什么显示成原文？**

A：禅道富文本字段是 HTML，不是 Markdown。用 `<p>`、`<ul>`、`<strong>` 等标签。

**Q：测试用例步骤能用 HTML 吗？**

A：不能。`--steps` 是纯文本 JSON；HTML 标签会原样显示。

**Q：图片怎么插入需求/Bug/任务？**

A：先 `file upload` 上传（v2 需绑定对象），拿到 `url` 后放进 `<img src="...">`，再 update 内容。详见 [attachment-workflow.md](attachment-workflow.md)。

**Q：上传成功但页面图片打不开？**

A：确认 URL 是上传返回的相对路径；未登录访问 `file read` 会 302 到登录页，浏览器登录后正常。

## 权限

**Q：403 Not allowed 是权限问题吗？**

A：不一定。字段名写错也会 403；先确认参数名（如 `executionID`、`productID`），再查角色/分组。

**Q：能通过 CLI 改角色权限吗？**

A：不能。只有 `group list` 只读；改权限需 Web/DB。

**Q：能通过 CLI 新建部门吗？**

A：不能。`dept` 只有查询；新建需 Web/DB。

## 数据

**Q：update 后其他字段被清空了？**

A：CLI 已自动 GET 回填；如果你绕过 CLI 直接 PUT，缺失字段会被重置。

**Q：删除能恢复吗？**

A：禅道 DELETE 是软删除（`deleted=1`），UI 不可见；恢复需 DB/后台。删除前确认。

**Q：文档能通过 API 创建吗？**

A：本实例不能：v1 无创建接口，v2 `/v2/doc/*` 返回空。文档需 Web 界面维护。
