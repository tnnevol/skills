---
title: 调用方式
source: https://developer.fnnas.com/api/calling
---

应用接入开放能力时，会用到两类接口：

- 前端 JS SDK：在应用页面中调用，用于打开授权页面、文件管理器、应用设置，也可以读取平台配置、监听主题和语言变化。
- 后端 API：在应用服务端调用，用于查询授权路径、检查文件权限或读取平台配置。

先完成本页的基础配置，再按要接入的功能调用对应接口。

## API Scope 定义

应用调用开放能力前，需要在应用包中声明会用到的 Scope。系统会根据这里的声明判断应用是否可以申请或调用对应能力。

常用权限声明与接口 Scope 对应关系如下：

| 能力 | 需要声明的 Scope | 说明 |
| --- | --- | --- |
| 应用共享授权管理 | `trim.file.sharedAccess` | 让管理员为应用授权目录，并查询或删除这些授权目录 |
| 用户授权管理 | `trim.file.userAccess` | 让当前用户选择并授权自己的目录或文件，并查询或删除授权结果 |
| 文件权限检查 | `trim.file.userAcl` | 检查某个用户对指定路径是否可读、可写或可删除 |
| 路径转换 | `trim.file.path` | 把 `/vol1/...` 这类内部路径转换成适合展示给用户看的路径 |
| 平台配置读取 | `trim.system.getPlatformConfig` | 在后端读取系统语言和系统版本 |

:::warning

只声明应用确实会用到的 Scope，不要无脑写满所有 Scope。声明 Scope 只是接入前提，实际可访问的目录或文件仍然取决于用户授权、管理员设置和 token 校验。

:::

在应用包的 `config/resource` 中声明：

```json
{
  "api-scope": [
    "trim.file.userAccess",
    "trim.file.userAcl",
  ]
}
```

## 前端 JS SDK

前端 JS SDK 运行在应用页面里。需要用户操作的能力，例如选择文件、授权目录、打开文件详情，优先使用 JS SDK。

:::warning

如果应用需要调用 JS SDK，必须在 `manifest` 中声明：

```ini
micro_app=true
```

未声明 `micro_app=true` 时，应用页面不会按微应用环境加载，JS SDK 相关能力可能无法初始化。

:::

