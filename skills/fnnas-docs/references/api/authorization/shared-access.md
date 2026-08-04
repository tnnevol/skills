---
title: 应用共享授权路径
source: https://developer.fnnas.com/api/authorization/shared-access
---

如果你的应用只需要访问一批固定目录，并且不需要按使用用户区分内容，可以让管理员为应用授权目录。授权完成后，应用后端可以查询这些目录，并基于这些目录提供服务。

![](https://static.fnnas.com/images/20260730181611204.png)

没有接入授权接口时，管理员需要进入应用设置手动添加授权目录。接入后，应用可以在自己的页面中调用 `pickSharedFile` 打开目录选择框，让管理员直接完成目录授权。

:::warning

应用共享授权由管理员操作。普通用户调用 `pickSharedFile` 或 `authorizeSharedFile` 会失败：宿主内直调通常返回 `code: 1` 和 `msg: "仅管理员可进行此操作"`；授权跳转回调通常返回 `status: "error"` 和 `error: "access_denied"`。

:::

:::note

该能力只支持目录授权。如果需要让当前用户选择或授权某个文件，请使用 [用户个人授权路径](./user-access.md)。

:::

## API 清单

前端 JS SDK 和后端 API 的通用请求方式见 [调用方式](../calling.md)。

| 接口 | 类型 | Scope | 系统版本要求 | App 版本要求 |
| --- | --- | --- | --- | --- |
| `pickSharedFile` | 前端 JS SDK | `trim.file.sharedAccess` | `1.2.0401` | `1.34.0` |
| `authorizeSharedFile` | 前端 JS SDK | `trim.file.sharedAccess` | `1.2.0401` | `1.34.0` |
| `trim.file.getSharedAccessibleFolders` | 后端 API | `trim.file.sharedAccess` | `1.2.0401` | `1.34.0` |
| `trim.file.delSharedAccessibleFolder` | 后端 API | `trim.file.sharedAccess` | `1.2.0401` | `1.34.0` |

## 向管理员申请授权

在应用页面中调用 `pickSharedFile`，可以打开目录选择器，让管理员选择要授权给应用的目录。

![](https://static.fnnas.com/images/20260730154807801.png)

接口类型：前端 JS SDK

```ts
pickSharedFile(
  params?: SharedFilePickerParams,
): Promise<AppBridgeResponse<string[]> | undefined>
```

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `params` | `SharedFilePickerParams` | 否 | 目录选择器参数 |

响应参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `code` | number | 业务码，`0` 表示成功 |
| `msg` | string | 错误消息或状态消息 |
| `data` | string[] | 管理员授权给当前应用的目录路径 |

示例：

```js
const result = await sdk.pickSharedFile({
  title: '选择授权目录',
  okText: '确认授权',
  sidebarGroup: ['myFiles', 'otherShare', 'favorites'],
});

if (result?.data?.length) {
  await refreshSharedAccessibleFolders();
}
```

如果 `sdk.isStandaloneWeb` 为 `true`，可以使用 `openAppAuth` 打开授权页面：

```js
const authState = createAuthState();

if (sdk.isStandaloneWeb) {
  await sdk.openAppAuth('pickSharedFile', {
    appName: 'your-app',
    sidebarGroup: ['myFiles', 'otherShare', 'favorites'],
    redirectUri: '/app/your-app/callback.html',
    state: authState,
  }, {
    target: '_blank',
    features: 'width=750,height=630',
  });
}
```

授权完成后，应用后端调用 `trim.file.getSharedAccessibleFolders` 查询当前应用可访问的目录。

如果当前用户不是管理员，宿主内直调会失败：

```json
{
  "code": 1,
  "msg": "仅管理员可进行此操作",
  "data": []
}
```

授权跳转回调会返回：

```json
{
  "status": "error",
  "error": "access_denied",
  "method": "pickSharedFile",
  "appName": "your-app",
  "state": "your-business-state"
}
```

## 按已知目录重新申请授权

如果应用已经知道要访问哪个目录，但该目录尚未授权，或授权被移除，可以调用 `authorizeSharedFile` 让管理员重新确认。

![](https://static.fnnas.com/images/20260730165705652.png)

接口类型：前端 JS SDK

```ts
authorizeSharedFile(path: string): Promise<AppBridgeResponse<string[]> | undefined>
```

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `path` | string | 是 | 要申请授权的目录路径 |

响应参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `code` | number | 业务码，`0` 表示成功 |
| `msg` | string | 错误消息或状态消息 |
| `data` | string[] | 管理员授权给当前应用的目录路径 |

示例：

```js
const result = await sdk.authorizeSharedFile('/vol1/1000/data/shared');

if (result?.data?.length) {
  await refreshSharedAccessibleFolders();
}
```

如果 `sdk.isStandaloneWeb` 为 `true`，可以使用 `openAppAuth` 打开授权页面：

```js
const authState = createAuthState();

if (sdk.isStandaloneWeb) {
  await sdk.openAppAuth('authorizeSharedFile', {
    appName: 'your-app',
    path: '/vol1/1000/data/shared',
    redirectUri: '/app/your-app/callback.html',
    state: authState,
  }, {
    target: '_blank',
    features: 'width=750,height=630',
  });
}
```

如果使用 `openAppAuth`，需要在 `redirectUri` 对应页面处理授权回调，通用写法见 [处理授权回调](../calling.md#处理授权回调)。

如果当前用户不是管理员，宿主内直调会失败：

```json
{
  "code": 1,
  "msg": "仅管理员可进行此操作",
  "data": []
}
```

授权跳转回调会返回：

```json
{
  "status": "error",
  "error": "access_denied",
  "method": "authorizeSharedFile",
  "appName": "your-app",
  "state": "your-business-state"
}
```

## 查询共享授权路径

接口类型：后端 API

```text
trim.file.getSharedAccessibleFolders
```

请求：

```json
{
  "reqId": "string",
  "req": "trim.file.getSharedAccessibleFolders",
  "appName": "string",
  "data": {}
}
```

请求字段：无。应用名通过顶层 `appName` 传入，见 [调用方式](../calling.md#后端-api)。

成功响应：

```json
{
  "reqId": "string",
  "code": 0,
  "msg": "",
  "data": {
    "paths": [
      "/vol1/1000/data"
    ]
  }
}
```

## 删除共享授权路径

接口类型：后端 API

```text
trim.file.delSharedAccessibleFolder
```

请求：

```json
{
  "reqId": "string",
  "req": "trim.file.delSharedAccessibleFolder",
  "appName": "string",
  "data": {
    "path": "/vol1/1000/data"
  }
}
```

请求字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `path` | string | 是 | 要删除的应用共享目录授权路径 |

成功响应：

```json
{
  "reqId": "string",
  "code": 0,
  "msg": "",
  "data": {
    "suc": true
  }
}
```

## JS SDK 类型定义

```ts
interface SharedFilePickerParams {
  title?: string;
  okText?: string;
  sidebarGroup?: SidebarGroup[];
  creatable?: boolean;
  disabledPaths?: string[];
}

type SidebarGroup =
  | 'myFiles'
  | 'otherShare'
  | 'external'
  | 'remote'
  | 'favorites'
  | 'team';

type AppBridgeResponse<T> = {
  code: number;
  msg: string;
  data: T;
};
```

`SharedFilePickerParams` 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | string | 选择器标题 |
| `okText` | string | 确认按钮文案 |
| `sidebarGroup` | SidebarGroup[] | 控制选择器左侧可见分组和展示顺序，例如 `['myFiles', 'otherShare', 'favorites']` |
| `creatable` | boolean | 宿主支持时，是否允许在选择器中创建文件夹 |
| `disabledPaths` | string[] | 不允许选择的路径 |

`SidebarGroup` 枚举：

| 值 | 含义 |
| --- | --- |
| `myFiles` | 我的文件 |
| `otherShare` | 他人共享 |
| `external` | 外接存储 |
| `remote` | 远程挂载 |
| `favorites` | 我的收藏 |
| `team` | 团队空间 |

`AppBridgeResponse` 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `code` | number | 业务码，`0` 表示成功 |
| `msg` | string | 错误消息或状态消息 |
| `data` | T | 具体方法返回的数据 |

## 本页要点

- 应用共享授权由管理员操作，普通用户调用会失败。
- 该能力只支持目录授权，不支持文件授权。
- 宿主内直调失败时可能返回 `code: 1` 和 `msg: "仅管理员可进行此操作"`。
- 授权跳转失败时可能返回 `status: "error"` 和 `error: "access_denied"`。
- 后端用 `trim.file.getSharedAccessibleFolders` 查询管理员授权给应用的目录。

---
