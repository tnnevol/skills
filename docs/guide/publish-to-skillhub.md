# 把技能发布到 SkillHub

这篇是给自己下次（或 AI agent）看的速查。SkillHub 是社区版的技能市场，仓库里这几个技能都发在上面。下面记录怎么做，以及踩过的坑。

## 先说结论

更新和首次发布**是同一个动作**：按 `slug` 重新 `publish`，服务端直接覆盖线上那份。没有单独的「update」命令。所以改完本地内容，直接 publish 就行。

## 前置：SKILL.md 必须有这三个字段

发布校验（CLI 源码 `_validate_metadata`）只认 frontmatter 里的三个必填项，缺一个都不让发：

- `slug`：kebab-case，2–128 字符。线上靠它定位，更新时**必须和线上一致**，否则会变成新建或撞 409。
- `version`：合法 SemVer（`x.y.z`）。本地只校验格式，不强制比线上高，但稳妥起见更新时记得 bump。注意别用前导零（`05` 这种），服务端可能拒。也别用日期格式（`2026.09.24` 这种），服务端 400 直接拒，统一改成 `x.y.z`。
- `displayName`：展示名，非空就行，一般跟目录名一样。

本仓库 `skills/*/SKILL.md` 之前只有 `name`，缺 `slug` 和 `displayName`，是发布踩的第一坑。现在都补上了。

## 登录

社区账号用 `skh_` 开头的 token 登录：

```bash
skillhub login --key "$SKILLHUB_KEY" --host "https://api.skillhub.cn"
```

老写法（CLI 不支持 `--key` 时才用）：

```bash
skillhub auth login --token "$SKILLHUB_KEY" --host "https://api.skillhub.cn"
```

登录态存在 `~/.skillhub/credentials.json`。已经登录过的话，publish 会自动带上 token，不用每次重登。

查当前身份：

```bash
skillhub auth whoami
```

## 发布步骤

先 dry-run 预检（只校验 + 本地打包，不联网写）：

```bash
skillhub publish skills/chandao --dry-run
```

通过后再真正发：

```bash
skillhub publish skills/chandao --changelog "sync from repo 2026-09-14"
```

发布接口是 `POST /api/v1/community/skills/publish`，按 `slug` 覆盖。成功回执会给出 `skillId`。

## 发布之后：回执 ≠ 已上线

这段最容易误判，完整状态机见 [发布规范（SPEC）](./specs/skillhub-publish)。

`✓ Published: skillId=xxx status=None` 只说明**已登记**。新版本还要过安全扫描和审核（实测 0～10 分钟）
才进版本列表；这期间 `/api/v1/skills/<slug>/versions` 和 `latestVersion` 都还是旧值，看着像没发出去。

- `status=None` 是服务端没回传该字段，不是失败。
- **别急着重发**：同版本重发会返回 409，CLI 提示「slug 冲突」，其实那是「已经登记成功」的反证。
- 只读确认方式：用回执里的 `skillId` 探 CDN 直链
  `https://skillhub-1388575217.cos.accelerate.myqcloud.com/skills/<skillId>/<slug>/<version>.zip`，
  返回 200 就说明包已上传，只剩等审核。
- `updatedAt` 会因浏览刷新，不能当发布证据。

上线后的验收（版本对齐 + 包内容逐字节比对）按规范第 5 节 AC1～AC5 执行。

## 全量发布的坑：限流

一口气连发多个会被 429 限流，报错是「发布频率过高，请稍后再试」。CLI 本身不会自动退避重试。

当时 6 个技能里前 3 个秒发成功，后 3 个被限流。解决办法就是停一下再发，实测等 60 秒左右、每个之间再隔几秒就比较稳。批量脚本长这样：

```bash
cd /Users/tnnevol/workspace/my-pj/gits/skills
for d in chandao dsh fnnas-docs halo memos openlist midscenejs vitepress-mermaid-renderer yonyou-doc; do
  skillhub publish "skills/$d" --changelog "sync from repo $(date +%F)"
  sleep 10
done
```

