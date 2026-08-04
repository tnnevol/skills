---
title: 用户个人授权路径
source: https://developer.fnnas.com/api/authorization/user-access
---

如果你的应用要按使用用户提供不同内容，可以让当前用户在应用内选择并授权自己的目录或文件。目录授权完成后，应用后端可以按用户查询授权目录；文件授权会直接返回已授权的文件路径。

:::tip

用户个人授权路径建议结合统一网关使用。应用通过统一网关识别当前使用用户，再用该用户的 `uid` 查询或管理目录授权路径；文件授权结果以选择器返回的文件路径为准。

:::

如果应用只需要访问管理员配置的一批固定目录，请使用 [应用共享授权路径](./shared-access.md)。

## API 清单

前端 JS SDK 和后端 API 的通用请求方式见 [调用方式](../calling.md)。

| 接口 | 类型 | Scope | 系统版本要求 | App 版本要求 |
| --- | --- | --- | --- | --- |
| `pickUserFile` | 前端 JS SDK | `trim.file.userAccess` | `1.2.0401` | `1.34.0` |
| `authorizeUserFile` | 前端 JS SDK | `trim.file.userAccess` | `1.2.0401` | `1.34.0` |
| `trim.file.getUserAccessibleFolders` | 后端 API | `trim.file.userAccess` | `1.2.0401` | `1.34.0` |
| `trim.file.delUserAccessibleFolder` | 后端 API | `trim.file.userAccess` | `1.2.0401` | `1.34.0` |

## 向当前用户申请目录授权

当应用需要读取当前用户某个目录下的内容时，调用 `pickUserFile` 并设置 `directory: true`。用户选择目录后，系统会自动把该目录授权给当前应用。

