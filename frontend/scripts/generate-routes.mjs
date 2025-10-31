#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Generate Next.js App Router re-export pages from modules.
 * Usage: node scripts/generate-routes.mjs [--modulesDir modules] [--appDir app]
 *
 * It scans for all "page.tsx" files inside modulesDir
 * (excluding any "index.test" folder and any "components" subtree)
 * and creates corresponding re-export files under appDir.
 */
const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : fallback;
};
const modulesDir = getArg('--modulesDir', 'modules');
const appDir = getArg('--appDir', 'app');

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function walk(dir) {
  const out = [];
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of ents) {
    const full = path.join(dir, ent.name);
    if (full.includes(`${path.sep}index.test${path.sep}`)) continue;
    if (ent.isDirectory()) {
      if (full.includes(`${path.sep}components${path.sep}`)) continue;
      out.push(...await walk(full));
    } else if (ent.isFile() && ent.name === 'page.tsx') {
      out.push(full);
    }
  }
  return out;
}

function toRoute(modPageFile) {
  const dirOfPage = path.dirname(modPageFile);
  const rel = path.relative(modulesDir, dirOfPage);
  const routePath = rel.split(path.sep).join('/');
  const importPath = `@/modules/${routePath}/page`;
  return { routePath, importPath };
}

async function main() {
  if (!await exists(modulesDir)) {
    console.error(`[generate-routes] modulesDir not found: ${modulesDir}`);
    process.exit(1);
  }
  await fs.mkdir(appDir, { recursive: true });

  const pages = await walk(modulesDir);
  const created = [];
  for (const p of pages) {
    const { routePath, importPath } = toRoute(p);
    const targetDir = path.join(appDir, routePath);
    const targetFile = path.join(targetDir, 'page.tsx');
    await fs.mkdir(targetDir, { recursive: true });
    if (!await exists(targetFile)) {
      const content = `// Auto-generated — do not edit\nexport { default } from '${importPath}';\n`;
      await fs.writeFile(targetFile, content, 'utf8');
      created.push(`${routePath}/page.tsx`);
    }
  }
  console.log(`[generate-routes] Created ${created.length} route file(s).`);
  created.slice(0, 20).forEach(f => console.log(' -', f));
  if (created.length > 20) console.log(` ... and ${created.length - 20} more`);
}
main().catch(err => { console.error(err); process.exit(1); });
