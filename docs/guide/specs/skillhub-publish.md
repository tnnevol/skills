---
spec:
  id: SPEC-SKILLHUB-PUBLISH
  status: active
  version: 1.0.0
  updated: "2026-11-05"
  scope: skills/* 发布到 SkillHub 社区源（api.skillhub.cn）
---

# 规范：SkillHub 发布生命周期

> 本文件是**权威规范**，`docs/guide/publish-to-skillhub.md` 是操作手册；两者冲突时以本文件为准。
> 约束词 `必须` / `禁止` 可按 RFC 2119 的 MUST / MUST NOT 理解。

## 1. 背景

2026-11-05 批量同步 6 个技能时，`publish` 全部返回 2xx 并给出 `skillId`，但随后查
`/api/v1/skills/{slug}/versions` 和 `latestVersion` 仍是旧版本。当时据此判断「发布失败」，
准备重新发布；重发时服务端返回 409，才确认版本其实已经登记，只是还在审核队列里。

根因是**两个状态被混为一谈**：发布回执只证明「登记」，版本上线还要过一段不可控时长的安全扫描/审核。
本规范把这个窗口写进流程，避免再用「版本列表里没有」当作失败判据。

## 2. 术语

| 术语 | 含义 | 观测方式 |
|---|---|---|
| 登记（registered） | 服务端已接收该 `slug` + `version` 的包 | publish 返回 2xx 且含 `skillId` |
| 版本记录 | `/api/v1/skills/{slug}/versions` 里的一项 | 含 `version`、`createdAt`、`securityReports` |
| 上线（live） | 新版本成为该 slug 的默认版本 | `/api/v1/skills/{slug}` 的 `latestVersion.version` |
| 审核窗口 | 登记到上线之间的等待，实测 0～10 分钟 | 只能轮询，无法加速 |
| 平台元数据 | 服务端注入包内的 `_meta.json` | 含 `ownerId`、`publishedAt`、`slug`、`version` |

## 3. 状态机（权威）

```text
                     publish 2xx(skillId)
  S0 本地已改 ─────────────────────────────▶ S1 已登记
     │                                          │
     │ 4xx/5xx（无 skillId）                      │ 安全扫描 + 审核（0～10 分钟）
     ▼                                          ▼
  S4 发布失败                                 S2 审核中
                                                │ latestVersion 指向新版本
                                                ▼
                                             S3 已上线 ──▶ 执行第 5 节验收
                                                │
                                                │ 超过等待上限仍无记录
                                                ▼
                                             S5 待人工
```

| 状态 | 判据（必须用命令实测） | 允许动作 |
|---|---|---|
| S0 本地已改 | `git status` 有技能文件改动 | bump `version` 到新 SemVer |
| S1 已登记 | publish 返回 2xx，回执含 `skillId` | 记录 `slug@version`、`skillId`、时间；进入 S2 |
| S2 审核中 | 版本列表查不到，或 `latestVersion` 仍是旧值 | 只轮询；**禁止**重复 publish |
| S3 已上线 | `latestVersion.version == 目标版本` | 执行 AC1～AC5 |
| S4 发布失败 | 非 2xx 且无 `skillId` | 按 4xx / 5xx / 429 分别处理 |
| S5 待人工 | 超过 30 分钟仍无版本记录 | 停止自动化，人工介入 |

> **S2 与 S4 在版本列表上看起来完全一样。** 无损的判定手段只有两个：
> 用回执里的 `skillId` 直接探 CDN 直链（只读），或再发一次拿 409（写操作，会消耗限流额度）。
> 前者优先。

## 4. 强制规则

**R1｜内容变了必须 bump 版本。** 同 `slug` + 同 `version` 的发布覆盖线上同版本内容，
历史版本失去可复现性。（2026-11-05 的 openlist、vitepress-mermaid-renderer 就曾改内容不 bump。）

**R2｜判定发布结果必须用两个以上独立信号。** 可用信号：回执 `skillId`、CDN 直链 200、
`/versions` 出现该版本、`latestVersion` 指向它、重发返回 409。**禁止**仅凭「版本列表没有」判定失败。

**R3｜审核窗口内禁止重复 publish 同一版本。** 需要确认时只允许一次 409 探测，或改用只读的 CDN 探测。

**R4｜回执必须落账。** 记录 `slug@version`、`skillId`、时间。
回执形如 `✓ Published: skillId=xxx status=None`，其中 `status=None` 只表示服务端没回传该字段，
**不是失败**。

**R5｜批量发布必须限速。** 每个之间 `sleep 10`；命中 429（`发布频率过高`，回执可能带 `retryAfter`）
必须等待 `retryAfter` 秒（缺省 ≥60 秒）后补发，且只补发尚未登记的那些。

**R6｜禁止用 `updatedAt` 判定发布。** 列表里的 `updatedAt` 会因浏览/请求刷新，与发布无因果关系。

**R7｜禁止用 `skillhub verify` 判定仓库发布结果。** 它比对的是本地已安装目录，不是源码仓库。

**R8｜发布完成必须回写版本表。** 更新 `docs/guide/publish-to-skillhub.md` 的「线上版本」列。

**R9｜发布前必须先 `--dry-run`。** `slug` / `version` / `displayName` 缺失，或 `version` 不是 SemVer
（`^\d+\.\d+\.\d+`）时 CLI 本地就会退出；日期格式（`2026.11.05`）会被服务端拒收。

**R10｜打包口径固定。** 上传内容 = 技能目录内全部文件，排除 `.git`、`.idea`、`.vscode`、
`node_modules`、`__pycache__`、`*.pyc`、`.DS_Store`、`Thumbs.db` 与软链接。
因此 `GENERATION.md` 也会随包上线。

## 5. 验收判据（Definition of Done）

一次「发布完成」必须同时满足：

- **AC1 版本对齐**：每个目标 slug 的 `latestVersion.version` 等于本地 `SKILL.md` 的 `metadata.version`。
- **AC2 内容一致**：下载最新包解压后与 `skills/<目录>` 递归比对，唯一允许的差异是平台注入的 `_meta.json`。
- **AC3 无孤儿**：线上不存在本地没有的 slug，本地也不存在线上没有的 slug。
- **AC4 文档回写**：`docs/guide/publish-to-skillhub.md` 的版本表已更新（R8）。
- **AC5 台账完整**：每个 slug 的 `skillId` 与发布时间已记录（R4）。

### 验收命令

线上 slug 与仓库目录名不一定相同（如 `tnnevol-memos` ↔ `memos`），映射见操作手册。

```bash
HOST=https://api.skillhub.cn
slug=dsh          # 线上 slug
dir=dsh           # 仓库目录名

# AC1：线上最新版本 vs 本地版本
online=$(curl -s "$HOST/api/v1/skills/$slug" | jq -r '.latestVersion.version')
local=$(sed -n '/^metadata:/,/^[^ ]/p' "skills/$dir/SKILL.md" | sed -n 's/^ *version: *//p' | tr -d '"')
echo "$slug 线上=$online 本地=$local"

