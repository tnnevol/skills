# chandao-cli 框架规范

chandao-cli 是 skills monorepo (`apps/`) 下的 Rust CLI 应用。

## 目录结构

| 文件 | 说明 |
|------|------|
| `index.js` | resolveBinPath + spawn |
| `Makefile` | 友好输出、install-targets、verify |
| `package.json` | license/repository/author/build:targets |
| `README.md` | 安装/配置/功能/开发文档 |
| `.gitignore` | 无（根目录已有） |
| `workflow` | CI/CD 发布流程 |

## Workflow Artifact 扁平化

```yaml
- name: Flatten artifact directories
  working-directory: apps/chandao-cli/bin/
  run: |
    mv */* . 2>/dev/null || true
    rmdir * 2>/dev/null || true
```

**历史坑**：曾用 `find . -type f -exec mv -f {} . \;` 但不可靠（遍历时移动文件导致问题）。已修复为 `mv+rmdir`。

## package.json scripts

```json
{
  "build": "make build-all",
  "build:linux": "make linux",
  "build:macos": "make macos",
  "build:windows": "make windows",
  "build:targets": "make install-targets",
  "clean": "make clean",
  "verify": "make verify",
  "bump": "bumpp",
  "bump:patch": "bumpp patch -y",
  "bump:minor": "bumpp minor -y",
  "bump:major": "bumpp major -y"
}
```

## Cargo.toml 依赖

| 依赖 | 说明 |
|------|------|
| pulldown-cmark | 不使用 |
| chrono | 用于日期处理 |
| ureq features | `tls, gzip, json` |

## 新增 CLI 时的检查清单

1. ✅ `index.js` — 含 resolveBinPath 兼容逻辑
2. ✅ `Makefile` — 友好输出 + install-targets + verify
3. ✅ `package.json` — license/repository/author + 所有 scripts
4. ✅ `README.md` — 安装/配置/功能/开发
5. ✅ `.github/workflows/release-*.yml` — CI/CD 流程
6. ✅ 不要有 `.gitignore`（根目录已有）
7. ✅ 不要有 `package-lock.json`（用 pnpm-lock.yaml）
