#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 JSON.engine starting on port 3030...');
console.log('⚠️  Requires Chrome/Edge (File System Access API)');

const appPath = path.join(__dirname, '..');

try {
  console.log('📦 Installing dependencies...');
  execSync('npm install --production', { cwd: appPath, stdio: 'inherit' });
  
  console.log('🔨 Building standalone server...');
  execSync('npm run build', { cwd: appPath, stdio: 'inherit' });
  
  console.log('▶️  Starting server...');
  execSync('npm run start', { cwd: appPath, stdio: 'inherit' });
} catch (err) {
  console.error('Failed to start JSON.engine:', err.message);
  process.exit(1);
}
