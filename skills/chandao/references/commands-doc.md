# 文档（doc）

禅道文档接口分两代，差异很大：

| 版本 | 能力 | 适用 |
| --- | --- | --- |
| v1 | 只读：`/v1/doclibs`、`/v1/docs`、`/v1/doc/{id}` | 22.1 及更早 |
| v2 | 空间/文档库/文档的读、建、改、删 | 22.5+（`minVersion: 22.5`） |

> 22.1 的 `/v2/doc/*` 路由会返回 **HTTP 200 + 空响应**，不要当成“创建成功”。CLI 会直接报“当前实例的文档 v2 接口返回空（需 22.5+）”。

## 读取

```bash
# v1：文档库（type=product/project/custom/mine）
chandao-cli doc libs --type product --object-id 1

# v1：文档列表 / 详情
chandao-cli doc list --lib 2
chandao-cli doc get --id 10

# v2：空间/库/文档
chandao-cli doc spaces --type product
chandao-cli doc libs --type product --object-id 1
chandao-cli doc list --type product --object-id 1 --lib 2
chandao-cli doc get --id 10
```

## 创建 / 修改（v2）

```bash
chandao-cli doc create \
  --type product --object-id 1 --lib 2 \
  --title "接口说明" \
  --content-file ./doc.md \
  --content-type doc

chandao-cli doc update --id 10 \
  --title "接口说明 v2" \
  --content-file ./doc.md \
  --content-type doc
```

### `contentType` 是关键（缺了就不会转 HTML）

| 值 | 行为 |
| --- | --- |
| `doc` | `content` 按 **Markdown** 解析，禅道转换为块编辑器内容并生成 HTML 快照；支持团队协同编辑 |
| `html` | 直接把 `content` 当 HTML 保存，不转换，不支持协同编辑 |

CLI 默认 `--content-type doc`。如果传入 Markdown 却用 `html`，页面会显示原始 Markdown；这是“内容没有主动转 HTML”的根因。

## 图片：必须上传到文档附件库

`doc create/update` 会扫描正文中的本地图片并自动处理：

- Markdown：`![alt](./images/a.png)`
- HTML：`<img src="./images/a.png">`
- 远程 URL（`http(s)://`、`file-read-*`、`fileID=`）保持原样。

处理流程：

1. 创建文档拿到 `docID`（创建时先用原始正文）；
2. 对每个本地图片调用 `POST /v2/files`，带上 `objectType=doc`、`objectID=<docID>`，把文件写入文档附件库；
3. 用返回的 `url` 替换正文里的本地路径；
4. `PUT /v2/doc/docs/{docID}` 保存最终正文。

如果实例不支持 `objectType=doc`，上传会报错；不要改用 v1 无绑定上传（图片不会进文档附件库），也不要把本地路径直接写进正文。

## 22.1 怎么办

- 读取：用上面的 v1 命令；
- 写入：22.1 没有文档写接口，CLI 会阻止并提示；用 Web 界面创建/编辑；
- 升级到 22.5+ 后即可用 v2 全量命令。
