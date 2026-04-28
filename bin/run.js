#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const packageDir = path.resolve(__dirname, '..');
process.chdir(packageDir);

console.log('🚀 JSON.engine starting on port 3030...');
console.log('⚠️  Requires Chrome/Edge (File System Access API)');
console.log('📁 Working directory:', packageDir);

try {
  const tsConfig = path.join(packageDir, 'tsconfig.json');
  if (!fs.existsSync(tsConfig)) {
    console.error('❌ tsconfig.json not found at:', tsConfig);
    process.exit(1);
  }
  console.log('✅ Found tsconfig.json');

  console.log('📦 Installing dependencies...');
  execSync('npm install', { 
    cwd: packageDir, 
    stdio: 'inherit',
  });
  
  console.log('🔨 Building standalone server...');
  execSync('node node_modules/.bin/next build', { 
    cwd: packageDir, 
    stdio: 'inherit',
  });
  
  console.log('▶️  Starting server...');
  execSync('node node_modules/.bin/next start --port 3030', { 
    cwd: packageDir, 
    stdio: 'inherit',
  });
} catch (err) {
  console.error('❌ Failed to start JSON.engine:', err.message);
  process.exit(1);
}
