# Generation Info

skills/openlist 的参考文件以本仓库 `apps/openlist-cli` 的真实命令行为准
（经真实服务端核验，见 `references/pitfalls.md`），不提炼自上游文档仓库。

- **Source:** `apps/openlist-cli`（本仓库应用）+ 上游单点引用
- **Skill version:** `1.2.2`
- **Synced:** 2026-10-09

## 上游引用范围

- 唯一外部文档引用：[OpenList-Docs「添加存储」通用项](https://github.com/OpenListTeam/OpenList-Docs/blob/main/pages/guide/drivers/common.md)，
  仅提取可通过 `openlist-cli` 操作的内容（`references/storage-advanced.md`）。
- 上游文档站（OpenListTeam/OpenList-Docs，valaxy 单语站，中文直接写在正文）
  无 release tag、更新频繁且与本技能交集极小，**不建子模块**，以 URL 直链引用。

## 同步方式

- CLI 行为变化时：改 `apps/openlist-cli` → 同步 `references/commands.md` / `pitfalls.md`。
- 上游「添加存储」字段变化时：核对 `pages/guide/drivers/common.md` 当前内容，
  以服务端 `admin driver info` 返回的模板为准。
