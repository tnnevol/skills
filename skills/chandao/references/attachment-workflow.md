# 附件 / 图文 Workflow

任何需要图片或文件的禅道内容，都必须遵循：

**上传附件 → 拿到 URL → 把 URL 回显进 HTML 片段 → 保存内容**

不能写本地路径、不能 base64、不能外链、不能先写内容再补附件（会导致附件与内容脱节）。

## 0. 读取已有图片/附件

内容里的 `file-read-N.png` / `fileID=N` 是禅道 Web 路由，**需要登录 Cookie**；直接 `curl` 会 302 或返回登录页 HTML，不能当成图片。用 CLI 走 v1 文件接口下载：

```bash
# 一次下载需求 spec+verify 里的全部图片/附件（去重）
chandao-cli story images --id 3251 --dir ./3251-images

# 已知 fileID 时单独下载
chandao-cli file download --id 55732 --output ./55732.png
```

- `story images` 会提取 `file-read-N` 和 `?fileID=N` 两种形式，按响应 Content-Type 决定扩展名；
- 下载走 `GET /api.php/v1/files/{id}`，v1-only 实例也可用；v2 实例需要登录时同时拿到 v1 token；
- 输出 JSON 里 `files[]` 包含 `fileID`、`output`、`bytes`、`contentType`；默认跳过已存在文件，加 `--force` 覆盖。

## 1. 上传命令

```bash
# 已有对象：绑定到对象（v2）
chandao-cli file upload --file ./mockup.png --object-type story --object-id 12

# 输出
{
  "success": true,
  "operation": "file.upload",
  "data": {
    "version": "v2",
    "associated": true,
    "data": {
      "status": "success",
      "id": 37,
      "url": "/index.php?m=file&f=read&t=png&fileID=37"
    }
  }
}
```

`objectType` 支持：`story`、`bug`、`task`、`testcase`。对象必须已存在。

### 无对象绑定（纯附件）

```bash
chandao-cli file upload --file ./report.pdf
# auto 模式下无绑定会自动走 v1，返回 {id, url}；文件不会出现在任何对象的附件列表
```

### 版本差异（重要）

| 版本 | 表单字段 | 对象绑定 | 缺少绑定时的行为 |
| --- | --- | --- | --- |
| v2 | `file` | ✅ `objectType` + `objectID` | 返回 **200 空响应**（CLI 会报错阻止） |
| v1 | `imgFile` | ❌（仅 `--uid`） | 正常返回 id/url，但不绑定对象 |

因此：

- `auto` + 带 `--object-type/--object-id` → v2 上传；
- `auto` + 不带绑定 → 自动走 v1；
- 强制 `--api-version v2` 但不带绑定 → 命令直接报错。

## 2. URL 形式

上传返回的 URL 有两种形式（取决于禅道版本）：

```text
新版：/index.php?m=file&f=read&t=png&fileID=37
旧版：http://chandao.example.com/zentao/file-read-37.png
```

两者都是**站点可直接访问的地址**，原样放进 HTML：

```html
<img src="/index.php?m=file&f=read&t=png&fileID=37" alt="图1：页面布局">
<a href="/index.php?m=file&f=read&t=pdf&fileID=38">下载附件：report.pdf</a>
```

不要拼接 `http://host`，不要改写参数，不要把 `&` 改成 `&amp;`（浏览器可正常解析；如必须严格转义，只影响属性解析，不影响 URL）。

> 禅道在渲染时会规范化 `<img>`（可能自动加 `onload` 属性），这是正常现象。

## 3. 已有对象：标准流程

```bash
# 1) 上传并绑定
chandao-cli file upload --file ./mockup.png --object-type story --object-id 12

# 2) 用返回 url 组装 HTML
# <p>页面布局：</p><p><img src="/index.php?m=file&f=read&t=png&fileID=37" alt="页面布局"></p>

# 3) 更新内容（只传需要改的字段；CLI 会自动回填其余字段）
chandao-cli story update --id 12 \
  --spec '<p>页面布局：</p><p><img src="/index.php?m=file&f=read&t=png&fileID=37" alt="页面布局"></p>'
# 旧版 v1 若 update 返回 400 error，改用：
# chandao-cli story change --id 12 --reviewer <账号> --spec '<p>...</p>'

# 4) 校验
chandao-cli story get --id 12 | jq -r '.data.data.story.spec'
```

## 4. 新建对象：建骨架 → 上传 → 回显

对象不存在时，v2 无法上传绑定。按顺序执行：

```bash
# 1) 创建骨架（必填字段 + 占位内容）
chandao-cli story create --product 1 --title "支持导出 Excel" --spec "<p>待补充</p>"
# 返回 id，例如 15

# 2) 上传并绑定到新对象
chandao-cli file upload --file ./export.png --object-type story --object-id 15

# 3) 回显 URL 并更新完整 HTML
chandao-cli story update --id 15 \
  --spec '<p>导出入口如下：</p><p><img src="/index.php?m=file&f=read&t=png&fileID=40" alt="导出入口"></p>'
```

这仍然满足“先上传附件、再把地址回显到 HTML”，同时保证附件挂在正确对象上。

## 5. 各对象示例

### 需求

```bash
chandao-cli story create --product 1 --title "..." --spec "<p>待补充</p>"
chandao-cli file upload --file ./flow.png --object-type story --object-id <id>
chandao-cli story update --id <id> --spec '<p>流程：</p><p><img src="..." alt="流程图"></p>'
```

### Bug

```bash
chandao-cli bug create --product 1 --title "..." --severity 2 --steps "<p>复现步骤...</p>"
chandao-cli file upload --file ./error.png --object-type bug --object-id <id>
chandao-cli bug update --id <id> --steps '<p>复现步骤...</p><p><img src="..." alt="错误截图"></p>'
```

### 任务

```bash
chandao-cli task create --execution 3 --name "联调" --desc "<p>说明</p>"
chandao-cli file upload --file ./api.pdf --object-type task --object-id <id>
chandao-cli task update --id <id> --desc '<p>说明：</p><p><a href="...">接口文档</a></p>'
```

### 测试用例

```bash
chandao-cli testcase create --product 1 --title "..." --steps '[{"step":"...","expect":"..."}]'
# 需要截图时单独绑定（步骤字段保持纯文本）
chandao-cli file upload --file ./case.png --object-type testcase --object-id <id>
```

## 6. 校验与限制

| 检查 | 方法 |
| --- | --- |
| 附件是否绑定 | `chandao-cli file get --id <fileID>`（v2 返回 objectType/objectID） |
| 内容是否含 URL | `story get` / `bug get` / `task get` 查看对应字段 |
| 图片能否下载 | `story images --id <id>` 或 `file download --id <fileID>`（走 v1 `/files/{id}`，带 Token） |
| Web 图片 URL 能否直接 curl | 不能：`file read` 需要登录 Cookie，未登录返回 302/登录 HTML |
| 文件是否存在 | 上传命令返回 `id` 即成功；不要用 curl 未登录访问判断 |

已知限制：

- 本实例 `v2 /doc/*` 未实现、v1 无文档创建接口，文档图片/附件需 Web 界面维护。
- 没有删除附件的 REST 接口；不要上传测试垃圾文件。
- 上传大小/扩展名受禅道配置限制，失败时按服务端错误信息调整。
