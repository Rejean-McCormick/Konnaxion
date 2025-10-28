#!/usr/bin/env python3
# MIT License
"""
scan_nextjs.py — deep Next.js scanner producing a partial manifest.yml
"""
import argparse, os, re, sys
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    import yaml  # type: ignore
except Exception:
    print("ERROR: PyYAML is required. pip install pyyaml", file=sys.stderr)
    raise

IGNORE_DIRS = {".git",".hg",".svn",".idea",".vscode",".DS_Store","node_modules",".next",".parcel-cache","__pycache__",".turbo",".cache","dist","build","out"}
CODE_EXTS = {".js",".jsx",".ts",".tsx"}

RE_HTTP_JS = re.compile(r'(?:fetch|axios\.(get|post|put|delete|patch))\s*\(\s*[\'"]([^\'"]+)[\'"]')
RE_EXPORT_FN = re.compile(r'export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(', re.I)
RE_EXPORT_CONST = re.compile(r'export\s+const\s+(GET|POST|PUT|DELETE|PATCH)\s*=', re.I)

def read_text_safe(p: Path) -> str:
    try:
        return p.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""

def should_ignore_dir(dirname: str) -> bool:
    return dirname in IGNORE_DIRS or (dirname.startswith(".") and dirname not in {".env"})

def iter_files(root: Path) -> List[Path]:
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if not should_ignore_dir(d)]
        for f in filenames:
            files.append(Path(dirpath) / f)
    return files

def route_from_app(file: Path, root: Path) -> Optional[str]:
    rel = file.relative_to(root).as_posix()
    if "/app/" not in rel or "/route." not in rel: return None
    return "/" + rel.split("/app/",1)[1].split("/route.",1)[0].strip("/")

def route_from_pages_api(file: Path, root: Path) -> Optional[str]:
    rel = file.relative_to(root).as_posix()
    if "/pages/api/" not in rel: return None
    sub = rel.split("/pages/api/",1)[1].rsplit(".",1)[0]
    if sub.endswith("/index"): sub = sub[:-len("/index")]
    return "/api/" + sub.strip("/")

def page_from_app(file: Path, root: Path) -> Optional[str]:
    rel = file.relative_to(root).as_posix()
    if "/app/" not in rel or "/page." not in rel: return None
    sub = rel.split("/app/",1)[1].split("/page.",1)[0].strip("/")
    return "/" + sub

def scan_frontend(root: Path) -> Dict[str, Any]:
    all_files = iter_files(root)
    code_files = [p for p in all_files if p.suffix.lower() in CODE_EXTS]
    endpoints: List[Dict[str,str]] = []
    calls_out: List[Dict[str,str]] = []
    ui_pages: List[str] = []
    has_middleware = any(p.name == "middleware.ts" for p in all_files)
    has_next_config = any(p.name == "next.config.ts" for p in all_files)

    for p in code_files:
        rel = p.as_posix().lower()
        method = None
        if "/app/" in rel and "/route." in rel:
            ep = route_from_app(p, root)
            if ep:
                text = read_text_safe(p)
                m = RE_EXPORT_FN.search(text) or RE_EXPORT_CONST.search(text)
                method = (m.group(1).upper() if m else "ANY")
                endpoints.append({"method": method, "path": ep})
        if "/pages/api/" in rel:
            ep = route_from_pages_api(p, root)
            if ep:
                text = read_text_safe(p); m = RE_EXPORT_FN.search(text) or RE_EXPORT_CONST.search(text)
                method = (m.group(1).upper() if m else "ANY")
                endpoints.append({"method": method, "path": ep})

        if "/app/" in rel and "/page." in rel:
            pg = page_from_app(p, root)
            if pg: ui_pages.append(pg)

    # outbound calls
    for p in code_files:
        text = read_text_safe(p)
        for m in RE_HTTP_JS.finditer(text):
            url = m.group(1)
            method = (m.group(0).split("(")[0].split(".")[-1] if "." in m.group(0) else "GET").upper()
            entry = {"method": method, "path": url}
            if url.startswith("/"):
                entry["to"] = "Api"
            calls_out.append(entry)

    container = {"name":"WebApp","tech":"Next.js","src_paths":["./"], "metadata": {"ui_pages": sorted(set(ui_pages)), "has_middleware": has_middleware, "has_next_config": has_next_config}}
    if endpoints: container["endpoints_in"] = endpoints
    if calls_out: container["calls_out"] = calls_out

    m = {
        "system":"",
        "actors":[{"name":"User","type":"person"}],
        "externals":[],
        "infra":{"docker": [], "k8s": [], "terraform": []},
        "containers":[container],
        "datastores":[],
        "messaging":[],
        "relations":[]
    }
    return m

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("repo", help="Path to Next.js frontend root (folder containing app/ or pages/)")
    ap.add_argument("--out", default="manifest_front.yml")
    ap.add_argument("--system", default="Konnaxion")
    args = ap.parse_args()
    root = Path(args.repo).resolve()
    if not root.exists() or not root.is_dir():
        print(f"ERROR: {root} not found or not a directory", file=sys.stderr)
        return 2
    m = scan_frontend(root)
    m["system"] = args.system
    Path(args.out).write_text(yaml.safe_dump(m, sort_keys=False, allow_unicode=True), encoding="utf-8")
    print(f"Wrote {Path(args.out).resolve()}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
