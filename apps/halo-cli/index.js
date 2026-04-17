#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const platform = process.platform;
const arch = process.arch;

let binName;
if (platform === 'linux') {
  binName = 'halo-linux';
} else if (platform === 'darwin') {
  binName = arch === 'arm64' ? 'halo-macos-arm' : 'halo-macos';
} else if (platform === 'win32') {
  binName = 'halo-windows.exe';
} else {
  console.error(`Unsupported platform: ${platform} (${arch})`);
  process.exit(1);
}

const binPath = path.join(__dirname, 'bin', binName);
const child = spawn(binPath, process.argv.slice(2), {
  stdio: 'inherit'
});

child.on('error', (err) => {
  console.error(`Failed to execute ${binName}: ${err.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});