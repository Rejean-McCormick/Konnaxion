#!/usr/bin/env python3
"""
add_use_client.py

Scan .ts/.tsx files to detect components that likely require `'use client'`,
and optionally add the directive at the top of each file when missing.

Heuristics to mark a file as "client-needed":
  - Imports from: recharts, @ant-design/plots, @ant-design/pro-components, @ant-design/compatible, socket.io-client, next/navigation, next/head
  - React client hooks: useState/useEffect/useLayoutEffect/useReducer/useMemo/useCallback/useRef/useTransition/useOptimistic/useActionState/useFormStatus
  - Direct DOM usage: window/document/localStorage/sessionStorage/navigator
  - (Optional) Imports from 'antd' (enabled by default; disable with --no-antd)

Exclusions:
  - node_modules, .next, dist, build, coverage, playwright-report
  - folders named index.test (unless --include-tests is passed)
  - declaration files *.d.ts

Usage:
  DRY RUN (report only):
    python add_use_client.py --root .
  WRITE changes:
    python add_use_client.py --root . --write
  WITHOUT antd as trigger:
    python add_use_client.py --root . --write --no-antd
"""

from __future__ import annotations
from pathlib import Path
import re
import sys
import json
import csv
import argparse

TRIGGER_IMPORTS = [
    r"from\s+['\"]recharts['\"]",
    r"from\s+['\"]@ant-design/plots['\"]",
    r"from\s+['\"]@ant-design/pro-components['\"]",
    r"from\s+['\"]@ant-design/compatible['\"]",
    r"from\s+['\"]socket\.io-client['\"]",
    r"from\s+['\"]next/navigation['\"]",
    r"from\s+['\"]next/head['\"]",
]
TRIGGER_IMPORTS_ANTD = [
    r"from\s+['\"]antd['\"]",
    r"from\s+['\"]@ant-design/icons['\"]",
]

TRIGGER_HOOKS = [
    r"\buse(State|Effect|LayoutEffect|Reducer|Memo|Callback|Ref|Transition|Optimistic|ActionState|FormStatus)\s*\(",
]
TRIGGER_DOM = [
    r"\b(window|document|localStorage|sessionStorage|navigator)\b",
]

USE_CLIENT_RE = re.compile(r"^\s*(['\"])use client\1\s*;?\s*$")
USE_SERVER_RE = re.compile(r"^\s*(['\"])use server\1\s*;?\s*$")

EXCLUDED_DIRS = {
    "node_modules", ".next", "dist", "build", "coverage", "playwright-report"
}

def should_exclude(path: Path, include_tests: bool) -> bool:
    parts = set(p.lower() for p in path.parts)
    if any(d in parts for d in EXCLUDED_DIRS):
        return True
    if not include_tests and any(part.lower() == "index.test" for part in path.parts):
        return True
    return False

def file_needs_client(text: str, no_antd: bool) -> bool:
    # Already has the directive at top? then no
    # We only check the first ~10 non-empty lines for directives.
    lines = [ln for ln in text.splitlines() if ln.strip() != ""]
    head = "\n".join(lines[:10])
    if USE_CLIENT_RE.search(head):
        return False
    if USE_SERVER_RE.search(head):
        # explicit server directive; do not mark as client
        return False

    # Triggers
    patterns = TRIGGER_IMPORTS[:]
    if not no_antd:
        patterns += TRIGGER_IMPORTS_ANTD
    for pat in patterns:
        if re.search(pat, text):
            return True
    for pat in TRIGGER_HOOKS + TRIGGER_DOM:
        if re.search(pat, text):
            return True
    return False

def prepend_use_client(text: str) -> str:
    # Insert at very beginning, before any imports.
    # Keep original newline style.
    newline = "\n"
    if "\r\n" in text and "\n" in text:
        newline = "\r\n"
    elif "\r\n" in text:
        newline = "\r\n"

    return f"'use client'{newline}{newline}{text}"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".", help="Project root")
    ap.add_argument("--write", action="store_true", help="Write changes to files")
    ap.add_argument("--no-antd", action="store_true", help="Do not treat 'antd' imports as client trigger")
    ap.add_argument("--include-tests", action="store_true", help="Include index.test folders")
    ap.add_argument("--ext", default="tsx,ts", help="Comma-separated extensions to scan")
    ap.add_argument("--report", default="use_client_report.json", help="JSON report path")
    ap.add_argument("--csv", default="use_client_report.csv", help="CSV report path")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    exts = {e.strip().lower() for e in args.ext.split(",") if e.strip()}
    changed = []
    results = []

    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower().lstrip(".") not in exts:
            continue
        if path.name.endswith(".d.ts"):
            continue
        if should_exclude(path, include_tests=args.include_tests):
            continue

        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue

        needs = file_needs_client(text, no_antd=args.no_antd)
        has_client = False
        # check presence again more globally to report
        if re.search(r"^\s*(['\"])use client\1\s*;?\s*$", text, flags=re.M):
            has_client = True

        item = {
            "file": str(path.relative_to(root)),
            "needs_client": needs,
            "has_use_client": has_client,
        }

        if needs and not has_client:
            item["action"] = "inserted" if args.write else "missing"
            if args.write:
                new_text = prepend_use_client(text)
                path.write_text(new_text, encoding="utf-8")
                changed.append(str(path))
        else:
            item["action"] = "none"

        results.append(item)

    # write reports
    report_path = root / args.report
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    csv_path = root / args.csv
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["file","needs_client","has_use_client","action"])
        w.writeheader()
        for r in results:
            w.writerow(r)

    # summary
    total = len(results)
    need = sum(1 for r in results if r["needs_client"])
    missing = sum(1 for r in results if r["needs_client"] and not r["has_use_client"])
    inserted = sum(1 for r in results if r["action"] == "inserted")
    print(f"Scanned: {total} files | Need client: {need} | Missing directive: {missing} | Inserted: {inserted}")
    print(f"JSON: {report_path}")
    print(f"CSV:  {csv_path}")

if __name__ == "__main__":
    main()
