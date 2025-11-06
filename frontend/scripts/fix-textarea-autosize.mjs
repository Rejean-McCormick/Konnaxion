#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import path from 'node:path';

const dry = process.argv.includes('--dry-run');
const cwd = process.cwd();

const files = await glob('{app,components,modules,pages}/**/*.tsx', { cwd, absolute: true, ignore: ['**/node_modules/**'] });
let changed = 0;

for (const file of files) {
  let src = await fs.readFile(file, 'utf8');
  const before = src;

  // <TextArea autosize=...> or <Input.TextArea autosize=...>
  src = src.replace(/(<(?:Input\.)?TextArea\b[^>]*?)\bautosize=/g, '$1autoSize=');
  // boolean prop form: <TextArea autosize>
  src = src.replace(/(<(?:Input\.)?TextArea\b[^>]*?)\bautosize(\s*[> ])/g, '$1autoSize$2');

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
