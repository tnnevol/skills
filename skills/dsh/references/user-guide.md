# 用户指南：插件市场与对外部署

本页覆盖 `dsh-v0.2.1-rc.2` 新增的两项**用户可感知功能**。其余上游变更（`persistence-changes/`、`upgrade-guide/`、`defensive-patterns/` 等）属内部工程文档，需要时直接读子模块 `sources/dsh/docs/`。

## 插件市场（Plugin Market）

插件市场是一个 JSON 索引文件，列出可安装的 DSH 组合包及其标题、图标、作者和版本。

### 打开「发现」

打开**插件** → 点击**实验性插件**旁的**更多** → 找到**自定义插件市场**并打开开关。**已安装**旁会出现**发现**标签页，Creator 模式还会获得只读的 `plugin_market` 工具。关闭该组合包会再次移除这两者。

DSH **不内置任何索引源**。选择**发现** → **添加索引源** → 输入索引文件 URL。

索引 URL 的约束：

- 必须使用 `http:` 或 `https:`
- **不能包含用户名、密码或 `#` 片段**
- 每个索引源属于当前 profile

> ⚠️ 网络路径上的任何人都能修改 `http:` 索引（包括其中列出的安装 spec），因此**经由不受你控制的网络访问的市场应使用 `https:`**。

### 浏览和安装

- 工具栏左侧的市场菜单用于切换索引源，并可打开**管理索引源…**，其中每个索引源显示最近一次的错误。
- 搜索匹配名称、作者、关键词，以及**所有语言**的标题、描述、分类和标签，并容忍拼写错误；在你选择其他排序之前，结果按最佳匹配排序。
- **标签**菜单、分类按钮和**排序**菜单使用市场声明的分类、标签和排序键；**发布时间**按每个插件最新版本的时间排序。

每张卡片显示插件的推荐版本：**与当前运行的 DSH 兼容、且不是预发布版本的最高版本**；插件没有列出任何非预发布版本时，则是兼容的最高预发布版本。

**安装**会打开确认框，显示该版本的来源（npm 包和注册表，或 Git 仓库、提交和目录）。确认后开始常规的插件安装，包括其中的兼容性检查和注册表检查；**未经确认不会安装任何内容**。

选择卡片会打开插件页面。**版本**列表显示列出的每个版本及其兼容性，并为 DSH 接受的任何版本提供**安装**，包括旧版本和预发布版本。

> ⚠️ **市场是第三方内容。** 每个插件的标题、描述、图标、作者和来源都由市场决定；**DSH 只检查文件格式，不验证这些声明**。只添加你信任的索引源，并在安装前核对确认框中的来源。

### 发布索引

索引是 UTF-8 编码的 JSON 文件，默认不超过 **128 MiB**，以 2xx 状态码返回且**不经过重定向**。放到任意静态主机即可（GitLab Pages、GitHub Pages，或通过 https 访问的对象存储）。

图标可以内联也可以是单独文件：

- **内联图标**：索引中的 base64 `data:` URL，不需额外请求但会变大
- **单独图标**：一个 URL。**相对图标相对于索引 URL 解析**（与网页中图片相对于页面解析相同）。指向其他源（协议、主机、端口）的绝对图标 URL **必须使用 `https:`**

最小索引（一个 npm 插件 + 一个来自 Git monorepo 的插件）：

```json
{
  "format": 1,
  "title": { "en": "Team plugins", "zh": "团队插件" },
  "plugins": [
    {
      "name": "dsh-plugin-foo",
      "title": "Foo",
      "description": "Adds the foo tool",
      "icon": "icons/foo.svg",
      "author": "Jane Doe",
      "homepage": "https://github.com/jane/dsh-plugin-foo#readme",
      "repository": { "url": "https://github.com/jane/dsh-plugin-foo" },
      "versions": [
        { "version": "1.1.0", "publishTimestamp": 1790476800, "source": { "type": "npm" }, "engines": { "dsh": ">=0.2.0-rc.2" } },
        { "version": "1.0.0", "publishTimestamp": 1788000000, "source": { "type": "npm" } }
      ]
    },
    {
      "name": "@team/dsh-bar",
      "versions": [
        {
          "version": "0.3.0",
          "publishTimestamp": 1789000000,
          "source": {
            "type": "git",
            "url": "https://gitlab.example.com/team/dsh-plugins",
            "commit": "3f9c2e1d8a4b6c0e7f1a2b3c4d5e6f708192a3b4",
            "path": "packages/bar"
          }
        }
      ]
    }
  ]
}
```

标为 `LocalizedText` 的文本字段是字符串，或以小写语言 id 为键的字符串对象（如 `{ "en": "Foo", "zh": "甲" }`）；**对象必须包含 `en`**。DSH 不认识的成员会被忽略。

违反任何一条规则时，**DSH 会拒绝整个索引**，并在「管理索引源…」中该索引源下方显示原因及**违规值的 JSON 路径**。

### 用参考生成器生成索引

上游仓库包含参考生成器，可从一份纯文本列表构建索引。每行写一个 npm 包名或 https Git 仓库 URL；空行和以 `#` 开头的行会被忽略：

```text
@team/dsh-foo
https://gitlab.example.com/team/dsh-plugins
```

```sh
pnpm --filter @deepseek-ai/dsh-plugin-market-generator start \
  --input plugins.txt --output site/index.json --title "Team plugins"
```

