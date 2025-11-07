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

function braceDelta(src) {
  let open = 0, close = 0;
  let inSQ = false, inDQ = false, inBQ = false, inLC = false, inBC = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i], nx = src[i + 1];

    if (inLC) { if (ch === '\n') inLC = false; continue; }
    if (inBC) { if (ch === '*' && nx === '/') { inBC = false; i++; } continue; }

    if (inSQ) { if (ch === '\\') { i++; continue; } if (ch === "'") inSQ = false; continue; }
    if (inDQ) { if (ch === '\\') { i++; continue; } if (ch === '"') inDQ = false; continue; }
    if (inBQ) { if (ch === '\\') { i++; continue; } if (ch === '`') inBQ = false; continue; }

    if (ch === '/' && nx === '/') { inLC = true; i++; continue; }
    if (ch === '/' && nx === '*') { inBC = true; i++; continue; }

    if (ch === "'") { inSQ = true; continue; }
    if (ch === '"') { inDQ = true; continue; }
    if (ch === '`') { inBQ = true; continue; }

    if (ch === '{') open++;
    else if (ch === '}') close++;
  }
  return open - close; // >0 => missing '}', <0 => extra '}'
}

function stripTrailingClosers(src, n) {
  let i = src.length - 1, removed = 0;
  while (i >= 0 && /\s/.test(src[i])) i--;
  const start = i + 1;
  while (i >= 0 && removed < n) {
    if (src[i] === '}') { removed++; i--; while (i >= 0 && /\s/.test(src[i])) i--; }
    else break;
  }
  if (removed !== n) return null; // don't touch if extras aren’t only at EOF
  return src.slice(0, i + 1) + '\n';
}

async function processFile(file) {
  const code = await fs.readFile(file, 'utf8');
  const delta = braceDelta(code);
  if (delta === 0) return null;

  let next = code;
  if (delta > 0) next = code.trimEnd() + '\n' + '}'.repeat(delta) + '\n';
  else {
    const trimmed = stripTrailingClosers(code, -delta);
    if (!trimmed) return null;
    next = trimmed;
  }

  if (DRY) return { file, delta, dry: true };
  await fs.writeFile(file, next, 'utf8');
  return { file, delta, dry: false };
}

(async () => {
  const files = [
    ...(await walk(resolve(ROOT, 'app')).catch(() => [])),
    ...(await walk(resolve(ROOT, 'components')).catch(() => [])),
    ...(await walk(resolve(ROOT, 'modules')).catch(() => [])),
  ];
  let changed = 0;
  for (const f of files) {
    const res = await processFile(f);
    if (!res) continue;
    changed++;
    const action = res.delta > 0 ? `appended ${res.delta} }` : `removed ${-res.delta} }`;
    console.log((DRY ? 'would ' : '') + `fix ${f} (${action})`);
  }
  console.log(`Done. ${DRY ? 'Would fix' : 'Fixed'} ${changed} file(s).`);
})();
