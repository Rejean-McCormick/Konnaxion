#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import path from 'node:path';

const dry = process.argv.includes('--dry-run');
const cwd = process.cwd();

// Scan only app pages
const files = await glob('app/**/page.tsx', { cwd, absolute: true, ignore: ['**/node_modules/**'] });
let changed = 0;

for (const file of files) {
  let src = await fs.readFile(file, 'utf8');
  const before = src;

  // 1) Remove any remaining single-line getLayout statements
  src = src.replace(/^[ \t]*[A-Za-z0-9_$]+\s*\.getLayout\s*=\s*.*?;[ \t]*\r?\n?/gm, '');

  // 2) Remove multi-line getLayout blocks:
  //    Component.getLayout = (page) => { ... }
  //    or Component.getLayout = page => (<Layout>...</Layout>);
  //    We remove from ".getLayout =" up to the first semicolon that ends the statement.
  src = src.replace(
    /[ \t]*[A-Za-z0-9_$]+\s*\.getLayout\s*=\s*[\s\S]*?;\s*\r?\n?/gm,
    ''
  );

  // 3) If our earlier regex left an orphan "};" on its own line, drop it
  src = src.replace(/^[ \t]*};[ \t]*\r?\n?/gm, '');

  // 4) Collapse extra blank lines
  src = src.replace(/\n{3,}/g, '\n\n');

  if (src !== before) {
    changed++;
    if (dry) {
      console.log('would update', path.relative(cwd, file));
    } else {
      await fs.writeFile(file, src, 'utf8');
      console.log('updated', path.relative(cwd, file));
    }
  }
}

console.log(`Done. ${dry ? 'Would update' : 'Updated'} ${changed} file(s).`);
