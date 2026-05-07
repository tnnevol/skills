TARGET_DIR = target/release
BIN_DIR = bin

ARCH ?= $(shell uname -m)
ifeq ($(ARCH), aarch64)
  ARCH_LINUX = aarch64-unknown-linux-gnu
  ARCH_MACOS = aarch64-apple-darwin
  ARCH_WIN = aarch64-pc-windows-gnu
else
  ARCH_LINUX = x86_64-unknown-linux-gnu
  ARCH_MACOS = x86_64-apple-darwin
  ARCH_WIN = x86_64-pc-windows-gnu
endif

.PHONY: all linux macos windows build-all clean verify

all: build-all

linux:
	cargo build --release --target $(ARCH_LINUX)
	cp $(TARGET_DIR)/$(ARCH_LINUX)/chandao $(BIN_DIR)/chandao-linux

macos:
	cargo build --release --target $(ARCH_MACOS)
	cp $(TARGET_DIR)/$(ARCH_MACOS)/chandao $(BIN_DIR)/chandao-macos

windows:
	cargo build --release --target $(ARCH_WIN)
	cp $(TARGET_DIR)/$(ARCH_WIN)/chandao.exe $(BIN_DIR)/chandao-win.exe

build-all: linux macos windows

clean:
	cargo clean
	rm -f $(BIN_DIR)/*

verify:
	cargo test
	cargo clippy -- -D warnings
	cargo check --release
