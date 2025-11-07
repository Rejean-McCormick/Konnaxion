#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

const DRY = process.argv.includes('--dry-run');
const cwd = process.cwd();

// Heuristic: remove top-level blocks that start with a line containing only "("
// and end with a line containing ");" — the typical leftover from:
// Page.getLayout = (page) => (
//   <Layout>{page}</Layout>
// );
const files = await glob('app/**/page.tsx', { cwd, absolute: true, ignore: ['**/node_modules/**'] });
let changed = 0;

for (const file of files) {
  let src = await fs.readFile(file, 'utf8');
  const before = src;

  // Remove any orphan block of the form:
  //   (            // only "(" on the line
  //     ...        // any lines (likely JSX)
  //   );           // only ");" on the line
  // Do this repeatedly until none remain.
  const orphanBlock = /^\s*\(\s*\r?\n[\s\S]*?\r?\n^\s*\);\s*$/m;
  while (orphanBlock.test(src)) {
    src = src.replace(orphanBlock, '');
  }

  // Tidy up extra blank lines introduced
  src = src.replace(/\r?\n{3,}/g, '\n\n');

  if (src !== before) {
    changed++;
    if (DRY) {
      console.log('would update', path.relative(cwd, file));
    } else {
      await fs.writeFile(file, src, 'utf8');
      console.log('updated', path.relative(cwd, file));
    }
  }
}

console.log(`Done. ${DRY ? 'Would update' : 'Updated'} ${changed} file(s).`);
