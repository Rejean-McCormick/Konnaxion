#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import path from 'node:path';

const DRY = process.argv.includes('--dry-run');
const cwd = process.cwd();

const files = await glob(['app/**/*.tsx', 'modules/**/*.tsx', 'components/**/*.tsx'], {
  cwd, absolute: true, ignore: ['**/node_modules/**']
});

function stripRows(optionBlock) {
  // Remove "rows: <number>" with optional leading/trailing comma and spaces
  let s = optionBlock
    .replace(/(^|,)\s*rows\s*:\s*\d+\s*(?=,|$)/g, (m, lead) => lead ? lead : '');
  // Clean up accidental ", ,"
  s = s.replace(/,\s*,/g, ',').replace(/^{\s*,/, '{').replace(/,\s*}$/, '}');
  return s;
}

let changed = 0;
for (const f of files) {
  let src = await fs.readFile(f, 'utf8');
  const before = src;

  // Replace inside ellipsis={{ ... }}
  src = src.replace(/ellipsis=\{\{([\s\S]*?)\}\}/g, (m, inner) => {
    const stripped = stripRows(inner);
    return stripped === inner ? m : `ellipsis={{${stripped}}}`;
  });

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
