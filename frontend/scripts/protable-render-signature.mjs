#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import path from 'node:path';

const DRY = process.argv.includes('--dry-run');
const cwd = process.cwd();

// Adds a second param `row` to arrow render functions that currently have one param.
// Also removes any explicit type annotation on the first param to avoid TS mismatches.
// Example: render: (v: number) => ...  -> render: (v, row) => ...
//          render: (value) => ...      -> render: (value, row) => ...
const files = await glob(['app/**/*.tsx', 'components/**/*.tsx', 'modules/**/*.tsx'], {
  cwd, absolute: true, ignore: ['**/node_modules/**']
});

let changed = 0;
for (const f of files) {
  let src = await fs.readFile(f, 'utf8');
  const before = src;

  // Only touch lines with "render:" followed by an arrow function with exactly one param
  // 1) strip explicit type annotation on first param in `render: (x: Something) =>`
  src = src.replace(
    /(\brender\s*:\s*\(\s*)([A-Za-z_$][\w$]*)\s*:\s*[^,)]+?(\s*\)\s*=>)/g,
    '$1$2$3'
  );

  // 2) add second param "row" when there is only one param
  //    render: (param) =>    -> render: (param, row) =>
  // Skip cases where there is already a comma in the param list.
  src = src.replace(
    /(\brender\s*:\s*\(\s*)([A-Za-z_$][\w$]*)(\s*\)\s*=>)/g,
    (m, pre, p1, post) => {
      // If there is a comma inside the parentheses, leave it.
      if (/\brender\s*:\s*\([^,()]+,[^()]*\)\s*=>/.test(m)) return m;
      return `${pre}${p1}, row${post}`;
    }
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
