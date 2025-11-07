#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import path from 'node:path';

const DRY = process.argv.includes('--dry-run');
const cwd = process.cwd();
const files = await glob(['app/**/*.tsx','modules/**/*.tsx','components/**/*.tsx'], { cwd, absolute: true, ignore: ['**/node_modules/**'] });

const methods = ['success','error','info','warning','open','loading','destroy','config'];
const methodsRe = methods.join('|'); // success|error|...

let changed = 0;
for (const f of files) {
  let src = await fs.readFile(f, 'utf8');
  const before = src;

  // If there is an antd import that includes "message", alias it.
  src = src.replace(
    /import\s*{\s*([^}]*)\bmessage\b([^}]*)}\s*from\s*['"]antd['"]\s*;?/g,
    (m, pre, post) => `import { ${pre}message as antdMessage${post} } from 'antd';`
  );

  // Replace only known antd methods: message.error(...) -> antdMessage.error(...)
  src = src.replace(
    new RegExp(`\\bmessage\\.(${methodsRe})\\b`, 'g'),
    'antdMessage.$1'
  );

  if (src !== before) {
    changed++;
    if (DRY) console.log('would update', path.relative(cwd, f));
    else { await fs.writeFile(f, src, 'utf8'); console.log('updated', path.relative(cwd, f)); }
  }
}
console.log(`Done. ${DRY ? 'Would update' : 'Updated'} ${changed} file(s).`);
