/* Run with: pnpm ts-node codemod_fix_services_payload.ts --root . */
import { Project, SyntaxKind, Node, ts } from "ts-morph";
import * as path from "path";
import * as fs from "fs";

/* ---------- CLI args ---------- */
const args = process.argv.slice(2);
const idx = args.indexOf("--root");
const rootArg: string =
  idx >= 0 && typeof args[idx + 1] === "string" && args[idx + 1] !== ""
    ? (args[idx + 1] as string)
    : ".";
const ROOT = path.resolve(process.cwd(), rootArg);

/* ---------- ts-morph Project (indépendant du tsconfig repo) ---------- */
const project = new Project({
  compilerOptions: {
    target: ts.ScriptTarget.ES2019,
    module: ts.ModuleKind.CommonJS,
    downlevelIteration: true,
  },
  skipAddingFilesFromTsConfig: true,
});

/* ---------- Helpers: ajout des fichiers ---------- */
function addIfExists(rel: string) {
  const p = path.join(ROOT, rel);
  if (fs.existsSync(p)) project.addSourceFileAtPathIfExists(p);
}

function addServicesDir() {
  const dir = path.join(ROOT, "services");
  if (!fs.existsSync(dir)) return;
  const walk = (d: string) => {
    for (const name of fs.readdirSync(d)) {
      const fp = path.join(d, name);
      const st = fs.statSync(fp);
      if (st.isDirectory()) walk(fp);
      else if (/\.(ts|tsx)$/.test(name)) project.addSourceFileAtPathIfExists(fp);
    }
  };
  walk(dir);
}

addIfExists("services/_request.ts");
addServicesDir();

/* =======================================================================
   STEP 1: services/_request.ts  =>  wrappers génériques qui retournent res.data
   ======================================================================= */
const reqFile = project.getSourceFile(s => /services[\/\\]_request\.ts$/.test(s.getFilePath()));
if (reqFile) {
  // Nom de l’instance axios (ex: apiRequest)
  const exportAssignment = reqFile.getFirstDescendantByKind(SyntaxKind.ExportAssignment);
  let instanceName = "apiRequest";
  if (exportAssignment) {
    const expr = exportAssignment.getExpression();
    if (Node.isIdentifier(expr)) instanceName = expr.getText();
  } else {
    const varDec = reqFile.getVariableDeclarations().find(v =>
      v.getInitializer()?.getText().includes("axios.create(")
    );
    if (varDec) instanceName = varDec.getName();
  }

  const cfgAlias = reqFile.getTypeAlias("Cfg")?.getName() || "any";

  const ensureWrapper = (fnName: string, axiosMethod: "get" | "post" | "put" | "patch" | "delete") => {
    let fn = reqFile.getFunction(fnName);
    const needsBody = axiosMethod !== "get" && axiosMethod !== "delete";

    if (!fn) {
      fn = reqFile.addFunction({
        isExported: true,
        isAsync: true,
        name: fnName,
        typeParameters: [{ name: "T" }],
        parameters: needsBody
          ? [
              { name: "url", type: "string" },
              { name: "body", hasQuestionToken: true, type: "any" },
              { name: "config", hasQuestionToken: true, type: cfgAlias },
            ]
          : [
              { name: "url", type: "string" },
              { name: "config", hasQuestionToken: true, type: cfgAlias },
            ],
        returnType: "Promise<T>",
      });
    }

    // Forcer signature + corps
    fn.setIsAsync(true);
    fn.setReturnType("Promise<T>");
    const params = fn.getParameters();
    const pUrl = params[0]?.getName() || "url";
    const pBody = params[1]?.getName() || "body";
    const pCfg  = params[needsBody ? 2 : 1]?.getName() || "config";

    fn.setBodyText(writer => {
      if (needsBody) {
        writer.writeLine(`const res = await ${instanceName}.${axiosMethod}<T>(${pUrl}, ${pBody}, ${pCfg});`);
      } else {
        writer.writeLine(`const res = await ${instanceName}.${axiosMethod}<T>(${pUrl}, ${pCfg});`);
      }
      writer.writeLine(`return (res as any).data as T;`);
    });
  };

  // Créer/normaliser toutes les méthodes
  ensureWrapper("get", "get");
  ensureWrapper("post", "post");
  ensureWrapper("put", "put");
  ensureWrapper("patch", "patch");
  ensureWrapper("del", "delete");
}

/* ==========================================================================
   STEP 2: refactor services/*.ts pour utiliser { get, post, put, patch, del }
   ========================================================================== */
for (const sf of project.getSourceFiles()) {
  const fp = sf.getFilePath();
  if (!/services[\/\\].+\.tsx?$/.test(fp)) continue;
  if (/services[\/\\]_request\.ts$/.test(fp)) continue;

  const imp = sf.getImportDeclarations().find(d => /[\/\\]_request$/.test(d.getModuleSpecifierValue()));
  if (!imp) continue;

  const def = imp.getDefaultImport();
  const defName = def?.getText();

  // Ajouter les named imports requis
  const needed = ["get", "post", "put", "patch", "del"];
  const existing = new Set(imp.getNamedImports().map(n => n.getName()));
  Array.from(needed).forEach((name) => {
    if (!existing.has(name)) imp.addNamedImport({ name });
  });

  // Retirer l’import par défaut (instance)
  if (def) imp.removeDefaultImport();

  if (defName) {
    // Remplace apiRequest.method(...) -> method(...)
    sf.forEachDescendant(node => {
      if (!Node.isCallExpression(node)) return;
      const expr = node.getExpression();
      if (!Node.isPropertyAccessExpression(expr)) return;

      const left = expr.getExpression();
      const prop = expr.getName(); // get|post|put|patch|delete|...

      if (Node.isIdentifier(left) && left.getText() === defName) {
        if (["get", "post", "put", "patch", "delete"].includes(prop)) {
          const method = prop === "delete" ? "del" : prop;
          const typeArgs = node.getTypeArguments().map(t => t.getText());
          const args = node.getArguments().map(a => a.getText());
          const newCall = `${method}${typeArgs.length ? `<${typeArgs.join(", ")}>` : ""}(${args.join(", ")})`;
          node.replaceWithText(newCall);
        }
      }
    });
  }
}

/* ---------- Save ---------- */
project.save().then(() => {
  console.log("Codemod appliqué: wrappers typés et res.data enforced.");
});
