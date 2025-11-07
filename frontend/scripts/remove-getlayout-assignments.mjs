#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import path from 'node:path';

const DRY = process.argv.includes('--dry-run');
const cwd = process.cwd();

/*
Removes any of the following patterns at top level:

Component.getLayout = (page) => <MainLayout>{page}</MainLayout>;
Component.getLayout = (page) => (
  <MainLayout>{page}</MainLayout>
);
SomeName.getLayout=(p)=>(
  <Something>{p}</Something>
);

We match from ".getLayout =" through the first semicolon that closes it,
allowing for balanced parentheses and newlines in between.
*/
const files = await glob('app/**/page.tsx', { cwd, absolute: true, ignore: ['**/node_modules/**'] });
let changed = 0;

for (const file of files) {
  let src = await fs.readFile(file, 'utf8');
  const before = src;

  // 1) Remove single-line assignments that return inline JSX without parentheses
  //    e.g. Foo.getLayout = (page) => <Layout>{page}</Layout>;
  src = src.replace(
    /^[^\S\r\n]*[A-Za-z0-9_$]+\.getLayout\s*=\s*\([^)]*\)\s*=>\s*<[\s\S]*?>\s*;\s*$/gm,
    ''
  );

  // 2) Remove multi-line assignments that return a parenthesized JSX block
  //    e.g.
  //    Foo.getLayout = (page) => (
  //      <Layout>{page}</Layout>
  //    );
  //    Use a conservative non-greedy match up to the next ");"
  src = src.replace(
    /[^\S\r\n]*[A-Za-z0-9_$]+\.getLayout\s*=\s*\([^)]*\)\s*=>\s*\(\s*[\s\S]*?\s*\);\s*/g,
    ''
  );

  // Tidy extra blank lines
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
