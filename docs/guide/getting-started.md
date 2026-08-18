# 快速开始

## 环境要求

- **Node.js** >= 18
- **npm**

## 安装技能

### 安装所有技能

```bash
npx skills add tnnevol/skills --skill='*'
```

### 全局安装

```bash
npx skills add tnnevol/skills --skill='*' -g -y
```

### 安装单个技能

```bash
# 安装 chandao 技能
npx skills add tnnevol/skills --skill=chandao -g -y
```

```bash
# 安装 dsh 技能
npx skills add tnnevol/skills --skill=dsh -g -y
```

了解更多命令行用法请参考[技能安装工具](https://github.com/vercel-labs/skills)。

## 安装命令行工具

### 网盘命令行工具

```bash
npm install -g @tnnevol/openlist-cli
```

安装后即可在终端中使用 `openlist-cli` 命令管理网盘文件。

## 环境变量配置

各技能需要配置相应的环境变量才能正常使用：

### 禅道项目管理

| 变量名 | 说明 |
|--------|------|
| `CHANDAO_URL` | 禅道地址 |
| `CHANDAO_ACCOUNT` | 禅道账号 |
| `CHANDAO_PASSWORD` | 禅道密码 |

### 博客管理

| 变量名 | 说明 |
|--------|------|
| `HALO_BASE_URL` | Halo 站点地址 |
| `HALO_PAT` | Halo 个人访问令牌 |

### 笔记管理

| 变量名 | 说明 |
|--------|------|
| `MEMOS_BASE_URL` | Memos 实例地址 |
| `MEMOS_ACCESS_TOKEN` | Memos 访问令牌 |

### 网盘聚合管理

| 变量名 | 说明 |
|--------|------|
| `OPENLIST_BASE_URL` | OpenList 地址 |
| `OPENLIST_TOKEN` | OpenList 访问令牌 |

## 验证安装

安装完成后，可以在人工智能代理中直接调用已安装的技能。例如：

```
帮我查看禅道中当前迭代的所有任务
```

```
在博客中创建一篇新文章
```

代理会自动识别并使用对应的技能来完成任务。
