// scripts/fix-activity-typing.mjs
// Corrige : props non typées + item unknown dans List.renderItem
// Fichiers ciblés : activity-/user- components + SculptureComment

import { Project, SyntaxKind } from "ts-morph";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TYPES_PATH = path.join(ROOT, "types", "activity.ts");
const USING_AT_ALIAS = true; // ton code utilise '@/...' (ex: '@/services/_request')
const TYPE_IMPORT = USING_AT_ALIAS ? "@/types/activity" : path.relative("", TYPES_PATH).replace(/\\/g, "/");

const TARGETS = [
  // activity components
  { file: "components/activity-components/RecentComments.tsx", comp: "RecentComments", kind: "comment", props: ["comments", "deleteComment"] },
  { file: "components/activity-components/RecentLikes.tsx",    comp: "RecentLikes",    kind: "like",    props: ["likes"] },
  { file: "components/activity-components/RecentVisits.tsx",   comp: "RecentVisits",   kind: "visit",   props: ["visits"] }, // a déjà des types, le script restera no-op si tout est OK

  // user components
  { file: "components/user-components/UserComments.tsx", comp: "UserComments", kind: "comment", props: ["comments", "deleteComment"] },
  { file: "components/user-components/UserLikes.tsx",    comp: "UserLikes",    kind: "like",    props: ["likes"] },
  { file: "components/user-components/UserVisit.tsx",    comp: "UserVisit",    kind: "visit",   props: ["visits"] },

  // sculpture detail
  { file: "components/sculpture-maker-components/SculptureDetail/SculptureComment.tsx", comp: "SculptureComment", kind: "comment", props: ["comments", "deleteComment", "addComment", "sculptureId"] },
];

const KIND_TO_TYPES = {
  comment: { item: "ActivityCommentItem", propName: "comments" },
  like:    { item: "ActivityLikeItem",    propName: "likes"    },
  visit:   { item: "ActivityVisitItem",   propName: "visits"   },
};

const ensureTypesFile = () => {
  if (fs.existsSync(TYPES_PATH)) return;
  fs.mkdirSync(path.dirname(TYPES_PATH), { recursive: true });
  fs.writeFileSync(
    TYPES_PATH,
`import type React from 'react';

export interface ActivityUser {
  userId: string;
  nickname?: string;
  name?: string;
  picture: string;
}

export interface ActivitySculptureImage {
  url: string;
  created: string | Date;
}

export interface ActivitySculpture {
  accessionId?: string;
  name: string;
  images?: ActivitySculptureImage[];
}

export interface ActivityCommentItem {
  commentId: string;
  content: string;
  createdTime: string | Date;
  user: ActivityUser;
  sculpture: ActivitySculpture;
}

export interface ActivityLikeItem {
  likedTime: string | Date;
  user: ActivityUser;
  sculptureId?: string;
  sculpture: ActivitySculpture;
}

export interface ActivityVisitItem {
  visitTime: string | Date;
  user: ActivityUser;
  sculptureId?: string;
  sculpture: ActivitySculpture;
}

export interface ActivityListItemView {
  key?: string;
  author: React.ReactNode;
  avatar: React.ReactNode;
  content: React.ReactNode;
  datetime?: React.ReactNode;
}
`, "utf8");
  console.log(`created: ${path.relative(ROOT, TYPES_PATH)}`);
};

function removeNamedSpecifier(importDecl, name) {
  const spec = importDecl.getNamedImports().find(s => s.getName() === name);
  if (spec) spec.remove();
  if (importDecl.getNamedImports().length === 0 && !importDecl.getNamespaceImport() && !importDecl.getDefaultImport()) {
    importDecl.remove();
  }
}

function upsertTypeImport(sf, names) {
  const existing = sf.getImportDeclarations().find(d => d.getModuleSpecifierValue() === TYPE_IMPORT);
  const want = Array.from(new Set(names)).sort();
  if (!existing) {
    sf.addImportDeclaration({
      moduleSpecifier: TYPE_IMPORT,
      isTypeOnly: true,
      namedImports: want.map(n => ({ name: n })),
    });
    return;
  }
  // merge
  const set = new Set(existing.getNamedImports().map(n => n.getName()));
  want.forEach(n => set.add(n));
  existing.removeNamedImports();
  existing.addNamedImports(Array.from(set).sort());
  existing.setIsTypeOnly(true);
}

