#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import path from 'node:path';

const DRY = process.argv.includes('--dry-run');
const cwd = process.cwd();
const files = await glob(['app/**/*.tsx','modules/**/*.tsx','components/**/*.tsx'], { cwd, absolute: true, ignore: ['**/node_modules/**'] });

let changed = 0;
for (const f of files) {
  let src = await fs.readFile(f, 'utf8');
  const before = src;

  // <Statistic.Countdown value={dayjs(expr)} ...> -> value={dayjs(expr).valueOf()}
  src = src.replace(
    /(<Statistic\.Countdown\b[^>]*\bvalue=\{\s*)dayjs\(([^}]+?)\)(\s*\})/g,
    '$1dayjs($2).valueOf()$3'
  );

  if (src !== before) {
    changed++;
    if (DRY) console.log('would update', path.relative(cwd, f));
    else { await fs.writeFile(f, src, 'utf8'); console.log('updated', path.relative(cwd, f)); }
  }
}
console.log(`Done. ${DRY ? 'Would update' : 'Updated'} ${changed} file(s).`);
