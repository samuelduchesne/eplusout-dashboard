// Copy static assets (including sample eplusout.sql) into dist
// No external deps to keep it simple
const fs = require('fs');
const path = require('path');

const root = __dirname ? path.resolve(__dirname, '..') : process.cwd();
const srcDir = path.join(root, 'assets');
const outDir = path.join(root, 'dist');
const vendorOut = path.join(outDir, 'vendor');

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

// Vendor libraries (local copies for offline use)
function copyIfExists(src, dst) {
  try {
    if (fs.existsSync(src)) {
      const dir = path.dirname(dst);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(src, dst);
      return true;
    }
  } catch {}
  return false;
}

const sqlJsDir = path.join(root, 'node_modules', 'sql.js', 'dist');
const d3Dir = path.join(root, 'node_modules', 'd3', 'dist');

const copied = [];
if (copyIfExists(path.join(sqlJsDir, 'sql-wasm.js'), path.join(vendorOut, 'sql-wasm.js')))
  copied.push('sql-wasm.js');
if (copyIfExists(path.join(sqlJsDir, 'sql-wasm.wasm'), path.join(vendorOut, 'sql-wasm.wasm')))
  copied.push('sql-wasm.wasm');
if (copyIfExists(path.join(d3Dir, 'd3.min.js'), path.join(vendorOut, 'd3.min.js')))
  copied.push('d3.min.js');

if (copied.length) {
  console.log(`[vendor] copied to ${path.relative(root, vendorOut)}: ${copied.join(', ')}`);
} else {
  console.warn('[vendor] no vendor files copied (ensure dependencies are installed)');
}
