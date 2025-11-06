#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import path from 'node:path';

const dry = process.argv.includes('--dry-run');
const cwd = process.cwd();

const files = await glob('app/**/page.tsx', { cwd, absolute: true, ignore: ['**/node_modules/**'] });
let changed = 0;

for (const file of files) {
  const src = await fs.readFile(file, 'utf8');
  const next = src
    // remove lines like: Page.getLayout = (...) => ...
    .replace(/^[^\n]*\.getLayout\s*=\s*.*$/gm, '')
    // collapse consecutive empty lines
    .replace(/\n{3,}/g, '\n\n');

  if (next !== src) {
    changed++;
    if (dry) {
      console.log('would update', path.relative(cwd, file));
    } else {
      await fs.writeFile(file, next, 'utf8');
      console.log('updated', path.relative(cwd, file));
    }
  }
}

console.log(`Done. ${dry ? 'Would update' : 'Updated'} ${changed} file(s).`);
