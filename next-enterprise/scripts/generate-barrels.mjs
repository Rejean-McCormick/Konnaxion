// scripts/fill-barrels.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modulesDir = path.join(root, 'modules');

// helper: exportable file?
function isTsx(file) {
  return /\.(tsx?|jsx?)$/.test(file) && !file.endsWith('index.ts') && !file.includes('__');
}

async function listExports(dir) {
  const files = await fs.readdir(dir);
  return files
    .filter(isTsx)
    .map((f) => {
      const base = f.replace(/\.(tsx?|jsx?)$/, '');
      const symbol = base.replace(/[^a-zA-Z0-9_$]/g, '');
      return `export { default as ${symbol} } from './${base}';`;
    });
}

async function processBarrel(subDir) {
  try {
    const exports = await listExports(subDir);
    const barrelPath = path.join(subDir, 'index.ts');
    await fs.writeFile(barrelPath, exports.join('\n') + '\n');
    return { barrelPath, count: exports.length };
  } catch {
    return null;
  }
}

(async () => {
  const mods = await fs.readdir(modulesDir);
  const summary = [];

  for (const m of mods) {
    for (const part of ['components', 'hooks']) {          // add 'pages' if desired
      const dir = path.join(modulesDir, m, part);
      try {
        const stat = await fs.stat(dir).catch(() => null);
        if (!stat?.isDirectory()) continue;
        const res = await processBarrel(dir);
        if (res) summary.push(`${path.relative(root, res.barrelPath)} → ${res.count} export(s)`);
      } catch {}
    }
  }

  console.log('\nBarrels written:\n' + summary.map((s) => '• ' + s).join('\n'));
})();
