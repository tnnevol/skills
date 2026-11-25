# chandao-cli · Agent Setup Guide

面向 AI Agent 的接入说明：如何在脚本/自动化里稳定调用禅道。

## 1. 安装

```bash
# 仓库内
pnpm --filter @tnnevol/chandao-cli build
node apps/chandao-cli/dist/cli.js --version

# 或发布后全局安装
pnpm add -g @tnnevol/chandao-cli
```

## 2. 非交互登录（推荐用环境变量）

```bash
export CHANDAO_URL="http://192.168.0.19:8890"
export CHANDAO_ACCOUNT="mizen"
export CHANDAO_PASSWORD="***"

chandao-cli auth login --api-version auto
```

登录会同时探测 v2 与 v1，优先 v2；token 加密写入 `~/.chandao/config.json`，之后无需再带密码。

> 密码只在登录时使用，不落盘。后续 token 失效时重新执行 `auth login` 即可。

## 3. 输出契约

所有命令输出 **单行 JSON**（`--pretty` 可美化）；成功 `exit 0`，失败 `exit 1` 且错误写 stderr：

```json
{ "success": true, "operation": "bug.list", "data": { "version": "v2", "data": { "bugs": [] } } }
```

失败（stderr，退出码 1）：

```json
{ "success": false, "message": "error detail", "httpStatus": 400, "version": "v2" }
```

- `data.version`：实际使用的 API 版本（`v1`/`v2`）
- `data.fallback: true`：auto 模式首选版本不支持该操作，已自动回退
- 业务数据在 `data.data`，结构随版本原样透传

Agent 建议：

```bash
chandao-cli bug list --product 1 --limit 5 | jq -r '.data.data.bugs[] | [.id,.title,.status] | @tsv'
```

## 4. 版本控制

| 场景 | 用法 |
|---|---|
| 默认（推荐） | 不传，`auto`：优先 v2，缺失操作回退 v1 |
| 强制 v2 | `--api-version v2` 或 `auth use v2` |
| 强制 v1 | `--api-version v1` 或 `auth use v1` |
| 查看当前 | `auth status --verify` |

强制版本不支持某操作会直接失败（不会静默换版本），便于确定性测试：

```bash
chandao-cli --api-version v1 execution start --id 1
# exit 1：operation not provided in v1
```

## 4.1 旧版 v1-only 实例

旧版禅道（如 18.x）可能没有可用的 v2 API：v2 路由会返回 PHP Fatal HTML。`auto` 会自动回退 v1；强制 `--api-version v2` 会得到明确错误。

在这类实例上：

- 创建需求的 `pri`/`category`/`branch` 由 CLI 补默认值；
- `bug create` 默认 `type=codeerror`，`testcase create` 默认 `type=feature`/`pri=3`；
- `task create` 必须显式 `--estStarted`（建议同时传 `--deadline`）；
- `story update` 可能返回 400 `error`，改用 `story change --reviewer <账号> --spec ...`；
- 上传返回的 URL 可能是 `http://host/zentao/file-read-<id>.png` 绝对地址，原样嵌入 HTML 即可。

## 5. 命令速查

```text
auth     login | status [--verify] | use <auto|v1|v2> | logout
product  list | get | create | update | delete | list-by-program
project  list | get | create | update | delete | list-by-program
story    list | get | create | update | close | change | activate | delete
task     list | get | create | update | start | pause | restart | finish | close | activate | delete
execution list | get | create | update | start(v2) | suspend(v2) | close(v2) | delete
bug      list | get | create | update | resolve | close | activate | confirm | delete
testcase list | get | create | update | delete
testtask list | get | delete       # 测试单（仅 v1 读）
user     list | get | create | update | delete
file     upload | download | get    # 附件上传/下载
group    list
dept     list | get
api      <METHOD> <PATH>            # 任意接口，path 可带 /v1 或 /v2 前缀
```

常用参数：`--page`、`--limit`、`--order`、`--id`、`--yes`（删除确认）、`--pretty`。

## 6. 关键业务约束

1. **需求/用例描述必须 HTML**：`--spec`/`--verify` 用 HTML，不要 Markdown。
2. **测试用例必须带步骤**：`--steps '[{"step":"...","expect":"..."}]'`（JSON 数组）。
3. **需求必须 spec + verify 都写**：两个字段都是 HTML，缺一个视为内容不完整；创建前先确定 product，v2 建议带 project/execution。
4. **关联优先**：任务要 execution（+story）、Bug/用例要 product（+project/execution/story）；测试单需要 project+product+execution+build。不要用 0 占位。
5. **列表过滤**：`story/bug/testcase list` 需要 `--product` 或 `--project` 或 `--execution`；`task list` 需要 `--execution`。
6. **更新是合并的**：CLI 会先 GET 当前值并回填未提交字段，避免禅道 PUT 重置字段；但只回填已知字段，特殊字段请显式传。
7. **删除必须 `--yes`**。
8. **版本**：需求/用例默认取最新版；历史内容用 `--spec-version <n>`。需求仅 v2 支持；用例 v1/v2 都支持（v1 看 `currentVersion`）。任务/Bug 无内容版本历史。
9. **创建用户**：v1 支持 `--group/--role/--dept/--visions`；v2 只接受 `account/password/realname`，因此 auto 模式下用户创建走 v2 时不会带上角色分组，需要完整字段请加 `--api-version v1`。
10. **图片/附件**：必须先 `file upload` 上传，再把返回的 `url` 回显进 HTML（`<img src>` / `<a href>`）；v2 上传必须绑定 `--object-type` + `--object-id`，新建对象先建骨架再上传再 update。
11. **权限授权（改角色权限）没有 REST API**：只能读 `group list`，写权限需 Web 会话或 DB。

## 7. 典型工作流

```bash
# 1) 登录
chandao-cli auth login

# 2) 找到产品/执行
chandao-cli product list --limit 20
chandao-cli execution list --project 2 --limit 20

# 3) 建需求 → 建任务
chandao-cli story create --product 1 --title "支持导出" --spec "<p>导出 CSV</p>"
chandao-cli task create --execution 4 --name "实现导出" --estimate 8 --assignedTo admin

# 4) 流转任务
chandao-cli task start --id 9 --left 8
chandao-cli task finish --id 9 --consumed 8 --left 0

# 5) 报 Bug 并解决
chandao-cli bug create --product 1 --title "导出乱码" --severity 2 --openedBuild trunk
chandao-cli bug resolve --id 10 --resolution fixed --resolvedBuild trunk
```

## 8. 排错

| 现象 | 处理 |
|---|---|
| `鉴权失败（HTTP 401/403）` | 重新 `auth login`；确认账号有对应模块权限 |
| `操作在当前强制版本 vX 上未提供` | 去掉 `--api-version` 或换成支持的版本 |
| `路由不存在或返回空响应` | 该版本没实现该接口；用 `--api-version` 另一个版本重试 |
| 非交互登录报缺少参数 | 设置 `CHANDAO_URL/ACCOUNT/PASSWORD` 或传 `--password` |
| 解密配置失败 | 重新 `auth login`（私钥丢失/换机器） |
| 想临时用别的 token | `--token <token>` 或 `CHANDAO_TOKEN_V1/CHANDAO_TOKEN_V2` |

## 9. 安全

- token 与私钥加密存储；配置文件 `600`、目录 `700`。
- 不要把 `CHANDAO_PASSWORD` 写进仓库或日志；CI 用 secrets。
- `--token` 会出现在进程参数里，敏感环境优先用环境变量。
