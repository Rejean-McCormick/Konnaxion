#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

const cwd = process.cwd();
const globs = [
  'components/**/*.tsx',
  'modules/**/*.tsx',
  'app/**/*.tsx',
  'pages/**/*.tsx',
];

const files = await glob(globs, { cwd, absolute: true, ignore: ['**/node_modules/**'] });
let changed = 0;

for (const file of files) {
  let src = await fs.readFile(file, 'utf8');

  // Only process if "Icon" is imported from 'antd'
  if (!/from ['"]antd['"]/.test(src) || !/{[^}]*\bIcon\b[^}]*}/.test(src)) continue;

  const before = src;

  // Remove "Icon" from the named import list from 'antd'
  src = src.replace(
    /import\s*{\s*([^}]*)\s*}\s*from\s*['"]antd['"];?/g,
    (m, inside) => {
      // Split by comma and filter out Icon
      const names = inside.split(',').map(s => s.trim()).filter(Boolean);
      const keep = names.filter(n => n !== 'Icon');
      if (keep.length === names.length) return m; // no Icon here
      if (keep.length === 0) return ''; // drop empty import
      return `import { ${keep.join(', ')} } from 'antd';`;
    }
  );

  // Ensure compat Icon default import exists
  if (!/from ['"]@\/components\/compat\/Icon['"]/.test(src)) {
    // insert after last import
    const lastImport = [...src.matchAll(/^import .*;$/gm)].pop();
    if (lastImport) {
      const idx = lastImport.index + lastImport[0].length;
      src = src.slice(0, idx) + `\nimport Icon from '@/components/compat/Icon';` + src.slice(idx);
    } else {
      src = `import Icon from '@/components/compat/Icon';\n` + src;
    }
  }

  if (src !== before) {
    await fs.writeFile(file, src, 'utf8');
    console.log('updated', path.relative(cwd, file));
    changed++;
  }
}

console.log(`Done. Updated ${changed} file(s).`);
