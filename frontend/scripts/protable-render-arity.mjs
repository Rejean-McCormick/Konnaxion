#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import path from 'node:path';

const DRY = process.argv.includes('--dry-run');
const cwd = process.cwd();
const files = await glob(['app/**/*.tsx', 'modules/**/*.tsx', 'components/**/*.tsx'], {
  cwd, absolute: true, ignore: ['**/node_modules/**']
});

let changed = 0;
for (const f of files) {
  let src = await fs.readFile(f, 'utf8');
  const before = src;

  // Case A: render: (value: T) => ...
  src = src.replace(
    /(\brender\s*:\s*)\(\s*([^)]+?)\s*\)\s*=>/g,
    (m, pre, params) => {
      // Skip if already multiple params
      if (params.includes(',')) return m;
      // Skip if empty or rest param
      const p = params.trim();
      if (!p || p.startsWith('...')) return m;
      return `${pre}(${p}, row, index, action) =>`;
    }
  );

  // Case B: render: value => ...
  src = src.replace(
    /(\brender\s*:\s*)([A-Za-z_$][\w$]*(?:\s*:\s*[^=,)]+)?)\s*=>/g,
    (m, pre, single) => `${pre}(${single}, row, index, action) =>`
  );

  if (src !== before) {
    changed++;
    if (DRY) console.log('would update', path.relative(cwd, f));
    else {
      await fs.writeFile(f, src, 'utf8');
      console.log('updated', path.relative(cwd, f));
    }
  }
}
console.log(`Done. ${DRY ? 'Would update' : 'Updated'} ${changed} file(s).`);
