/**
 * Replace router.query.* with useParams() in Client Components:
 *  - remove `{ query } = useRouter()`
 *  - add `const params = useParams()` at top of the nearest function
 *  - replace `query.foo` → `params.foo`
 *  - add import { useParams } from 'next/navigation' and 'use client' if needed
 */
export default function transformer(file, api) {
  const j = api.jscodeshift
  const r = j(file.source)
  let changed = false

  function ensureUseParamsImport() {
    const imports = r.find(j.ImportDeclaration, { source: { value: 'next/navigation' } })
    if (imports.size()) {
      imports.forEach(p => {
        const spec = p.value.specifiers || []
        const has = spec.some(s => s.type === 'ImportSpecifier' && s.imported.name === 'useParams')
        if (!has) spec.push(j.importSpecifier(j.identifier('useParams')))
        p.value.specifiers = spec
      })
    } else {
      const decl = j.importDeclaration([j.importSpecifier(j.identifier('useParams'))], j.literal('next/navigation'))
      const first = r.find(j.ImportDeclaration).at(0)
      if (first.size()) first.insertBefore(decl)
      else r.get().value.program.body.unshift(decl)
    }
  }
  function ensureUseClient() {
    const body = r.get().value.program.body
    const first = body[0]
    if (!(first && first.type === 'ExpressionStatement' && first.expression.type === 'Literal' && first.expression.value === 'use client')) {
      body.unshift(j.expressionStatement(j.literal('use client')))
    }
  }
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
  function ensureParamsVarInFunction(fnPath) {
    if (!fnPath) return
    const fn = fnPath.node
    const body = fn.body && fn.body.type === 'BlockStatement' ? fn.body.body : null
    if (!body) return
    const hasDecl = j(fnPath).find(j.VariableDeclarator, { id: { name: 'params' } })
      .filter(p => p.parent && p.parent.parent && p.parent.parent.node === fn.body)
      .size() > 0
    if (!hasDecl) {
      body.unshift(
        j.variableDeclaration('const', [
          j.variableDeclarator(j.identifier('params'), j.callExpression(j.identifier('useParams'), []))
        ])
      )
    }
  }

  // remove `{ query } = useRouter()` destructuring
  r.find(j.VariableDeclarator, {
    id: { type: 'ObjectPattern' },
    init: {
      type: 'CallExpression',
      callee: { name: 'useRouter' }
    }
  }).forEach(p => {
    const props = p.value.id.properties
    const hasQuery = props.some(pr => pr.key?.name === 'query')
    if (hasQuery) {
      p.value.id.properties = props.filter(pr => pr.key?.name !== 'query')
      changed = true
    }
  })

  // replace occurrences of `query.xxx` with `params.xxx` and insert params var in function
  r.find(j.MemberExpression, { object: { name: 'query' } })
    .forEach(path => {
      j(path).replaceWith(j.memberExpression(j.identifier('params'), path.value.property))
      const fnPath = nearestFunction(path)
      ensureParamsVarInFunction(fnPath)
      changed = true
    })

  if (changed) {
    ensureUseParamsImport()
    ensureUseClient()
  }

  return changed ? r.toSource() : file.source
}