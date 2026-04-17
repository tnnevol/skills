#!/usr/bin/env node
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const process = require('node:process')

const platform = process.platform
const arch = process.arch

let binName
if (platform === 'linux') {
  binName = 'halo-linux'
}
else if (platform === 'darwin') {
  binName = arch === 'arm64' ? 'halo-macos-arm' : 'halo-macos'
}
else if (platform === 'win32') {
  binName = 'halo-windows.exe'
}
else {
  console.error(`Unsupported platform: ${platform} (${arch})`)
  process.exit(1)
}

function resolveBinPath(binPath) {
  // If it's a directory (old workflow artifact structure), look inside
  if (fs.statSync(binPath).isDirectory()) {
    const entries = fs.readdirSync(binPath)
    for (const entry of entries) {
      if (entry === binName || entry.endsWith('.exe') || !entry.includes('.')) {
        return path.join(binPath, entry)
      }
    }
  }
  return binPath
}

function ensureExecutable(binPath) {
  if (platform !== 'win32') {
    try {
      const resolved = resolveBinPath(binPath)
      fs.chmodSync(resolved, 0o755)
      return resolved
    }
    catch {}
  }
  return binPath
}

const binPath = path.join(__dirname, 'bin', binName)
const resolvedPath = ensureExecutable(binPath)

const child = spawn(resolvedPath, process.argv.slice(2), {
  stdio: 'inherit',
})

child.on('error', (err) => {
  console.error(`Failed to execute ${binName}: ${err.message}`)
  process.exit(1)
})

child.on('exit', (code) => {
  process.exit(code)
})