![](https://static.fnnas.com/images/20260730165830385.png)

:::note

目录授权只支持单选。即使传入 `multiple`，也会按单个目录选择处理。

:::

接口类型：前端 JS SDK

```ts
pickUserFile(params?: FilePickerParams): Promise<AppBridgeResponse<string[]> | undefined>
```

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `params` | `FilePickerParams` | 否 | 文件选择器参数。申请目录授权时设置 `directory: true` |

响应参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `code` | number | 业务码，`0` 表示成功 |
| `msg` | string | 错误消息或状态消息 |
| `data` | string[] | 当前用户授权给应用的目录路径 |

示例：

```js
const result = await sdk.pickUserFile({
  directory: true,
  title: '选择授权目录',
  okText: '确认授权',
  sidebarGroup: ['myFiles', 'otherShare', 'favorites'],
});

if (result?.data?.length) {
  useAuthorizedFolders(result.data);
  await refreshUserAccessibleFolders();
}
```

如果 `sdk.isStandaloneWeb` 为 `true`，可以使用 `openAppAuth` 打开授权页面：

```js
const authState = createAuthState();

if (sdk.isStandaloneWeb) {
  await sdk.openAppAuth('pickUserFile', {
    appName: 'your-app',
    directory: true,
    sidebarGroup: ['myFiles', 'otherShare', 'favorites'],
    redirectUri: '/app/your-app/callback.html',
    state: authState,
  }, {
    target: '_blank',
    features: 'width=750,height=630',
  });
}
```

目录授权完成后，本次选择器调用会直接返回已授权目录。应用后端也可以调用 `trim.file.getUserAccessibleFolders` 查询当前用户授权给应用的目录路径。

## 向当前用户申请文件授权

当应用只需要读取当前用户明确选择的文件时，调用 `pickUserFile` 并设置 `directory: false`。用户选择文件后，系统会自动把这些文件授权给当前应用。

![](https://static.fnnas.com/images/20260730170037000.png)

接口类型：前端 JS SDK

申请文件授权时，可以通过 `accept` 限制可选择的文件扩展名。响应中的 `data` 是用户授权给应用的文件路径。

示例：

```js
const result = await sdk.pickUserFile({
  directory: false,
  title: '选择授权文件',
  okText: '确认授权',
  sidebarGroup: ['myFiles', 'otherShare', 'favorites'],
});

if (result?.data?.length) {
  useAuthorizedFiles(result.data);
}
```

限制文件扩展名：

```js
const result = await sdk.pickUserFile({
  directory: false,
  accept: ['.jpeg', '.png'],
  sidebarGroup: ['myFiles'],
});
```

如果 `sdk.isStandaloneWeb` 为 `true`，也可以使用 `openAppAuth` 打开授权页面：

```js
const authState = createAuthState();

if (sdk.isStandaloneWeb) {
  await sdk.openAppAuth('pickUserFile', {
    appName: 'your-app',
    directory: false,
    accept: ['.jpeg', '.png'],
    sidebarGroup: ['myFiles'],
    redirectUri: '/app/your-app/callback.html',
    state: authState,
  }, {
    target: '_blank',
    features: 'width=750,height=630',
  });
}
```

:::warning

文件授权不会写入可通过 `trim.file.getUserAccessibleFolders` 查询的目录列表。调用成功后，直接使用 `pickUserFile` 或授权回调返回的文件路径。

:::

## 按已知路径重新申请授权

如果应用已经知道要访问哪个用户目录或文件，但当前用户尚未授权，或授权已被移除，可以调用 `authorizeUserFile` 让用户重新确认。

![](https://static.fnnas.com/images/20260730170118534.png)

接口类型：前端 JS SDK

```ts
authorizeUserFile(path: string): Promise<AppBridgeResponse<string[]> | undefined>
```

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `path` | string | 是 | 要申请授权的用户目录或文件路径 |

响应参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `code` | number | 业务码，`0` 表示成功 |
| `msg` | string | 错误消息或状态消息 |
| `data` | string[] | 当前用户授权给应用的路径 |

示例：

```js
const result = await sdk.authorizeUserFile('/vol1/home/user/photos');

if (result?.data?.length) {
  useAuthorizedPaths(result.data);
}
```

如果 `sdk.isStandaloneWeb` 为 `true`，可以使用 `openAppAuth` 打开授权页面：

```js
const authState = createAuthState();

if (sdk.isStandaloneWeb) {
  await sdk.openAppAuth('authorizeUserFile', {
    appName: 'your-app',
    path: '/vol1/home/user/photos',
    redirectUri: '/app/your-app/callback.html',
    state: authState,
  }, {
    target: '_blank',
    features: 'width=750,height=630',
  });
}
```

如果使用 `openAppAuth`，需要在 `redirectUri` 对应页面处理授权回调，通用写法见 [处理授权回调](../calling.md#处理授权回调)。

如果重新申请的是文件路径，调用成功后直接使用返回的文件路径。如果重新申请的是目录路径，后续也可以通过 `trim.file.getUserAccessibleFolders` 同步目录授权列表。

## 查询当前用户的已授权目录

接口类型：后端 API

调用该接口前，应用应先通过统一网关确认当前使用用户，并使用该用户的 `uid` 作为查询条件。

:::warning

该接口只返回当前用户授权给应用的目录路径，不返回文件授权结果。

:::

```text
trim.file.getUserAccessibleFolders
```

请求：

```json
{
  "reqId": "string",
  "req": "trim.file.getUserAccessibleFolders",
  "appName": "string",
  "data": {
    "uid": 1000
  }
}
```

请求字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `uid` | number | 是 | 用户 UID |

成功响应：

```json
{
  "reqId": "string",
  "code": 0,
  "msg": "",
  "data": {
    "paths": [
      "/vol1/home/user"
    ]
  }
}
```

## 删除用户授权目录

接口类型：后端 API

```text
trim.file.delUserAccessibleFolder
```

请求：

```json
{
  "reqId": "string",
  "req": "trim.file.delUserAccessibleFolder",
  "appName": "string",
  "data": {
    "uid": 1000,
    "path": "/vol1/home/user"
  }
}
```

请求字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `uid` | number | 是 | 用户 UID |
| `path` | string | 是 | 要删除的用户授权目录路径 |

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
interface FilePickerParams {
  multiple?: boolean;
  directory?: boolean;
  accept?: string[];
  sidebarGroup?: SidebarGroup[];
  title?: string;
  okText?: string;
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

`FilePickerParams` 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `multiple` | boolean | 是否允许多选文件 |
| `directory` | boolean | 是否选择目录 |
| `accept` | string[] | 支持的文件扩展名，例如 `.png` |
| `sidebarGroup` | SidebarGroup[] | 控制选择器左侧可见分组和展示顺序，例如 `['myFiles', 'otherShare', 'favorites']` |
| `title` | string | 选择器标题 |
| `okText` | string | 确认按钮文案 |
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

- 用户个人授权路径建议结合统一网关使用，用当前使用用户的 `uid` 查询和管理目录授权路径。
- 文档推荐使用 `pickUserFile`，它会在用户选择目录或文件后自动完成授权。
- 目录授权只支持单选，目录授权结果可通过 `trim.file.getUserAccessibleFolders` 查询。
- 文件授权不会通过 `trim.file.getUserAccessibleFolders` 查询；调用成功后直接使用返回的文件路径。
- 如果应用只需要管理员配置的一批固定目录，使用应用共享授权路径。

---
