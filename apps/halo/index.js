#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const platform = process.platform;
const binMap = {
  linux: 'halo-linux',
  darwin: 'halo-macos',
  win32: 'halo-windows.exe'
};

const binName = binMap[platform];
if (!binName) {
  console.error(`Unsupported platform: ${platform}`);
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