/**
 * fix-list-renderItem-types.ts
 *
 * Objectif: éliminer “item is of type 'unknown'” sur antd <List>
 * Méthode: typer le paramètre de renderItem à partir du type de dataSource.
 *
 * Usage:
 *   npm i -D ts-morph ts-node typescript
 *   npx ts-node scripts/fix-list-renderItem-types.ts
 *
 * Limites:
 * - Ne génère pas de types métiers. Il réutilise le type déjà présent sur dataSource.
 * - Si le type de dataSource n’est pas inféré (any/unknown), le script LOG la cible à corriger manuellement.
 */
import { Project, SyntaxKind, JsxAttribute, JsxOpeningElement, Node, Type } from "ts-morph";
import * as path from "path";

const TS_CONFIG = path.resolve(process.cwd(), "tsconfig.json");
const INCLUDE = [
  "app/**/*.tsx",
  "components/**/*.tsx",
  "modules/**/*.tsx"
];

const project = new Project({
  tsConfigFilePath: TS_CONFIG,
  skipAddingFilesFromTsConfig: false,
});

project.addSourceFilesAtPaths(INCLUDE);

const typeChecker = project.getTypeChecker();

type FixResult = {
  file: string;
  line: number;
  col: number;
  status: "fixed" | "skipped";
  reason?: string;
  inferredType?: string;
};

const results: FixResult[] = [];

function isAntdList(open: JsxOpeningElement): boolean {
  const tagNameNode = open.getTagNameNode();
  const name = tagNameNode.getText();
  const sf = open.getSourceFile();
  const imps = sf.getImportDeclarations();
  const fromAntd = imps.some(id => id.getModuleSpecifierValue() === "antd" &&
    id.getNamedImports().some(n => n.getName() === name));
  return name === "List" && fromAntd;
}

function getJsxAttr(open: JsxOpeningElement, name: string): JsxAttribute | undefined {
  const attrs = open.getAttributes().filter(a => Node.isJsxAttribute(a)) as JsxAttribute[];
  return attrs.find(a => a.getName() === name);
}

function elementTypeFromArrayType(t: Type): Type | undefined {
  const arrayElem = t.getArrayElementType();
  if (arrayElem) return arrayElem;

  if (t.isUnion()) {
    const nonUndef = t.getUnionTypes().filter(x => !x.isUndefined());
    if (nonUndef.length === 1) return elementTypeFromArrayType(nonUndef[0]);
    return undefined;
  }

  const sym = t.getSymbol();
  if (sym && (sym.getEscapedName() === "Array")) {
    const typeArgs = t.getTypeArguments();
    if (typeArgs.length === 1) return typeArgs[0];
  }
  return undefined;
}

function getTypeTextSafe(t: Type | undefined): string | undefined {
  if (!t) return undefined;
  const text = t.getText();
  if (!text) return undefined;
  const lower = text.toLowerCase();
  if (lower.includes("any") || lower.includes("unknown") || lower.includes("never")) return undefined;
  return text;
}

for (const sf of project.getSourceFiles()) {
  const jsxOpens = sf.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);

  for (const open of jsxOpens) {
    if (!isAntdList(open)) continue;

    const renderAttr = getJsxAttr(open, "renderItem");
    if (!renderAttr) continue;

    const renderExpr = renderAttr.getInitializer()?.getFirstDescendantByKind(SyntaxKind.ArrowFunction);
    if (!renderExpr) continue;

    const params = renderExpr.getParameters();
    if (params.length === 0) continue;
    const firstParam = params[0];

    const hasType = !!firstParam.getTypeNode();
    const currentTypeText = firstParam.getType().getText();
    if (hasType && !/any|unknown|never/i.test(currentTypeText)) continue;

    const dataAttr = getJsxAttr(open, "dataSource") || getJsxAttr(open, "items");
    if (!dataAttr) {
      results.push({
        file: sf.getFilePath(),
        line: open.getStartLineNumber(),
        col: 0,
        status: "skipped",
        reason: "Aucune dataSource/items trouvée"
      });
      continue;
    }

    const dataExpr = dataAttr.getInitializer();
    if (!dataExpr) {
      results.push({
        file: sf.getFilePath(),
        line: open.getStartLineNumber(),
        col: 0,
        status: "skipped",
        reason: "dataSource sans expression"
      });
      continue;
    }

    const dataType = typeChecker.getTypeAtLocation(dataExpr);
    const elemType = elementTypeFromArrayType(dataType);
    const typeText = getTypeTextSafe(elemType);

    if (!typeText) {
      results.push({
        file: sf.getFilePath(),
        line: open.getStartLineNumber(),
        col: 0,
        status: "skipped",
        reason: "Type élément non inféré (any/unknown). Taper le service/variable"
      });
      continue;
    }

    firstParam.setType(typeText);

    results.push({
      file: sf.getFilePath(),
      line: firstParam.getStartLineNumber(),
      col: 0,
      status: "fixed",
      inferredType: typeText
    });
  }
}

project.saveSync();

const fixed = results.filter(r => r.status === "fixed").length;
const skipped = results.filter(r => r.status === "skipped").length;
console.log(`fix-list-renderItem-types: fixed=${fixed} skipped=${skipped}`);
for (const r of results) {
  const rel = path.relative(process.cwd(), r.file);
  if (r.status === "fixed") {
    console.log(`FIXED  ${rel}:${r.line}  -> ${r.inferredType}`);
  } else {
    console.log(`SKIP   ${rel}:${r.line}  (${r.reason})`);
  }
}