被限流了别慌，记住已经发出去的 `skillId`，剩下的单独补发就行。

## 各技能在 SkillHub 上的 slug

仓库目录名和线上 slug 不完全一样，别想当然：

| 目录 | 线上 slug | 线上版本 | 仓库版本 |
|------|-----------|----------|----------|
| chandao | `chandao` | 1.0.2 | 1.0.2 |
| dsh | `dsh` | 1.3.0 | 1.3.0 |
| fnnas-docs | `fnnas-docs` | 1.1.4 | 1.1.4 |
| halo | `tnnevol-halo` | 1.0.2 | 1.0.2 |
| memos | `tnnevol-memos` | 2.2.0 | 2.2.0 |
| openlist | `openlist` | 1.2.3 | 1.2.3 |
| midscenejs | `midscenejs` | 1.4.0 | 1.4.0 |
| vitepress-mermaid-renderer | `vitepress-mermaid-renderer` | 1.0.1 | 1.0.1 |
| yonyou-doc | `yonyou-doc` | 1.0.1 | 1.0.1 |

> 这张表在 2026-11-05 的批量同步后更新为当时的线上版本。改动技能后以 `SKILL.md` 的 `version` 为准，
> 发布成功后回来更新「线上版本」列。

halo 和 memos 的线上 slug 带 `tnnevol-` 前缀，这是当时发上去定的，改 slug 等于换一份，别动。

## 更新图标

当前 CLI（`skillhub publish`）不直接支持上传图标，`payload` 里没有 `iconUrl` 字段。想换图标得绕过 CLI，直接调发布接口，在 `payload` 里加上 `iconUrl`。

步骤：

1. 先把图标传到 SkillHub CDN。最方便的是复用评论图片上传接口：

```bash
curl -X POST "https://api.skillhub.cn/api/v1/skills/<slug>/comments/images?namespace=community" \
  -H "Authorization: Bearer $SKILLHUB_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@icon.png"
```

返回 JSON 里有 `url`，记下来。

2. 然后用同样 publish 的 multipart 请求，但在 JSON payload 里加上：

```json
{
  "slug": "dsh",
  "version": "1.0.3",
  "displayName": "dsh",
  "iconUrl": "https://skillhub-1388575217.cos.accelerate.myqcloud.com/.../icon.png",
  "changelog": "update icon"
}
```

3. 如果回执里出现 `iconAuditStatus: pending`，说明图标已提交并进入平台审核，等过审就行。

dsh 的图标就是这样更新的，版本从 `1.0.1` 升到了 `1.0.2`。

### 图标从哪来

不要凭空造图。文档类技能直接用上游站点的图标资源：

- 先看页面 `<link rel="shortcut icon">`，通常是 `favicon.ico`
- 站点一般只提供 16×16 的 ico，直接放大很糊；可以在同一站点找页头高清 logo
  （例如 Raneto 模板的 `.main-header-logo` 背景图），裁出同一个字标重绘成 256×256，
  视觉上仍是平台原图
- 上传后确认回执 `iconAuditStatus`，再在 `/api/v1/skills/<slug>` 的 `skill.iconUrl` 里核对

`yonyou-doc` 用的是 `developer.yonyou.com/docs/favicon.ico` 的「用」字标：站点只有 16×16，
所以按页头 logo 的同款字标重绘成红底白字 256×256，没有改设计。

## 关于 `skillhub verify`

`verify` 比对的是**本地已安装目录**和线上的内容指纹，不是比对源码仓库。本仓库的技能没走 `skillhub install` 装到标准路径，所以直接 verify 会报「指纹不匹配」。这不代表发布失败，看 publish 回执里的 `skillId` 才是准的。

要想正经校验，先把线上版本拉到本地标准目录再 verify：

```bash
skillhub install chandao
skillhub verify chandao
```

## 一句话流程

改内容 → bump `version` → `skillhub publish <目录> --dry-run` → `skillhub publish <目录> --changelog "..."`
→ 记下 `skillId`，等审核 → 按 [SPEC](./specs/skillhub-publish) 的 AC1～AC5 验收 → 回写上面的版本表。
