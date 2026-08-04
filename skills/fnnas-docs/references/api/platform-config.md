---
title: 平台配置
source: https://developer.fnnas.com/api/platform-config
---

应用可以读取宿主当前的语言、主题、系统版本和格式配置，用于初始化页面文案、适配浅色或暗黑模式，或让后端根据系统语言和版本返回不同内容。

:::tip

前端页面初始化时，优先调用 JS SDK 的 `getPlatformConfig`。只有后端渲染、后端接口返回内容或后端逻辑需要判断系统语言、版本时，才需要调用后端 API `trim.system.getPlatformConfig`。

:::

前端 JS SDK 和后端 API 的通用请求方式见 [调用方式](./calling.md)。

## API 清单

| 接口 | 类型 | Scope | 系统版本要求 | App 版本要求 |
| --- | --- | --- | --- | --- |
| `getPlatformConfig` | 前端 JS SDK | 无 | `1.2.0401` | `1.34.0` |
| `trim.system.getPlatformConfig` | 后端 API | `trim.system.getPlatformConfig` | `1.2.0401` | `1.34.0` |

## 前端 JS SDK

页面初始化时，可以调用 `getPlatformConfig` 获取当前界面语言、主题、系统版本和时间格式等配置。

方法：

```ts
getPlatformConfig(): Promise<PlatformConfig>
```

示例：

```js
const config = await sdk.getPlatformConfig();

applyLanguage(config.language);
applyTheme(config.theme);
```

返回示例：

```json
{
  "theme": "light",
  "language": "zh-CN",
  "systemLanguage": "zh-CN",
  "systemVersion": "1.2.0301",
  "format": {
    "date": "YYYY-MM-DD",
    "time": "24h"
  }
}
```

返回类型：

```ts
interface PlatformConfig {
  theme: 'dark' | 'light';
  language: string;
  systemLanguage?: string;
  appVersion?: string;
  systemVersion: string;
  format: {
    date?: string;
    time?: string;
  };
}
```

字段说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `theme` | `'dark' \| 'light'` | 当前宿主主题，`dark` 表示暗黑模式，`light` 表示浅色模式 |
| `language` | string | 当前宿主界面语言 |
| `systemLanguage` | string | 当前宿主系统语言，可能为空 |
| `appVersion` | string | 当前宿主 APP 版本，可能为空 |
| `systemVersion` | string | 当前宿主系统版本 |
| `format.date` | string | 当前日期格式，可能为空 |
| `format.time` | string | 当前时间格式，可能为空 |

## 后端 API

应用后端如果需要根据 fnOS 的系统语言或系统版本决定返回内容，可以调用 `trim.system.getPlatformConfig`。

API 方法：

```text
trim.system.getPlatformConfig
```

请求：

```json
{
  "reqId": "1",
  "req": "trim.system.getPlatformConfig",
  "appName": "your-app",
  "data": {}
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `reqId` | string | 否 | 请求 ID，响应会原样返回 |
| `req` | string | 是 | 固定为 `trim.system.getPlatformConfig` |
| `appName` | string | 是 | 当前应用名 |
| `data` | object | 否 | 固定传空对象 |

成功响应：

```json
{
  "reqId": "1785488957867",
  "code": 0,
  "msg": "",
  "data": {
    "systemLanguage": "zh-CN",
    "systemVersion": "1.2.0401"
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `systemLanguage` | string | 当前 fnOS 系统语言，固定式 zh-CN |
| `systemVersion` | string | 当前 fnOS 系统版本 |

调用示例：

```bash
curl --unix-socket /var/run/trim_open_gateway_apiscope.socket \
  -X POST http://localhost/api/v1/trimapp \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"reqId":"1","req":"trim.system.getPlatformConfig","appName":"your-app","data":{}}'
```

## 本页要点

- 使用本接口前，在 `config/resource` 中声明 `trim.system.getPlatformConfig`。
- 前端页面初始化时，优先用 `getPlatformConfig` 读取语言、主题、系统版本和格式配置。
- 后端 `trim.system.getPlatformConfig` 只返回系统语言和系统版本。
- 后端 API 只能由应用服务端通过 Unix Socket 调用，不要暴露 token 给前端。
