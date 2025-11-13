#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
endpoint_corrector.py
Safely applies endpoint mappings in JS/TS code by replacing ONLY inside string literals
(single, double, template-literal quasi segments), avoiding code/bracket artifacts.

Usage (dry-run):
  python3 endpoint_corrector.py --mapping mapping.csv --root ./frontend \
    --dry-run --write-patch changes.patch --write-json changes.json

Apply:
  python3 endpoint_corrector.py --mapping mapping.csv --root ./frontend \
    --backup --write-json changes.json

CSV header (case-insensitive) accepted:
  from,to[,type][,action]
  old,new[,type][,action]
  frontend_route,backend_target[,type][,action]
If no header is present, the first two columns are treated as from,to.
type: exact | prefix (default exact).
action filter: use --include-actions to select which rows to apply; defaults to alias-or-rename,map,rename,replace (skips 'keep' and 'review').
"""
import argparse, csv, os, re, sys, json, difflib
from pathlib import Path
from typing import List, Tuple, Dict, Optional

ALLOWED_EXTS_DEFAULT = {".ts",".tsx",".js",".jsx",".mjs",".cjs"}
EXCLUDE_DIRS_DEFAULT = {"node_modules",".git","dist","build",".next","out","coverage","__tests__","cypress"}

class ReplacementRule:
    __slots__ = ("old","new","type","pattern","_prefix_guard")
    def __init__(self, old:str, new:str, type_:str="exact"):
        self.old = old
        self.new = new
        self.type = type_.lower() if type_ in ("exact","prefix") else "exact"
        self._prefix_guard = None
        self.pattern = self._compile()

    @staticmethod
    def _boundary():
        # token characters for URL segments (avoid partial matches)
        return r"[A-Za-z0-9_\-]"

    def _compile(self):
        before = rf"(?<!{self._boundary()})"
        after  = rf"(?!{self._boundary()})"
        esc_old = re.escape(self.old)

        if self.type == "prefix":
            # special case: if new = prefix + old, guard against double-prefix
            if self.new.endswith(self.old):
                prefix = self.new[:-len(self.old)]
                self._prefix_guard = prefix
                guard = rf"(?<!{re.escape(prefix)})"
                return re.compile(guard + esc_old + after)
            # else, regular guarded exact
            return re.compile(before + esc_old + after)
        else:
            return re.compile(before + esc_old + after)

    def apply(self, s:str) -> Tuple[str,int]:
        return self.pattern.subn(self.new, s)


def load_mapping(csv_path: Path, include_actions: Optional[List[str]]) -> List[ReplacementRule]:
    if not csv_path.exists():
        raise FileNotFoundError(f"mapping file not found: {csv_path}")
    rows = []
    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        for raw in csv.reader(f):
            if not raw: continue
            # allow comments
            if raw[0].strip().startswith("#"): continue
            rows.append(raw)

    if not rows: return []

    header = None
    # determine if first row is header (no leading slash or named columns)
    if rows and (not rows[0][0].strip().startswith("/") or rows[0][0].lower() in ("from","old","frontend_route")):
        header = [c.strip().lower() for c in rows[0]]
        data = rows[1:]
    else:
        data = rows

    def parse_row(r):
        if header:
            cols = {header[i]: (r[i].strip() if i < len(r) else "") for i in range(len(r))}
            frm = cols.get("from") or cols.get("old") or cols.get("frontend_route") or ""
            to  = cols.get("to") or cols.get("new") or cols.get("backend_target") or ""
            typ = (cols.get("type") or "exact").lower()
            act = (cols.get("action") or "").lower()
        else:
            frm = r[0].strip() if len(r) > 0 else ""
            to  = r[1].strip() if len(r) > 1 else ""
            typ = r[2].strip().lower() if len(r) > 2 else "exact"
            act = r[3].strip().lower() if len(r) > 3 else ""
        return frm, to, typ, act

    rules = []
    seen = set()
    for r in data:
        frm, to, typ, act = parse_row(r)
        if not frm or not to: continue
        if include_actions:
            if act and act not in include_actions:
                continue
            if (not act) and ("keep" in include_actions):
                continue
        key = (frm, to, typ)
        if key in seen: continue
        seen.add(key)
        rules.append((frm, to, typ))

    # sort longest 'from' first to avoid cascades; stable otherwise
    rules.sort(key=lambda t: len(t[0]), reverse=True)

    return [ReplacementRule(frm, to, typ) for frm,to,typ in rules]


def iter_string_spans_js(text:str):
    """
    Yield (start,end) for string-literal spans:
    - '...'
    - "..."
    - template literals: emit quasi segments outside ${...}
    """
    n = len(text)
    i = 0
    while i < n:
        c = text[i]
        if c in ("'", '"'):
            quote = c; start = i+1; i += 1
            while i < n:
                ch = text[i]
                if ch == "\\":
                    i += 2; continue
                if ch == quote:
                    yield (start, i)
                    i += 1
                    break
                i += 1
            continue
        if c == "`":
            i += 1
            start_quasi = i
            depth = 0
            while i < n:
                ch = text[i]
                if ch == "\\":
                    i += 2; continue
                if ch == "$" and i+1 < n and text[i+1] == "{":
                    # flush quasi before expression
                    if start_quasi < i:
                        yield (start_quasi, i)
                    i += 2
                    depth = 1
                    # skip expression including nested braces
                    while i < n and depth > 0:
                        ch2 = text[i]
                        if ch2 == "\\":
                            i += 2; continue
                        if ch2 == "{":
                            depth += 1
                        elif ch2 == "}":
                            depth -= 1
                        i += 1
                    start_quasi = i
                    continue
                if ch == "`":
                    if start_quasi < i:
                        yield (start_quasi, i)
                    i += 1
                    break
                i += 1
            continue
        i += 1


def apply_rules_to_text(text:str, rules:List[ReplacementRule]):
    """
    Replace only within string spans; return new_text and per-rule counts.
    Extra safety: skip 'prefix' rules immediately after a ${...} boundary to avoid double-prefix
    when base already includes '/api' or similar.
    """
    if not rules:
        return text, {}

    pieces = []
    counts = { (r.old, r.new, r.type): 0 for r in rules }
    last = 0
    for (s,e) in iter_string_spans_js(text):
        if last < s:
            pieces.append(text[last:s])
        seg = text[s:e]
        prev_char = text[s-1] if s > 0 else ""
        for r in rules:
            if r.type == "prefix" and prev_char == "}":
                continue
            seg, n = r.apply(seg)
            if n:
                counts[(r.old, r.new, r.type)] += n
        pieces.append(seg)
        last = e
    if last < len(text):
        pieces.append(text[last:])
    return "".join(pieces), counts


def scan_files(root:Path, extensions:set, exclude_dirs:set):
    for p in root.rglob("*"):
        if p.is_dir():
            continue
        if any(part in exclude_dirs for part in p.parts):
            continue
        if p.suffix.lower() in extensions:
            yield p


def main():
    ap = argparse.ArgumentParser(description="Apply endpoint mapping safely inside JS/TS string literals.")
    ap.add_argument("--mapping", required=True, help="CSV path (from,to[,type][,action])")
    ap.add_argument("--root", required=True, help="Project root to scan")
    ap.add_argument("--extensions", default=",".join(sorted(ALLOWED_EXTS_DEFAULT)), help="Comma-separated file extensions to scan")
    ap.add_argument("--exclude-dirs", default=",".join(sorted(EXCLUDE_DIRS_DEFAULT)), help="Comma-separated dir names to exclude")
    ap.add_argument("--dry-run", action="store_true", help="Preview without writing")
    ap.add_argument("--backup", action="store_true", help="Write .bak files next to changed files")
    ap.add_argument("--write-patch", default="", help="Write unified diff patch to this file")
    ap.add_argument("--write-json", default="", help="Write JSON report to this file")
    ap.add_argument("--include-actions", default="alias-or-rename,map,rename,replace", help="Comma-separated actions to include (default skips 'keep' and 'review')")
    args = ap.parse_args()

    mapping_path = Path(args.mapping)
    root = Path(args.root)
    extensions = {e if e.startswith(".") else "."+e for e in args.extensions.split(",") if e.strip()}
    exclude_dirs = {d.strip() for d in args.exclude_dirs.split(",") if d.strip()}
    include_actions = [x.strip().lower() for x in args.include_actions.split(",") if x.strip()] if args.include_actions else None

    rules = load_mapping(mapping_path, include_actions)
    if not rules:
        print("[info] No rules to apply (mapping filtered to empty).")
        sys.exit(0)

    changed = []
    patch_chunks = []
    summary = { (r.old, r.new, r.type): 0 for r in rules }

    for fp in scan_files(root, extensions, exclude_dirs):
        try:
            text = fp.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        new_text, counts = apply_rules_to_text(text, rules)
        if new_text != text:
            for k,v in counts.items():
                summary[k] += v
            if args.dry-run:
                diff = difflib.unified_diff(
                    text.splitlines(keepends=True),
                    new_text.splitlines(keepends=True),
                    fromfile=str(fp), tofile=str(fp)
                )
                patch_chunks.append("".join(diff))
            else:
                if args.backup:
                    bak = fp.with_suffix(fp.suffix + ".bak")
                    if not bak.exists():
                        bak.write_text(text, encoding="utf-8")
                fp.write_text(new_text, encoding="utf-8")
                if args.write_patch:
                    diff = difflib.unified_diff(
                        text.splitlines(keepends=True),
                        new_text.splitlines(keepends=True),
                        fromfile=str(fp), tofile=str(fp)
                    )
                    patch_chunks.append("".join(diff))
            changed.append(str(fp))

    if args.write_patch:
        Path(args.write_patch).write_text("\n".join(patch_chunks), encoding="utf-8")
    if args.write_json:
        report = {
            "root": str(root),
            "mapping": str(mapping_path),
            "rules": [{"from": r.old, "to": r.new, "type": r.type} for r in rules],
            "changed_files": changed,
            "counts": [
                {"from": k[0], "to": k[1], "type": k[2], "replacements": v}
                for k,v in summary.items() if v
            ],
        }
        Path(args.write_json).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    total = sum(v for v in summary.values())
    print(f"[done] files changed: {len(changed)}; replacements: {total}")
    for (old,new,typ),v in summary.items():
        if v:
            print(f"  - {old} → {new} ({typ}): {v}")

if __name__ == "__main__":
    main()
