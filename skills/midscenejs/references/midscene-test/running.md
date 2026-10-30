# 运行测试与报告

## 基本用法

```bash
pnpm exec midscene-test                    # 跑全部
pnpm exec midscene-test android-smoke ios-regression   # 只跑指定执行项目
pnpm exec midscene-test --config ./midscene.ci.config.ts
pnpm exec midscene-test --reporter verbose  # 每步详细诊断
pnpm exec midscene-test --help              # 全部选项
```

## 产物

每次运行生成两类产物，**路径以终端末尾打印的 `Summary:` 和 `Report:` 为准**：

| 产物 | 默认位置 | 说明 |
| --- | --- | --- |
| 结构化结果 | `.midscene/test-results/<runId>/` | `summary.json`（程序读取）+ `result.md`（人读）；`--result-dir` 可改根目录，仍会建 `<runId>` 子目录 |
| HTML 报告 | `midscene_run/report/` | 由 `output.reportDir` 控制；含用例结果、每步截图、输入输出、报错堆栈、视觉执行回放 |

> `summary.json` 字段结构**可能随版本演进**，外部工具消费时以当前版本实际输出为准，不要写死。

## 退出码

| 码 | 含义 |
| --- | --- |
| `0` | 所有选中用例与生命周期钩子全部成功 |
| `1` | 任何错误：步骤失败、YAML 解析/收集报错、项目级或文件级生命周期报错 |

⚠️ **即使所有用例步骤都通过，只要清理阶段异常，退出码同样是 `1`**。CI 里不要只看用例计数。

## 环境变量注入

| 场景 | 做法 |
| --- | --- |
| 脚手架项目 | `midscene-test create` 生成的项目已在 `midscene.config.ts` 顶部配好 `dotenv`，根目录建 `.env` 即可 |
| 手写配置 | 需在 `midscene.config.ts` 顶部显式 `import 'dotenv/config'` |
| CI/CD | 不建 `.env`，直接把密钥注入流水线环境变量 |

`dotenv` 加载时**Shell 已有同名变量优先**。

> ⚠️ 例外：`midscene-test model verify` 排查模型连接时会主动读当前目录 `.env`，并**用 `.env` 覆盖同名 Shell 变量**。排查时确保 `.env` 与测试实际使用的模型配置一致。

## GitHub Actions

官方 [midscene-action](https://github.com/marketplace/actions/midscene-action)：

- 自动把执行结果汇总到工作流 **Summary** 页
- 把 HTML 报告与结果数据打包为 **Artifacts**
- 可按需发布报告到 **Cloudflare Workers** 生成在线预览链接

```yaml
- uses: web-infra-dev/midscene-action@v1
  env:
    MIDSCENE_MODEL_NAME: ${{ secrets.MIDSCENE_MODEL_NAME }}
    MIDSCENE_MODEL_FAMILY: ${{ secrets.MIDSCENE_MODEL_FAMILY }}
    MIDSCENE_MODEL_BASE_URL: ${{ secrets.MIDSCENE_MODEL_BASE_URL }}
    MIDSCENE_MODEL_API_KEY: ${{ secrets.MIDSCENE_MODEL_API_KEY }}
```

给 Action 步骤设 `id: midscene` 后，可用 `${{ steps.midscene.outputs.<name> }}` 读取：

| 输出 | 用途 |
| --- | --- |
| `test-result` | 测试命令执行状态 |
| `artifact-url` | 已上传 Artifact 的下载页链接 |
| `report-artifact-name` | 已上传 Artifact 名称；未上传时为空 |
| `page-url` | 在线报告链接；发布未成功时为空 |
| `publication-result` | 发布步骤状态：`success` / `failure` / `skipped` / `cancelled` |

发布到 Cloudflare Workers 需先在 Action 配置中启用发布并准备 API Token，费用与配额见 Marketplace 文档。参数细节以官方文档为准。

## 报告归档与深度链接

`--report-dir` 外的归档、URL 深度链接（直接跳到某条用例某一步）见上游 [运行测试](https://midscenejs.com/zh/midscene-test/running) 页。
