#!/usr/bin/env node
/* Fix TS18046: catch variable is 'unknown' + normalisation d'erreur. */
const path = require('path');
const fs = require('fs');
const { Project, SyntaxKind } = require('ts-morph');

const ROOT = process.cwd();
const ERRORS_FILE = path.join(ROOT, 'shared', 'errors.ts');

function ensureErrorsFile() {
  if (fs.existsSync(ERRORS_FILE)) return;
  fs.mkdirSync(path.dirname(ERRORS_FILE), { recursive: true });
  fs.writeFileSync(
    ERRORS_FILE,
`export type ErrorState = { message: string; statusCode?: number };

export class HttpError extends Error {
  statusCode?: number;
  data?: unknown;
  constructor(message: string, opts?: { statusCode?: number; data?: unknown; cause?: unknown }) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = opts?.statusCode;
    this.data = opts?.data;
    // @ts-ignore
    if (opts?.cause !== undefined) this.cause = opts.cause;
  }
}

function isAxiosError(e: any): e is { isAxiosError: boolean; message: string; response?: { status?: number; data?: any } } {
  return !!e && typeof e === 'object' && 'isAxiosError' in e;
}

export function isHttpError(e: unknown): e is HttpError {
  return e instanceof HttpError;
}

export function normalizeError(e: unknown): ErrorState {
  if (isHttpError(e)) return { message: e.message, statusCode: e.statusCode };
  if (isAxiosError(e)) {
    const statusCode = e.response?.status;
    const message = e.response?.data?.message ?? e.message ?? 'Unexpected error';
    return { message, statusCode };
  }
  if (e instanceof Error) return { message: e.message };
  return { message: 'Unexpected error' };
}
`,
    'utf8'
  );
  console.log('created: shared/errors.ts');
}

function relImport(fromFile) {
  let rel = path.relative(path.dirname(fromFile.getFilePath()), ERRORS_FILE).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  if (rel.endsWith('.ts')) rel = rel.slice(0, -3);
  return rel;
}

function ensureImportNormalizeError(sf) {
  const mod = relImport(sf);
  const has = sf.getImportDeclarations().some(d => {
    const m = d.getModuleSpecifierValue();
    if (m !== mod) return false;
    return d.getNamedImports().some(n => n.getName() === 'normalizeError');
  });
  if (!has) {
    sf.addImportDeclaration({ moduleSpecifier: mod, namedImports: [{ name: 'normalizeError' }] });
  }
}

function isChainFromIdent(node, identName, chainParts) {
  // Check nested PropertyAccessExpression / PropertyAccessChain like e.response.data.message
  let cur = node;
  for (let i = chainParts.length - 1; i >= 0; i--) {
    const part = chainParts[i];
    const expr = cur.getExpression && cur.getExpression();
    if (!expr) return false;
    if (i === 0) {
      return expr.getKind() === SyntaxKind.Identifier && expr.getText() === identName && cur.getName && cur.getName() === part;
    } else {
      if (!(expr.getName && expr.getName() === chainParts[i - 1])) return false;
      cur = expr;
      i--; // we consumed one more in the chain
    }
  }
  return false;
}

function replaceChainWithIdent(node, ident) {
  node.replaceWithText(ident);
}

