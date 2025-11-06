/**
 * jscodeshift transform
 * Usage:
 *   npx jscodeshift -t codemods/fix-router.js "app/**/*.tsx" "components/**/*.tsx" --parser=tsx
 * Options:
 *   --clientify=true  # ajoute 'use client' si manquant quand router.* est utilisé
 */

const ROUTER_METHODS = new Set(["push","replace","back","forward","prefetch","refresh"]);

module.exports.parser = "tsx";

module.exports = function transformer(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let changed = false;

  const isUseClient = () => {
    const firstStmt = root.find(j.ExpressionStatement).at(0).getOrNull();
    return !!(firstStmt && firstStmt.node.directive === "use client");
  };
  const addUseClient = () => {
    const prog = root.get().node.program;
    const first = prog.body[0];
    if (!(first && first.type === "ExpressionStatement" && first.directive === "use client")) {
      const stmt = j.expressionStatement(j.literal("use client"));
      stmt.directive = "use client";
      prog.body.unshift(stmt);
      changed = true;
    }
  };

  // Ensure import { useRouter } from 'next/navigation'
  const ensureUseRouterImport = () => {
    const navImports = root.find(j.ImportDeclaration, { source: { value: "next/navigation" } });
    if (navImports.size() === 0) {
      const decl = j.importDeclaration(
        [j.importSpecifier(j.identifier("useRouter"))],
        j.literal("next/navigation")
      );
      // Insert after last import
      const lastImport = root.find(j.ImportDeclaration).at(-1).getOrNull();
      if (lastImport) {
        j(lastImport).insertAfter(decl);
      } else {
        root.get().node.program.body.unshift(decl);
      }
      changed = true;
      return;
    }
    // Add specifier if missing
    navImports.forEach(path => {
      const has = path.node.specifiers.some(s => s.type === "ImportSpecifier" && s.imported.name === "useRouter");
      if (!has) {
        path.node.specifiers.push(j.importSpecifier(j.identifier("useRouter")));
        changed = true;
      }
    });
  };

  // Migrate useRouter import away from next/router (only for the useRouter specifier)
  const migrateNextRouterImport = () => {
    root.find(j.ImportDeclaration, { source: { value: "next/router" } }).forEach(path => {
      const specifiers = path.node.specifiers || [];
      const keep = [];
      let removedUseRouter = false;
      specifiers.forEach(s => {
        if (s.type === "ImportSpecifier" && s.imported.name === "useRouter") {
          removedUseRouter = true; // drop it from next/router
          changed = true;
        } else {
          keep.push(s);
        }
      });
      if (removedUseRouter) {
        if (keep.length === 0) {
          j(path).remove();
        } else {
          path.node.specifiers = keep;
        }
        ensureUseRouterImport();
      }
    });
  };

  migrateNextRouterImport();

  // Find all MemberExpressions like router.push(...)
  const routerCalls = root.find(j.MemberExpression, {
    object: { type: "Identifier", name: "router" },
    property: (p) => p && p.type === "Identifier" && ROUTER_METHODS.has(p.name),
  });

  if (routerCalls.size() === 0) {
    return changed ? root.toSource() : null;
  }

  const clientify = String(options.clientify || "").toLowerCase() === "true";
  if (!isUseClient()) {
    if (clientify) {
      addUseClient();
    } else {
      // Do not modify server components unless explicit opt-in
      // Still keep any previous import migration that may have occurred.
      return changed ? root.toSource() : null;
    }
  }

  ensureUseRouterImport();

  // Helper: find nearest enclosing function for a given path
  const nearestFunction = (p) => {
    let cur = p;
    while (cur) {
      const n = cur.node;
      if (
        n.type === "FunctionDeclaration" ||
        n.type === "FunctionExpression" ||
        n.type === "ArrowFunctionExpression"
      ) {
        return cur;
      }
      cur = cur.parentPath;
    }
    return null;
  };

  // For each function that uses router.*, ensure `const router = useRouter()` at top
  const handledFunctions = new Set();
  routerCalls.forEach(callPath => {
    const fnPath = nearestFunction(callPath);
    if (!fnPath) return;

    const fnNode = fnPath.node;
    if (handledFunctions.has(fnNode)) return;
    handledFunctions.add(fnNode);

    // skip if function already declares a `router` variable bound to useRouter()
    const hasRouterDecl =
      j(fnPath).find(j.VariableDeclarator, {
        id: { type: "Identifier", name: "router" },
        init: { type: "CallExpression", callee: { type: "Identifier", name: "useRouter" } },
      }).size() > 0;

    if (hasRouterDecl) return;

    // also skip if there is already any local binding named 'router' (param/const/let) to avoid collisions
    const anyRouterBinding =
      j(fnPath).find(j.Identifier, { name: "router" })
        .filter(p => {
          // parameter names
          if (p.parentPath && p.parentPath.node && (
              p.parentPath.node.type === "FunctionDeclaration" ||
              p.parentPath.node.type === "FunctionExpression" ||
              p.parentPath.node.type === "ArrowFunctionExpression"
            )) {
            return true;
          }
          // variable declarator
          return p.parentPath && p.parentPath.node && p.parentPath.node.type === "VariableDeclarator" && p.parentPath.node.id === p.node;
        }).size() > 0;

    if (anyRouterBinding) return;

    // Insert `const router = useRouter();` as first statement in this function body
    if (fnNode.body && fnNode.body.type === "BlockStatement") {
      const decl = j.variableDeclaration("const", [
        j.variableDeclarator(j.identifier("router"),
          j.callExpression(j.identifier("useRouter"), []))
      ]);
      fnNode.body.body.unshift(decl);
      changed = true;
    } else {
      // Arrow function without block: convert to block with inserted decl
      const expr = fnNode.body;
      const decl = j.variableDeclaration("const", [
        j.variableDeclarator(j.identifier("router"),
          j.callExpression(j.identifier("useRouter"), []))
      ]);
      fnNode.body = j.blockStatement([decl, j.returnStatement(expr)]);
      changed = true;
    }
  });

  return changed ? root.toSource() : null;
};

