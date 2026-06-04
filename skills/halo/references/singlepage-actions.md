# 单页操作指南

## 单页 vs 文章

单页（SinglePage）用于创建独立的静态页面，不按时序发布：
- **典型场景**：关于我们、联系方式、隐私政策、服务条款、FAQ
- **与文章的区别**：不出现在博客时间线，通常作为固定导航页面

## 核心操作

### 列出单页

```bash
/halo list-singlepages
/halo list-singlepages --limit=10 --page=2
/halo list-singlepages --keyword=关于
```

### 获取单页详情

```bash
/halo get-singlepage <name>
```

### 创建单页

```bash
# 创建草稿
/halo create-singlepage --title="关于我们" --content="<h1>关于我们</h1><p>公司介绍...</p>"

# 创建并发布
/halo create-singlepage --title="隐私政策" --content="..." --publish

# 设置公开可见
/halo create-singlepage --title="服务条款" --content="..." --public

# 从文件读取内容
/halo create-singlepage --title="FAQ" --content-file=./faq.html --publish
```

### 更新单页

```bash
# 更新标题
/halo update-singlepage <name> --title="新的标题"

# 更新内容
/halo update-singlepage <name> --content="<p>新内容</p>"

# 更新可见性
/halo update-singlepage <name> --visible=PUBLIC
```

### 发布/取消发布

```bash
/halo publish-singlepage <name>
/halo unpublish-singlepage <name>
```

### 删除单页

```bash
# 移入回收站（默认）
/halo delete-singlepage <name>

# 永久删除（需二次确认）
/halo delete-singlepage <name> --permanent
```

### 回收站管理

```bash
# 查看回收站
/halo list-singlepages-trash

# 从回收站恢复
/halo restore-singlepage <name>
```

## 注意事项

1. **一次性创建原则** - 尽量一次性提供所有必要参数，避免多次更新操作
2. **回收站机制** - 默认删除移入回收站，使用 `--permanent` 永久删除
3. **永久删除确认** - 永久删除不可恢复，Agent 会在执行前二次确认
4. **乐观锁机制** - 更新操作需要 `metadata.version`，脚本自动处理版本冲突并重试
5. **metadata.name 规则** - ≤253 字符，仅小写字母、数字和连字符，自动生成 `{slug}-{timestamp}`
6. **slug 自动生成** - CJK 字符保留（Halo 支持 Unicode），特殊字符替换为连字符
7. **内容格式** - 内容必须为 HTML 格式，使用 `--content-file` 可从文件读取
8. **发布流程** - 创建时加 `--publish` 可直接发布，否则为草稿状态

## 错误处理

| 状态码 | 说明       | 处理方式                              |
| ------ | ---------- | ------------------------------------- |
| 401    | 认证失败   | 检查 HALO_PAT 是否正确                |
| 403    | 无权限     | 确认 PAT 权限是否包含 singlepage 操作 |
| 404    | 资源不存在 | 检查单页名称是否正确                  |
| 409    | 版本冲突   | 脚本自动重试，无需手动处理            |
| 500    | 服务器异常 | 稍后重试                              |

## 使用示例

### 示例 1：创建并立即发布"关于我们"页面

```bash
/halo create-singlepage \
  --title="关于我们" \
  --content="<h1>关于我们</h1><p>我们是一个优秀的团队...</p>" \
  --publish \
  --public
```

### 示例 2：更新隐私政策内容

```bash
/halo update-singlepage yinsi-zhengce-20260604120000 \
  --content-file=./privacy-policy-updated.html
```

### 示例 3：创建 FAQ 并稍后发布

```bash
/halo create-singlepage \
  --title="常见问题" \
  --content="<h2>Q: 如何联系你们？</h2><p>A: 请发送邮件到...</p>" \
  --slug=faq
```
