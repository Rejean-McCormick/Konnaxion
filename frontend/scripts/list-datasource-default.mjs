#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import path from 'node:path';

const DRY = process.argv.includes('--dry-run');
const cwd = process.cwd();
const files = await glob(['app/**/*.tsx','modules/**/*.tsx','components/**/*.tsx'], { cwd, absolute: true, ignore: ['**/node_modules/**'] });

function needsFallback(expr) {
  return !expr.includes('??') && !expr.includes('||') && !expr.trim().startsWith('[');
}

let changed = 0;
for (const f of files) {
  let src = await fs.readFile(f, 'utf8');
  const before = src;

  src = src.replace(
    /(<List\b[^>]*\bdataSource=\{)([^}]+)(\})/g,
    (m, pre, expr, post) => needsFallback(expr) ? `${pre}${expr} ?? []${post}` : m
  );

  if (src !== before) {
    changed++;
    if (DRY) console.log('would update', path.relative(cwd, f));
    else { await fs.writeFile(f, src, 'utf8'); console.log('updated', path.relative(cwd, f)); }
  }
}
console.log(`Done. ${DRY ? 'Would update' : 'Updated'} ${changed} file(s).`);
