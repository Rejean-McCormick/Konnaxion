// codemods/fix-bug-17.cjs
// Usage:
//   pnpm add -D ts-morph
//   node codemods/fix-bug-17.cjs         # applique
//   node codemods/fix-bug-17.cjs --dry   # aperçu sans écrire

const { Project, SyntaxKind, Node } = require("ts-morph");
const path = require("path");

const DRY = process.argv.includes("--dry");

const project = new Project({
  tsConfigFilePath: path.resolve("tsconfig.json"),
  skipAddingFilesFromTsConfig: false,
});

// Cible: code source (exclut .next / dist / node_modules)
project.addSourceFilesAtPaths([
  "app/**/*.ts", "app/**/*.tsx",
  "components/**/*.ts", "components/**/*.tsx",
  "modules/**/*.ts", "modules/**/*.tsx",
  "shared/**/*.ts", "shared/**/*.tsx",
  "services/**/*.ts", "services/**/*.tsx",
  "!**/node_modules/**", "!**/.next/**", "!**/dist/**", "!**/build/**"
]);

const checker = project.getTypeChecker();
const edits = [];

const BOOL_NAME = /^(is|has|can|should|did|will|show|open|visible|enabled|disabled)[A-Z_]/i;

function isBooleanType(tText) {
  // "boolean", "true", "false", ou unions de ces littéraux
  return /^\s*(?:boolean|true|false)(\s*\|\s*(?:boolean|true|false))*\s*$/i.test(tText);
}

function isBooleanUpdater(fn) {
  if (!Node.isArrowFunction(fn)) return false;
  const body = fn.getBody();
  // cas simples: !prev, !!prev, comparaisons, &&, ||
  const text = body.getText();
  if (/^!+[\w$]+$/.test(text)) return true;
  if (/[=!]==|&&|\|\|/.test(text)) return true;
  // type du corps
  const t = checker.getTypeAtLocation(body);
  return isBooleanType(t.getText());
}

function fixUseStateBooleans() {
  for (const sf of project.getSourceFiles()) {
    const decls = sf.getDescendantsOfKind(SyntaxKind.VariableDeclaration);
    for (const vd of decls) {
      const init = vd.getInitializer();
      if (!init || !Node.isCallExpression(init)) continue;

      // useState(...) ou React.useState(...)
      const callee = init.getExpression();
      const isUseState =
        (Node.isIdentifier(callee) && callee.getText() === "useState") ||
        (Node.isPropertyAccessExpression(callee) &&
         callee.getExpression().getText() === "React" &&
         callee.getName() === "useState");
      if (!isUseState) continue;

      // On ne traite QUE les appels sans argument
      if (init.getArguments().length !== 0) continue;

      // Pattern: const [state, setState] = useState()
      const nameNode = vd.getNameNode();
      if (!Node.isArrayBindingPattern(nameNode)) continue;
      const [stateEl, setterEl] = nameNode.getElements();
      if (!stateEl || !setterEl) continue;

      const stateName = stateEl.getNameNode()?.getText() ?? "";
      const setterName = setterEl.getNameNode()?.getText() ?? "";
      if (!stateName || !setterName) continue;

      // Collecte des appels au setter
      const setterCalls = sf
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .filter(c => {
          const ex = c.getExpression();
          return Node.isIdentifier(ex) && ex.getText() === setterName;
        });

      // Heuristique 1: nom booléen
      let shouldBoolean = BOOL_NAME.test(stateName);

      // Heuristique 2: tous les appels au setter → boolean
      if (setterCalls.length > 0) {
        shouldBoolean = setterCalls.every(call => {
          const args = call.getArguments();
          if (args.length === 0) return false;
          const a0 = args[0];

          // setter(prev => !prev)
          if (Node.isArrowFunction(a0)) return isBooleanUpdater(a0);

          // setter(true|false|expr bool)
          const t = checker.getTypeAtLocation(a0);
          const text = t.getText();
          return isBooleanType(text);
        });
      }

      if (!shouldBoolean) continue; // ne tente rien si non certain

      // Applique: useState<boolean>(false)
      init.addTypeArgument("boolean");
      init.addArgument("false");
      edits.push({ file: sf.getFilePath(), state: stateName });
    }
  }
}

fixUseStateBooleans();

if (!DRY) {
  project.saveSync();
}

console.log("=== Résumé bug 17 ===");
console.log(`Fichiers modifiés: ${new Set(edits.map(e => e.file)).size}`);
for (const e of edits) {
  console.log(`- ${e.file}: ${e.state} → useState<boolean>(false)`);
}
if (DRY) console.log("(dry run, aucun fichier écrit)");
