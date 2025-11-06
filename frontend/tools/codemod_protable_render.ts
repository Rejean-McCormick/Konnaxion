#!/usr/bin/env ts-node
// Codemod ProTable: normalise render(...) vers render(dom, entity, index, action, schema)
// Sûr par défaut: rebinde l'ancien "v" à row[dataIndex] seulement si dataIndex est littéral.
// Dépendances: ts-morph, ts-node, typescript
// Exemples d'exécution:
//   pnpm ts-node tools/codemod_protable_render.ts --include "app/**/*.tsx,modules/**/*.tsx,components/**/*.tsx" --dry
//   pnpm ts-node tools/codemod_protable_render.ts --include "app/**/*.tsx,modules/**/*.tsx,components/**/*.tsx" --apply
// Option tsconfig si besoin:
//   --tsconfig apps/frontend/tsconfig.json

import {
  Project,
  SyntaxKind,
  Node,
  ObjectLiteralExpression,
  ArrowFunction,
  FunctionExpression,
  PropertyAssignment,
  Block,
} from 'ts-morph';
import * as fs from 'fs';

type Options = {
  dry: boolean;
  apply: boolean;
  include: string[];
  exclude: string[];
  tsconfig?: string;
};

type Note = { file: string; line: number; message: string };

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const opts: Options = { dry: true, apply: false, include: [], exclude: [], tsconfig: undefined };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dry') opts.dry = true;
    else if (a === '--apply') {
      opts.apply = true;
      opts.dry = false;
    } else if (a === '--tsconfig') {
      const next = args[i + 1];
      if (next) { opts.tsconfig = next; i++; }
    } else if (a === '--include') {
      const next = args[i + 1];
      if (next) {
        opts.include = next.split(',').map((s) => s.trim()).filter(Boolean);
        i++;
      }
    } else if (a === '--exclude') {
      const next = args[i + 1];
      if (next) {
        opts.exclude = next.split(',').map((s) => s.trim()).filter(Boolean);
        i++;
      }
    }
  }
  if (opts.include.length === 0) {
    opts.include = ['app/**/*.tsx', 'modules/**/*.tsx', 'components/**/*.tsx'];
  }
  if (opts.exclude.length === 0) {
    opts.exclude = ['**/node_modules/**', '**/.next/**', '**/*.d.ts'];
  }
  return opts;
}

function hasProp(obj: ObjectLiteralExpression, name: string) {
  return !!obj.getProperty(name);
}

function getProp(obj: ObjectLiteralExpression, name: string): PropertyAssignment | undefined {
  const p = obj.getProperty(name);
  if (!p) return undefined;
  return Node.isPropertyAssignment(p) ? p : undefined;
}

function getStringLiteralValue(pa: PropertyAssignment): string | undefined {
  const init = pa.getInitializer();
  if (!init) return undefined;
  if (Node.isStringLiteral(init)) return init.getLiteralText();
  return undefined;
}

function getArrayOfStringLiterals(pa: PropertyAssignment): string[] | undefined {
  const init = pa.getInitializer();
  if (!init || !Node.isArrayLiteralExpression(init)) return undefined;
  const parts: string[] = [];
  for (const el of init.getElements()) {
    if (Node.isStringLiteral(el)) parts.push(el.getLiteralText());
    else return undefined;
  }
  return parts;
}

function buildAccess(rowName: string, pathParts: string[]): string {
  if (pathParts.length === 0) return rowName;
  const dotSafe = pathParts.every((p) => /^[A-Za-z_$][\w$]*$/.test(p));
  if (dotSafe) return rowName + '?.' + pathParts.join('?.');
  return pathParts.reduce((acc, seg) => acc + `[${JSON.stringify(seg)}]`, rowName);
}

function idUsedIn(fn: ArrowFunction | FunctionExpression, name: string): boolean {
  const body = fn.getBody();
  const ids = body.getDescendantsOfKind(SyntaxKind.Identifier);
  return ids.some((id) => id.getText() === name);
}

function ensureBlockBody(fn: ArrowFunction | FunctionExpression): Block {
  const body = fn.getBody();
  if (!Node.isBlock(body)) {
    const expr = body.getText();
    fn.setBodyText((w) => {
      w.writeLine('{');
      w.writeLine(`  return ${expr};`);
      w.writeLine('}');
    });
  }
  const newBody = fn.getBody();
  if (Node.isBlock(newBody)) return newBody;
  // Fallback ultra conservateur
  fn.setBodyText((w) => { w.writeLine('{'); w.writeLine('  return null;'); w.writeLine('}'); });
  return fn.getBody() as Block;
}

function ensureParams(fn: ArrowFunction | FunctionExpression, names: { dom: string; row: string }) {
  for (const p of fn.getParameters()) p.remove();
  fn.addParameter({ name: names.dom });
  fn.addParameter({ name: names.row });
  fn.addParameter({ name: 'index' });
  fn.addParameter({ name: 'action' });
  fn.addParameter({ name: 'schema' });
}

function renameFirstParamOnly(fn: ArrowFunction | FunctionExpression, newName: string) {
  const ps = fn.getParameters();
  if (ps.length === 0) return;
  ps[0].rename(newName);
  if (ps.length === 1) fn.addParameter({ name: 'row' });
  const names = ['index', 'action', 'schema'];
  while (fn.getParameters().length < 5) {
    const next = names[fn.getParameters().length - 2] ?? 'index';
    fn.addParameter({ name: next });
  }
}

