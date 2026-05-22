.PHONY: all clean linux macos windows install-targets verify build-all

# 一键编译所有平台
all: build-all

# 编译所有三个平台
build-all: linux macos windows
	@echo ""
	@echo "========================================="
	@echo "✅ 所有平台编译完成"
	@echo "========================================="
	@if [ -f bin/halo-linux ]; then \
		ls -lh bin/halo-linux | awk '{print "   Linux:   bin/halo-linux  (" $$5 ")"}'; \
	else echo "   Linux:   未编译"; fi
	@if [ -f bin/halo-macos ]; then \
		ls -lh bin/halo-macos | awk '{print "   macOS:   bin/halo-macos (Intel) (" $$5 ")"}'; \
	else echo "   macOS:   未编译 (Intel)"; fi
	@if [ -f bin/halo-macos-arm ]; then \
		ls -lh bin/halo-macos-arm | awk '{print "   macOS:   bin/halo-macos-arm (Apple Silicon) (" $$5 ")"}'; \
	else echo "   macOS:   未编译 (Apple Silicon)"; fi
	@if [ -f bin/halo-windows.exe ]; then \
		ls -lh bin/halo-windows.exe | awk '{print "   Windows: bin/halo-windows.exe (" $$5 ")"}'; \
	else echo "   Windows: 未编译"; fi

# Linux（本机编译，与 workflow 一致）
linux:
	@mkdir -p bin
	@if cargo build --release --target x86_64-unknown-linux-gnu 2>/dev/null; then \
		cp target/x86_64-unknown-linux-gnu/release/halo-cli bin/halo-linux; \
		echo "✅ Linux (x86_64-unknown-linux-gnu) 编译完成"; \
	else \
		echo "⚠️  跳过 Linux 编译（缺少 target: rustup target add x86_64-unknown-linux-gnu）"; \
	fi

# macOS（检测本机架构，只编译当前平台；workflow 会分别编译两者）
macos:
	@mkdir -p bin
	@if [ "$$(uname -m)" = "arm64" ]; then \
		if cargo build --release --target aarch64-apple-darwin 2>/dev/null; then \
			cp target/aarch64-apple-darwin/release/halo-cli bin/halo-macos-arm; \
			echo "✅ macOS Apple Silicon (aarch64-apple-darwin) 编译完成"; \
		else \
			echo "⚠️  跳过 macOS Apple Silicon 编译（缺少 target: rustup target add aarch64-apple-darwin）"; \
		fi; \
	else \
		if cargo build --release --target x86_64-apple-darwin 2>/dev/null; then \
			cp target/x86_64-apple-darwin/release/halo-cli bin/halo-macos; \
			echo "✅ macOS Intel (x86_64-apple-darwin) 编译完成"; \
		else \
			echo "⚠️  跳过 macOS Intel 编译（缺少 target: rustup target add x86_64-apple-darwin）"; \
		fi; \
	fi

# Windows（本机交叉编译，与 workflow 一致）
windows:
	@mkdir -p bin
	@if cargo build --release --target x86_64-pc-windows-msvc 2>/dev/null; then \
		cp target/x86_64-pc-windows-msvc/release/halo-cli.exe bin/halo-windows.exe; \
		echo "✅ Windows (x86_64-pc-windows-msvc) 编译完成"; \
	else \
		echo "⚠️  跳过 Windows 编译（缺少 target: rustup target add x86_64-pc-windows-msvc）"; \
	fi

# 清理
clean:
	rm -rf target/
	rm -f bin/halo-linux bin/halo-macos bin/halo-macos-arm bin/halo-windows.exe
	@echo "✅ 清理完成"

# 安装交叉编译目标（与 workflow 的 targets 一致）
install-targets:
	rustup target add x86_64-unknown-linux-gnu
	rustup target add x86_64-apple-darwin
	rustup target add aarch64-apple-darwin
	rustup target add x86_64-pc-windows-msvc
	@echo "✅ 所有目标已安装"

# 验证编译结果
verify:
	@echo "=== 版本检查 ==="
	@bin/halo-linux version 2>/dev/null || echo "Linux 二进制不存在"
	@bin/halo-macos version 2>/dev/null || echo "macOS Intel 二进制不存在"
	@bin/halo-macos-arm version 2>/dev/null || echo "macOS ARM 二进制不存在"
	@echo ""
	@echo "=== 文件列表 ==="
	@ls -lh bin/
