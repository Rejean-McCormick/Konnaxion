// scripts/generate-barrels.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODULES_DIR = path.join(ROOT, 'modules');

// helper — returns true for .ts/.tsx except index & test/story dirs
function isExportable(file) {
  const extOk = file.endsWith('.ts') || file.endsWith('.tsx');
  const base = path.basename(file);
  if (!extOk) return false;
  if (base === 'index.ts' || base === 'index.tsx') return false;
  if (file.includes('__tests__') || file.includes('__stories__') || file.includes('__mocks__'))
    return false;
  return true;
}

async function buildBarrel(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const exports = [];

  for (const entry of entries) {
    if (entry.isFile() && isExportable(entry.name)) {
      const baseName = entry.name.replace(/\.(tsx?|jsx?)$/, '');
      const symbol = baseName.replace(/[^a-zA-Z0-9_$]/g, '');
      exports.push(`export { default as ${symbol} } from './${baseName}';`);
    }
  }

  // nothing to export? leave empty file
  const barrelPath = path.join(dir, 'index.ts');
  await fs.writeFile(barrelPath, exports.join('\n') + '\n');
  return { barrelPath, count: exports.length };
}

(async () => {
  const modules = await fs.readdir(MODULES_DIR, { withFileTypes: true });
  const summaries = [];

  for (const mod of modules.filter((d) => d.isDirectory())) {
    for (const sub of ['components', 'hooks', 'pages']) {
      const targetDir = path.join(MODULES_DIR, mod.name, sub);
      try {
        const stat = await fs.stat(targetDir).catch(() => null);
        if (!stat) continue; // folder doesn't exist
        const res = await buildBarrel(targetDir);
        summaries.push(`${path.relative(ROOT, res.barrelPath)} \u2192 ${res.count} export(s)`);
      } catch (err) {
        console.error(`✖ Failed generating barrel for ${targetDir}`, err);
      }
    }
  }

  console.log('\nBarrel generation summary:');
  summaries.forEach((s) => console.log('•', s));
})();
