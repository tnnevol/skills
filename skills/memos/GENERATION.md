# Generation Info

skills/memos 的参考文件以本仓库 `apps/memos-cli` 的真实命令行为准
（经真实实例 v0.31.0 核验，见 `references/pitfalls.md`），不提炼自上游文档仓库。

- **Source:** `apps/memos-cli`（本仓库应用）+ 上游 OpenAPI 单点引用
- **Skill version:** `2.0.0`
- **Synced:** 2026-10-29

## 技能自带文件

- `installation-guide.md`：首次安装引导，随技能一起分发（`pnpx skills add` 只拉 `skills/` 目录，
  因此不能依赖 `apps/` 下的外链）。变更 CLI 安装方式时同步此处。

## 上游引用范围

- 接口事实来源：`github.com/usememos/memos` 各 tag 的 `proto/gen/openapi.yaml`
  （即官网 <https://usememos.com/docs/api/latest> 渲染的同一份文件）。
  官网只维护 `latest`（跟随 main），历史版本只能从对应 tag 取该文件。
- 可用的 spec 产物：

  | tag 范围      | 产物                                        | 格式        |
  | ------------- | ------------------------------------------- | ----------- |
  | v0.25.1 起    | `proto/gen/openapi.yaml`                    | OpenAPI 3   |
  | v0.23.1–v0.25.0 | `proto/gen/apidocs.swagger.yaml`          | Swagger 2.0 |
  | ≤ v0.23.0     | 无生成产物                                  | —           |

- 上游文档站无独立文档仓库可挂 submodule，**不建子模块**，以 tag 内的 spec 直链引用。

## 同步方式

- CLI 行为变化时：改 `apps/memos-cli` → 同步 `references/commands.md` / `pitfalls.md`，
  并更新 `apps/memos-cli/API-COVERAGE.md`。
- 上游发新 tag 时：
  1. 取 `raw.githubusercontent.com/usememos/memos/<tag>/proto/gen/openapi.yaml`；
  2. 对比 `paths` 差异，判断是否需要扩展命令；
  3. 用真实实例跑 `pnpm --filter @tnnevol/memos-cli test`；
  4. 任何文档与服务端冲突记进 `references/pitfalls.md`。

## 版本沿革

- `1.0.2` 及更早：技能自带零依赖 `.cjs` 脚本（`skills/memos/scripts/`），直接拼 HTTP 请求。
- `2.0.0`：脚本拆分为独立 CLI（`apps/memos-cli`，发布为 `@tnnevol/memos-cli`），
  技能只保留 SKILL.md 与 references，按 CLI 命令组织内容。
