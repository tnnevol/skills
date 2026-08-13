# 技能文档

本模块集中介绍仓库中的 5 个技能。每个技能均包含安装、首次使用方式和功能说明；详细的接口契约、脚本参数和注意事项由技能目录中的参考资料维护。

## 统一安装

安装全部技能：

```bash
npx skills add tnnevol/skills --skill='*' -g -y
```

按需安装单个技能：

```bash
npx skills add tnnevol/skills --skill=<技能名称> -g -y
```

## openlist

通过 `openlist-cli` 操作 OpenList 多存储文件列表和网盘聚合服务。

### 安装

```bash
npx skills add tnnevol/skills --skill=openlist -g -y
```

也可以让 Agent 完成安装。通过 AI Agent 安装时发送：

```text
阅读说明并帮我安装 openlist-cli：https://github.com/tnnevol/skills/blob/main/apps/openlist-cli/openlist-cli-installation-guide.md
```

通过 SkillHub 安装时发送：

```text
请根据 https://skillhub.cn/install/skillhub.md，安装 @user_5c85a23c/openlist。
```

### 使用

首次使用先确认工具和认证状态：

```bash
openlist-cli --version
openlist-cli auth login
openlist-cli me get
```

登录时服务地址必须提供。真实终端会进入交互式登录，配置文件中的服务地址和令牌会作为默认值；服务允许无令牌访问时可以跳过令牌。非交互环境使用 `--base-url`，令牌按服务要求提供。

常用命令：

```bash
openlist-cli fs list /
openlist-cli fs search -k 关键词 -p /
openlist-cli fs put ./本地文件 /目标目录
openlist-cli share create --path /目录
```

### 功能

- 文件与目录：列出、获取、搜索、新建、重命名、移动、复制、删除、上传、批量整理和解压。
- 分享：创建、查询、更新、删除、启用和禁用分享。
- 当前用户：查询当前账号信息。
- 后台管理：管理用户、存储、元信息、设置、驱动和搜索索引。
- 结果处理：统一输出结构化 JSON，列表结果包含分页信息，所有命令支持 `--help` 和 `--pretty`。
- 意图引导：将列目录、搜索文件、上传文件、创建分享和查看存储等自然语言转换为对应命令。

## memos

通过安全脚本操作自建时间线式笔记服务。Memos 使用时间线和标签组织内容，不使用文件夹笔记本。

### 安装

```bash
npx skills add tnnevol/skills --skill=memos -g -y
```

配置 `MEMOS_BASE_URL` 和 `MEMOS_ACCESS_TOKEN` 环境变量。

### 使用

首次使用先配置环境变量并确认可用。所有接口调用必须通过技能脚本完成，不要直接使用 `curl` 或其他客户端访问服务。删除笔记、附件或分享前确认目标，笔记优先使用标签整理。

### 功能

- 笔记：列表、过滤、创建、查询、更新、删除和置顶。
- 标签：查询标签、按标签筛选和维护标签。
- 评论：查看、添加、更新和删除评论。
- 附件：查询、上传、关联、删除和批量删除；上传前获取存储策略和分组信息。
- 分享：创建、查询和撤销分享链接。
- 表情与关联：添加、切换、取消表情，建立和解除笔记关联。
- 安全处理：统一认证、错误处理、敏感信息清理和脚本化调用。

## fnnas-docs

飞牛 fnOS 应用开发文档技能，覆盖应用创建、开发、调试、打包和发布。

### 安装

```bash
npx skills add tnnevol/skills --skill=fnnas-docs -g -y
```

文档来源：[飞牛在线文档索引](https://developer.fnnas.com/llms.txt)、[完整文档](https://developer.fnnas.com/llms-full.txt)和[开放接口概览](https://developer.fnnas.com/api/overview/)。

### 使用

首次使用根据问题阅读对应参考资料，再给出开发方案或执行命令。同步官方文档时运行：

```bash
cd skills/fnnas-docs
python3 scripts/fetch-docs.py
```

创建原生应用不使用 `--template`，创建 Docker 应用必须使用 `--template docker`；不删除应用模板文件，只在基础模板上修改或新增。框架环境变量目录只在 `cmd/install_callback` 阶段生成，该阶段也是应用正式安装阶段。`cmd/main` 用于框架进程检测，生命周期脚本直接输出日志，不单独维护日志文件。

### 功能

- 快速开始：环境准备、创建应用、测试应用和发布上架。
- 开发指南：应用框架、Manifest、环境变量、权限、资源、入口、网关、向导、依赖、中间件、运行时和图标规范。
- 开放接口：调用方式、文件授权、路径转换、页面路由、页面交互、平台配置和错误码。
- 命令行工具：`fnpack` 应用打包工具和 `appcenter-cli` 应用管理工具。
- 应用案例：原生应用和 Docker 应用的完整示例。
- 文档同步：从飞牛线上文档获取更新，并保留更新日志。

## halo

通过脚本和 Halo REST API 管理博客内容。

### 安装

```bash
npx skills add tnnevol/skills --skill=halo -g -y
```

配置 `HALO_BASE_URL` 和 `HALO_PAT` 环境变量。

### 使用

首次使用先确认站点地址和个人访问令牌，再通过脚本执行命令：

```bash
node scripts/halo.mjs list
node scripts/halo.mjs create --title="文章标题" --content="文章内容"
node scripts/halo.mjs list-tags
node scripts/halo.mjs list-singlepages
```

删除操作需要确认，更新操作会处理版本冲突。

### 功能

- 文章：查询、创建、获取、更新、删除、发布和取消发布。
- 分类：查询、创建、获取、更新和删除。
- 标签：查询、创建、获取、更新和删除。
- 单页：查询、创建、获取、更新、删除、发布和取消发布。
- 接口保护：统一认证、敏感信息清理、错误处理、版本锁和冲突重试。
- 文档参考：提供 [Halo API 参考](https://docs.halo.run/category/api-%E5%8F%82%E8%80%83)入口。

## chandao

通过脚本操作禅道项目管理系统。

### 安装

```bash
npx skills add tnnevol/skills --skill=chandao -g -y
```

配置 `CHANDAO_URL`、`CHANDAO_ACCOUNT` 和 `CHANDAO_PASSWORD` 环境变量。

### 使用

首次使用先验证配置：

```bash
node scripts/auth.js --action list-products
```

业务命令格式：

```bash
node scripts/<模块>.js --action <操作> [--参数]
```

代理根据用户意图选择模块和操作。更新前先读取当前数据，创建时一次性传入已提供的参数；删除等破坏性操作需要先确认。

### 功能

- 认证：自动登录、缓存令牌、处理认证失败和令牌刷新。
- 产品与项目：查询、创建、更新、删除，以及按项目集筛选。
- 需求、任务和迭代：查询、创建、更新、状态流转、关联和删除。
- 缺陷和测试用例：查询、创建、更新、解决、关闭、激活和删除。
- 通用能力：分页、预览写操作、删除确认、自然语言意图识别和禅道接口兼容性处理。

常见意图包括“查看项目”“创建需求”“开始任务”“关闭缺陷”和“查看测试用例”。
