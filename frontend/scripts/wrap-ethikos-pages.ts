// scripts/wrap-ethikos-pages.ts
/* eslint-disable no-console */
/**
 * Wrap all /app/ethikos/**/page.tsx default exports with <EthikosPageShell>.
 * Compatible with ts-morph v27 APIs.
 *
 * Usage:
 *   pnpm ts-node scripts/wrap-ethikos-pages.ts           # dry-run
 *   pnpm ts-node scripts/wrap-ethikos-pages.ts --write   # apply changes
 */

import path from 'path'
import { fileURLToPath } from 'url'
import {
  ArrowFunction,
  FunctionDeclaration,
  Node,
  Project,
  QuoteKind,
  SourceFile,
  SyntaxKind,
  VariableDeclaration,
} from 'ts-morph'

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const WRITE = process.argv.includes('--write')

// Use repo tsconfig (so path alias @/… resolves)
const project = new Project({
  tsConfigFilePath: path.resolve('tsconfig.json'),
  manipulationSettings: { quoteKind: QuoteKind.Double },
})

// Add Ethikos pages
project.addSourceFilesAtPaths([
  'app/ethikos/**/page.tsx',
  'app/ethikos/**/page.ts',
  'app/ethikos/**/page.jsx',
  'app/ethikos/**/page.js',
])

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------

function hasUseClient(sf: SourceFile): boolean {
  const stmts = sf.getStatements()
  if (!stmts.length) return false

  const first = stmts[0]
  if (!Node.isExpressionStatement(first)) return false

  const expr = first.getExpression()
  if (!Node.isStringLiteral(expr)) return false

  return expr.getLiteralText() === 'use client'
}

function ensureUseClientFirst(sf: SourceFile): void {
  if (hasUseClient(sf)) return
  // Insert at very top
  sf.insertStatements(0, [`'use client'`])
}

function alreadyWrapped(sf: SourceFile): boolean {
  const hasImport = sf
    .getImportDeclarations()
    .some((d) => d.getModuleSpecifierValue().includes('EthikosPageShell'))

  const hasShellJsx = sf.getText().includes('<EthikosPageShell')
  return hasImport || hasShellJsx
}

function ensureShellImport(sf: SourceFile): void {
  const exists = sf
    .getImportDeclarations()
    .some((d) => d.getModuleSpecifierValue().includes('EthikosPageShell'))

  if (exists) return
  // Use alias import (repo uses "@/…")
  // EthikosPageShell is defined in app/ethikos/EthikosPageShell.tsx
  // and exported as default. :contentReference[oaicite:4]{index=4}
  sf.addImportDeclaration({
    defaultImport: 'EthikosPageShell',
    moduleSpecifier: '@/app/ethikos/EthikosPageShell',
  })
}

function titleCase(s: string): string {
  return s
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

function deriveTitlesFromPath(absPath: string): {
  section?: string
  title: string
} {
  // absPath -> app/ethikos/<section>/.../page.tsx
  const relFromApp = path
    .relative(path.resolve('app'), absPath)
    .replace(/\\/g, '/')

  const parts = relFromApp.split('/').filter(Boolean) // e.g. ['ethikos','pulse','trends','page.tsx']
  // sanity
  if (parts[0] !== 'ethikos') {
    return { title: 'Ethikos' }
  }

  const section = parts[1] ? titleCase(parts[1]) : undefined
  // everything after section except final page.{tsx,ts,js,jsx}
  const leafParts = parts.slice(2, -1).map(titleCase)

  let title: string
  if (leafParts.length > 0) {
    title = section ? `${section} · ${leafParts.join(' / ')}` : leafParts.join(' / ')
  } else {
    // index-like page -> use section as title
    title = section ?? 'Ethikos'
  }
  return { section, title }
}

function wrapReturnWithShell(fn: FunctionDeclaration | ArrowFunction, shellProps: {
  title: string
  section?: string
}): boolean {
  // Find the "return" and its expression
  const ret = fn.getFirstDescendantByKind(SyntaxKind.ReturnStatement)
  const props = [
    `title=${JSON.stringify(shellProps.title)}`,
    shellProps.section ? `sectionLabel=${JSON.stringify(shellProps.section)}` : null,
  ]
    .filter(Boolean)
    .join(' ')

  // Case 1: block body with explicit return
  if (ret) {
    const expr = ret.getExpression()
    const inner = expr ? expr.getText() : 'null'
    ret.replaceWithText(`return (<EthikosPageShell ${props}>${inner}</EthikosPageShell>);`)
    return true
  }

  // Case 2: expression-bodied arrow function:  () => <div>...</div>
  if (Node.isArrowFunction(fn)) {
    const body = fn.getBody()
    if (!body) return false
    const inner = body.getText()
    fn.setBodyText(`return (<EthikosPageShell ${props}>${inner}</EthikosPageShell>);`)
    return true
  }

  // No obvious spot to wrap
  return false
}

function getDefaultExportFunction(sf: SourceFile):
  | FunctionDeclaration
  | ArrowFunction
  | undefined {
  // Pattern A: export default function Page() {}
  const direct = sf.getFunctions().find((f) => f.isDefaultExport())
  if (direct) return direct

  // Pattern B: const Page = () => {}; export default Page
  const exportAssign = sf.getFirstDescendantByKind(SyntaxKind.ExportAssignment)
  if (exportAssign) {
    const expr = exportAssign.getExpression()
    if (Node.isIdentifier(expr)) {
      const name = expr.getText()
      // look for const name = () => {}
      const v: VariableDeclaration | undefined = sf.getVariableDeclaration(name)
      const init = v?.getInitializer()
      if (init && Node.isArrowFunction(init)) return init
      if (init && Node.isFunctionExpression(init)) {
        // Convert to arrow for uniform handling
        // Or just try to wrap via return search
        return init
      }
    }
  }

  return undefined
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const targets = project.getSourceFiles().filter((sf) => {
  const p = sf.getFilePath()
  // only /app/ethikos/**/page.*
  return /[\\/]app[\\/]ethikos[\\/].+[\\/]page\.(t|j)sx?$/.test(p)
})

if (!targets.length) {
  console.log('No Ethikos pages found.')
  process.exit(0)
}

let changed = 0

for (const sf of targets) {
  const filePath = sf.getFilePath()

  if (alreadyWrapped(sf)) {
    continue
  }

  ensureUseClientFirst(sf)
  ensureShellImport(sf)

  const fn = getDefaultExportFunction(sf)
  if (!fn) {
    console.log(`SKIP (no default export function found): ${filePath}`)
    continue
  }

  const { section, title } = deriveTitlesFromPath(filePath)
  const ok = wrapReturnWithShell(fn, { title, section })

  if (!ok) {
    console.log(`SKIP (could not wrap return): ${filePath}`)
    continue
  }

  changed += 1

  if (WRITE) {
    // prettier is normally applied by your formatter; ts-morph will persist text
    sf.saveSync()
    console.log(`UPDATED: ${filePath}`)
  } else {
    console.log(`WOULD UPDATE: ${filePath}`)
  }
}

console.log(WRITE ? `Done. ${changed} file(s) updated.` : `Dry-run complete. ${changed} file(s) would be updated.`)