SDK 包地址：[https://www.npmjs.com/package/@trimjs/web-app](https://www.npmjs.com/package/@trimjs/web-app)

安装：

```bash
npm install @trimjs/web-app
```

示例：

```js
import { TrimApp } from '@trimjs/web-app';

const sdk = new TrimApp();
const config = await sdk.getPlatformConfig();
```

每个方法的参数和返回值见对应功能页。


### 区分运行环境

有些方法依赖宿主注入能力。调用前可以用下面两个属性判断当前页面的运行环境：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `isWeb` | boolean | 当前运行时是否为 Web 环境。移动端 App 内嵌页面通常为 `false` |
| `isStandaloneWeb` | boolean | 当前页面是否是独立浏览器页面。如果为 `true`，页面没有运行在宿主环境中 |

文件选择和授权能力需要用户参与，按 `isStandaloneWeb` 选择入口：

- `isStandaloneWeb` 为 `false`：页面运行在宿主环境中，直接调用 `pickSharedFile`、`pickUserFile` 等方法。
- `isStandaloneWeb` 为 `true`：页面运行在独立浏览器中，调用 `openAppAuth` 打开授权页面，并通过 `redirectUri` 接收结果。

:::tip

跳转授权建议结合统一网关使用。统一网关可以保证应用页面、授权页面和 `redirectUri` 回调页处在同一域名下，便于回调页解析结果、通知原应用页面，并完成 `postMessage` 的同源校验。

:::

读取平台配置、设置标题等普通页面能力不需要走授权入口。

:::warning

如果要监听主题或语言变化，`$on` 只支持 Web 宿主环境，也就是 `sdk.isWeb === true` 且 `sdk.isStandaloneWeb === false`。移动端 App 内嵌页面和独立浏览器页面不支持 `$on`。

:::

`createAuthState()` 表示应用自己生成并保存的业务 `state`，回调页需要用它确认授权结果来自本次请求。

![](https://static.fnnas.com/images/20260730154807801.png)
![](https://static.fnnas.com/images/20260730165138220.png)

```js
const authState = createAuthState();

if (sdk.isStandaloneWeb) {
  await sdk.openAppAuth('pickUserFile', {
    appName: 'your-app',
    directory: true,
    redirectUri: '/app/your-app/callback.html',
    state: authState,
  }, {
    target: '_blank',
    features: 'width=750,height=630',
  });
} else {
  await sdk.pickUserFile({
    directory: true,
  });
}
```

### 处理授权回调

使用 `openAppAuth` 时，建议默认用 `target: '_blank'` 打开系统授权页面。这样授权过程不会打断原应用页面，授权完成后，系统会跳转到调用时传入的 `redirectUri`，并把授权结果带回这个回调页。

为了让回调更稳定，建议通过统一网关访问应用，并把 `redirectUri` 设置为同域路径，例如 `/app/your-app/callback.html`。这样原应用页面和回调页是同源页面，回调页才能安全地用 `window.opener.postMessage` 通知原页面。

回调页需要完成两件事：

1. 用 `parseAppAuthCallback` 解析当前 URL 中的授权结果。
2. 校验 `state` 后，通知原应用页面刷新授权路径，并关闭当前窗口。

回调页示例：

```js
import { TrimApp } from '@trimjs/web-app';

const sdk = new TrimApp();
const result = sdk.parseAppAuthCallback(window.location.href);

// 建议在这里校验 result 中的 state，确认结果来自本次授权请求。

if (window.opener && !window.opener.closed) {
  window.opener.postMessage({
    type: 'your-app:auth-result',
    result,
  }, window.location.origin);
}

window.close();
```

原页面监听回调结果：

```js
window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) {
    return;
  }

  if (event.data?.type !== 'your-app:auth-result') {
    return;
  }

  refreshAccessiblePaths();
});
```

部分浏览器环境不支持稳定的子窗口能力，例如移动端或平板浏览器中，`_blank` 可能被打开为新标签页、新窗口、分屏窗口或宿主自定义页面。此时 `window.opener` 可能不存在，回调页无法通知原页面，`window.close()` 也不一定能关闭当前窗口。

因此，原应用页面建议保留“刷新授权状态”按钮。即使回调页没有通知到原页面，用户回到原页面后也可以手动重新查询授权路径。

```js
document.querySelector('#refresh-auth').addEventListener('click', () => {
  refreshAccessiblePaths();
});
```

如果希望授权完成后一定回到当前页面，也可以使用 `target: '_self'`。这种方式会跳转原应用页面，但回调链路更稳定：

```js
const authState = createAuthState();

if (sdk.isStandaloneWeb) {
  await sdk.openAppAuth('pickUserFile', {
    appName: 'your-app',
    directory: true,
    redirectUri: '/app/your-app/callback.html',
    state: authState,
  }, {
    target: '_self',
  });
}
```

无论使用 `_blank` 还是 `_self`，都应由用户点击按钮触发 `openAppAuth`。如果在页面加载、定时器或异步回调里自动打开授权页，浏览器可能会拦截新窗口。

## 后端 API

后端 API 统一使用 `POST /api/v1/trimapp` 调用，并且需要应用服务端通过 Unix Socket `/var/run/trim_open_gateway_apiscope.socket` 访问这个 HTTP 接口。请求体中的 `req` 决定要调用哪个能力。

:::warning

后端 API 只能由应用服务端通过 Unix Socket 调用。不要在前端浏览器中直接调用后端 API，也不要把 token 暴露给前端。

:::

```http
POST /api/v1/trimapp
Unix Socket: /var/run/trim_open_gateway_apiscope.socket
Content-Type: application/json
Authorization: Bearer <token>
```

调用示例：

```bash
curl --unix-socket /var/run/trim_open_gateway_apiscope.socket \
  -X POST http://localhost/api/v1/trimapp \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"reqId":"1","req":"trim.system.getPlatformConfig","appName":"your-app","data":{}}'
```

### 请求结构

```json
{
  "reqId": "string",
  "req": "trim.system.getPlatformConfig",
  "appName": "string",
  "data": {}
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `reqId` | string | 否 | 请求 ID，响应会原样返回 |
| `req` | string | 是 | 要调用的后端能力标识，例如读取平台配置时写 `trim.system.getPlatformConfig` |
| `appName` | string | 是 | 应用名 |
| `data` | object | 否 | 具体接口参数 |

### 响应结构

常见错误码和处理建议见 [错误码](./error-codes.md)。

```json
{
  "reqId": "string",
  "code": 0,
  "msg": "",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `reqId` | string | 对应请求中的 `reqId` |
| `code` | number | 业务码，`0` 表示成功 |
| `msg` | string | 错误消息或状态消息 |
| `data` | any | 具体接口响应数据 |

后端读取 fnOS 系统语言和系统版本的接口见 [平台配置](./platform-config.md)。

### 接口调用认证

所有后端 API 都需要传入有效 token。

token 由系统在调用应用脚本时自动注入，例如启动 `cmd/main` 等后端脚本时，系统会把当前可用 token 写入环境变量 `TRIM_API_TOKEN`。应用不需要自己申请或生成 token。

后端进程从环境变量 `TRIM_API_TOKEN` 读取该 token，并放到 `Authorization` 请求头中：

```js
const token = process.env.TRIM_API_TOKEN;
```

:::warning

`TRIM_API_TOKEN` 可能会在应用重新注册、重新安装或运行环境变化后更新。应用每次调用时都应从当前进程环境变量读取，不要把它持久化到数据库、文件或应用配置中，也不要写进前端代码或静态文件。

:::

接口调用认证通过 `Authorization: Bearer <token>` 完成。请求体中不需要额外传入认证字段。

应用调用后端 API 时，应使用系统为当前应用签发的 token：

```http
Authorization: Bearer <token>
```

完整示例：

```js
const token = process.env.TRIM_API_TOKEN;

const result = await request({
  socketPath: '/var/run/trim_open_gateway_apiscope.socket',
  path: '/api/v1/trimapp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: {
    reqId: String(Date.now()),
    req: 'trim.system.getPlatformConfig',
    appName: 'your-app',
    data: {},
  },
});
```

## 本页要点

- 应用包只声明实际需要的 `api-scope`，不要无脑写满。
- 调用 JS SDK 前，`manifest` 需要声明 `micro_app=true`。
- `isStandaloneWeb` 为 `true` 时，文件选择和授权类能力走 `openAppAuth` 跳转授权。
- 跳转授权建议结合统一网关使用，保证应用页面和回调页同域。
- 后端 API 的具体 `req` 和 `data` 见对应功能页；读取平台配置见 [平台配置](./platform-config.md)。
- 后端 API 使用系统调用应用脚本时注入的 `TRIM_API_TOKEN`，每次调用时从环境变量读取，不要持久化或暴露给前端。

---
