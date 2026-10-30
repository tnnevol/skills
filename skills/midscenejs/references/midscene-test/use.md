# 创建 Midscene Test 项目

以 Web 为例；移动端 / 桌面端只需在创建时选对应平台模板。

## 1. 生成项目并安装依赖

需 Node.js `^20.19.0 || ^22.12.0 || >=24.0.0` 与 pnpm：

```bash
pnpm dlx @midscene/test create my-tests --platform web --package-manager pnpm
cd my-tests
```

交互式选平台可直接 `pnpm dlx @midscene/test create`。

生成的结构：

```text
my-tests/
├── cases/todo.yaml             # TodoMVC 示例用例
├── nodes/todo.ts               # 自定义 Node：初始化、校验、状态采集
├── midscene.config.ts          # 平台配置与 Node 注册
├── midscene-node-spec.web.md   # 安装依赖后自动生成的 Node 说明书
├── package.json
├── tsconfig.json
├── .env.example
└── README.md / README.zh.md
```

这一步只生成文件与说明书，**不运行测试**，所以还不需要模型 Key、浏览器或设备。

## 2. 配置模型与运行环境

```bash
cp .env.example .env                    # 填模型名、服务地址、API Key
pnpm exec midscene-test model verify    # 先验证连通性
```

`model verify` 会**优先读当前目录 `.env`**（覆盖同名 Shell 变量），且不需要浏览器或设备。

Web 还要装浏览器：

```bash
pnpm exec playwright install chromium
```

非 Web 平台的运行前准备：

| 平台 | `--platform` | 运行前准备 |
| --- | --- | --- |
| Android | `android` | 连设备，`ANDROID_DEVICE_ID` 可指定 |
| iOS | `ios` | 起 WebDriverAgent；本地直连配 `WDA_HOST` / `WDA_PORT`，网关转发配 `WDA_BASE_URL`，视频流用 `WDA_MJPEG_PORT` / `WDA_MJPEG_URL` |
| HarmonyOS | `harmony` | `hdc list targets` 检查连接，`HARMONY_DEVICE_ID` 可指定；HDC 不在 PATH 时设 `HDC_HOME` |
| 桌面 | `computer` | macOS 需辅助功能权限 |

## 3. 运行并看结果

```bash
pnpm exec midscene-test
```

报告路径以终端末尾打印的 `Summary:` / `Report:` 为准，详见 [running.md](running.md)。

## 改第一条用例

打开 `cases/todo.yaml`，把示例里的操作与断言换成自己的业务文本：

```yaml
cases:
  - name: 搜索商品
    steps:
      - aiAct: 在搜索框输入“马克杯”，点击搜索按钮
      - aiAssert: 搜索结果中包含马克杯
```

写用例的约定（线性执行、步骤无状态、不能用“上一步”指代）见 [writing.md](writing.md)；可用 Node 见 [builtin-nodes.md](builtin-nodes.md)。

## 创建命令参考

| 参数 | 说明 |
| --- | --- |
| `[directory]` | 项目目录，相对或绝对路径（`.` 为当前目录）；省略则交互询问，已存在文件不覆盖 |
| `--platform <value>` | `web`(Playwright) / `android` / `ios` / `harmony` / `computer`；省略则交互选择 |
| `--package-manager <value>` | `npm` 或 `pnpm`；非交互环境自动探测调用方包管理器，识别不出则用 `npm` |
| `--yes` / `-y` | 跳过交互并自动装依赖；须同时给目录和 `--platform`；与 `--skip-install` 同传则只生成文件 |
| `--skip-install` | 只生成文件，跳过装依赖与说明书生成（后续手动装依赖会自动生成） |
| `--help` / `-h` | 帮助 |

```bash
# CI 非交互：必须显式给目录和 --platform
pnpm dlx @midscene/test create my-ios-tests --platform ios --package-manager pnpm --yes

# 只生成 Web 文件，暂不装依赖
pnpm dlx @midscene/test create my-web-tests --platform web --skip-install
```
