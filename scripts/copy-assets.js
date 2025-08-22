// Copy static assets (including sample eplusout.sql) into dist
// No external deps to keep it simple
const fs = require('fs');
const path = require('path');

const root = __dirname ? path.resolve(__dirname, '..') : process.cwd();
const srcDir = path.join(root, 'assets');
const outDir = path.join(root, 'dist');

function copyRecursive(src, dst) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dst, entry);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

copyRecursive(srcDir, outDir);
console.log(`[assets] copied from ${path.relative(root, srcDir)} to ${path.relative(root, outDir)}`);
