import type { API, FileInfo, Options } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API, _options: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let changed = false;

  const isWhitespace = (n: any) => n.type === 'JSXText' && /^\s*$/.test(n.value ?? n.raw ?? '');
  const unwrapParen = (e: any) => {
    let x = e;
    while (x && x.type === 'ParenthesizedExpression') x = x.expression;
    return x;
  };

  const isMainLayoutPage = (arg: any) => {
    if (!arg) return false;
    const node = unwrapParen(arg);
    if (!node || node.type !== 'JSXElement') return false;

    const name = node.openingElement?.name;
    if (!name || name.type !== 'JSXIdentifier' || name.name !== 'MainLayout') return false;

    const kids = (node.children ?? []).filter((c: any) => !isWhitespace(c));
    if (kids.length !== 1) return false;

    const only = kids[0];
    return (
      only.type === 'JSXExpressionContainer' &&
      only.expression &&
      only.expression.type === 'Identifier' &&
      only.expression.name === 'page'
    );
  };

  const processFn = (path: any) => {
    const fn = path.node;
    if (!fn.body || fn.body.type !== 'BlockStatement') return;
    const body = fn.body.body as any[];
    if (!body.length) return;

    const last = body[body.length - 1];
    if (!last || last.type !== 'ReturnStatement') return;

    // Sécurité: ne supprime que si un autre return existe déjà avant
    const hasEarlierReturn = body.slice(0, -1).some(s => s.type === 'ReturnStatement');

    if (hasEarlierReturn && isMainLayoutPage(last.argument)) {
      body.pop(); // retire uniquement le return résiduel
      changed = true;
    }
  };

  root.find(j.FunctionDeclaration).forEach(processFn);
  root.find(j.FunctionExpression).forEach(processFn);
  root.find(j.ArrowFunctionExpression).forEach(p => {
    // On ne traite que les bodies en bloc: "() => { ... }"
    if (p.node.expression) return;
    processFn(p);
  });

  return changed ? root.toSource({ quote: 'single', trailingComma: true }) : null;
}
