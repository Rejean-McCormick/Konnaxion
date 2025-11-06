#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import path from 'node:path';

const DRY = process.argv.includes('--dry-run');
const cwd = process.cwd();

// Conservative text transforms aimed at inline services passed to useRequest.
// 1) "return (await something).data"  -> "return await something"
// 2) "return res.data"                -> "return res"
const files = await glob(['app/**/*.tsx', 'modules/**/*.tsx', 'components/**/*.tsx'], {
  cwd, absolute: true, ignore: ['**/node_modules/**']
});

let changed = 0;
for (const f of files) {
  let src = await fs.readFile(f, 'utf8');
  const before = src;

  // Only touch files that reference useRequest
  if (!src.includes('useRequest')) continue;

  // 1) return (await X()).data -> return await X()
  src = src.replace(
    /return\s+\(\s*await\s+([^)]+?)\s*\)\.data\b/g,
    'return await $1'
  );

  // 2) return res.data -> return res
  // Keep it generic but only inside arrow bodies; safe optimization overall.
  src = src.replace(
    /return\s+([A-Za-z_$][\w$]*)\.data\b/g,
    'return $1'
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