function processCatch(catchClause) {
  const v = catchClause.getVariableDeclaration();
  if (!v) return false;
  const name = v.getName();
  if (!v.getTypeNode()) v.setType('unknown');

  const block = catchClause.getBlock();
  // Insert destructuring at top if not present
  const firstStmt = block.getStatements()[0];
  const decl = `const { message, statusCode } = normalizeError(${name});`;
  const hasDecl = firstStmt && firstStmt.getText().includes('normalizeError(' + name + ')');
  if (!hasDecl) block.insertStatements(0, decl);

  let changed = false;

  // Replace e.message  -> message
  block.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression).forEach(p => {
    const prop = p.getName && p.getName();
    if (!prop) return;

    // e.message
    if (prop === 'message') {
      const expr = p.getExpression();
      if (expr.getKind() === SyntaxKind.Identifier && expr.getText() === name) {
        replaceChainWithIdent(p, 'message');
        changed = true;
        return;
      }
    }

    // e.response.status
    if (prop === 'status') {
      const expr = p.getExpression();
      if (expr.getKind() === SyntaxKind.PropertyAccessExpression) {
        const e2 = expr.getExpression();
        if (e2.getKind() === SyntaxKind.PropertyAccessExpression) {
          const e3 = e2.getExpression();
          if (e3.getKind() === SyntaxKind.Identifier && e3.getText() === name && e2.getName() === 'response' && expr.getName() === 'status') {
            replaceChainWithIdent(p, 'statusCode');
            changed = true;
            return;
          }
        }
      }
    }

    // e.response.data.message
    if (prop === 'message') {
      const expr = p.getExpression();
      if (expr.getKind() === SyntaxKind.PropertyAccessExpression) {
        const e2 = expr.getExpression();
        if (e2.getKind() === SyntaxKind.PropertyAccessExpression) {
          const e3 = e2.getExpression();
          if (e3.getKind() === SyntaxKind.PropertyAccessExpression) {
            const base = e3.getExpression();
            if (base.getKind() === SyntaxKind.Identifier && base.getText() === name &&
                e3.getName() === 'response' && e2.getName() === 'data') {
              replaceChainWithIdent(p, 'message');
              changed = true;
              return;
            }
          }
        }
      }
    }
  });

  // Optional chaining variants: PropertyAccessChain
  block.getDescendantsOfKind(SyntaxKind.PropertyAccessChain).forEach(p => {
    const prop = p.getName && p.getName();
    if (!prop) return;

    // e?.message
    if (prop === 'message') {
      const expr = p.getExpression();
      if (expr.getKind() === SyntaxKind.Identifier && expr.getText() === name) {
        replaceChainWithIdent(p, 'message');
        changed = true;
        return;
      }
    }

    // e?.response?.status
    if (prop === 'status') {
      const expr = p.getExpression();
      if (expr.getKind() === SyntaxKind.PropertyAccessChain) {
        const e2 = expr.getExpression();
        if (e2.getKind() === SyntaxKind.Identifier && e2.getText() === name && expr.getName() === 'response') {
          replaceChainWithIdent(p, 'statusCode');
          changed = true;
          return;
        }
      }
    }

    // e?.response?.data?.message
    if (prop === 'message') {
      const expr = p.getExpression();
      if (expr.getKind() === SyntaxKind.PropertyAccessChain) {
        const e2 = expr.getExpression();
        if (e2.getKind() === SyntaxKind.PropertyAccessChain) {
          const base = e2.getExpression();
          if (base.getKind() === SyntaxKind.Identifier && base.getText() === name &&
              e2.getName() === 'data' && expr.getName() === 'response') {
            replaceChainWithIdent(p, 'message');
            changed = true;
            return;
          }
        }
      }
    }
  });

  return true;
}

(async function main() {
  ensureErrorsFile();

  const project = new Project({
    tsConfigFilePath: fs.existsSync(path.join(ROOT, 'tsconfig.json')) ? path.join(ROOT, 'tsconfig.json') : undefined,
    skipAddingFilesFromTsConfig: false,
    manipulationSettings: { quoteKind: 1 }
  });

  // Cible: source app/components/modules/services/shared uniquement
  project.addSourceFilesAtPaths([
    'app/**/*.ts',
    'app/**/*.tsx',
    'components/**/*.ts',
    'components/**/*.tsx',
    'modules/**/*.ts',
    'modules/**/*.tsx',
    'services/**/*.ts',
    'services/**/*.tsx',
    'shared/**/*.ts',
    'shared/**/*.tsx',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/dist/**',
    '!**/build/**'
  ]);

  let filesChanged = 0;
  for (const sf of project.getSourceFiles()) {
    let modifiedHere = false;
    sf.getDescendantsOfKind(SyntaxKind.TryStatement).forEach(ts => {
      const cc = ts.getCatchClause();
      if (!cc) return;
      const ok = processCatch(cc);
      if (ok) {
        ensureImportNormalizeError(sf);
        modifiedHere = true;
      }
    });
    if (modifiedHere) {
      filesChanged++;
    }
  }

  await project.save();
  console.log(`Done. Files modified: ${filesChanged}`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
