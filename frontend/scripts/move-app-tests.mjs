#!/usr/bin/env node
import { promises as fs } from 'fs';
import { join, relative, dirname, sep } from 'path';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const APP_DIR = join(ROOT, 'app');
const DEST_ROOT = join(ROOT, 'tests', 'app'); // destination par défaut (hors app)

const argv = new Set(process.argv.slice(2));
const DO_WRITE = argv.has('--write');
const USE_GIT  = argv.has('--git');
const SIBLING  = argv.has('--sibling');          // sinon vers tests/app/**
const REWRITE  = argv.has('--rewrite-imports');  // facultatif, off par défaut

async function walk(dir, out = []) {
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.isFile()) out.push(p);
  }
  return out;
}

function toPosix(p) { return p.split(sep).join('/'); }

function computeDst(absSrc) {
  // relFromApp: ex "ekoh/dashboard/index.test/page.test.tsx"
  const relFromApp = relative(APP_DIR, absSrc);
  const parts = relFromApp.split(sep);
  const idx = parts.lastIndexOf('index.test');
  if (idx < 0) return null;

  // Chemin du dossier de la page (sans 'index.test')
  const routeParts = parts.slice(0, idx);
  const dstDir = SIBLING
    ? join(APP_DIR, ...routeParts, '__tests__')     // app/.../__tests__/page.test.tsx
    : join(DEST_ROOT, ...routeParts);               // tests/app/.../page.test.tsx

  const dst = join(dstDir, 'page.test.tsx');
  return { dstDir, dst };
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

function exec(cmd, args, opts = {}) {
  return new Promise((res, rej) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...opts });
    child.on('exit', code => (code === 0 ? res() : rej(new Error(`${cmd} ${args.join(' ')} → ${code}`))));
  });
}

async function pathExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function rewriteImports(file) {
  // Heuristique minimale: "./index" -> "../page"
  try {
    let txt = await fs.readFile(file, 'utf8');
    const next = txt.replace(/from\s+['"]\.\/index['"]/g, "from '../page'");
    if (next !== txt) await fs.writeFile(file, next, 'utf8');
  } catch (e) {
    console.warn('rewrite failed:', toPosix(relative(ROOT, file)), e.message);
  }
}

(async () => {
  const all = await walk(APP_DIR);
  const matches = all.filter(p => p.endsWith(`${sep}index.test${sep}page.test.tsx`));

  console.log(`Found ${matches.length} test files.`);
  for (const src of matches) {
    const plan = computeDst(src);
    if (!plan) { console.warn('skip (no index.test in path):', src); continue; }

    const { dstDir, dst } = plan;
    const srcRel = toPosix(relative(ROOT, src));
    const dstRel = toPosix(relative(ROOT, dst));

    if (!DO_WRITE) {
      console.log(`[dry-run] ${srcRel} -> ${dstRel}`);
      continue;
    }

    await ensureDir(dstDir);
    if (await pathExists(dst)) {
      console.warn(`skip (exists): ${dstRel}`);
      continue;
    }

    if (USE_GIT) {
      await exec('git', ['mv', src, dst]);
    } else {
      await fs.rename(src, dst);
    }

    // Nettoyage du dossier index.test s'il est vide
    const srcDir = dirname(src);
    try { await fs.rm(srcDir, { recursive: false }); } catch { /* ignore if not empty */ }

    if (REWRITE) await rewriteImports(dst);

    console.log(`moved: ${srcRel} -> ${dstRel}`);
  }
})();
