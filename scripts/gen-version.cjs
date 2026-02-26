#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const version = pkg.version || '0.0.0-dev';
let changelog = '';
try {
  changelog = fs.readFileSync(path.join(__dirname, '..', 'CHANGELOG.md'), 'utf8');
} catch (error) {
  throw new Error(
    `Failed to read CHANGELOG.md: ${error instanceof Error ? error.message : String(error)}`,
  );
}
const out = `window.__APP_VERSION__=${JSON.stringify(version)};\nwindow.__CHANGELOG_MD__=${JSON.stringify(changelog)};\n`;
const outDir = path.join(__dirname, '..', 'public');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'version.js'), out);
console.log('[version] wrote public/version.js');
