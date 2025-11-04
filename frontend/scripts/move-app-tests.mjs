#!/usr/bin/env node
import { promises as fs } from 'fs';
import { join, relative, dirname } from 'path';
import { spawn } from 'child_process';

const ROOT = process.cwd();

// ---- flags ----
const argv = new Set(process.argv.slice(2));
const getArg = (name, def = null) => {
  const pref = `${name}=`;
  const a = [...argv].find(x => x.startsWith(pref));
  return a ? a.slice(pref.length) : def;
};
const DO_WRITE = argv.has('--write');
const USE_GIT  = argv.has('--git');
const SIBLING  = argv.has('--sibling');          // sinon vers tests/app/**
const REWRITE  = argv.has('--rewrite-imports');  // corrige "./index" -> "../page"
const SCAN     = argv.has('--scan');             // lister les matches puis quitter
const DEBUG    = argv.has('--debug');            // logs détaillés
const APPDIR_FLAG = getArg('--appdir');          // ex: --appdir=src/app

// ---- app dir autodetect ----
async function exists(p) { try { await fs.stat(p); return true; } catch { return false; } }
async function resolveAppDir() {
  const cands = APPDIR_FLAG ? [APPDIR_FLAG] : ['app', join('src','app'), join('apps','web','app')];
  for (const c of cands) {
    const abs = join(ROOT, c);
    if (await exists(abs)) return abs;
  }
  throw new Error(`app directory not found. Tried: ${cands.join(', ')}`);
}
const APP_DIR = await resolveAppDir();
const DEST_ROOT = join(ROOT, 'tests', 'app'); // destination par défaut (hors app)

function log(...a) { if (DEBUG) console.log('[debug]', ...a); }

// ---- fs utils ----
async function walk(dir, out = []) {
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.isFile()) out.push(p);
  }
  return out;
}

function toRelUnix(abs) { return relative(APP_DIR, abs).replace(/\\/g, '/'); }

function isIndexTestPage(abs) {
  const rel = toRelUnix(abs).toLowerCase();
  // doit contenir un segment "index.test" et se terminer par "/page.test.tsx"
  return rel.includes('/index.test/') && rel.endsWith('/page.test.tsx');
}

function computeDst(absSrc) {
  // relFromApp: ex "konnected/dashboard/index.test/page.test.tsx"
  const rel = toRelUnix(absSrc);
  const parts = rel.split('/');
  const idx = parts.lastIndexOf('index.test');
  if (idx < 0 || parts[parts.length - 1].toLowerCase() !== 'page.test.tsx') return null;

  // Chemin du dossier de la page (sans 'index.test')
  const routeParts = parts.slice(0, idx);
  const dstDir = SIBLING
    ? join(APP_DIR, ...routeParts, '__tests__')     // app/.../__tests__/page.test.tsx
    : join(DEST_ROOT, ...routeParts);               // tests/app/.../page.test.tsx
  const dst = join(dstDir, 'page.test.tsx');
  return { dstDir, dst, rel };
}

async function ensureDir(p) { await fs.mkdir(p, { recursive: true }); }

function exec(cmd, args, opts = {}) {
  return new Promise((res, rej) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...opts });
    child.on('exit', code => (code === 0 ? res() : rej(new Error(`${cmd} ${args.join(' ')} -> ${code}`))));
  });
}

async function pathExists(p) { try { await fs.access(p); return true; } catch { return false; } }

async function cleanupIfEmpty(dir) {
  try {
    const items = await fs.readdir(dir);
    if (items.length === 0) await fs.rmdir(dir);
  } catch { /* ignore */ }
}

async function rewriteImports(file) {
  // Corrige "./index" ou "./index.tsx" -> "../page"
  try {
    const txt = await fs.readFile(file, 'utf8');
    const next = txt
      .replace(/from\s+['"]\.\/index(?:\.tsx)?['"]/g, "from '../page'")
      .replace(/require\(['"]\.\/index(?:\.tsx)?['"]\)/g, "require('../page')");
    if (next !== txt) await fs.writeFile(file, next, 'utf8');
  } catch (e) {
    console.warn('rewrite failed:', file, e.message);
  }
}

(async () => {
  console.log(`APP_DIR: ${APP_DIR}`);
  const all = await walk(APP_DIR);
  log(`scanned files: ${all.length}`);

  const matches = all.filter(isIndexTestPage);
  console.log(`Found ${matches.length} test files.`);

  if (SCAN) {
    matches.slice(0, 200).forEach(p => console.log(' -', toRelUnix(p)));
    if (matches.length > 200) console.log(` ... and ${matches.length - 200} more`);
    return;
  }

  for (const src of matches) {
    const plan = computeDst(src);
    if (!plan) { console.warn('skip (no index.test in path):', src); continue; }

    const { dstDir, dst, rel } = plan;
    const dstRel = relative(ROOT, dst).replace(/\\/g, '/');

    if (!DO_WRITE) {
      console.log(`[dry-run] ${rel} -> ${dstRel}`);
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

    // Nettoyage éventuel du dossier index.test si vide
    await cleanupIfEmpty(dirname(src));

    if (REWRITE) await rewriteImports(dst);

    console.log(`moved: ${rel} -> ${dstRel}`);
  }
})();
