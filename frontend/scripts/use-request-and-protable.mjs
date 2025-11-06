#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import path from 'node:path';

const dry = process.argv.includes('--dry-run');
const cwd = process.cwd();

const files = await glob('{app,components,modules}/**/*.tsx', { cwd, absolute: true, ignore: ['**/node_modules/**'] });
let changed = 0;

for (const file of files) {
  let src = await fs.readFile(file, 'utf8');
  const before = src;

  // A) useRequest inline services: return res.data -> return res
  // Pattern: useRequest<...>(async () => { const res = await X(); return res.data; })
  src = src.replace(
    /(useRequest<[^>]+>\s*\(\s*async\s*\(\s*\)\s*=>\s*{[^}]*?\bconst\s+res\s*=\s*await[^}]*?\breturn\s+)res\.data(\s*;?\s*}\s*\))/gs,
    '$1res$2'
  );

  // B) ProTable dataSource defaulting: data?.items -> data?.items ?? []
  // Only target ProTable JSX lines
  src = src.replace(
    /(<ProTable\b[^>]*\bdataSource=\{)data\?\.(\w+)\}([^>]*>)/g,
    '$1data?.$2 ?? []}$3'
  );
  // Also handle data.items
  src = src.replace(
    /(<ProTable\b[^>]*\bdataSource=\{)data\.(\w+)\}([^>]*>)/g,
    '$1data?.$2 ?? []}$3'
  );

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
