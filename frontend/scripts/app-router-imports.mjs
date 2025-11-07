#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import path from 'node:path';

const DRY = process.argv.includes('--dry-run');
const cwd = process.cwd();

// For app/ files only: replace next/router -> next/navigation,
// add 'use client' if missing, ensure useRouter import,
// and log files that reference router.query (manual follow-up needed).
const files = await glob(['app/**/*.tsx'], { cwd, absolute: true, ignore: ['**/node_modules/**'] });

let changed = 0;
for (const f of files) {
  let src = await fs.readFile(f, 'utf8');
  const before = src;

  // Skip server files (heuristic): if "export const runtime = 'edge'|'nodejs'" or fetch in top-level server code,
  // we still allow client, but we won't force it. We'll always insert use client for safety if next/router used.
  const hadNextRouter = /from\s+['"]next\/router['"]/.test(src);

  if (!hadNextRouter) {
    // Still flag router.query usage even without explicit import (rare but possible via global or alias)
    if (/\brouter\.query\b/.test(src)) {
      console.log('note (router.query):', path.relative(cwd, f));
    }
    continue;
  }

  // Remove all imports from next/router
  src = src.replace(/^import\s+.*from\s+['"]next\/router['"];?\s*$/gm, '');

  // Ensure 'use client' directive at top if missing
  if (!/^\s*['"]use client['"];\s*/.test(src)) {
    src = `'use client';\n` + src;
  }

  // Ensure we import useRouter from next/navigation (avoid duplication)
  if (!/from\s+['"]next\/navigation['"]/.test(src)) {
    // Insert after first import (or after 'use client')
    const firstImport = src.match(/^import .*;$/m);
    if (firstImport) {
      const idx = firstImport.index + firstImport[0].length;
      src = src.slice(0, idx) + `\nimport { useRouter } from 'next/navigation';` + src.slice(idx);
    } else {
      // after 'use client'
      const lines = src.split('\n');
      if (lines[0].includes('use client')) {
        lines.splice(1, 0, `import { useRouter } from 'next/navigation';`);
        src = lines.join('\n');
      } else {
        src = `import { useRouter } from 'next/navigation';\n` + src;
      }
    }
  } else if (!/\buseRouter\b/.test(src)) {
    // If there is an import from next/navigation but not useRouter, add it
    src = src.replace(
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]next\/navigation['"];/,
      (m, inside) => {
        const names = inside.split(',').map(s => s.trim()).filter(Boolean);
        if (!names.includes('useRouter')) names.push('useRouter');
        return `import { ${names.join(', ')} } from 'next/navigation';`;
      }
    );
  }

  // Flag router.query usage for manual follow-up
  if (/\brouter\.query\b/.test(src) || /\bRouter\.query\b/.test(src)) {
    console.log('note (router.query):', path.relative(cwd, f));
  }

  // Replace Router.push(...) -> TODO + reminder to instantiate useRouter
  src = src.replace(/\bRouter\.push\(/g, match => {
    return `/* TODO: replace with const router = useRouter(); router.push(…) */ router.push(`;
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
