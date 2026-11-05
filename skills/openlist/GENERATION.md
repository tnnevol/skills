# Generation Info

skills/openlist 的参考文件以本仓库 `apps/openlist-cli` 的真实命令行为准
（经真实服务端核验，见 `references/pitfalls.md`），不提炼自上游文档仓库。

- **Source:** `apps/openlist-cli`（本仓库应用）+ 上游单点引用
- **Skill version:** `1.3.0`
- **Synced:** 2026-11-05

## v1.3.0 记录（2026-11-05）：补齐 v4.2.9 新增 API

上游 `v4.2.9` 相比技能原先覆盖的 `v4.0.x` 多出 100+ 接口，集中在媒体库、种子、分片上传、
接口凭证、公开信息与后台管理。本次把 CLI 与技能同步补齐。

### 新增 CLI 命令组

| 分组 | 数量 | 覆盖接口 |
| --- | --- | --- |
| `media` | 16 | `/api/fs/media/*` 相册、条目、收藏、进度、批注、STRM |
| `admin media` | 23 | `/api/admin/media/*` 配置、条目、扫描、刮削、扫描目录、增删、导出导入 |
| `seed` | 11 | `/api/fs/seed/*` 解析、生成、转换、诊断、保存 |
| `multipart` | 6 | `/api/fs/multipart/*` 分片上传（含一键 `upload`） |
| `admin scan` | 3 | `/api/admin/scan/*` |
| `admin transcode` | 3 | `/api/admin/transcode/*` |
| `appkey` | 3 | `/api/me/appkey/*` |
| `public` | 4 | `/api/public/*` |

### 关键技术事实（已用真实实例 v4.2.9 核验）

- **分片上传参数走 HTTP 头**，不是 JSON body：`File-Path`（URL 编码）、`X-File-Size`、
  `X-Upload-Id`、`X-Chunk-Index`。按 body 传参返回 400。
- `upload_id` 字段名在返回体里可能是 `upload_id` 或 `uploadId`，两种都要兼容。
- `seed capabilities` 等**必填 `seed_data`**，只给 `path` 会 400。
- `media` 分组依赖实例启用媒体库；未启用时相册接口 404/空列表属预期。
- `appkey delete` 用 query `?id=`，不是路径参数。

### 客户端能力补齐

`client.get` 增加 query 参数、`client.post` 增加 headers 与 query 参数，
统一由 `buildQueryPath` 拼接（跳过 undefined/null/空串，数组展开为重复键）。

## 技能自带文件

- `installation-guide.md`：首次安装引导，随技能一起分发（`pnpx skills add` 只拉 `skills/` 目录，
  因此不能依赖 `apps/` 下的外链）。变更 CLI 安装方式时同步此处。

## 上游引用范围

- 唯一外部文档引用：[OpenList-Docs「添加存储」通用项](https://github.com/OpenListTeam/OpenList-Docs/blob/main/pages/guide/drivers/common.md)，
  仅提取可通过 `openlist-cli` 操作的内容（`references/storage-advanced.md`）。
- 上游文档站（OpenListTeam/OpenList-Docs，valaxy 单语站，中文直接写在正文）
  无 release tag、更新频繁且与本技能交集极小，**不建子模块**，以 URL 直链引用。

## 同步方式

- CLI 行为变化时：改 `apps/openlist-cli` → 同步 `references/commands.md` / `pitfalls.md`。
- 上游「添加存储」字段变化时：核对 `pages/guide/drivers/common.md` 当前内容，
  以服务端 `admin driver info` 返回的模板为准。
