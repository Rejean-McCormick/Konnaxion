// scripts/codemods/fix-konnaxion.js
/* Run: pnpm dlx ts-node scripts/codemods/fix-konnaxion.js --dry
   Then: pnpm dlx ts-node scripts/codemods/fix-konnaxion.js
   Requires: pnpm add -D ts-morph
*/
const path = require('path');
const { Project, SyntaxKind, Node } = require('ts-morph');

const DRY = process.argv.includes('--dry');
const project = new Project({
  tsConfigFilePath: path.resolve('tsconfig.json'),
  manipulationSettings: { usePrefixAndSuffixTextForRename: false },
});

// Inclure tout le TS/TSX, exclure builds
project.addSourceFilesAtPaths([
  '**/*.ts',
  '**/*.tsx',
  '!**/*.d.ts',
  '!node_modules/**',
  '!.next/**',
  '!.turbo/**',
  '!dist/**',
  '!out/**',
  '!coverage/**',
]);

const stats = {
  apiImports: 0,
  routerQuery: 0,
  useParamsImport: 0,
  countdown: 0,
  autosize: 0,
  protableRender: 0,
  useRequestTwoGenerics: 0,
  filesChanged: 0,
};

function ensureNamedImport(sf, moduleSpecifier, name) {
  const imp = sf.getImportDeclarations().find(d => d.getModuleSpecifierValue() === moduleSpecifier);
  if (imp) {
    const has = imp.getNamedImports().some(n => n.getName() === name);
    if (!has) {
      imp.addNamedImport({ name });
      stats.useParamsImport++;
      return true;
    }
    return false;
  } else {
    sf.insertImportDeclaration(0, { moduleSpecifier, namedImports: [{ name }] });
    stats.useParamsImport++;
    return true;
  }
}

for (const sf of project.getSourceFiles()) {
  let changed = false;

  /* 1) ../../api -> @/services/_request */
  for (const imp of sf.getImportDeclarations()) {
    const mod = imp.getModuleSpecifierValue();
    if (/^(\.\.\/)+api$/.test(mod)) {
      imp.setModuleSpecifier('@/services/_request');
      stats.apiImports++;
      changed = true;
    }
  }

  /* 2) router.query.X -> useParams */
  for (const decl of sf.getDescendantsOfKind(SyntaxKind.VariableDeclaration)) {
    const init = decl.getInitializer();
    if (!init || !Node.isPropertyAccessExpression(init)) continue;

    const last = init; // router.query.id
    const mid = last.getExpression(); // router.query
    if (!Node.isPropertyAccessExpression(mid)) continue;
    if (mid.getName() !== 'query') continue;

    const left = mid.getExpression(); // router
    if (!Node.isIdentifier(left) || left.getText() !== 'router') continue;

    const key = last.getName(); // 'id'
    const varName = decl.getName(); // e.g. 'id' ou 'topicId'

    // Remplace la déclaration complète
    decl.replaceWithText(`const { ${key}: ${varName} } = useParams<{ ${key}: string }>()`);
    ensureNamedImport(sf, 'next/navigation', 'useParams');
    stats.routerQuery++;
    changed = true;
  }

  /* 3) Statistic.Countdown value={dayjs(...)} => .valueOf() */
  const jsxNodes = [
    ...sf.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
    ...sf.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
  ];
  for (const node of jsxNodes) {
    const tag = node.getTagNameNode().getText();
    if (tag !== 'Statistic.Countdown') continue;

    const attrs = node.getAttributes().filter(a => Node.isJsxAttribute(a));
    for (const a of attrs) {
      if (a.getName() !== 'value') continue;
      const expr = a.getInitializerIfKind(SyntaxKind.JsxExpression)?.getExpression();
      if (!expr) continue;
      const text = expr.getText();
      if (/^dayjs\(.+\)$/.test(text) && !text.endsWith('.valueOf()')) {
        a.setInitializer(`{${text}.valueOf()}`);
        stats.countdown++;
        changed = true;
      }
    }
  }

  /* 4) TextArea autosize -> autoSize */
  for (const attr of sf.getDescendantsOfKind(SyntaxKind.JsxAttribute)) {
    if (attr.getName() === 'autosize') {
      attr.set({ name: 'autoSize' });
      stats.autosize++;
      changed = true;
    }
  }

  /* 5) ProTable columns: render: (v) => ...  => render: (_dom, row) => { const v = (row as any)['dataIndex']; return ... } */
  for (const obj of sf.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)) {
    const renderProp = obj.getProperty('render');
    const dataIndexProp = obj.getProperty('dataIndex');
    if (!renderProp || !dataIndexProp) continue;

    const dataIndexInit = dataIndexProp.getInitializer && dataIndexProp.getInitializer();
    let dataKey = null;
    if (dataIndexInit && (Node.isStringLiteral(dataIndexInit) || Node.isNoSubstitutionTemplateLiteral(dataIndexInit))) {
      dataKey = dataIndexInit.getText().replace(/^['"`]|['"`]$/g, '');
    } else {
      continue; // sans dataIndex string, on ne tente pas
    }

    if (!Node.isPropertyAssignment(renderProp)) continue;
    const fn =
      renderProp.getInitializerIfKind(SyntaxKind.ArrowFunction) ||
      renderProp.getInitializerIfKind(SyntaxKind.FunctionExpression);
    if (!fn) continue;

    const params = fn.getParameters();
    if (params.length === 1) {
      const body = fn.getBody();
      const bodyText = body.getText();
      // Recompose une fonction avec 2 params et v local basé sur row[dataIndex]
      fn.removeParameters();
      fn.addParameter({ name: '_dom' });
      fn.addParameter({ name: 'row' });

      // Supprime => expression courte en bloc pour pouvoir déclarer v
      const newBody =
        body.getKind() === SyntaxKind.Block
          ? `{ const v = (row as any)['${dataKey}']; ${body.getStatements().map(s => s.getText()).join('\n')} }`
          : `{ const v = (row as any)['${dataKey}']; return ${bodyText}; }`;

      fn.setBodyText(newBody);
      stats.protableRender++;
      changed = true;
    }
  }

  /* 6) useRequest<T> -> useRequest<T, []> si un seul générique */
  for (const call of sf.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const ex = call.getExpression();
    if (!Node.isIdentifier(ex) || ex.getText() !== 'useRequest') continue;
    const tArgs = call.getTypeArguments();
    if (tArgs.length === 1) {
      call.addTypeArgument('[]');
      stats.useRequestTwoGenerics++;
      changed = true;
    }
  }

  if (changed) {
    stats.filesChanged++;
    if (DRY) {
      console.log('[dry] would update', sf.getFilePath());
    }
  }
}

(async () => {
  if (!DRY) await project.save();

  console.log('\n=== Codemod report ===');
  console.log('files changed        :', stats.filesChanged);
  console.log('api imports fixed    :', stats.apiImports);
  console.log('router.query -> params:', stats.routerQuery, '(imports added:', stats.useParamsImport, ')');
  console.log('countdown .valueOf() :', stats.countdown);
  console.log('TextArea autoSize    :', stats.autosize);
  console.log('ProTable render fix  :', stats.protableRender);
  console.log('useRequest <T,[]>    :', stats.useRequestTwoGenerics);
})();
