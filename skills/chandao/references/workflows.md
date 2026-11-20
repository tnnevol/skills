# 业务 Workflow 集合

所有写操作遵循：**先关联 → 再写 → 写后校验**。涉及附件时严格按 [attachment-workflow.md](attachment-workflow.md) 的“上传 → 回显 → 保存”。

开工前先确认对象链：`product` → `project` → `execution` → `story`，详见 [relations.md](relations.md)。不要用 0 占位。

## 1. 需求（图文）

```bash
# 1) 确认产品
chandao-cli product list --limit 20

# 2) 创建骨架（写全 spec + verify；project/execution 二选一）
chandao-cli story create --product 1 --project 2 \
  --title "支持导出 Excel" --pri 3 \
  --spec "<p>待补充</p>" --verify "<ul><li>待补充</li></ul>"
# 记录 id

# 3) 上传图片并绑定
chandao-cli file upload --file ./mockup.png --object-type story --object-id <id>

# 4) 用返回 url 写 HTML 并更新（spec + verify 都要写）
chandao-cli story update --id <id> \
  --spec '<p><strong>目标</strong></p><p>支持导出 .xlsx。</p><p><img src="/index.php?m=file&f=read&t=png&fileID=NN" alt="导出入口"></p>' \
  --verify '<ul><li>给定有数据列表，导出后 .xlsx 内容与列表一致。</li></ul>'

# 5) 校验（内容 + 关联）
chandao-cli story get --id <id> | jq -r '.data.data.story | {spec,verify,product,project,execution}'
```

要点：`--spec` / `--verify` 必须是 HTML 片段；图片必须来自上传返回的 URL。

## 2. Bug（带截图）

```bash
chandao-cli bug create --product 1 --project 2 --execution 3 --story 12 \
  --title "导出 Excel 失败" --severity 2 --steps "<p>复现步骤见下</p>"
chandao-cli file upload --file ./error.png --object-type bug --object-id <id>
chandao-cli bug update --id <id> --steps '<p><strong>步骤</strong></p><ol><li>打开导出页</li><li>点击导出</li></ol><p><img src="..." alt="错误截图"></p>'
```

修复后立即流转（不要批量拖到最后）：

```bash
chandao-cli bug resolve --id <id> --resolution fixed --resolvedBuild trunk
```

## 3. 任务（附件）

```bash
chandao-cli task create --execution 3 --story 12 --name "接口联调" --desc "<p>按接口文档联调</p>"
chandao-cli file upload --file ./api.pdf --object-type task --object-id <id>
chandao-cli task update --id <id> --desc '<p>按接口文档联调：</p><p><a href="{url}">接口文档</a></p>'
chandao-cli task start --id <id> --left 8
chandao-cli task finish --id <id> --consumed 8 --left 0
```

## 4. 测试用例（纯文本步骤）

```bash
chandao-cli testcase create --product 1 --project 2 --execution 3 --story 12 \
  --title "导出 Excel" \
  --steps '[{"step":"打开导出页","expect":"显示导出按钮"},{"step":"点击导出 Excel","expect":"下载 xlsx 且内容完整"}]'
```

- 步骤/预期只用纯文本；
- 需要截图时单独上传并绑定 `--object-type testcase`，步骤字段仍保持纯文本。

## 5. 文档（HTML，但 API 受限）

- 文档正文同样按 HTML 片段生成；
- 本实例：v1 无创建接口，v2 `/v2/doc/*` 返回空（未实现）；
- 只能读取：

```bash
chandao-cli api GET /v1/doclibs
chandao-cli api GET /v1/docs/<libID>
```

- 创建/更新文档需 Web 界面；不要假装 API 成功。

## 6. 测试单（testtask）

测试单是「项目 + 产品 + 执行 + 构建」四者绑定的测试批次：

```bash
chandao-cli testtask list --product 1
chandao-cli testtask list --project 2
chandao-cli testtask get --id 1
```

创建暂未封装（需要 build ID）：先 `api GET /v1/products/<productID>/builds` 找构建，或直接到 Web 界面创建；参数至少包含 `project/product/execution/build/name/begin/end`。

## 7. 通用内容生成流程（Agent 必读）

1. **确认对象**：产品/项目/执行 ID 是否真实存在（先 list/get）。
2. **确认版本**：需求/用例默认返回最新版本；需要历史内容用 `--spec-version`（仅 v2），更新前先 GET 最新，避免覆盖旧版。
3. **判断是否需要图片/附件**：需要则先走附件上传流程。
4. **生成 HTML 片段**：只用允许标签；文本先转义；图片用上传 URL。
5. **写入**：create 传完整字段；update 只传要改的字段（CLI 会回填）。
6. **校验**：get 后在 `spec`/`steps`/`desc` 中确认存在 `<img src="...fileID=...">`。
7. **不要**：用 Markdown、用本地路径、用 base64、用外链、跳过上传。

## 8. 删除类

```bash
chandao-cli story delete --id 12 --yes
chandao-cli bug delete --id 12 --yes
chandao-cli task delete --id 12 --yes
```

删除前必须向用户确认目标和影响；不要批量删除。
