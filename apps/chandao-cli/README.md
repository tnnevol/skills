# @tnnevol/chandao-cli

禅道 (ZenTao) 项目管理命令行工具。使用 Rust 编写，零运行时依赖。

## 特性

- 支持用户、产品、项目、需求、任务、Bug、史诗、测试用例等模块管理
- 支持执行/迭代、测试单、反馈、工单、版本、发布、项目集等管理
- RESTful API v2 完整对接
- Token 自动管理（首次登录、401 自动刷新）
- `.env` 文件和环境变量配置
- 跨平台：Linux、macOS（Intel + ARM）、Windows
- 零运行时依赖（纯原生二进制）

## 安装

### 全局安装

```bash
npm install -g @tnnevol/chandao-cli
# 或
pnpm add -g @tnnevol/chandao-cli

chandao-cli help
```

### 临时使用（无需安装）

```bash
npx -y @tnnevol/chandao-cli help
```

## 配置

使用前需要配置禅道地址和账号：

```bash
export CHANDAO_URL=https://your-zentao.com
export CHANDAO_ACCOUNT=your-username
export CHANDAO_PASSWORD=***
```

或在 `~/.config/chandao/.env` 创建配置文件：

```
CHANDAO_URL=https://your-zentao.com
CHANDAO_ACCOUNT=your-username
CHANDAO_PASSWORD=***
```

## 功能与使用

### 帮助

```bash
chandao-cli help                    # 查看所有模块
chandao-cli <module> help           # 查看模块详细用法
chandao-cli version                 # 查看版本号
```

### 用户管理

```bash
chandao-cli user list [--limit N]         # 列出用户
chandao-cli user get <id>                 # 用户详情
chandao-cli user create --account <a> --realname <n> --email <e>
chandao-cli user update <id> --realname <n>
chandao-cli user delete <id>
```

### 产品管理

```bash
chandao-cli product list [--limit N]      # 列出产品
chandao-cli product get <id>              # 产品详情
chandao-cli product create --name <n> --code <c>
chandao-cli product delete <id>
```

### 项目管理

```bash
chandao-cli project list [--limit N]      # 列出项目
chandao-cli project get <id>              # 项目详情
chandao-cli project create --name <n> --code <c> --begin <d> --end <d>
chandao-cli project delete <id>
```

### 需求管理

```bash
chandao-cli story list [--product <id>]   # 列出需求
chandao-cli story get <id>                # 需求详情
chandao-cli story create --product <id> --title <t>
chandao-cli story close <id>              # 关闭需求
```

### 任务管理

```bash
chandao-cli task list [--execution <id>]  # 列出任务
chandao-cli task get <id>                 # 任务详情
chandao-cli task create --execution <id> --name <n>
chandao-cli task start <id>               # 开始任务
chandao-cli task finish <id>              # 完成任务
chandao-cli task close <id>               # 关闭任务
```

### Bug 管理

```bash
chandao-cli bug list [--product <id>]     # 列出 Bug
chandao-cli bug get <id>                  # Bug 详情
chandao-cli bug create --product <id> --title <t>
chandao-cli bug resolve <id> --resolution fixed --assigned-to <user> --resolved-build <build>
chandao-cli bug close <id>                # 关闭 Bug
```

### 执行/迭代管理

```bash
chandao-cli execution list [--project <id>]   # 列出执行
chandao-cli execution get <id>                # 执行详情
chandao-cli execution start <id>              # 启动执行
chandao-cli execution close <id>              # 关闭执行
```

### 测试用例管理

```bash
chandao-cli testcase list [--product <id>]    # 列出测试用例
chandao-cli testcase get <id>                 # 用例详情
chandao-cli testcase create --product <id> --title <t>
chandao-cli testcase delete <id>
```

### 更多模块

支持的模块：`user` `product` `project` `story` `task` `bug` `epic` `execution` `testcase` `testtask` `requirement` `feedback` `ticket` `build` `release` `productplan` `program` `file` `system`

使用 `chandao-cli <module> help` 查看完整参数。

## 开发

### 编译

需要 Rust 环境（推荐通过 [rustup](https://rustup.rs) 安装）：

```bash
make build-all          # 编译所有平台
make linux              # 仅编译 Linux
make macos              # 仅编译 macOS
make windows            # 仅编译 Windows
make clean              # 清理编译产物
make verify             # 验证编译结果
```

### 发布

```bash
pnpm run bump           # 交互式选择版本
pnpm run bump:patch     # 1.0.0 → 1.0.1
pnpm run bump:minor     # 1.0.0 → 1.1.0
pnpm run bump:major     # 1.0.0 → 2.0.0
```

推送 tag 后，CI/CD 自动编译四平台二进制并发布到 npm。

## 技术栈

- **Rust** — 核心 CLI（edition 2024）
- **clap** — CLI 参数解析
- **ureq** — HTTP 客户端（rustls TLS，轻量级）
- **serde / serde_json** — JSON 序列化
- **dotenvy** — `.env` 文件加载
- **chrono** — 日期时间处理

## License

MIT
