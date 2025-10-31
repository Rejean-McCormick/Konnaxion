/**
 * Transformations:
 *  - import default Router → remove. add/use useRouter from 'next/navigation'
 *  - Router.push('/a/[id]', '/a/1') → router.push('/a/1')
 *  - Router.replace(...) → router.replace(...)
 *  - Inject `const router = useRouter()` at top of the nearest function body containing the call
 *  - Add 'use client' directive if a router hook is introduced
 */
export default function transformer(file, api) {
  const j = api.jscodeshift
  const r = j(file.source)
  let changed = false

  // ensure an import for useRouter exists (or extend existing import)
  function ensureUseRouterImport() {
    const imports = r.find(j.ImportDeclaration, { source: { value: 'next/navigation' } })
    if (imports.size()) {
      imports.forEach(p => {
        const spec = p.value.specifiers || []
        const hasUse = spec.some(s => s.type === 'ImportSpecifier' && s.imported.name === 'useRouter')
        const hasDefaultRouter = spec.find(s => s.type === 'ImportDefaultSpecifier' && s.local.name === 'Router')
        if (!hasUse) spec.push(j.importSpecifier(j.identifier('useRouter')))
        // remove default Router import if present
        if (hasDefaultRouter) {
          p.value.specifiers = spec.filter(s => !(s.type==='ImportDefaultSpecifier' && s.local.name==='Router'))
        } else {
          p.value.specifiers = spec
        }
      })
    } else {
      // add a new import
      const decl = j.importDeclaration([j.importSpecifier(j.identifier('useRouter'))], j.literal('next/navigation'))
      const first = r.find(j.ImportDeclaration).at(0)
      if (first.size()) first.insertBefore(decl)
      else r.get().value.program.body.unshift(decl)
    }
  }

  // add 'use client' directive if not present
  function ensureUseClient() {
    const body = r.get().value.program.body
    const first = body[0]
    if (!(first && first.type === 'ExpressionStatement' && first.expression.type === 'Literal' && first.expression.value === 'use client')) {
      body.unshift(j.expressionStatement(j.literal('use client')))
    }
  }

  // Locate nearest enclosing function for a given path
  function nearestFunction(path) {
    let p = path
    while (p && p.parent) {
      if (j.FunctionDeclaration.check(p.node) || j.FunctionExpression.check(p.node) || j.ArrowFunctionExpression.check(p.node)) {
        return p
      }
      p = p.parent
    }
    return null
  }

  // Ensure const router = useRouter() at start of function body
  function ensureRouterVarInFunction(fnPath) {
    if (!fnPath) return
    const fn = fnPath.node
    const body = fn.body && fn.body.type === 'BlockStatement' ? fn.body.body : null
    if (!body) return

    const hasDecl = j(fnPath).find(j.VariableDeclarator, { id: { name: 'router' } })
      .filter(p => p.parent && p.parent.parent && p.parent.parent.node === fn.body)
      .size() > 0

    if (!hasDecl) {
      body.unshift(
        j.variableDeclaration('const', [
          j.variableDeclarator(j.identifier('router'), j.callExpression(j.identifier('useRouter'), []))
        ])
      )
    }
  }

  // Replace Router.push/replace
  r.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: { name: 'Router' },
      property: (p) => ['push','replace'].includes(p.name)
    }
  }).forEach(path => {
    const args = path.value.arguments
    const finalUrl = args[args.length - 1] // last arg is the resolved href
    const method = path.value.callee.property.name
    j(path).replaceWith(
      j.callExpression(
        j.memberExpression(j.identifier('router'), j.identifier(method)),
        [finalUrl]
      )
    )
    // ensure function-scope router var
    const fnPath = nearestFunction(path)
    ensureRouterVarInFunction(fnPath)
    changed = true
  })

  if (changed) {
    ensureUseRouterImport()
    ensureUseClient()
  }

  return changed ? r.toSource() : file.source
}