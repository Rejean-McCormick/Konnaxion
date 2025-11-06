// scripts/moment-to-dayjs.js
const { Project } = require("ts-morph");
const fg = require("fast-glob");
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SETUP_PATH = path.join(ROOT, "src", "dayjs-setup.ts");
const ENTRY_CANDIDATES = [
  path.join(ROOT, "app", "layout.tsx"),
  path.join(ROOT, "app", "layout.jsx"),
  path.join(ROOT, "pages", "_app.tsx"),
  path.join(ROOT, "pages", "_app.jsx"),
  path.join(ROOT, "shared", "QueryProvider.tsx"),
];

function relImport(fromFile, absTarget) {
  let rel = path.relative(path.dirname(fromFile), absTarget).replace(/\\/g, "/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel.replace(/\.ts$/, ""); // import sans extension
}

async function main() {
  const hasTsconfig = fs.existsSync(path.join(ROOT, "tsconfig.json"));
  const project = new Project(
    hasTsconfig
      ? { tsConfigFilePath: path.join(ROOT, "tsconfig.json") }
      : { compilerOptions: { allowJs: true, jsx: 1 } }
  );

  const files = await fg(["**/*.{ts,tsx}"], {
    ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/build/**", "**/coverage/**", "**/out/**"],
    dot: true,
  });
  project.addSourceFilesAtPaths(files);

  let changedFiles = 0;

  for (const sf of project.getSourceFiles()) {
    const imports = sf.getImportDeclarations().filter(d => d.getModuleSpecifierValue() === "moment");
    if (imports.length === 0) continue;

    let fileChanged = false;

    for (const imp of imports) {
      // rename default import "moment" -> "dayjs" and update references
      const def = imp.getDefaultImport();
      if (def && def.getText() !== "dayjs") {
        def.rename("dayjs");
        fileChanged = true;
      }
      // rename named import { Moment } -> { Dayjs } and update references
      imp.getNamedImports().forEach(ni => {
        if (ni.getName() === "Moment") {
          ni.renameAlias ? ni.renameAlias("Dayjs") : ni.setName("Dayjs");
          fileChanged = true;
        }
      });
      // change module specifier
      if (imp.getModuleSpecifierValue() !== "dayjs") {
        imp.setModuleSpecifier("dayjs");
        fileChanged = true;
      }
    }

    // Résilience: si le code mentionne un type "Moment" sans import, remapper le type.
    sf.getDescendantsOfKind(tsMorph.SyntaxKind.TypeReference).forEach(tr => {
      const tn = tr.getTypeName && tr.getTypeName();
      if (tn && tn.getText && tn.getText() === "Moment") {
        tn.replaceWithText("Dayjs");
        fileChanged = true;
      }
    });

    if (fileChanged) {
      changedFiles++;
    }
  }

  // Écrit le fichier de setup Dayjs si absent
  if (!fs.existsSync(SETUP_PATH)) {
    fs.mkdirSync(path.dirname(SETUP_PATH), { recursive: true });
    fs.writeFileSync(
      SETUP_PATH,
`import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
// Ajoute d'autres plugins si besoin: advancedFormat, isBetween, etc.

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// Définis la locale si voulu:
// import 'dayjs/locale/fr';
// dayjs.locale('fr');
`,
      "utf8"
    );
  }

  // Injecte l'import de setup dans un entrypoint (le premier trouvé)
  for (const candidate of ENTRY_CANDIDATES) {
    if (!fs.existsSync(candidate)) continue;
    const sf = project.addSourceFileAtPathIfExists(candidate);
    if (!sf) continue;

    const already = sf.getImportDeclarations().some(d => {
      const ms = d.getModuleSpecifierValue();
      return ms.endsWith("dayjs-setup") || ms.includes("/dayjs-setup");
    });
    if (!already) {
      sf.addImportDeclaration({ moduleSpecifier: relImport(candidate, SETUP_PATH) }); // import side-effect
    }
    break; // un seul entrypoint
  }

  await project.save();

  console.log(`Moment → Dayjs: fichiers modifiés = ${changedFiles}`);
}

const tsMorph = require("ts-morph");
main().catch(err => {
  console.error(err);
  process.exit(1);
});
