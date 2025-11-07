import { promises as fs } from 'node:fs';
import { join, resolve } from 'node:path';

const DRY = process.argv.includes('--dry-run');
const root = resolve('.');

// very light strip of comments/strings to reduce false counts
function stripNoise(code) {
  return code
    // template strings
    .replace(/`(?:\\[\s\S]|[^`])*`/g, '')
    // block comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // line comments
    .replace(/\/\/[^\n]*$/gm, '')
    // quoted strings
    .replace(/"(?:\\.|[^"\n])*"|'(?:\\.|[^'\n])*'/g, '');
}

function balance(code) {
  const clean = stripNoise(code);

  const count = (s, ch) => (s.match(new RegExp(`\\${ch}`, 'g')) || []).length;

  let needParen = count(clean, '(') - count(clean, ')');
  let needCurly = count(clean, '{') - count(clean, '}');

  // Only fix files that end in the middle of a component/return
  if (needParen <= 0 && needCurly <= 0) return null;

  let patch = '';
  if (needParen > 0) patch += ')'.repeat(needParen);
  if (needCurly > 0) patch += '}'.repeat(needCurly);
  // common pattern: return ( ... )  ; ensure semicolon/newline
  patch += '\n';

  return code.endsWith('\n') ? patch : '\n' + patch;
}

async function* walk(dir) {
  for (const d of await fs.readdir(dir, { withFileTypes: true })) {
    const p = join(dir, d.name);
    if (d.isDirectory()) {
      if (['node_modules', '.next', 'coverage'].includes(d.name)) continue;
      yield* walk(p);
    } else if (
      /\.(tsx)$/.test(d.name) &&
      !/\.test\./.test(d.name) &&
      (p.includes(`${join('app', '')}`) || p.includes(`${join('modules', '')}`) || p.includes(`${join('components', '')}`))
    ) {
      yield p;
    }
  }
}

let touched = 0;
for await (const file of walk(root)) {
  const src = await fs.readFile(file, 'utf8');
  const add = balance(src);
  if (add) {
    if (DRY) {
      console.log('would append balance to', file, JSON.stringify(add));
    } else {
      await fs.appendFile(file, add, 'utf8');
      console.log('balanced', file);
    }
    touched++;
  }
}
console.log(`Done. ${DRY ? 'Would balance' : 'Balanced'} ${touched} file(s).`);
