/**
 * fix-list-renderItem-types.v2.ts
 * Compatible ts-morph v27+ / ts-node.
 *
 * Corrige “item is of type 'unknown'” sur <List> antd
 * -> Annote (item: T) en inférant T depuis dataSource/items (T[]).
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
  const attrs = open.getAttributes().filter((a): a is JsxAttribute => Node.isJsxAttribute(a));
  return attrs.find(a => a.getNameNode()?.getText() === name);
}

function elementTypeFromArrayType(t: Type): Type | undefined {
  const arrayElem = t.getArrayElementType();
  if (arrayElem) return arrayElem;

  if (t.isUnion()) {
    const nonUndef = t.getUnionTypes().filter(x => !x.isUndefined());
    if (nonUndef.length === 1) {
      const only = nonUndef[0];
      if (only) return elementTypeFromArrayType(only);
    }
    return undefined;
  }

  const sym = t.getSymbol();
  if (sym && sym.getEscapedName() === "Array") {
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
    const firstParam = params[0];
    if (!firstParam) continue;

    const hasType = !!firstParam.getTypeNode();
    const currentTypeText = firstParam.getType().getText();
    if (hasType && !/any|unknown|never/i.test(currentTypeText)) continue;

    const dataAttr = getJsxAttr(open, "dataSource") || getJsxAttr(open, "items");
    if (!dataAttr) {
      results.push({ file: sf.getFilePath(), line: open.getStartLineNumber(), status: "skipped", reason: "Aucune dataSource/items trouvée" });
      continue;
    }

    const dataExpr = dataAttr.getInitializer();
    if (!dataExpr) {
      results.push({ file: sf.getFilePath(), line: open.getStartLineNumber(), status: "skipped", reason: "dataSource sans expression" });
      continue;
    }

    const dataType = typeChecker.getTypeAtLocation(dataExpr);
    const elemType = elementTypeFromArrayType(dataType);
    const typeText = getTypeTextSafe(elemType);

    if (!typeText) {
      results.push({ file: sf.getFilePath(), line: open.getStartLineNumber(), status: "skipped", reason: "Type élément non inféré (any/unknown). Taper la source de dataSource" });
      continue;
    }

    firstParam.setType(typeText);
    results.push({ file: sf.getFilePath(), line: firstParam.getStartLineNumber(), status: "fixed", inferredType: typeText });
  }
}

project.saveSync();

const fixed = results.filter(r => r.status === "fixed").length;
const skipped = results.filter(r => r.status === "skipped").length;
console.log(`fix-list-renderItem-types.v2: fixed=${fixed} skipped=${skipped}`);
for (const r of results) {
  const rel = path.relative(process.cwd(), r.file);
  if (r.status === "fixed") {
    console.log(`FIXED  ${rel}:${r.line}  -> ${r.inferredType}`);
  } else {
    console.log(`SKIP   ${rel}:${r.line}  (${r.reason})`);
  }
}
