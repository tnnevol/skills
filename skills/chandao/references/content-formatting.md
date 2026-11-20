# 内容格式：HTML 片段与纯文本

禅道的富文本字段不是 Markdown，而是直接保存 **HTML 片段**。写错格式不会报错，但页面会显示 Markdown 符号或纯文本。

## 字段格式对照

| 命令/字段 | 格式 | 说明 |
| --- | --- | --- |
| `story --spec`（需求描述） | HTML 片段 | 支持段落、列表、图片、链接、表格 |
| `story --verify`（验收标准） | HTML 片段 | 同上 |
| `bug --steps`（重现步骤） | HTML 片段 | 可嵌入截图 |
| `task --desc`（任务描述） | HTML 片段 | 可嵌入附件链接 |
| 文档 content | HTML 片段 | 本实例暂无写 API |
| `testcase --steps` | **纯文本 JSON** | 禁止 HTML / Markdown |
| `--title` / `--name` / `--reason` / `--comment` | 纯文本 | 不要放标签 |

## HTML 片段规则

允许：

```html
<p>段落</p>
<br>
<strong>加粗</strong> <em>斜体</em> <u>下划线</u>
<ul><li>无序项</li></ul>
<ol><li>有序项</li></ol>
<h2>小标题</h2>
<table><tr><th>列</th></tr><tr><td>值</td></tr></table>
<img src="/index.php?m=file&f=read&t=png&fileID=123" alt="图1：页面布局">
<a href="/index.php?m=file&f=read&t=pdf&fileID=124">下载附件</a>
<blockquote>引用</blockquote>
<pre><code>代码</code></pre>
```

禁止：

- `<html>`、`<head>`、`<body>`、`<script>`、`<style>`、`<iframe>` 等整页/脚本标签；
- Markdown 语法（`# 标题`、`- 列表`、`**加粗**`、`[文字](链接)`）；
- 外部图片外链、`data:` base64、本地文件路径；
- 未转义的 `<`、`>`、`&`。

## 转义

用户文本拼进 HTML 前必须转义：

| 原始 | 转义 |
| --- | --- |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `&` | `&amp;` |
| `"`（属性内） | `&quot;` |

## 需求模板

需求有两个独立字段，**都要写、都存 HTML**：

- `--spec` 需求描述：讲清「为什么做、为谁做、做什么、怎么走、异常怎么办」；
- `--verify` 验收标准：讲清「满足什么条件才算做完」，要可逐条验证。

### spec 需求描述模板

```html
<p><strong>背景</strong></p>
<p>当前……，存在……问题。</p>
<p><strong>目标</strong></p>
<ul>
  <li>……</li>
  <li>……</li>
</ul>
<p><strong>用户与场景</strong></p>
<ul>
  <li>角色：……；场景：……</li>
</ul>
<p><strong>功能范围</strong></p>
<ol>
  <li>……</li>
  <li>……</li>
</ol>
<p><strong>流程与规则</strong></p>
<p>……</p>
<p><strong>异常与边界</strong></p>
<ul>
  <li>……</li>
</ul>
<p><strong>附件</strong></p>
<p><img src="/index.php?m=file&f=read&t=png&fileID=37" alt="图1：页面布局"></p>
```

### verify 验收标准模板

```html
<p><strong>功能验收</strong></p>
<ul>
  <li>给定……，当……时，则……。</li>
  <li>给定……，当……时，则……。</li>
</ul>
<p><strong>边界与异常</strong></p>
<ul>
  <li>空数据/超长/并发/网络异常时……。</li>
</ul>
<p><strong>权限与兼容</strong></p>
<ul>
  <li>无权限用户不可见/不可操作；主流浏览器与分辨率正常。</li>
</ul>
<p><strong>完成定义</strong></p>
<ul>
  <li>以上全部通过，且相关回归用例通过。</li>
</ul>
```

### 一次创建（两个字段同时写）

```bash
chandao-cli story create --product 1 --project 2 \
  --title "支持导出 Excel" --pri 3 \
  --spec '<p><strong>背景</strong></p><p>当前导出仅支持 CSV。</p><p><strong>目标</strong></p><ul><li>支持导出 .xlsx</li></ul>' \
  --verify '<p><strong>功能验收</strong></p><ul><li>给定有数据的列表，当点击导出时，则下载 .xlsx 且内容与列表一致。</li></ul><p><strong>完成定义</strong></p><ul><li>以上通过并回归通过。</li></ul>'
```

> 不要只写 `--spec` 不写 `--verify`；也不要只在 `--verify` 里重复描述，验收标准应是可判定的条件。

## 示例：Bug 重现步骤

```html
<p><strong>环境</strong>：Chrome 120 / 测试环境</p>
<p><strong>步骤</strong></p>
<ol>
  <li>打开导出页</li>
  <li>点击导出 Excel</li>
</ol>
<p><strong>实际</strong>：下载文件为 0 字节</p>
<p><img src="/index.php?m=file&f=read&t=png&fileID=38" alt="错误截图"></p>
```

```bash
chandao-cli bug create --product 1 --title "导出 Excel 失败" --severity 2 \
  --steps '<p><strong>步骤</strong></p><ol><li>打开导出页</li><li>点击导出</li></ol><p><img src="/index.php?m=file&f=read&t=png&fileID=38"></p>'
```

## 测试用例步骤（纯文本）

`--steps` 接受 JSON 数组，每个元素 `step` / `expect` 都是纯文本：

```bash
chandao-cli testcase create --product 1 --title "导出 Excel" \
  --steps '[{"step":"打开导出页","expect":"显示导出按钮"},{"step":"点击导出 Excel","expect":"下载 xlsx 且内容完整"}]'
```

禁止：

```bash
# ❌ 不要这样
--steps '[{"step":"<p>打开导出页</p>","expect":"<strong>成功</strong>"}]'
--steps '[{"step":"- 打开导出页","expect":"**成功**"}]'
```

## 图片与附件

图片/附件 URL 只能来自附件上传（`chandao-cli file upload`），格式与流程见 [attachment-workflow.md](attachment-workflow.md)。
