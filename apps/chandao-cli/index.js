#!/usr/bin/env node

const { execFileSync } = require("child_process");
const path = require("path");

const platform = process.platform;
const binaryName =
  platform === "win32"
    ? "chandao-win.exe"
    : platform === "darwin"
      ? "chandao-macos"
      : "chandao-linux";

const binaryPath = path.join(__dirname, "bin", binaryName);
const args = process.argv.slice(2);

try {
  execFileSync(binaryPath, args, { stdio: "inherit" });
} catch (e) {
  if (e.status === 127) {
    console.error(
      `[chandao] Binary not found for platform ${platform}.`,
    );
    console.error(`  Expected: ${binaryPath}`);
    console.error("  Run `make build-all` to build for all platforms.");
  }
  process.exit(e.status ?? 1);
}
