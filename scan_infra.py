#!/usr/bin/env python3
# MIT License
"""
scan_infra.py — deep infra scanner for docker-compose, k8s, terraform and .env externals
"""
import argparse, os, sys
from pathlib import Path
from typing import Any, Dict, List, Set, Optional, Tuple

try:
    import yaml  # type: ignore
except Exception:
    print("ERROR: PyYAML is required. pip install pyyaml", file=sys.stderr)
    raise

IGNORE_DIRS = {".git",".hg",".svn",".idea",".vscode",".DS_Store","node_modules",".next",".parcel-cache","__pycache__",".venv","venv","env",".tox","build","dist","out","target","coverage",".turbo",".cache",".pytest_cache",".mypy_cache",".gradle",".sbt"}
YAML_EXTS = {".yml",".yaml"}

EXTERNAL_HINTS = {
    "STRIPE":"Stripe","AUTH0":"Auth0","COGNITO":"AWS Cognito","SENDGRID":"SendGrid","MAILGUN":"Mailgun",
    "S3":"AWS S3","GCS":"Google Cloud Storage","OPENAI":"OpenAI API","SUPABASE":"Supabase","FIREBASE":"Firebase",
    "MONGODB":"MongoDB Atlas","ALGOLIA":"Algolia","MAPBOX":"Mapbox","LIVEKIT":"Livekit","PLAID":"Plaid","TWILIO":"Twilio"
}

def read_text_safe(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""

def should_ignore_dir(dirname: str) -> bool:
    name = os.path.basename(dirname)
    return name in IGNORE_DIRS or (name.startswith(".") and name not in {".env"})

def iter_files(root: Path) -> List[Path]:
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if not should_ignore_dir(os.path.join(dirpath, d))]
        for f in filenames:
            files.append(Path(dirpath) / f)
    return files

def parse_compose(files: List[Path], repo_root: Path) -> Tuple[List[str], List[Dict[str, Any]]]:
    docker_files = [p for p in files if p.suffix.lower() in YAML_EXTS and ("compose" in p.name.lower() or "docker-compose" in p.name.lower())]
    services_meta: List[Dict[str, Any]] = []
    shown = []
    for p in docker_files:
        shown.append(str(p.relative_to(repo_root)))
        try:
            data = yaml.safe_load(read_text_safe(p))
        except Exception:
            data = None
        if not isinstance(data, dict): continue
        svcs = data.get("services") or {}
        for name, svc in svcs.items():
            meta = {"name": name, "image": svc.get("image"), "ports": svc.get("ports"), "depends_on": svc.get("depends_on"),
                    "environment_keys": sorted([k for k in (svc.get("environment") or {}).keys()]) if isinstance(svc.get("environment"), dict) else None}
            services_meta.append(meta)
    return [s for s in shown], services_meta

def detect_externals_from_env(text: str) -> Set[str]:
    ex: Set[str] = set()
    for ln in text.splitlines():
        if "=" not in ln: continue
        key = ln.split("=",1)[0].strip().upper()
        for hint, name in EXTERNAL_HINTS.items():
            if key.startswith(hint + "_") or key == hint: ex.add(name)
    return ex

def scan_infrastructure(repo_root: Path) -> Dict[str, Any]:
    all_files = iter_files(repo_root)
    compose_list, services_meta = parse_compose(all_files, repo_root)
    k8s = [str(p.relative_to(repo_root)) for p in all_files if "k8s" in str(p).lower() and p.suffix.lower() in {".yml",".yaml"}]
    terraform = [str(p.relative_to(repo_root)) for p in all_files if p.suffix.lower()==".tf"]

    externals: Set[str] = set()
    for p in all_files:
        if p.name == ".env" or p.suffix.lower() == ".env" or p.name.lower().startswith(".env"):
            externals |= detect_externals_from_env(read_text_safe(p))

    datastores = []
    # database engine will be inferred by django scanner; here we just describe services

    return {
        "system":"",
        "actors":[{"name":"User","type":"person"}],
        "externals":[{"name":e,"type":"system"} for e in sorted(externals)],
        "infra":{"docker": compose_list, "services": services_meta, "k8s": k8s, "terraform": terraform},
        "containers":[],
        "datastores": datastores,
        "messaging":[],
        "relations":[]
    }

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("repo", help="Path to repo root")
    ap.add_argument("--out", default="manifest_infra.yml")
    ap.add_argument("--system", default="Konnaxion")
    args = ap.parse_args()

    root = Path(args.repo).resolve()
    if not root.exists() or not root.is_dir():
        print(f"ERROR: {root} not found or not a directory", file=sys.stderr)
        return 2
    m = scan_infrastructure(root)
    m["system"] = args.system
    Path(args.out).write_text(yaml.safe_dump(m, sort_keys=False, allow_unicode=True), encoding="utf-8")
    print(f"Wrote {Path(args.out).resolve()}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
