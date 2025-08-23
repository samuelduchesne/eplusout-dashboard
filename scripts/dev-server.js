#!/usr/bin/env node

/**
 * @fileoverview Development server for EnergyPlus Dashboard
 * Combines file watching, automatic rebuilding, and live server
 * Provides complete development workflow with hot reloading
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || 'localhost';

/**
 * Start the live server
 * @returns {ChildProcess} Server process
 */
function startServer() {
  console.log('🚀 Starting development server...');
  
  const serverArgs = [
    '--port=' + PORT,
    '--host=' + HOST,
    '--no-browser',
    '--quiet',
    '--entry-file=index.html'
  ];

  const server = spawn('npx', ['live-server', ...serverArgs], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error.message);
  });

  return server;
}

/**
 * Start the file watcher
 * @returns {ChildProcess} Watcher process
 */
function startWatcher() {
  console.log('👀 Starting file watcher...');
  
  const watcherScript = path.join(__dirname, 'dev-watch.js');
  const watcher = spawn('node', [watcherScript], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  watcher.on('error', (error) => {
    console.error('❌ Watcher error:', error.message);
  });

  return watcher;
}

/**
 * Development server main function
 */
function startDevelopment() {
  console.log('🔧 EnergyPlus Dashboard - Development Mode');
  console.log('=====================================');
  
  // Check if required files exist
  const requiredFiles = ['index.html', 'src', 'scripts/build-src.js'];
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(process.cwd(), file))) {
      console.error(`❌ Required file/directory not found: ${file}`);
      process.exit(1);
    }
  }

  // Start components
  const watcher = startWatcher();
  const server = startServer();

  console.log(`\n🌐 Development server running at:`);
  console.log(`   http://${HOST}:${PORT}`);
  console.log('\n📝 Features:');
  console.log('   • File watching with automatic rebuild');
  console.log('   • Live browser reload on changes');
  console.log('   • Real-time compilation of src/ modules');
  console.log('\n🛑 Press Ctrl+C to stop development server');

  // Graceful shutdown
  function shutdown() {
    console.log('\n🛑 Shutting down development server...');
    
    if (watcher && !watcher.killed) {
      watcher.kill('SIGINT');
    }
    
    if (server && !server.killed) {
      server.kill('SIGINT');
    }
    
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Handle child process exits
  watcher.on('exit', (code) => {
    if (code !== 0) {
      console.error('❌ File watcher exited with error code:', code);
      shutdown();
    }
  });

  server.on('exit', (code) => {
    if (code !== 0) {
      console.error('❌ Development server exited with error code:', code);
      shutdown();
    }
  });
}

// Main execution
if (require.main === module) {
  startDevelopment();
}

module.exports = { startServer, startWatcher, startDevelopment };