- **npm 包**：索引列出所有未弃用且声明了 `dsh.bundle` 的版本
- **Git 仓库**：在默认分支上查找组合包，列出 `vX.Y.Z`、`X.Y.Z` 和 `<name>@X.Y.Z` 标签处的版本，以及每个包在默认分支上的版本
- 标题、描述、图标、作者和主页取自每个插件的**最高版本**

> ⚠️ 生成器**只下载和读取文件，从不安装包或运行其代码**。它在列表旁的 `.plugin-market-cache` 中保存缓存，再次运行时只下载新的版本和提交。

发布时把 `index.json` 及其 `icons/` 目录并排放到静态主机即可。

## 在反向代理之后发布 Web UI

`dsh --profile web` 在 **loopback 端口**上提供 GUI，因此其他机器上的浏览器无法访问它，进程也无从得知你实际使用的地址。它前面的反向代理拥有这条外部链路——公开主机名、TLS，以及转发到监听器之前剥离的路径前缀——而 `--public-url` 则告诉 DSH 浏览器使用的是哪个地址：

```sh
dsh --profile web --public-url https://app.example/ui/ --trusted-host app.example
```

### `--public-url` 公告什么

`--public-url` 接受可带挂载前缀的 `http://` 或 `https://` 根，并把它**归一化为以 `/` 结尾**。它提供：

- 打印与打开的启动 URL
- `DSH_WEB_URL`
- agent 运行时上下文中的 Web GUI URL

webserver 继续提供 **origin-root** 路由，且从不了解挂载。`publicUrl` 配置字段发布同样的公告。

### 代理必须做什么

- **保留浏览器可见的 `Host`。** 栅栏把收到的 `Host` 与被接受的 authority 比对，因此代理应**原样转发**，不要改写成监听器的地址。
- **剥离挂载前缀。** 监听器应答的是 origin-root 路由，因此对 `/ui/api/...` 的请求必须以 `/api/...` 抵达。
- **转发升级请求。** 页面发出的每个请求与 **WebSocket 升级**都必须连同其 `Upgrade` 与 `Connection` 头抵达监听器；代理对外提供 HTTPS 时，**TLS 在其外部链路上终止**。
- **改写 cookie 作用域。** 以明文 HTTP 提供服务的后端签发不带 `Secure` 的 host-only `Path=/` cookie；代理再把 `Path` 改写为挂载（`/ui/`），并**仅在其 HTTPS 链路上添加 `Secure`**。监听器自身提供 TLS 时 cookie 已带 `Secure`，代理只需改写 `Path`。
- **重定向裸挂载。** `/ui/` 是**唯一入口**：只有它把启动 token 换成会话 cookie；已持有该 cookie 的浏览器可由它或 `/ui/index.html` 取得文档。对 `/ui` 的请求必须以 `/ui/` 抵达。

### 信任浏览器使用的 authority

栅栏接受 loopback、监听器自身的绑定地址，以及每个由 `--trusted-host` 点名的 authority。浏览器若以其他任何 authority 访问部署，**无论代理多么正确，每个 API 调用都会得到 403**。

> ⚠️ 请用 `--trusted-host` 点名**浏览器可见的** authority；用 `--public-url` 公告它**只是展示，并不等于接纳**。不带端口的条目匹配任意端口，适合每次绑定不同端口的隧道。

栅栏只放行请求；**打印 URL 中的启动 token 与签名会话 cookie 才完成认证**。无论 TLS 在哪里终止都不改变这一点：证书只是向浏览器标识服务器，而不是向服务器标识浏览器。

> ⚠️ 无论是公告 URL 还是栅栏都**不保护监听端口本身**，请把端口限制在可信代理或网络内。

### 在监听器上终止 TLS

传入 `--tls-cert` 与 `--tls-key`，两者各是**相对进程工作目录解析**的路径：证书文件包含完整证书链，密钥文件为**不带口令**的 PEM 私钥。

- DSH **从不获取、续期或监视证书**，且载体**只读取一次文件**——更换文件后需重新加载监听器或重启进程
- 文件缺失或无效时**启动失败，绝不回退到 HTTP**
- 浏览器使用自己的信任库与名称校验，因此证书必须覆盖你所访问的 hostname 或 IP
- 默认端口仍为 **3080**
- 原生 TLS 不需要代理，但代理部署与 `--public-url` 仍分别受支持

TLS 监听器会给会话 cookie 加上 `Secure`；**公开部署的浏览器侧链路应保持 HTTPS**，才能让浏览器回传这些 cookie。

### 保护外部链路

可以在代理处、监听器本身或两者上终止 TLS；`--public-url` 仍只是公告。面向浏览器的 `http://` 根会**明文暴露启动 token**。

> ⚠️ 打印的 URL 携带进程凭据，**只应与预期用户分享**。

### 对应配置位置

| 命令行选项 | 配置位置 |
| --- | --- |
| `--public-url` | Web profile 的 `web-runtime` 行 `publicUrl` |
| `--trusted-host` | `Connection` 行 `trustedHosts` |
| `--tls-cert` / `--tls-key` | `webserver` 行 `tls` |

## 相关页面

- 命令行与 profile 全貌：[cli.md](cli.md)
- 官方文档索引：[docs-map.md](docs-map.md)