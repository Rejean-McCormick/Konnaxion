import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const SRC_DIRS = ["services","modules","hooks","shared"];
const exts = new Set([".ts",".tsx",".js",".jsx"]);
const hits = [];

async function walk(dir, acc=[]) {
  let entries = [];
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, acc);
    else if (exts.has(path.extname(p))) acc.push(p);
  }
  return acc;
}

function scanFile(file, text) {
  const rel = file.replace(/\\/g,"/");

  // helpers from services/_request.ts (get|post|put|patch|del) :contentReference[oaicite:1]{index=1}
  const reHelpers = /\b(get|post|put|patch|del)\s*(?:<[^>]*>)?\s*\(\s*([`'"])([^`'"]+)\2/g;

  // direct axios instance from shared/api.ts (api.get|post|put|patch|delete) :contentReference[oaicite:2]{index=2}
  const reAxios = /\bapi\.(get|post|put|patch|delete)\s*(?:<[^>]*>)?\s*\(\s*([`'"])([^`'"]+)\2/g;

  // raw fetch(...)
  const reFetch = /\bfetch\(\s*([`'"])([^`'"]+)\1/g;

  let m;
  while ((m = reHelpers.exec(text))) hits.push({ file: rel, method: m[1].toUpperCase(), url: m[3] });
  while ((m = reAxios.exec(text)))   hits.push({ file: rel, method: m[1].toUpperCase(), url: m[3] });
  while ((m = reFetch.exec(text)))   hits.push({ file: rel, method: "FETCH", url: m[2] });
}

(async () => {
  const files = [];
  for (const d of SRC_DIRS) await walk(path.join(ROOT, d), files);

  for (const f of files) {
    const s = await fs.readFile(f, "utf8").catch(() => null);
    if (s != null) scanFile(f, s);
  }

  hits.sort((a,b)=> a.url.localeCompare(b.url) || a.method.localeCompare(b.method) || a.file.localeCompare(b.file));

  const csv = "method,url,file\n" + hits.map(r => `${r.method},${r.url},${r.file}`).join("\n");
  await fs.writeFile("frontend_endpoints.json", JSON.stringify(hits, null, 2), "utf8");
  await fs.writeFile("frontend_endpoints.csv",  csv, "utf8");
  console.log("wrote", hits.length, "endpoints");
})();
