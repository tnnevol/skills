# 预置 Node 速查

> 事实来源：Node 的完整入参以 `pnpm exec midscene-test nodes` 生成的说明书为准，本文只列高频子集。

## 调用语法

YAML 里两种传参方式：

```yaml
steps:
  # 1. 字符串简写：Node 声明了 stringInputKey 时可用
  - gotoUrl: https://bing.com
  - aiAct: 搜索 Midscene 并进入官网

  # 2. 对象传参：需要多个字段或无参数时
  - setViewportSize:
      width: 1440
      height: 900
  - back: {}
```

某个 Node 是否支持字符串简写，以 Node Spec 为准。

## 核心 AI Node（最常用）

| Node | 字符串简写 | 作用 | 主要参数 |
| --- | --- | --- | --- |
| `aiAct` | `prompt` | 按自然语言意图规划并执行复合操作 | `prompt`（支持参考图）、`options`（如 `deepThink`） |
| `aiAssert` | `prompt` | 验证界面符合预期，不符合则**步骤失败并中断用例** | `prompt`、`message`（自定义失败提示）、`options` |
| `aiWaitFor` | `prompt` | 轮询直到出现指定状态，超时抛异常 | `prompt`、`options`（`timeoutMs`、`checkIntervalMs`） |

```yaml
cases:
  - name: 搜索商品并验证结果
    steps:
      - aiAct: 在搜索框中输入“马克杯”并点击搜索
      - aiWaitFor: 搜索结果列表加载完成
      - aiAssert: 结果列表中至少展示一款马克杯商品
```

## 原子操作与进阶 Node

GUI Agent SDK 的原子方法（`aiTap`、`aiHover`、`aiInput`、`aiKeyboardPress`、`aiScroll`、`aiDragAndDrop` 等）也能直接在 YAML 中调用，但**不建议**：

- 把操作拆成大量微观点击 / 聚焦 / 滚动，YAML 会冗长且界面微调就断；
- 优先用 `aiAct` 表达业务意图（“在搜索框输入马克杯并点击搜索”），让视觉模型规划底层动作。

另外注入全局运行时的能力：

| 类别 | Node |
| --- | --- |
| 数据提取与问答 | `aiQuery`、`aiBoolean` / `aiString` / `aiNumber` / `aiAsk` |
| 环境指引与报告 | `setAIContext`（注入业务规则/弹窗处理指引）、`recordToReport`（写自定义记录或快照） |
| 基础等待与执行 | `wait`（框架级可取消，收 `{ duration, unit }`）、`sleep`（Agent 级）、`javascript`（执行脚本） |

## Web 预置

`gotoUrl`（打开网页）、`setCookies`（设置 Cookie）、`setViewportSize`（视口大小）、`clearCookies` 等。

> ⚠️ `setCookies` **禁止在 YAML 里写真实 Cookie**——它会进持久化运行结果。必须用 `cookiesEnv` / `profile` / `storageStatePath` 三选一。

## 移动端预置

| 平台 | 常用 Node |
| --- | --- |
| Android（`@midscene/android`） | `launch`（启动应用）、`back`、`home`、`runAdbShell` |
| iOS（`@midscene/ios`） | 启动应用、返回桌面等设备操作 |
| HarmonyOS（`@midscene/harmony`） | 对应 HDC 设备操作 |
| 桌面端（`@midscene/computer`） | 系统级键鼠与窗口操作 |

各平台完整清单与参数见 [builtin-nodes 源页](https://midscenejs.com/zh/midscene-test/builtin-nodes)。

## 注册前提

用脚手架创建的项目会按所选平台**显式注册**官方 Node；从零手写 `midscene.config.ts` 时框架**不默认注册任何 Node**，必须手动引入配置（见 [configuration.md](configuration.md)）。自定义业务 Node 见 [extend.md](extend.md)。
