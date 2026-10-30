# 生命周期与并发

## 生命周期层级

三个层级按 `setup → fileSetup → beforeAll → 用例` 顺序执行，未配置的自动跳过：

| 配置项 | 声明位置 | 执行次数 | 用途 |
| --- | --- | --- | --- |
| `setup` | `midscene.config.ts` | 每个执行项目一次 | 项目级共享资源（如共享 Browser 进程） |
| `fileSetup` | `midscene.config.ts` | 每个 YAML 文件一次 | 创建**文件独占**的页面与 Agent，返回供 Node 使用的 `context` |
| `beforeAll` | YAML 文件 | 每文件所有用例开始前一次 | 用已就绪的 `context` 登录、准备本文件共用数据 |

一个项目含两份 YAML 时：`setup` 执行 1 次，`fileSetup` 与 `beforeAll` 各 2 次——**开启并发不改变执行次数**。

`fileSetup` 只需在项目配置声明一次就作用于该项目所有文件；`beforeAll` 由各文件按需声明。若**没有** `fileSetup`，同项目所有文件会共用 `setup` 返回的**同一个 `context` 对象**。

## YAML 钩子

四个钩子与 `cases` 同级，内部步骤写法与 `steps` 相同：

| 钩子 | 时机 | 典型用途 |
| --- | --- | --- |
| `beforeAll` | 本文件所有用例前一次 | 准备文件级共用数据 |
| `beforeEach` | 每条用例每次执行前（**含重试**） | 打开起始页、重置界面/业务状态 |
| `afterEach` | 每条用例每次执行后（**无论成败或重试**） | 清理当次产生数据 |
| `afterAll` | 本文件所有用例后一次 | 清理文件级共用数据 |

```yaml title="cases/search.yaml"
beforeAll:
  - data.prepare: 准备马克杯和水壶两种测试商品   # 团队自定义 Node

beforeEach:
  - gotoUrl: https://your-shop.example
  - clearCookies: {}

cases:
  - name: 搜索马克杯
    steps:
      - aiAct: 搜索马克杯
      - aiAssert: 搜索结果中包含马克杯

afterEach:
  - data.cleanup: 清理本次创建的测试商品
```

`context` 共享范围：`setup` 返回的 `context` 是项目级；配了 `fileSetup` 后每文件有独立 `context`。

## 并发：两个维度，各自独立

> ⚠️ **旧配置 `test.maxConcurrency` 已移除**，加载含该字段的配置会**直接报错**并提示迁移。它原先控制的是项目级并发，**不能**直接改名成 `maxConcurrentFiles`。

| 配置项 | 含义 | 默认 |
| --- | --- | --- |
| `test.maxConcurrentFiles` | 全局同时活动的 YAML 文件上限 | `1` |
| `test.maxConcurrentProjects` | 全局同时活动（从 `setup` 到清理完毕）的执行项目上限 | `1` |
| `projects[].maxConcurrentFiles` | 单个项目的文件并发上限，且不得超过全局值 | 沿用全局 |
| `projects[].fileSetup` | 为每文件建独立环境；**项目有效文件并发 > 1 时必须配置**（哪怕只匹配到一份文件） | — |

两者互不推导，`null` 表示不限制，数字须正整数。

| 配置 | 实际调度 |
| --- | --- |
| 省略 | 项目串行、项目内文件串行 |
| `{ maxConcurrentFiles: 4 }` | 1 个项目，项目内最多 4 份文件并发 |
| `{ maxConcurrentProjects: 2 }` | 全局仍只跑 1 份文件，但可同时保持 2 个项目环境已初始化 |
| 两者都 `null` | 不设全局上限，只受各项目自身与机器资源约束 |

调度要点：

- 是**单 Node.js 进程内的异步并发**，不创建独立进程；模块全局变量、外部账号、测试数据仍需自行隔离。
- 调高 `maxConcurrentProjects` **不会**提升文件并发数。
- 并发越高不等于越快：要同时考虑内存、浏览器实例开销、真机数量、大模型 QPM/TPM 限流。
- 文件名额：从 `fileSetup`（含等设备）起，历经用例执行与重试，到文件级清理彻底完成才释放。
- 项目名额：最后一份文件清理完并执行完项目级清理后才释放。

### 从旧版迁移

想保留旧 `maxConcurrency: 2`（两个项目并发、项目内文件串行）的行为：

```ts
test: {
  maxConcurrentProjects: 2,
  maxConcurrentFiles: 2,
},
// 同时把各 projects[].maxConcurrentFiles 设为 1
```

## 超时

| 配置项 | 控制范围 | 默认 |
| --- | --- | --- |
| `test.testTimeout` | 单步骤执行（可被步骤内 `$.timeout` 覆盖） | `120000` ms |
| `test.setupTimeout` | 单次 `setup` / `fileSetup`（含等设备分配） | `120000` ms |
| `test.teardownTimeout` | 单个清理范围（含清理钩子、等超时操作退出、`onTeardown()` 回调） | `30000` ms |

即使不开并发，这些限制依然生效。整次运行被取消或触发 `bail` 后，**剩余所有清理范围共用一个基于 `teardownTimeout` 的收尾时限**。

## 取消与清理

步骤超时或 CLI 收到 `SIGINT`/`SIGTERM` 时，框架触发当前步骤的 `signal`（`AbortSignal`）。JS 异步操作不会自动终止，**自定义 Node 必须把 `signal` 透传给支持取消的底层 API**，或在循环里主动检查取消状态。

中断后仍尽力清理：

- `afterEach` / `afterAll` 的 Node 收到**未取消的独立清理 `signal`**（仍受步骤超时约束），并会等同一 Agent 上未退出的旧操作结束再执行，避免并发冲突。
- `onTeardown()` 注册的回调**不接收 `signal`**；不要在其中复用原步骤的 `signal`（那时它可能已取消）。
- 超时只限制「框架等待结果的时长」。若底层操作仍没退出，报告记 `cleanup pending` 并继续跟踪，直到真正结束才释放，同时**停止启动新的测试文件**。
