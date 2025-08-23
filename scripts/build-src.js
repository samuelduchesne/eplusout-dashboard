#!/usr/bin/env node
/**
 * Build script that assembles modular source files from /src into single index.html
 * This maintains the standalone, offline-capable nature of the dashboard while 
 * providing better development structure.
 */

const fs = require('fs');
const path = require('path');

const root = __dirname ? path.resolve(__dirname, '..') : process.cwd();
const srcDir = path.join(root, 'src');
const outputFile = path.join(root, 'index.html');

// Backup original file if it exists
const backupFile = path.join(root, 'index.html.backup');
if (fs.existsSync(outputFile) && !fs.existsSync(backupFile)) {
  fs.copyFileSync(outputFile, backupFile);
  console.log('[build-src] Backed up original index.html to index.html.backup');
}

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[build-src] Warning: ${filePath} not found, skipping`);
    return '';
  }
  return fs.readFileSync(filePath, 'utf8');
}

function buildHTML() {
  const head = readFile(path.join(srcDir, 'html', 'head.html'));
  const header = readFile(path.join(srcDir, 'html', 'header.html'));
  const openModal = readFile(path.join(srcDir, 'html', 'modals', 'open-file.html'));
  const main = readFile(path.join(srcDir, 'html', 'main.html'));
  const changelogModal = readFile(path.join(srcDir, 'html', 'modals', 'changelog.html'));
  const unitsModal = readFile(path.join(srcDir, 'html', 'modals', 'units-settings.html'));
  const htmlReportModal = readFile(path.join(srcDir, 'html', 'modals', 'html-report.html'));
  
  // JavaScript modules (in order of dependency)
  const utilsJS = readFile(path.join(srcDir, 'js', 'core', 'utils.js'));
  const libraryLoaderJS = readFile(path.join(srcDir, 'js', 'core', 'library-loader.js'));
  const themeJS = readFile(path.join(srcDir, 'js', 'core', 'theme.js'));
  const databaseJS = readFile(path.join(srcDir, 'js', 'data', 'database.js'));
  const signalsJS = readFile(path.join(srcDir, 'js', 'data', 'signals.js'));
  const exportJS = readFile(path.join(srcDir, 'js', 'data', 'export.js'));
  const modalsJS = readFile(path.join(srcDir, 'js', 'ui', 'modals.js'));
  const filtersJS = readFile(path.join(srcDir, 'js', 'ui', 'filters.js'));
  const chartsJS = readFile(path.join(srcDir, 'js', 'ui', 'charts.js'));
  const reportsJS = readFile(path.join(srcDir, 'js', 'ui', 'reports.js'));
  const fileHandlingJS = readFile(path.join(srcDir, 'js', 'ui', 'file-handling.js'));
  const additionalHandlersJS = readFile(path.join(srcDir, 'js', 'ui', 'additional-handlers.js'));
  const appJS = readFile(path.join(srcDir, 'js', 'app.js'));

  // Assemble the complete HTML
  const html = `${head}
${header}

    <!-- Open Database Modal -->
${openModal}

${main}

    <!-- Changelog Modal -->
${changelogModal}

    <!-- Units Settings Modal -->
${unitsModal}

    <!-- HTML Report Modal -->
${htmlReportModal}

    <script>
${utilsJS}

${libraryLoaderJS}

${themeJS}

${databaseJS}

${signalsJS}

${exportJS}

${modalsJS}

${filtersJS}

${chartsJS}

${reportsJS}

${fileHandlingJS}

${additionalHandlersJS}

${appJS}
    </script>
  </body>
</html>`;

  return html;
}

try {
  const output = buildHTML();
  fs.writeFileSync(outputFile, output);
  
  const stats = fs.statSync(outputFile);
  console.log(`[build-src] Built index.html (${stats.size} bytes) from modular sources in /src`);
  console.log('[build-src] Structure:');
  console.log('  HTML: head.html, header.html, main.html, modals/*');
  console.log('  JS: core/*, data/*, ui/*, app.js');
  
} catch (error) {
  console.error('[build-src] Build failed:', error.message);
  process.exit(1);
}