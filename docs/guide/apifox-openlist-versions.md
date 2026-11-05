# Apifox 项目版本目录规划

记录 OpenList 项目（`8612113`）的接口目录拆分方式，供后续同步新版本时参照。

## 背景

项目原先按功能域平铺（`Authentication` / `User` / `Admin` / `File System` / `Public` / `Sharing` / `TS版本接口`），
接口只覆盖 v4.0.x 时代的 87 个，缺少 `media`、`seed`、`multipart`、`appkey`、`transcode` 等 2026 年新增模块。

2026-11-05 按「版本目录 → 功能域子目录」重构，与 memos 项目的组织方式保持一致，
让不同版本的接口契约可以并存、互不覆盖。

## 当前结构

```
OpenList (8612113)
├── v4.2.9                 # 最新版，188 条
│   ├── Authentication
│   ├── User
│   ├── Admin
│   ├── File System
│   ├── Public
│   ├── Sharing
│   └── TS版本接口
└── v4.0.x (legacy)        # 历史快照，87 条
    ├── Authentication
    ├── User
    ├── Admin
    ├── File System
    ├── Public
    ├── Sharing
    └── TS版本接口
```

> 「根目录」是 Apifox 系统目录，无法删除，可忽略。

## 版本判定依据

- 最新版取上游最新 tag `v4.2.9`。
- 旧快照无版本标记，按特征反推：不含 `media`/`seed`/`multipart`/`appkey`/`transcode`/`torrent`
  任何一条，且仍保留已废弃的 `/api/share/*`（v4.2.9 中分享已并入 `/api/fs`），
  路由数量落在 v4.0.0～v4.0.9 区间，故命名为 `v4.0.x (legacy)` 而非断言具体小版本。

## 版本号怎么取

路由定义在源码 `server/router.go`，不在 OpenAPI 文件里（上游不产出 spec）。
取某一版本接口清单的步骤：

```bash
git clone --depth 1 --branch v4.2.9 https://github.com/OpenListTeam/OpenList.git /tmp/ol
# 解析 server/router.go 中的 group 前缀 + 路由注册
```

解析要点（踩过的坑）：

1. **helper 函数要展开**：`_fs(...)`、`_sharing(...)`、`admin(...)` 等接收 `*gin.RouterGroup`，
   内部还会再 `g.Group(...)`，必须递归展开并代入调用点前缀，否则会漏掉大半个项目。
2. **`Any` 要与真实语义对齐**：源码有 16 处 `.Any(...)`，直接展开成 5 个方法会产生 5 倍冗余。
   实际按语义收敛——公开查询用 `GET`，`/api/fs/*` 与 `/api/share/list` 用 `POST`。
3. **根路由上的 `/@*` 不受 `/api` 前缀影响**：`/@emby`、`/@mediabrowser`、`/@rest`、`/d`、`/p`、`/sd`、`/sad`
   注册在 `e` 上，按 `/api` 过滤会全部丢掉，需要单独补。

按上述规则，v4.2.9 从 212 条（含 Any 展开）收敛为 188 条。

## 同步新版本的做法

1. 新建版本顶层目录（`apifox folder create --type endpoint`，不传 `parentId`）
2. 在该目录下建 7 个功能域子目录（传 `parentId`）
3. 按上面的解析规则生成接口清单并逐个 `apifox endpoint create --file`
4. 旧版本目录保留不动，不要覆盖

写入前必须先 `apifox cli-schema get endpoint-create` 取结构，
再用 `apifox cli-schema validate endpoint-create --file <path>` 校验，通过后才执行创建。

## 写入命令备忘

```bash
# 目录
apifox folder create --project 8612113 --file folder.json     # {"name","type","projectId","moduleId","parentId"}
apifox folder list   --project 8612113 --type endpoint

# 接口：已存在的接口改目录用 --folder-id，不必删除重建
apifox endpoint update <endpointId> --project 8612113 --folder-id <folderId>
apifox endpoint create --project 8612113 --file endpoint.json
```

`moduleId` 当前为 `8236282`（默认模块）。
