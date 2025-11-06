#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

const cwd = process.cwd();
const patterns = [
  'app/api/**/auth/**/route.ts',
  'app/api/**/-auth/**/route.ts',
  'app/api/auth/[auth0]/route.ts',
];

const files = await glob(patterns, { cwd, absolute: true, ignore: ['**/node_modules/**'] });
let removed = 0;

for (const file of files) {
  let src = '';
  try { src = await fs.readFile(file, 'utf8'); } catch {}
  if (!src) continue;

  const touchesAuth0 = /@auth0\/nextjs-auth0/.test(src);
  const usesV3API = /\bhandle(Auth|Callback|Login|Logout|Profile)\b/.test(src);

  if (touchesAuth0 && usesV3API) {
    await fs.rm(file, { force: true });
    console.log('removed', path.relative(cwd, file));
    removed++;
  }
}

console.log(`Done. Removed ${removed} file(s).`);
