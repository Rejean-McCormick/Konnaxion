#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { resolve, join } from 'node:path';

const DRY = process.argv.includes('--dry-run');
const ROOT = process.cwd();
const SKIP_DIRS = new Set(['node_modules', '.next', '.git']);

async function walk(dir) {
  const out = [];
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (/\.(tsx?|jsx?)$/.test(e.name)) out.push(full);
  }
  return out;
}

function patch(code) {
  let changed = false;
  // Collapse "message as antdMessage as antdMessage" -> "message as antdMessage"
  let s = code.replace(
    /message\s+as\s+antdMessage(?:\s+as\s+antdMessage)+/g,
    () => { changed = true; return 'message as antdMessage'; }
  );

  // If the same import also contains a bare "message", drop the bare one.
  s = s.replace(/import\s*\{\s*([^}]+)\}\s*from\s*['"]antd['"];/g, (full, inner) => {
    const parts = inner.split(',').map(p => p.trim()).filter(Boolean);
    const hasAlias = parts.some(p => /^message\s+as\s+antdMessage$/.test(p));
    if (!hasAlias) return full;
    const filtered = parts.filter(p => p !== 'message');
    if (filtered.length !== parts.length) changed = true;
    return `import { ${filtered.join(', ')} } from 'antd';`;
  });

  return { code: s, changed };
}

(async () => {
  const files = [
    ...(await walk(resolve(ROOT, 'components')).catch(() => [])),
    ...(await walk(resolve(ROOT, 'app')).catch(() => [])),
  ];
  let n = 0;
  for (const f of files) {
    const src = await fs.readFile(f, 'utf8');
    const { code, changed } = patch(src);
    if (!changed) continue;
    n++;
    if (!DRY) await fs.writeFile(f, code, 'utf8');
    console.log((DRY ? 'would update ' : 'updated ') + f);
  }
  console.log(`Done. ${DRY ? 'Would update' : 'Updated'} ${n} file(s).`);
})();
