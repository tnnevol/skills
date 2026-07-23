# OpenList CLI

[OpenList](https://github.com/OpenListTeam/OpenList) 命令行工具，用于管理文件、分享、用户及后台配置。

## 安装

```bash
# npm
npm install -g @tnnevol/openlist-cli

# pnpm
pnpm add -g @tnnevol/openlist-cli

# 直接运行（无需安装）
npx @tnnevol/openlist-cli <command>
```

## 快速开始

```bash
# 1. 登录（使用 Token，在 Web 界面获取）
openlist-cli auth login --base-url http://localhost:5244 --token your-token

# 2. 列出根目录
openlist-cli fs list /

# 3. 上传文件
openlist-cli fs put ./local-file.txt /remote-dir/

# 4. 创建分享
openlist-cli share create --path /share-dir
```

## 配置

配置优先级：**CLI 选项 > 环境变量 > 配置文件**

### 配置文件

路径：`~/.openlist/config.json`

```json
{
  "baseUrl": "http://localhost:5244",
  "token": "your-api-token"
}
```

使用 `openlist-cli auth login` 自动生成，无需手动创建。

### 环境变量

| 变量                | 说明              |
| ------------------- | ----------------- |
| `OPENLIST_BASE_URL` | OpenList 服务地址 |
| `OPENLIST_TOKEN`    | API Token         |

### 全局选项

所有命令均支持以下全局选项：

| 选项               | 说明              |
| ------------------ | ----------------- |
| `--base-url <url>` | OpenList 服务地址 |
| `--token <token>`  | API Token         |
| `--pretty`         | 美化 JSON 输出    |

## 命令

### auth - 账号管理

| 命令          | 说明                   | 示例                                                        |
| ------------- | ---------------------- | ----------------------------------------------------------- |
| `auth login`  | 登录并保存配置         | `openlist-cli auth login --base-url http://... --token xxx` |
| `auth logout` | 退出登录并清除本地配置 | `openlist-cli auth logout`                                  |
| `auth status` | 查看当前登录状态       | `openlist-cli auth status`                                  |

`auth login` 选项：

| 选项               | 说明      |
| ------------------ | --------- |
| `--base-url <url>` | 服务地址  |
| `--token <token>`  | API Token |

### fs - 文件管理

| 命令                          | 说明                 |
| ----------------------------- | -------------------- |
| `fs list <path>`              | 列出目录内容         |
| `fs get <path>`               | 获取文件或目录信息   |
| `fs search`                   | 搜索文件和目录       |
| `fs dirs <path>`              | 获取目录树           |
| `fs mkdir <path>`             | 创建目录             |
| `fs rename <path> <name>`     | 重命名文件或目录     |
| `fs move`                     | 移动文件或目录       |
| `fs copy`                     | 复制文件或目录       |
| `fs remove`                   | 删除文件或目录       |
| `fs put <local> <remote>`     | 上传文件（流式）     |
| `fs form <local> <remote>`    | 上传文件（表单模式） |
| `fs batch-rename`             | 批量重命名           |
| `fs regex-rename`             | 正则批量重命名       |
| `fs recursive-move`           | 递归移动             |
| `fs remove-empty-dirs <path>` | 删除空目录           |
| `fs archive-decompress`       | 解压压缩包           |
| `fs archive-meta <path>`      | 获取压缩包元信息     |
| `fs archive-list`             | 列出压缩包内容       |

```bash
# 列出目录（分页）
openlist-cli fs list / --page 1 --per-page 50

# 搜索文件
openlist-cli fs search -k report -p /documents

# 复制文件
openlist-cli fs copy --src-dir /docs --dst-dir /backup --names a.txt,b.txt

# 移动文件
openlist-cli fs move --src-dir /docs --dst-dir /archive --names old.txt

# 删除文件
openlist-cli fs remove --dir /docs --names old.txt,temp.txt

# 上传文件
openlist-cli fs put ./report.pdf /documents/

# 正则重命名
openlist-cli fs regex-rename --src-dir /photos --src-name-regex "IMG_(\d+)" --new-name-regex "Photo_$1"

# 批量重命名
openlist-cli fs batch-rename --src-dir /docs --rename-objects '[{"src_name":"a.txt","new_name":"b.txt"}]'
```

### share - 分享管理

| 命令                 | 说明                                      |
| -------------------- | ----------------------------------------- |
| `share list`         | 列出所有分享                              |
| `share get <id>`     | 获取分享详情                              |
| `share create`       | 创建文件分享（`--path` 支持逗号分隔多个） |
| `share update <id>`  | 更新分享（需 `--path` 指定文件）          |
| `share delete <id>`  | 删除分享                                  |
| `share enable <id>`  | 启用分享                                  |
| `share disable <id>` | 禁用分享                                  |

```bash
# 创建带密码的分享
openlist-cli share create --path /shared --password secret

# 更新分享（需重新指定 --path）
openlist-cli share update <id> --path /shared --password newpass

# 分页列出分享
openlist-cli share list --page 1 --per-page 50
```

### me - 用户信息

| 命令               | 说明             |
| ------------------ | ---------------- |
| `me get`           | 获取当前用户信息 |
| `me update`        | 更新当前用户信息 |
| `me sshkey-list`   | 列出 SSH 公钥    |
| `me sshkey-add`    | 添加 SSH 公钥    |
| `me sshkey-delete` | 删除 SSH 公钥    |

### admin - 后台管理

| 命令                   | 说明         |
| ---------------------- | ------------ |
| `admin list`           | 列出管理资源 |
| `admin get <id>`       | 获取资源详情 |
| `admin create`         | 创建资源     |
| `admin update <id>`    | 更新资源     |
| `admin delete <id>`    | 删除资源     |
| `admin index-build`    | 构建搜索索引 |
| `admin index-stop`     | 停止索引构建 |
| `admin index-clear`    | 清除搜索索引 |
| `admin index-progress` | 获取索引进度 |

资源类型（`--type`）：`user`、`storage`、`driver`、`setting`、`meta`、`index`

```bash
# 列出用户
openlist-cli admin list --type user

# 创建存储（从 JSON 文件）
openlist-cli admin create --type storage --file ./storage-config.json

# 构建搜索索引
openlist-cli admin index-build
```

### public - 公开信息

| 命令                        | 说明               |
| --------------------------- | ------------------ |
| `public settings`           | 获取公开设置       |
| `public archive-extensions` | 获取支持的压缩格式 |

## 开发

### 环境要求

- Node.js >= 20.0.0
- pnpm（通过 Corepack 管理）

### 构建

项目位于 monorepo 中，从根目录执行：

```bash
# 交互式选择应用后开发
pnpm dev

# 交互式选择应用后构建
pnpm build

# 清理构建产物
pnpm clean
```

或直接在 openlist-cli 目录下：

```bash
pnpm --filter @tnnevol/openlist-cli build
```

### 技术栈

- TypeScript + ESM
- Commander.js - 命令解析
- undici - HTTP 客户端
- tsup - 构建工具

## License

MIT
