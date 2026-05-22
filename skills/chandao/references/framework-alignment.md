# chandao-cli 与 halo-cli 框架对齐

两个 CLI 都是 skills monorepo (`apps/`) 下的 Rust CLI 应用，应保持一致的框架结构。

## 目录结构对比

| 文件 | halo-cli | chandao-cli | 状态 |
|------|----------|-------------|------|
| `index.js` | resolveBinPath + spawn | resolveBinPath + spawn | ✅ 已对齐 |
| `Makefile` | 友好输出、install-targets、verify | 同 | ✅ 已对齐 |
| `package.json` | license/repository/author/build:targets | 同 | ✅ 已对齐 |
| `README.md` | 安装/配置/功能/开发文档 | 同 | ✅ 已对齐 |
| `.gitignore` | 无（根目录已有） | 无 | ✅ 已对齐 |
| `workflow` | CI/CD 发布流程 | 同 | ✅ 已对齐 |

## Workflow 对比

两个 workflow 几乎一致，仅以下差异：
- 名称：`Release Halo CLI` vs `Release Chandao CLI`
- 路径：`apps/halo-cli` vs `apps/chandao-cli`
- 二进制名：`halo-linux`/`halo-macos`/`halo-macos-arm`/`halo-windows.exe` vs `chandao-linux`/`chandao-macos`/`chandao-macos-arm`/`chandao-win.exe`
- Rust 二进制名：`halo-cli` vs `chandao`（注意：chandao-cli 的 Rust bin 名是 `chandao`，不含 `-cli`）

## Workflow Flatten 步骤

两个 workflow 都有 artifact 目录扁平化步骤：

```yaml
- name: Flatten artifact directories
  working-directory: apps/<app>/bin/
  run: |
    mv */* . 2>/dev/null || true
    rmdir * 2>/dev/null || true
```

**历史坑**：曾用 `find . -type f -exec mv -f {} . \;` 但不可靠（遍历时移动文件导致问题）。已修复为 `mv+rmdir`。

**注意**：两个 workflow 的 flatten 步骤必须保持一致，修改一个时要同步修改另一个。

## Cargo.toml 差异

| 依赖 | halo-cli | chandao-cli | 说明 |
|------|----------|-------------|------|
| pulldown-cmark | ✅ | ❌ | halo 用于 Markdown→HTML |
| chrono | ❌ | ✅ | chandao 用于日期处理 |
| ureq features | `tls, gzip` | `tls, gzip, json` | chandao 需要 JSON 解析 |

## package.json scripts 对比

```json
// 两者都应有这些 scripts
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

## 新增 CLI 时的检查清单

1. ✅ `index.js` — 含 resolveBinPath 兼容逻辑
2. ✅ `Makefile` — 友好输出 + install-targets + verify
3. ✅ `package.json` — license/repository/author + 所有 scripts
4. ✅ `README.md` — 安装/配置/功能/开发
5. ✅ `.github/workflows/release-*.yml` — CI/CD 流程
6. ✅ 不要有 `.gitignore`（根目录已有）
7. ✅ 不要有 `package-lock.json`（用 pnpm-lock.yaml）