function addHoistedValueVar(fn: ArrowFunction | FunctionExpression, varName: string, exprText: string) {
  const body = fn.getBody();
  if (!Node.isBlock(body)) return;
  const stmts = body.getStatements();
  const decl = `const ${varName} = ${exprText};`;
  if (stmts.length > 0) body.insertStatements(0, decl);
  else body.addStatements(decl);
}

function isLikelyColumnObject(obj: ObjectLiteralExpression): boolean {
  if (!hasProp(obj, 'render')) return false;
  if (hasProp(obj, 'dataIndex') || hasProp(obj, 'title') || hasProp(obj, 'valueType') || hasProp(obj, 'valueEnum')) {
    return true;
  }
  return false;
}

const opts = parseArgs();

const tsconfig =
  opts.tsconfig && fs.existsSync(opts.tsconfig)
    ? opts.tsconfig
    : fs.existsSync('tsconfig.json')
    ? 'tsconfig.json'
    : undefined;

const project = new Project(
  tsconfig ? { tsConfigFilePath: tsconfig } : { useInMemoryFileSystem: false, skipAddingFilesFromTsConfig: true }
);

// Ajoute les fichiers
for (const pattern of opts.include) {
  project.addSourceFilesAtPaths(pattern);
}

// Exclusions simples (chemin contient le fragment)
const files = project.getSourceFiles().filter((sf) => {
  const fp = sf.getFilePath();
  return !opts.exclude.some((ex) => fp.includes(ex.replace('**/', '')));
});

const notes: Note[] = [];
let changedCount = 0;

function processFile(filePath: string, notes: Note[]): boolean {
  let changed = false;
  const sf = project.getSourceFile(filePath);
  if (!sf) return false;

  const objects = sf.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);
  for (const obj of objects) {
    if (!isLikelyColumnObject(obj)) continue;

    const renderProp = getProp(obj, 'render');
    if (!renderProp) continue;

    const init = renderProp.getInitializer();
    if (!init) continue;

    const fnArrow = Node.isArrowFunction(init) ? (init as ArrowFunction) : undefined;
    const fnFunc = Node.isFunctionExpression(init) ? (init as FunctionExpression) : undefined;
    const fn = fnArrow ?? fnFunc;
    if (!fn) continue;

    const params = fn.getParameters();
    const p0 = params[0];
    const p1 = params[1];
    const p0Name = p0 ? p0.getName() : undefined;
    const p1Name = p1 ? p1.getName() : 'row';

    const diProp = getProp(obj, 'dataIndex');
    let diParts: string[] | undefined = undefined;
    if (diProp) {
      const s = getStringLiteralValue(diProp);
      const arr = getArrayOfStringLiterals(diProp);
      if (s) diParts = [s];
      else if (arr) diParts = arr;
    }

    const file = sf.getFilePath();
    const line = fn.getStartLineNumber();

    // 0) S'assure d'un corps bloc
    ensureBlockBody(fn);

    // 1) Aucun paramètre -> normalisation de signature
    if (!p0) {
      ensureParams(fn, { dom: '_dom', row: 'row' });
      notes.push({ file, line, message: 'render(): normalized (no params)' });
      changed = true;
      continue;
    }

    // 2) Un seul param
    if (params.length === 1) {
      const usesP0 = p0Name ? idUsedIn(fn, p0Name) : false;
      if (!usesP0) {
        ensureParams(fn, { dom: '_dom', row: 'row' });
        notes.push({ file, line, message: 'render(v): v unused -> normalized signature' });
        changed = true;
        continue;
      }
      if (diParts && p0Name) {
        ensureParams(fn, { dom: '_dom', row: 'row' });
        addHoistedValueVar(fn, p0Name, buildAccess('row', diParts));
        notes.push({ file, line, message: `render(v): rebind '${p0Name}' to row[dataIndex]` });
        changed = true;
        continue;
      } else {
        notes.push({ file, line, message: 'SKIP render(v): no literal dataIndex -> manual review' });
        continue;
      }
    }

    // 3) Deux+ paramètres
    const usesP0 = p0Name ? idUsedIn(fn, p0Name) : false;
    if (!usesP0) {
      renameFirstParamOnly(fn, '_dom');
      notes.push({ file, line, message: 'render(v, row): v unused -> normalized signature' });
      changed = true;
      continue;
    }

    if (diParts && p0Name) {
      const rowParamName = p1Name || 'row';
      renameFirstParamOnly(fn, '_dom');
      addHoistedValueVar(fn, p0Name, buildAccess(rowParamName, diParts));
      notes.push({
        file,
        line,
        message: `render(v, ${rowParamName}): rebind '${p0Name}' to ${rowParamName}[dataIndex]`,
      });
      changed = true;
      continue;
    } else {
      notes.push({ file, line, message: 'SKIP render(v, row): no literal dataIndex -> manual review' });
      continue;
    }
  }

  return changed;
}

for (const sf of files) {
  const changed = processFile(sf.getFilePath(), notes);
  if (changed) changedCount++;
}

if (!opts.dry) {
  project.saveSync();
}

const summary = {
  filesScanned: files.length,
  filesChanged: changedCount,
  dryRun: opts.dry,
  tsconfig: tsconfig || '(none)',
  include: opts.include,
  exclude: opts.exclude,
};

console.log('--- ProTable render codemod summary ---');
console.log(JSON.stringify(summary, null, 2));
if (notes.length) {
  const grouped = notes.reduce<Record<string, Note[]>>((acc, n) => {
    (acc[n.file] ??= []).push(n);
    return acc;
  }, {});
  for (const [file, list] of Object.entries(grouped)) {
    console.log('\n' + file);
    for (const n of list) {
      console.log(`  L${n.line}: ${n.message}`);
    }
  }
}
