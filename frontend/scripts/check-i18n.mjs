#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const localeDir = path.join(root, 'i18n', 'locales');
const routeDir = path.join(root, 'routes');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function flatten(value, prefix = '', out = new Map()) {
  if (typeof value === 'string') {
    out.set(prefix, value);
    return out;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Unsupported catalogue value at ${prefix || '<root>'}`);
  }

  for (const [key, child] of Object.entries(value)) {
    flatten(child, prefix ? `${prefix}.${key}` : key, out);
  }
  return out;
}

const en = flatten(readJson(path.join(localeDir, 'en.json')));
const fr = flatten(readJson(path.join(localeDir, 'fr.json')));
const errors = [];

for (const key of en.keys()) {
  if (!fr.has(key)) errors.push(`Missing in fr.json: ${key}`);
}
for (const key of fr.keys()) {
  if (!en.has(key)) errors.push(`Missing in en.json: ${key}`);
}

const routeFiles = fs
  .readdirSync(routeDir)
  .filter((name) => /^routes.*\.tsx$/.test(name));

const referenced = new Set();
for (const name of routeFiles) {
  const text = fs.readFileSync(path.join(routeDir, name), 'utf8');
  for (const match of text.matchAll(/labelKey:\s*['"]([^'"]+)['"]/g)) {
    referenced.add(match[1]);
  }
}

for (const key of referenced) {
  if (!en.has(key)) errors.push(`Route key missing in en.json: ${key}`);
  if (!fr.has(key)) errors.push(`Route key missing in fr.json: ${key}`);
}

if (errors.length) {
  console.error(`i18n check failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`i18n check OK: ${en.size} English leaves, ${fr.size} French leaves, ${referenced.size} route keys.`);
