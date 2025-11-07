#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import path from 'node:path';

const cwd = process.cwd();
const files = await glob('app/**/*.tsx', { cwd, absolute: true, ignore: ['**/node_modules/**'] });

const hits = [];
for (const f of files) {
  const src = await fs.readFile(f, 'utf8');
  const issues = [];
  if (/from\s+['"]next\/router['"]/.test(src)) issues.push("import 'next/router'");
  if (/router\.query\./.test(src)) issues.push('router.query');
  if (/\bRouter\./.test(src)) issues.push('Router.default');
  if (issues.length) hits.push([path.relative(cwd, f), issues]);
}

if (!hits.length) {
  console.log('No router issues found under app/.');
} else {
  for (const [file, issues] of hits) {
    console.log(file, '->', issues.join(', '));
  }
  console.log(`Found ${hits.length} file(s) with router patterns to fix.`);
}
