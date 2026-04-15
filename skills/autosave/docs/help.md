# Help

## quark-auto-save 是什么？

quark-auto-save 是一个夸克网盘自动转存服务，支持：
- 自动转存夸克网盘分享链接
- 文件命名整理
- 推送通知提醒
- 媒体库刷新

## 如何获取 Token？

1. 登录 quark-auto-save WebUI
2. 进入 **系统配置 - API 栏**
3. 复制显示的 Token

⚠️ Token 由用户名密码加密生成，不支持直接修改。未修改用户名密码的前提下永不过期。
⚠️ **注意：Token = 身份鉴权，请妥善保管，请勿泄漏。**

## 常见问题

**Q: 添加任务失败？**
A: 检查 `AUTO_SAVE_BASE_URL` 和 `AUTO_SAVE_TOKEN` 环境变量是否正确配置。

**Q: 如何查看当前任务列表？**
A: 当前版本后端不支持获取任务列表的 API，可通过 WebUI 查看。

**Q: Token 过期了怎么办？**
A: Token 永不过期（未修改用户名密码前提下）。如果认证失败，请确认用户名密码未变更。

**Q: 支持哪些网盘？**
A: 目前仅支持夸克网盘（pan.quark.cn）。

## 相关资源

- **GitHub：** https://github.com/Cp0204/quark-auto-save
- **API 文档：** https://github.com/Cp0204/quark-auto-save/wiki/API接口
- **生态项目：** 见 API 文档"生态项目"章节