function ensurePropsAlias(sf, compName, propsShape) {
  const aliasName = `${compName}Props`;
  const has = sf.getTypeAliases().some(t => t.getName() === aliasName);
  if (has) return aliasName;
  sf.insertTypeAlias(0, {
    name: aliasName,
    isExported: false,
    type: `{ ${propsShape} }`,
  });
  return aliasName;
}

function setArrowParamTypeForComponent(sf, compName, propsAlias) {
  // const Comp = ({ ... }) => { ... }
  const decl = sf.getVariableDeclaration(compName);
  if (!decl) return false;
  const init = decl.getInitializer();
  if (!init || init.getKind() !== SyntaxKind.ArrowFunction) return false;
  const fn = init;
  const [param] = fn.getParameters();
  if (!param) return false;
  // Annoter le binding pattern : ({ a, b }: Props)
  param.setType(propsAlias);
  return true;
}

function annotateRenderItem(sf) {
  // JSX attr: renderItem={(item) => ...}  ->  (item: ActivityListItemView)
  const jsxAttrs = sf.getDescendantsOfKind(SyntaxKind.JsxAttribute)
    .filter(a => a.getName() === "renderItem");
  jsxAttrs.forEach(attr => {
    const expr = attr.getInitializer()?.getFirstDescendantByKind(SyntaxKind.ArrowFunction);
    if (!expr) return;
    const [p] = expr.getParameters();
    if (!p) return;
    if (!p.getTypeNode()) p.setType("ActivityListItemView");
  });
}

function annotateFormattedComments(sf) {
  // const formattedComments = X.map(...) -> : ActivityListItemView[]
  const decls = sf.getVariableDeclarations().filter(v => v.getName() === "formattedComments");
  decls.forEach(v => {
    if (!v.getTypeNode()) v.setType("ActivityListItemView[]");
  });
}

function replaceAntdCommentImport(sf) {
  // { Comment } from 'antd'  -> from '@ant-design/compatible'
  const antd = sf.getImportDeclarations().find(d => d.getModuleSpecifierValue() === "antd");
  if (antd && antd.getNamedImports().some(n => n.getName() === "Comment")) {
    removeNamedSpecifier(antd, "Comment");
    // ajouter import type/value pour Comment compat si absent
    const compat = sf.getImportDeclarations().find(d => d.getModuleSpecifierValue() === "@ant-design/compatible");
    if (compat) {
      const has = compat.getNamedImports().some(n => n.getName() === "Comment");
      if (!has) compat.addNamedImport("Comment");
    } else {
      sf.addImportDeclaration({ moduleSpecifier: "@ant-design/compatible", namedImports: ["Comment"] });
    }
  }
}

function run() {
  ensureTypesFile();

  const project = new Project({
    tsConfigFilePath: path.join(ROOT, "tsconfig.json"),
    skipAddingFilesFromTsConfig: false,
  });

  const changed = [];

  for (const t of TARGETS) {
    const sf = project.getSourceFile(t.file);
    if (!sf) {
      console.warn(`skip (missing): ${t.file}`);
      continue;
    }

    // 1) import types + compat Comment
    const needed = new Set(["ActivityListItemView"]);
    const { item, propName } = KIND_TO_TYPES[t.kind];
    needed.add(item);
    upsertTypeImport(sf, Array.from(needed));
    replaceAntdCommentImport(sf);

    // 2) définir Props alias
    const propsFields = t.props.map(p => {
      if (p === propName) return `${p}: ${item}[]`;
      if (p === "deleteComment") return `deleteComment: (id: string) => void`;
      if (p === "addComment") return `addComment: (c: ${item}) => void`;
      if (p === "sculptureId") return `sculptureId: string`;
      return `${p}: unknown`;
    }).join("; ");
    const propsAlias = ensurePropsAlias(sf, t.comp, propsFields);

    // 3) appliquer type sur param du FC + lister itens
    setArrowParamTypeForComponent(sf, t.comp, propsAlias);
    annotateFormattedComments(sf);
    annotateRenderItem(sf);

    // 4) sauver si modifié
    changed.push(t.file);
  }

  project.saveSync();
  console.log("updated:\n" + changed.map(f => " - " + f).join("\n"));
}

run();