# AC2：下载最新包并逐字节比对（预期只有 _meta.json 一行差异）
tmp=$(mktemp -d)
curl -sL "$HOST/api/v1/download?slug=$slug" -o "$tmp/pkg.zip"
unzip -q "$tmp/pkg.zip" -d "$tmp/x"
diff -rq "$tmp/x" "skills/$dir"

# 审核期内的只读探测（把 <skillId> 换成回执里的值；200 = 包已上传）
# curl -sI -o /dev/null -w '%{http_code}\n' \
#   "https://skillhub-1388575217.cos.accelerate.myqcloud.com/skills/<skillId>/$slug/<version>.zip"
```

## 6. 误判对照表

| 现象 | 常见错误结论 | 实际含义 | 正确动作 |
|---|---|---|---|
| 回执 `status=None` | 发布失败 | 服务端未回传该字段 | 记 `skillId`，等审核 |
| `/versions` 没有新版本 | 发布失败 | 审核中（S2） | 轮询，禁止重发 |
| `latestVersion` 还是旧的 | 发布失败 | 同上 | 轮询 |
| 重发返回 409 | slug 冲突 / 发错了 | 该版本已登记（幂等保护） | 视为登记成功的正证据 |
| `skillhub verify` 不匹配 | 发布失败 | 比对的是安装目录，不是仓库 | 忽略，改用 AC1/AC2 |
| `updatedAt` 变了 | 发布成功 | 浏览行为刷新 | 忽略 |

## 7. 变更记录

| 版本 | 日期 | 变更 |
|---|---|---|
| 1.0.0 | 2026-11-05 | 首次发布：状态机、R1～R10、AC1～AC5、误判对照表 |
