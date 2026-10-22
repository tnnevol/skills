# Generation Info

`skills/yonyou-doc` 的参考文件来自 YonBuilder 移动开发在线文档（原 APICloud）：
`https://developer.yonyou.com/docs`。站点是 Raneto 静态渲染，**不是 git 仓库**
（无公开 GitHub/Gitee 镜像，GitHub 搜索 `yonyou` 组织与企业仓库均无对应文档仓），
也没有 `llms.txt` / `sitemap.xml`，所以不能像 dsh / midscenejs 那样挂 submodule，
改用技能自带抓取脚本 + 状态文件同步，思路与 `skills/fnnas-docs` 一致。

- **Source:** <https://developer.yonyou.com/docs>
- **入口页:** `/docs/Client-API/API`（API 对象，415 章节内联在一页）
- **全站规模:** 1697 个页面条目 / 8 个分册（2026-10-22 抓取）
- **Skill version:** `1.0.0`
- **Synced:** 2026-10-22

## 同步方式

```bash
cd skills/yonyou-doc
python3 scripts/sync_docs.py           # 刷新核心快照
python3 scripts/sync_docs.py --check   # 只检查线上是否变化（exit 1 = 落后）
```

脚本会重新抓取并覆盖下面这些生成文件：

| 文件 | 内容 |
| --- | --- |
| `references/menu.md` | 全站菜单索引（1697 条，8 个分册） |
| `references/api-reference.md` | `/docs/Client-API/API` 离线全量正文（415 章节） |
| `references/api-objects.md` | 方法 / 属性 / 常量索引（350 / 37 / 27） |
| `references/mtl-plugins.md` | MTL.js 原生插件正文（28 个模块） |
| `references/.sync-state.json` | 正文 sha256、条目数、同步日期（`--check` 靠它比对） |

- 生成文件**不要手工编辑**，下次同步会覆盖；人工补充的说明写在 `SKILL.md`。
- 全站正文按需抓取：`--all` 会把 1697 页落到 `references/pages/`（约 5.6MB），
  该目录已 gitignore，只做本地缓存，不进技能发布内容。
- 章节数或菜单结构变化时，人工核对 `SKILL.md` 的「索引」「常用能力速查」是否需要跟随调整。
- 发布到 SkillHub 前 bump `SKILL.md` 的 `metadata.version`（SemVer `x.y.z`）。

## 版本记录

| 版本 | 日期 | 变更 |
| --- | --- | --- |
| 1.0.0 | 2026-10-22 | 首次入库：API 全量离线正文 + MTL 28 个模块 + 全站菜单索引 + 同步脚本 |

## 语言范围

上游仅简体中文，无国际化问题。
