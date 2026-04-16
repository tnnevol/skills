.PHONY: build-all build-linux build-macos build-windows clean

BUILD_DIR := bin
MODULE := halo-cli

build-all: build-linux build-macos build-windows

build-linux:
	GOOS=linux GOARCH=amd64 go build -o $(BUILD_DIR)/halo-linux $(MODULE)

build-macos:
	GOOS=darwin GOARCH=amd64 go build -o $(BUILD_DIR)/halo-macos $(MODULE)

build-windows:
	GOOS=windows GOARCH=amd64 go build -o $(BUILD_DIR)/halo-windows.exe $(MODULE)

clean:
	rm -rf $(BUILD_DIR)
