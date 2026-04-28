#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const packageDir = path.resolve(__dirname, '..');

// Ensure we're in the package directory
process.chdir(packageDir);
process.env.PWD = packageDir;

console.log('🚀 JSON.engine starting on port 3030...');
console.log('⚠️  Requires Chrome/Edge (File System Access API)');
console.log('📁 Working directory:', packageDir);

try {
  // Verify tsconfig.json exists
  const tsConfig = path.join(packageDir, 'tsconfig.json');
  if (!fs.existsSync(tsConfig)) {
    console.error('❌ tsconfig.json not found at:', tsConfig);
    process.exit(1);
  }
  console.log('✅ Found tsconfig.json');

  console.log('📦 Installing dependencies...');
  execSync('npm install --ignore-scripts', { 
    cwd: packageDir, 
    stdio: 'inherit',
    env: { ...process.env, PWD: packageDir }
  });
  
  console.log('🔨 Building standalone server...');
  execSync('npx next build', { 
    cwd: packageDir, 
    stdio: 'inherit',
    env: { ...process.env, PWD: packageDir }
  });
  
  console.log('▶️  Starting server...');
  execSync('npx next start --port 3030', { 
    cwd: packageDir, 
    stdio: 'inherit',
    env: { ...process.env, PWD: packageDir }
  });
} catch (err) {
  console.error('❌ Failed to start JSON.engine:', err.message);
  process.exit(1);
}
