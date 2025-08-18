#!/usr/bin/env node
const fs = require('fs');
const pkg = require('../package.json');
const version = pkg.version || '0.0.0-dev';
let changelog = '';
try { changelog = fs.readFileSync(require('path').join(__dirname,'..','CHANGELOG.md'),'utf8'); } catch {}
const out = `window.__APP_VERSION__="${version}";\nwindow.__CHANGELOG_MD__=${JSON.stringify(changelog)};`;
fs.mkdirSync('dist',{recursive:true});
fs.writeFileSync('dist/version.js', out);
