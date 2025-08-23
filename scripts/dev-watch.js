#!/usr/bin/env node

/**
 * @fileoverview Development file watcher for EnergyPlus Dashboard
 * Watches src/ directory for changes and automatically rebuilds the application
 * Provides live reloading and development server integration
 */

const chokidar = require('chokidar');
const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const SRC_DIR = path.join(__dirname, '..', 'src');
const BUILD_SCRIPT = path.join(__dirname, 'build-src.js');

/**
 * Execute build with error handling
 * @returns {boolean} Success status
 */
function runBuild() {
  try {
    console.log('🔨 Building application...');
    const start = Date.now();
    execSync(`node "${BUILD_SCRIPT}"`, { stdio: 'inherit' });
    const duration = Date.now() - start;
    console.log(`✅ Build completed in ${duration}ms`);
    return true;
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
}

/**
 * Handle file change events
 * @param {string} filePath - Path of changed file
 * @param {string} changeType - Type of change (add, change, unlink)
 */
function handleFileChange(filePath, changeType) {
  const relativePath = path.relative(process.cwd(), filePath);
  console.log(`📝 ${changeType}: ${relativePath}`);
  
  // Debounce builds to avoid multiple rapid builds
  if (handleFileChange.timeout) {
    clearTimeout(handleFileChange.timeout);
  }
  
  handleFileChange.timeout = setTimeout(() => {
    runBuild();
  }, 300);
}

/**
 * Initialize file watcher
 */
function initWatcher() {
  console.log('👀 Starting file watcher...');
  console.log(`📁 Watching: ${SRC_DIR}`);
  
  const watcher = chokidar.watch(SRC_DIR, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true
  });

  watcher
    .on('add', (filePath) => handleFileChange(filePath, 'Added'))
    .on('change', (filePath) => handleFileChange(filePath, 'Changed'))
    .on('unlink', (filePath) => handleFileChange(filePath, 'Removed'))
    .on('ready', () => {
      console.log('✅ File watcher ready');
      console.log('📝 Edit files in src/ directory to trigger automatic rebuilds');
      console.log('🛑 Press Ctrl+C to stop watching');
    })
    .on('error', (error) => {
      console.error('❌ Watcher error:', error);
    });

  return watcher;
}

/**
 * Graceful shutdown
 */
function setupShutdown(watcher) {
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down file watcher...');
    watcher.close();
    process.exit(0);
  });
}

// Main execution
if (require.main === module) {
  // Check if src directory exists
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`❌ Source directory not found: ${SRC_DIR}`);
    process.exit(1);
  }

  // Initial build
  if (!runBuild()) {
    console.error('❌ Initial build failed, exiting');
    process.exit(1);
  }

  // Start watching
  const watcher = initWatcher();
  setupShutdown(watcher);
}

module.exports = { runBuild, handleFileChange, initWatcher };