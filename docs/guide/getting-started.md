# 快速开始

## 环境要求

- **Node.js** >= 18
- **pnpm**（推荐）或 npm

## 安装技能

### 安装所有技能

```bash
pnpx skills add tnnevol/skills --skill='*'
```

### 全局安装

```bash
pnpx skills add tnnevol/skills --skill='*' -g
```

### 安装单个技能

```bash
# 安装 autosave 技能
pnpx skills add tnnevol/skills --skill=autosave

# 安装 chandao 技能
pnpx skills add tnnevol/skills --skill=chandao
```

了解更多命令行用法请参考[技能安装工具](https://github.com/vercel-labs/skills)。

## 安装命令行工具

### 网盘命令行工具

```bash
npm install -g @tnnevol/openlist-cli
```

安装后即可在终端中使用 `openlist` 命令管理网盘文件。

## 环境变量配置

各技能需要配置相应的环境变量才能正常使用：

### 网盘自动保存

| 变量名 | 说明 |
|--------|------|
| `AUTOSAVE_API_URL` | 网盘 API 地址 |
| `AUTOSAVE_API_TOKEN` | API 访问令牌 |

### 禅道项目管理

| 变量名 | 说明 |
|--------|------|
| `CHANDAO_API_URL` | 禅道 API 地址 |
| `CHANDAO_USERNAME` | 禅道用户名 |
| `CHANDAO_PASSWORD` | 禅道密码 |

### 钉钉代理通讯

| 变量名 | 说明 |
|--------|------|
| `DING_WEBHOOK_URL` | 钉钉 Webhook 地址 |
| `DING_SECRET` | 钉钉签名密钥 |

### 博客管理

| 变量名 | 说明 |
|--------|------|
| `HALO_API_URL` | Halo 站点 API 地址 |
| `HALO_API_TOKEN` | Halo API 访问令牌 |

### 笔记管理

| 变量名 | 说明 |
|--------|------|
| `MEMOS_API_URL` | Memos 实例 API 地址 |
| `MEMOS_API_TOKEN` | Memos API 访问令牌 |

### 网盘聚合管理

| 变量名 | 说明 |
|--------|------|
| `OPENLIST_API_URL` | OpenList API 地址 |
| `OPENLIST_API_TOKEN` | OpenList API 访问令牌 |

## 验证安装

安装完成后，可以在人工智能代理中直接调用已安装的技能。例如：

```
帮我查看禅道中当前迭代的所有任务
```

```
在博客中创建一篇新文章
```

代理会自动识别并使用对应的技能来完成任务。
