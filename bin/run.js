#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const packageDir = path.resolve(__dirname, '..');
const standaloneDir = path.join(packageDir, '.next', 'standalone');

console.log('🚀 JSON.engine starting on port 3030...');
console.log('⚠️  Requires Chrome/Edge (File System Access API)');

try {
  if (!fs.existsSync(standaloneDir)) {
    console.error('❌ Pre-built standalone server not found at:', standaloneDir);
    console.error('   This package may be corrupted. Try reinstalling.');
    process.exit(1);
  }

  console.log('✅ Found pre-built server');
  console.log('▶️  Starting server...');

  execSync('node server.js', {
    cwd: standaloneDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: '3030',
    },
  });
} catch (err) {
  console.error('❌ Failed to start JSON.engine:', err.message);
  process.exit(1);
}
