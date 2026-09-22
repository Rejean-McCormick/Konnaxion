#!/usr/bin/env node
/**
 * Konnaxion UI translation inventory extractor.
 *
 * Goal
 * ----
 * Find user-visible strings in the TypeScript/React frontend before migrating
 * them to i18n keys. This intentionally prefers a small amount of
 * over-detection to silently missing UI copy.
 *
 * Uses ts-morph (already declared in frontend/package.json) so JSX/TS syntax is
 * parsed as an AST instead of grepped with regular expressions.
 *
 * Run from frontend/:
 *   node scripts/extract-ui-translations.mjs
 *
 * Useful options:
 *   --root .
 *   --out-dir artifacts/i18n-extraction
 *   --include-tests
 *   --include-stories
 *   --english-only
 *   --min-confidence high|medium|low
 *
 * Outputs:
 *   ui-translation-occurrences.csv   one row per source occurrence
 *   ui-translation-occurrences.json  same data as JSON
 *   ui-translation-unique.json       strings deduplicated across the repo
 *   ui-translation-summary.json      counts / extraction metadata
 *   ui-translation-summary.md        human-readable summary
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Node, Project, SyntaxKind } from 'ts-morph';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(SCRIPT_DIR, '..');
const args = process.argv.slice(2);

function hasFlag(flag) {
  return args.includes(flag);
}

function getArg(flag, fallback) {
  const index = args.indexOf(flag);
  if (index === -1 || index === args.length - 1) return fallback;
  return args[index + 1];
}

function fail(message) {
  console.error(`[i18n-extract] ${message}`);
  process.exitCode = 1;
}

const ROOT = path.resolve(FRONTEND_ROOT, getArg('--root', '.'));
const OUT_DIR = path.resolve(
  FRONTEND_ROOT,
  getArg('--out-dir', 'artifacts/i18n-extraction'),
);
const INCLUDE_TESTS = hasFlag('--include-tests');
const INCLUDE_STORIES = hasFlag('--include-stories');
const ENGLISH_ONLY = hasFlag('--english-only');
const MIN_CONFIDENCE = getArg('--min-confidence', 'low').toLowerCase();

const confidenceRank = { low: 1, medium: 2, high: 3 };
if (!(MIN_CONFIDENCE in confidenceRank)) {
  fail(`Invalid --min-confidence "${MIN_CONFIDENCE}". Use high, medium, or low.`);
  process.exit(1);
}

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

const SKIP_DIRS = new Set([
  '.git',
  '.next',
  '.storybook',
  '.turbo',
  'node_modules',
  'coverage',
  'dist',
  'build',
  'storybook-static',
  'playwright-report',
  'test-results',
  'artifacts',
  'codemods',
  'scripts',
  'styles',
  'tools',
  'types',
  '_BUG_HARVEST_SOURCE',
  '_BUG_HARVEST_REVIEW',
]);

const TEST_DIR_NAMES = new Set([
  '__tests__',
  'tests',
  'test',
  'e2e',
  '_e2e',
  'ct',
  'smoke',
]);

const VISIBLE_JSX_PROPS = new Set([
  'alt',
  'arialabel',
  'aria-label',
  'caption',
  'canceltext',
  'confirmtext',
  'content',
  'description',
  'emptytext',
  'errortext',
  'help',
  'label',
  'loadingtext',
  'message',
  'notfoundcontent',
  'oktext',
  'placeholder',
  'subtitle',
  'successText'.toLowerCase(),
  'text',
  'title',
  'tooltip',
]);

const UI_OBJECT_KEYS = new Set([
  'caption',
  'cancelText',
  'confirmText',
  'content',
  'description',
  'emptyText',
  'errorText',
  'help',
  'label',
  'loadingText',
  'message',
  'notFoundContent',
  'okText',
  'subtitle',
  'successText',
  'text',
  'title',
  'tooltip',
]);

const UI_VARIABLE_RE = /(?:ariaLabel|caption|description|emptyText|errorMessage|errorText|heading|help|label|loadingText|message|notFoundContent|placeholder|statusText|subtitle|successMessage|successText|text|title|tooltip)$/i;

const USER_MESSAGE_CALL_RE = /(?:^|\.)(?:message|toast|notification)\.(?:success|error|warning|warn|info|loading|open)$/i;
const USER_DIALOG_CALL_RE = /(?:^|\.)(?:alert|confirm|prompt)$/i;
const MODAL_CALL_RE = /(?:^|\.)Modal\.(?:confirm|info|success|error|warning)$/;

const ENGLISH_MARKERS = new Set([
  'a', 'all', 'and', 'are', 'as', 'at', 'back', 'browse', 'cancel', 'changes',
  'choose', 'close', 'confirm', 'continue', 'create', 'current', 'dashboard',
  'delete', 'description', 'edit', 'error', 'filter', 'for', 'from', 'help',
  'in', 'is', 'learn', 'loading', 'manage', 'modified', 'my', 'new', 'next',
  'no', 'not', 'of', 'on', 'or', 'overview', 'please', 'previous', 'profile',
  'project', 'results', 'save', 'search', 'select', 'settings', 'sign', 'submit',
  'success', 'the', 'this', 'to', 'update', 'upload', 'user', 'view', 'warning',
  'with', 'world', 'you', 'your',
]);

const FRENCH_MARKERS = new Set([
  'à', 'au', 'aux', 'avec', 'ce', 'cette', 'choisir', 'créer', 'dans', 'de',
  'des', 'du', 'en', 'enregistrer', 'est', 'et', 'la', 'le', 'les', 'modifier',
  'non', 'ou', 'pour', 'profil', 'rechercher', 'résultats', 'sélectionner',
  'sur', 'un', 'une', 'vos', 'votre', 'vous',
]);

const TECHNICAL_EXACT = new Set([
  'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS',
  'true', 'false', 'null', 'undefined',
]);

function normalizeSlashes(value) {
  return value.replaceAll('\\', '/');
}

function rel(filePath) {
  return normalizeSlashes(path.relative(ROOT, filePath));
}

function isTestFile(filePath) {
  const relative = rel(filePath);
  const parts = relative.split('/');
  if (parts.some((part) => TEST_DIR_NAMES.has(part))) return true;
  return /(?:^|\.)(?:test|spec)\.[cm]?[jt]sx?$/i.test(path.basename(filePath));
}

function isStoryFile(filePath) {
  return /\.stories\.[cm]?[jt]sx?$/i.test(path.basename(filePath));
}

function shouldSkipFile(filePath) {
  const relative = rel(filePath);
  if (relative === 'next-env.d.ts' || relative.endsWith('/next-env.d.ts')) return true;
  if (relative.endsWith('.d.ts')) return true;
  if (!INCLUDE_TESTS && isTestFile(filePath)) return true;
  if (!INCLUDE_STORIES && isStoryFile(filePath)) return true;
  return false;
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      if (!INCLUDE_TESTS && TEST_DIR_NAMES.has(entry.name)) continue;
      if (/_Dump$/i.test(entry.name) || /_dump$/i.test(entry.name)) continue;
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!SOURCE_EXTENSIONS.has(path.extname(entry.name))) continue;
    if (shouldSkipFile(fullPath)) continue;
    files.push(fullPath);
  }

  return files;
}

function normalizeMessage(value) {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[\t ]+/g, ' ')
    .replace(/ *\n */g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsHumanText(value) {
  return /\p{L}/u.test(value);
}

