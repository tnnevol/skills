.PHONY: all clean linux macos windows build-all install-targets verify

# 一键编译所有平台
all: build-all

# 编译所有三个平台
build-all: linux macos windows
	@echo ""
	@echo "========================================="
	@echo "✅ 所有平台编译完成"
	@echo "========================================="
	@echo "   Linux:   bin/halo-linux"
	@ls -lh bin/halo-linux 2>/dev/null | awk '{print "            "$$5}'
	@echo "   macOS:   bin/halo-macos"
	@ls -lh bin/halo-macos 2>/dev/null | awk '{print "            "$$5}'
	@echo "   Windows: bin/halo-windows.exe"
	@ls -lh bin/halo-windows.exe 2>/dev/null | awk '{print "            "$$5}'

# Linux（原生编译，始终可用）
linux:
	@echo "🔨 编译 Linux (x86_64-unknown-linux-gnu)..."
	cargo build --release --target x86_64-unknown-linux-gnu 2>&1
	cp target/x86_64-unknown-linux-gnu/release/halo-cli bin/halo-linux
	@echo "✅ Linux 编译完成"

# macOS（需要 osxcross 工具链，否则跳过）
macos:
	@if command -v o64-clang &>/dev/null; then \
		echo "🔨 编译 macOS (x86_64-apple-darwin)..."; \
		cargo build --release --target x86_64-apple-darwin 2>&1 && \
		cp target/x86_64-apple-darwin/release/halo-cli bin/halo-macos && \
		echo "✅ macOS 编译完成"; \
	else \
		echo "⚠️  macOS 交叉编译需要 osxcross 工具链，跳过"; \
		echo "   在 macOS 机器上运行: cargo build --release --target x86_64-apple-darwin"; \
		echo "   或安装 osxcross: https://github.com/tpoechtrager/osxcross"; \
	fi

# Windows（需要 mingw-w64，否则跳过）
windows:
	@if command -v x86_64-w64-mingw32-gcc &>/dev/null; then \
		echo "🔨 编译 Windows (x86_64-pc-windows-gnu)..."; \
		cargo build --release --target x86_64-pc-windows-gnu 2>&1 && \
		cp target/x86_64-pc-windows-gnu/release/halo-cli.exe bin/halo-windows.exe && \
		echo "✅ Windows 编译完成"; \
	else \
		echo "⚠️  Windows 交叉编译需要 mingw-w64，跳过"; \
		echo "   安装: sudo apt install mingw-w64"; \
	fi

# 清理
clean:
	rm -rf target/
	rm -f bin/halo-linux bin/halo-macos bin/halo-windows.exe
	@echo "✅ 清理完成"

# 安装交叉编译目标
install-targets:
	rustup target add x86_64-unknown-linux-gnu
	rustup target add x86_64-apple-darwin
	rustup target add x86_64-pc-windows-gnu
	@echo "✅ 所有目标已安装"

# 验证编译结果
verify:
	@echo "=== 版本检查 ==="
	@bin/halo-linux version 2>/dev/null || echo "Linux 二进制不存在"
	@echo ""
	@echo "=== 文件列表 ==="
	@ls -lh bin/
