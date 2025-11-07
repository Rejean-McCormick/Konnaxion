#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import path from 'node:path';

const DRY = process.argv.includes('--dry-run');
const cwd = process.cwd();
const files = await glob('app/**/*.tsx', { cwd, absolute: true, ignore: ['**/node_modules/**'] });

let changed = 0, skipped = 0;
for (const f of files) {
  let src = await fs.readFile(f, 'utf8');
  const before = src;

  const m = src.match(/import\s+([^;]+)\s+from\s+['"]next\/router['"];?/);
  if (!m) continue;

  const clause = m[1];
  const hasDefault = /^[A-Za-z_$][\w$]*/.test(clause) && !clause.trim().startsWith('{');
  const hasWithRouter = /\bwithRouter\b/.test(clause);

  // Skip risky cases; print for manual follow-up
  if (hasDefault || hasWithRouter) {
    console.log('skip (manual):', path.relative(cwd, f));
    skipped++;
    continue;
  }

  // No default import; safe to retarget module path to next/navigation
  src = src.replace(/from\s+['"]next\/router['"];/, "from 'next/navigation';");

  if (src !== before) {
    changed++;
    if (DRY) console.log('would update', path.relative(cwd, f));
    else {
      await fs.writeFile(f, src, 'utf8');
      console.log('updated', path.relative(cwd, f));
    }
  }
}
console.log(`Done. ${DRY ? 'Would update' : 'Updated'} ${changed} file(s), skipped ${skipped}.`);