function looksLikeUrlOrPath(value) {
  const s = value.trim();
  if (/^(?:https?:|mailto:|tel:|data:|blob:)/i.test(s)) return true;
  if (/^\/?[\w.-]+(?:\/[\w.@%+~#=?&-]+)+\/?$/.test(s) && !/\s/.test(s)) return true;
  if (/^\.\.?\//.test(s)) return true;
  return false;
}

function looksLikeCode(value) {
  const s = value.trim();
  if (/^[.#][\w-]+$/.test(s)) return true;
  if (/^(?:var\(|rgb\(|rgba\(|hsl\(|hsla\(|calc\(|clamp\()/i.test(s)) return true;
  if (/^(?:flex|grid|block|inline|none|auto|inherit|initial|unset)$/i.test(s)) return true;
  if (/^[a-z0-9_-]+:[a-z0-9_./-]+$/i.test(s)) return true;
  if (/^[a-z0-9_-]+(?:\.[a-z0-9_-]+){2,}$/i.test(s)) return true;
  if (/^[A-Z0-9_]{3,}$/.test(s) && !/\s/.test(s)) return true;
  if (/^#[0-9a-f]{3,8}$/i.test(s)) return true;
  return false;
}

function isTranslatableCandidate(value) {
  const s = normalizeMessage(value);
  if (!s || s.length < 2) return false;
  if (!containsHumanText(s)) return false;
  if (TECHNICAL_EXACT.has(s)) return false;
  if (looksLikeUrlOrPath(s)) return false;
  if (looksLikeCode(s)) return false;
  if (/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(s)) return false;
  if (/^[A-Fa-f0-9]{8,}$/.test(s)) return false;
  if (/^[\w.-]+\.(?:ts|tsx|js|jsx|json|css|scss|svg|png|jpg|jpeg|webp)$/i.test(s)) return false;
  return true;
}

function languageHint(value) {
  const lower = value.toLocaleLowerCase('en-CA');
  const tokens = lower.match(/\p{L}+(?:['’]\p{L}+)?/gu) ?? [];
  let en = 0;
  let fr = 0;

  for (const token of tokens) {
    if (ENGLISH_MARKERS.has(token)) en += 1;
    if (FRENCH_MARKERS.has(token)) fr += 1;
  }

  if (/[àâçéèêëîïôùûüÿœ]/i.test(value)) fr += 2;
  if (/\b(?:the|this|that|please|your|with|without|from|into|could|would|should)\b/i.test(value)) en += 2;

  if (en >= fr + 1) return 'en';
  if (fr >= en + 1) return 'fr';
  return 'unknown';
}

function cleanPlaceholderName(text, fallback) {
  const identifier = text
    .replace(/\?\./g, '.')
    .match(/[A-Za-z_$][\w$]*(?!.*[A-Za-z_$][\w$]*)/)?.[0];
  return identifier || fallback;
}

function expressionToMessages(node) {
  if (!node) return [];

  if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
    return [node.getLiteralValue()];
  }

  if (Node.isTemplateExpression(node)) {
    let result = node.getHead().getLiteralText();
    let index = 1;
    for (const span of node.getTemplateSpans()) {
      const exprText = span.getExpression().getText();
      const placeholder = cleanPlaceholderName(exprText, `value${index}`);
      result += `{${placeholder}}${span.getLiteral().getLiteralText()}`;
      index += 1;
    }
    return [result];
  }

  if (Node.isParenthesizedExpression(node)) {
    return expressionToMessages(node.getExpression());
  }

  if (Node.isConditionalExpression(node)) {
    return [
      ...expressionToMessages(node.getWhenTrue()),
      ...expressionToMessages(node.getWhenFalse()),
    ];
  }

  if (Node.isBinaryExpression(node) && node.getOperatorToken().getKind() === SyntaxKind.PlusToken) {
    const left = expressionToSingleMessagePart(node.getLeft(), 'left');
    const right = expressionToSingleMessagePart(node.getRight(), 'right');
    if (left !== null && right !== null) return [`${left}${right}`];
  }

  if (Node.isArrayLiteralExpression(node)) {
    return node.getElements().flatMap((element) => expressionToMessages(element));
  }

  return [];
}

function expressionToSingleMessagePart(node, fallback) {
  const messages = expressionToMessages(node);
  if (messages.length === 1) return messages[0];

  if (
    Node.isIdentifier(node) ||
    Node.isPropertyAccessExpression(node) ||
    Node.isElementAccessExpression(node) ||
    Node.isCallExpression(node)
  ) {
    return `{${cleanPlaceholderName(node.getText(), fallback)}}`;
  }

  return null;
}

function unwrapJsxInitializer(initializer) {
  if (!initializer) return null;
  if (Node.isStringLiteral(initializer)) return initializer;
  if (Node.isJsxExpression(initializer)) return initializer.getExpression();
  return null;
}

function propertyNameText(node) {
  try {
    return node.getNameNode().getText().replace(/^['"]|['"]$/g, '');
  } catch {
    return '';
  }
}

function nearestVariableName(node) {
  const declaration = node.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
  return declaration?.getNameNode().getText() ?? '';
}

function possibleContentReason(node, text) {
  const variable = nearestVariableName(node);
  const file = rel(node.getSourceFile().getFilePath());

  if (/(?:mock|fixture|sample|seed|demoData|fake|exampleData|staticData)/i.test(variable)) {
    return `possible content/data (${variable})`;
  }
  if (/\b(?:fixtures?|mocks?|seed-data)\b/i.test(file)) {
    return 'possible content/data (fixture/mock path)';
  }
  if (text.length > 280) return 'long text: review whether UI copy or content';
  if (/^[{[]/.test(text) && /[}\]]$/.test(text)) return 'code/data-looking text';
  return '';
}

function inferNamespace(filePath) {
  const relative = rel(filePath);
  const parts = relative.split('/');

  const appIndex = parts.indexOf('app');
  if (appIndex !== -1 && parts[appIndex + 1]) {
    const segment = parts[appIndex + 1].replace(/^\(|\)$/g, '');
    if (segment && !segment.startsWith('_')) return safeKeySegment(segment);
  }

  const routesMatch = relative.match(/routes\/routes([A-Za-z0-9_-]+)\./);
  if (routesMatch) return `navigation.${safeKeySegment(routesMatch[1])}`;

  const meaningfulDir = ['worlds', 'layout-components', 'auth0-components'].find((name) =>
    parts.includes(name),
  );
  if (meaningfulDir === 'worlds') return 'worlds';
  if (meaningfulDir === 'layout-components') return 'shell';
  if (meaningfulDir === 'auth0-components') return 'auth';

  return 'common';
}

function safeKeySegment(value) {
  return value
    .replace(/[^A-Za-z0-9]+(.)/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^[A-Z]/, (c) => c.toLowerCase())
    .replace(/[^A-Za-z0-9]/g, '') || 'common';
}

function messageToKeySegment(text) {
  const withoutPlaceholders = text.replace(/\{[^}]+\}/g, ' value ');
  const words = withoutPlaceholders.match(/[A-Za-z0-9]+/g) ?? [];
  const selected = words.slice(0, 9);
  if (!selected.length) return 'message';

  const [first, ...rest] = selected;
  let result = first.toLowerCase();
  for (const word of rest) {
    result += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  if (/^\d/.test(result)) result = `message${result}`;
  return result.slice(0, 72);
}

function stableSuffix(text) {
  return crypto.createHash('sha1').update(text).digest('hex').slice(0, 6);
}

function suggestedKey(filePath, text) {
  const namespace = inferNamespace(filePath);
  return `${namespace}.${messageToKeySegment(text)}_${stableSuffix(text)}`;
}

function codeSnippet(node) {
  const sourceFile = node.getSourceFile();
  const line = node.getStartLineNumber();
  const lines = sourceFile.getFullText().split(/\r?\n/);
  return (lines[line - 1] ?? '').trim().slice(0, 260);
}

const occurrences = [];
const seenOccurrence = new Set();

function addOccurrence({ node, rawText, kind, context, confidence = 'high' }) {
  const text = normalizeMessage(rawText);
  if (!isTranslatableCandidate(text)) return;
  if (confidenceRank[confidence] < confidenceRank[MIN_CONFIDENCE]) return;

  const hint = languageHint(text);
  if (ENGLISH_ONLY && hint === 'fr') return;

  const filePath = node.getSourceFile().getFilePath();
  const relative = rel(filePath);
  const line = node.getStartLineNumber();
  const column = node.getStartLinePos
    ? node.getStart() - node.getStartLinePos() + 1
    : 1;
  const contentReason = possibleContentReason(node, text);
  const effectiveConfidence = contentReason && confidence === 'high' ? 'medium' : confidence;

  if (confidenceRank[effectiveConfidence] < confidenceRank[MIN_CONFIDENCE]) return;

  const identity = `${relative}:${line}:${column}:${kind}:${text}`;
  if (seenOccurrence.has(identity)) return;
  seenOccurrence.add(identity);

  occurrences.push({
    text,
    language_hint: hint,
    suggested_key: suggestedKey(filePath, text),
    namespace: inferNamespace(filePath),
    file: relative,
    line,
    column,
    kind,
    context,
    confidence: effectiveConfidence,
    possible_content: Boolean(contentReason),
    review_note: contentReason,
    snippet: codeSnippet(node),
  });
}

function addExpressionMessages({ node, expression, kind, context, confidence }) {
  for (const message of expressionToMessages(expression)) {
    addOccurrence({ node, rawText: message, kind, context, confidence });
  }
}

function hasClaimingUiAncestor(node) {
  for (const ancestor of node.getAncestors()) {
    if (Node.isJsxAttribute(ancestor)) {
      const prop = ancestor.getNameNode().getText().toLowerCase();
      return VISIBLE_JSX_PROPS.has(prop);
    }
    if (Node.isJsxExpression(ancestor) && !Node.isJsxAttribute(ancestor.getParent())) return true;
    if (Node.isPropertyAssignment(ancestor)) {
      const key = propertyNameText(ancestor);
      const relative = rel(ancestor.getSourceFile().getFilePath());
      if (UI_OBJECT_KEYS.has(key) || (key === 'name' && /(?:^|\/)routes\//.test(relative))) return true;
    }
    if (Node.isVariableDeclaration(ancestor) && UI_VARIABLE_RE.test(ancestor.getNameNode().getText())) return true;
    if (Node.isCallExpression(ancestor)) {
      const callee = ancestor.getExpression().getText();
      if (USER_MESSAGE_CALL_RE.test(callee) || USER_DIALOG_CALL_RE.test(callee) || MODAL_CALL_RE.test(callee)) return true;
    }
  }
  return false;
}

function isImportLikeLiteral(node) {
  const parent = node.getParent();
  return Boolean(
    parent && (
      Node.isImportDeclaration(parent) ||
      Node.isExportDeclaration(parent)
    )
  );
}

function looksHumanEnoughForFallback(text) {
  const s = normalizeMessage(text);
  if (!isTranslatableCandidate(s)) return false;
  if (/\s/.test(s)) return true;
  if (/^[A-ZÀ-ÖØ-Þ][\p{L}'’.-]{2,}$/u.test(s)) return true;
  if (/[!?…]/.test(s)) return true;
  return false;
}

function scanSourceFile(sourceFile) {
  const filePath = sourceFile.getFilePath();
  const relative = rel(filePath);

  sourceFile.forEachDescendant((node) => {
    if (Node.isJsxText(node)) {
      addOccurrence({
        node,
        rawText: node.getText(),
        kind: 'jsx_text',
        context: 'Visible JSX text',
        confidence: 'high',
      });
      return;
    }

    if (Node.isJsxAttribute(node)) {
      const prop = node.getNameNode().getText();
      if (!VISIBLE_JSX_PROPS.has(prop.toLowerCase())) return;

      const expression = unwrapJsxInitializer(node.getInitializer());
      if (!expression) return;
      addExpressionMessages({
        node,
        expression,
        kind: 'jsx_attribute',
        context: `JSX prop: ${prop}`,
        confidence: 'high',
      });
      return;
    }

    if (Node.isJsxExpression(node) && !Node.isJsxAttribute(node.getParent())) {
      const expression = node.getExpression();
      if (!expression) return;
      addExpressionMessages({
        node,
        expression,
        kind: 'jsx_expression',
        context: 'Visible JSX expression',
        confidence: 'high',
      });
      return;
    }

    if (Node.isPropertyAssignment(node)) {
      const key = propertyNameText(node);
      const routeName = key === 'name' && /(?:^|\/)routes\//.test(relative);
      const uiKey = UI_OBJECT_KEYS.has(key);
      if (!routeName && !uiKey) return;

      addExpressionMessages({
        node,
        expression: node.getInitializer(),
        kind: routeName ? 'route_name' : 'object_ui_property',
        context: routeName ? 'Route/menu name' : `Object UI property: ${key}`,
        confidence: routeName || ['label', 'title', 'subtitle', 'message'].includes(key)
          ? 'high'
          : 'medium',
      });
      return;
    }

    if (Node.isVariableDeclaration(node)) {
      const name = node.getNameNode().getText();
      if (!UI_VARIABLE_RE.test(name)) return;
      const initializer = node.getInitializer();
      if (!initializer) return;

      addExpressionMessages({
        node,
        expression: initializer,
        kind: 'ui_variable',
        context: `UI-like variable: ${name}`,
        confidence: 'medium',
      });
      return;
    }

    if (Node.isCallExpression(node)) {
      const callee = node.getExpression().getText();
      const isUserMessage = USER_MESSAGE_CALL_RE.test(callee);
      const isDialog = USER_DIALOG_CALL_RE.test(callee);
      const isModal = MODAL_CALL_RE.test(callee);
      if (isUserMessage || isDialog || isModal) {
        for (const argument of node.getArguments()) {
          if (Node.isObjectLiteralExpression(argument)) {
            // Object fields such as { message, description, title, okText } are
            // handled by PropertyAssignment above.
            continue;
          }
          addExpressionMessages({
            node,
            expression: argument,
            kind: 'user_message_call',
            context: `User-facing call: ${callee}`,
            confidence: 'high',
          });
        }
        return;
      }
    }

    if ((Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) && !hasClaimingUiAncestor(node)) {
      if (isImportLikeLiteral(node)) return;
      const text = node.getLiteralValue();
      if (!looksHumanEnoughForFallback(text)) return;
      addOccurrence({
        node,
        rawText: text,
        kind: 'fallback_literal',
        context: 'Generic human-looking literal; review before translating',
        confidence: 'low',
      });
    }
  });
}

function sortOccurrences(values) {
  return values.sort((a, b) =>
    a.file.localeCompare(b.file) ||
    a.line - b.line ||
    a.column - b.column ||
    a.text.localeCompare(b.text),
  );
}

function deduplicate(values) {
  const groups = new Map();

  for (const occurrence of values) {
    const key = occurrence.text;
    if (!groups.has(key)) {
      groups.set(key, {
        text: occurrence.text,
        language_hint: occurrence.language_hint,
        suggested_key: occurrence.suggested_key,
        namespaces: new Set(),
        occurrence_count: 0,
        files: new Set(),
        occurrences: [],
      });
    }

    const group = groups.get(key);
    group.occurrence_count += 1;
    group.namespaces.add(occurrence.namespace);
    group.files.add(occurrence.file);
    group.occurrences.push({
      file: occurrence.file,
      line: occurrence.line,
      column: occurrence.column,
      kind: occurrence.kind,
      context: occurrence.context,
      confidence: occurrence.confidence,
      possible_content: occurrence.possible_content,
    });
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      namespaces: [...group.namespaces].sort(),
      file_count: group.files.size,
      files: [...group.files].sort(),
    }))
    .sort((a, b) => b.occurrence_count - a.occurrence_count || a.text.localeCompare(b.text));
}

function csvCell(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return `"${s.replaceAll('"', '""')}"`;
}

function toCsv(rows) {
  const fields = [
    'text',
    'language_hint',
    'suggested_key',
    'namespace',
    'file',
    'line',
    'column',
    'kind',
    'context',
    'confidence',
    'possible_content',
    'review_note',
    'snippet',
  ];

  const lines = [fields.map(csvCell).join(',')];
  for (const row of rows) {
    lines.push(fields.map((field) => csvCell(row[field])).join(','));
  }
  return `\uFEFF${lines.join('\n')}\n`;
}

function countBy(values, field) {
  const result = {};
  for (const item of values) {
    const key = item[field] || 'unknown';
    result[key] = (result[key] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)));
}

function summaryMarkdown(summary, unique) {
  const top = unique.slice(0, 25);
  return `# Konnaxion UI translation extraction\n\n` +
    `Generated: ${summary.generated_at}\n\n` +
    `- Source root: \`${summary.root}\`\n` +
    `- Source files scanned: **${summary.files_scanned}**\n` +
    `- Candidate occurrences: **${summary.occurrences}**\n` +
    `- Unique candidate strings: **${summary.unique_strings}**\n` +
    `- Possible content/data requiring review: **${summary.possible_content_occurrences}**\n` +
    `- English-only mode: **${summary.options.english_only}**\n` +
    `- Minimum confidence: **${summary.options.min_confidence}**\n\n` +
    `## By detection kind\n\n` +
    Object.entries(summary.by_kind).map(([k, v]) => `- ${k}: ${v}`).join('\n') +
    `\n\n## By language hint\n\n` +
    Object.entries(summary.by_language_hint).map(([k, v]) => `- ${k}: ${v}`).join('\n') +
    `\n\n## Most repeated strings\n\n` +
    `| Count | Text |\n|---:|---|\n` +
    top.map((item) => `| ${item.occurrence_count} | ${item.text.replaceAll('|', '\\|')} |`).join('\n') +
    `\n\n## Review guidance\n\n` +
    `This is an inventory, not an automatic migration. Review rows where \`possible_content=true\` before creating i18n keys. ` +
    `Database/API/user-authored content should normally stay outside the UI translation catalog.\n`;
}

async function main() {
  const files = await walk(ROOT);
  if (!files.length) {
    fail(`No source files found under ${ROOT}`);
    return;
  }

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      allowJs: true,
      checkJs: false,
    },
  });

  project.addSourceFilesAtPaths(files);
  for (const sourceFile of project.getSourceFiles()) {
    scanSourceFile(sourceFile);
  }

  sortOccurrences(occurrences);
  const unique = deduplicate(occurrences);
  const summary = {
    generated_at: new Date().toISOString(),
    root: normalizeSlashes(path.relative(FRONTEND_ROOT, ROOT) || '.'),
    files_scanned: files.length,
    occurrences: occurrences.length,
    unique_strings: unique.length,
    possible_content_occurrences: occurrences.filter((item) => item.possible_content).length,
    by_kind: countBy(occurrences, 'kind'),
    by_confidence: countBy(occurrences, 'confidence'),
    by_language_hint: countBy(occurrences, 'language_hint'),
    options: {
      include_tests: INCLUDE_TESTS,
      include_stories: INCLUDE_STORIES,
      english_only: ENGLISH_ONLY,
      min_confidence: MIN_CONFIDENCE,
    },
  };

  await fs.mkdir(OUT_DIR, { recursive: true });
  await Promise.all([
    fs.writeFile(
      path.join(OUT_DIR, 'ui-translation-occurrences.json'),
      `${JSON.stringify(occurrences, null, 2)}\n`,
      'utf8',
    ),
    fs.writeFile(
      path.join(OUT_DIR, 'ui-translation-occurrences.csv'),
      toCsv(occurrences),
      'utf8',
    ),
    fs.writeFile(
      path.join(OUT_DIR, 'ui-translation-unique.json'),
      `${JSON.stringify(unique, null, 2)}\n`,
      'utf8',
    ),
    fs.writeFile(
      path.join(OUT_DIR, 'ui-translation-summary.json'),
      `${JSON.stringify(summary, null, 2)}\n`,
      'utf8',
    ),
    fs.writeFile(
      path.join(OUT_DIR, 'ui-translation-summary.md'),
      summaryMarkdown(summary, unique),
      'utf8',
    ),
  ]);

  console.log(`[i18n-extract] scanned ${files.length} source files`);
  console.log(`[i18n-extract] ${occurrences.length} candidate occurrences`);
  console.log(`[i18n-extract] ${unique.length} unique candidate strings`);
  console.log(`[i18n-extract] output -> ${normalizeSlashes(path.relative(FRONTEND_ROOT, OUT_DIR))}`);
}

main().catch((error) => {
  fail(error instanceof Error ? error.stack || error.message : String(error));
});
