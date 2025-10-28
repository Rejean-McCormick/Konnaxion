#!/usr/bin/env python3
# MIT License
"""
scan_django.py — deep Django/DRF (+Celery/Channels) scanner producing a partial manifest.yml
"""
import argparse, os, re, sys
from pathlib import Path
from typing import Any, Dict, List, Set, Optional, Tuple

try:
    import yaml  # type: ignore
except Exception:
    print("ERROR: PyYAML is required. pip install pyyaml", file=sys.stderr)
    raise

IGNORE_DIRS = {".git",".hg",".svn",".idea",".vscode",".DS_Store","node_modules",".next",".parcel-cache","__pycache__",".venv","venv","env",".tox","build","dist","out","target","coverage",".turbo",".cache",".pytest_cache",".mypy_cache",".gradle",".sbt"}
CODE_EXTS = {".py"}
YAML_EXTS = {".yml",".yaml"}

RE_DJANGO_PATH   = re.compile(r"path\(\s*['\"]([^'\"]+)['\"]\s*,")
RE_DJANGO_REPATH = re.compile(r"re_path\(\s*[ru]?['\"]([^'\"]+)['\"]\s*,")
RE_DRF_ROUTER    = re.compile(r"router\.register\(\s*['\"]([^'\"]+)['\"]")
RE_WS_PATTERN    = re.compile(r"['\"](ws/[^\"']+)['\"]")
RE_REQUESTS      = re.compile(r"(?:requests|httpx)\.(get|post|put|delete|patch)\s*\(\s*['\"]([^\"']+)['\"]")
RE_DATABASES_ENGINE = re.compile(r"django\.db\.backends\.([a-z0-9_\.]+)", re.I)
RE_CELERY_TASK = re.compile(r"@(?:shared_task|[a-zA-Z_][a-zA-Z0-9_]*\.task)\s*(?:\([^\)]*\))?\s*?\n\s*def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(")
RE_MODEL_CLASS = re.compile(r"class\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*models\.Model[^)]*)\)\s*:", re.M)

SETTING_CAPTURE_KEYS = [
    "INSTALLED_APPS",
    "MIDDLEWARE",
    "AUTHENTICATION_BACKENDS",
    "CACHES",
    "REST_FRAMEWORK",
    "DATABASES",
    "ALLOWED_HOSTS",
]

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

def parse_compose(files: List[Path], repo_root: Path) -> Tuple[List[str], Optional[str], Set[str]]:
    docker_files = [p for p in files if p.suffix.lower() in YAML_EXTS and ("compose" in p.name.lower() or "docker-compose" in p.name.lower())]
    db_engine = None; extras: Set[str] = set()
    for p in docker_files:
        try:
            data = yaml.safe_load(read_text_safe(p))
        except Exception:
            data = None
        if not isinstance(data, dict): continue
        svcs = data.get("services") or {}
        for name, svc in svcs.items():
            image = str((svc.get("image") or "")).lower()
            if "postgres" in image: db_engine = db_engine or "PostgreSQL"
            if "mysql" in image: db_engine = db_engine or "MySQL"
            if "mariadb" in image: db_engine = db_engine or "MariaDB"
            if "mongo" in image: db_engine = db_engine or "MongoDB"
            if "redis" in image: extras.add("Redis")
    return [str(p.relative_to(repo_root)) for p in docker_files], db_engine, extras

def detect_externals_from_env(text: str) -> Set[str]:
    hints = {
        "STRIPE":"Stripe","AUTH0":"Auth0","COGNITO":"AWS Cognito","SENDGRID":"SendGrid","MAILGUN":"Mailgun",
        "S3":"AWS S3","GCS":"Google Cloud Storage","OPENAI":"OpenAI API","SUPABASE":"Supabase","FIREBASE":"Firebase",
        "MONGODB":"MongoDB Atlas","ALGOLIA":"Algolia","MAPBOX":"Mapbox","LIVEKIT":"Livekit","PLAID":"Plaid","TWILIO":"Twilio"
    }
    ex: Set[str] = set()
    for ln in text.splitlines():
        if "=" not in ln: continue
        key = ln.split("=",1)[0].strip().upper()
        for hint, name in hints.items():
            if key.startswith(hint + "_") or key == hint: ex.add(name)
    return ex

def extract_settings_bits(text: str) -> Dict[str, Any]:
    bits: Dict[str, Any] = {}
    for key in SETTING_CAPTURE_KEYS:
        pat = re.compile(rf"{key}\s*=\s*(.+)")
        m = pat.search(text)
        if not m:
            continue
        start = m.start(1); i = start; depth=0; buf=""; end=len(text)
        while i < len(text):
            ch = text[i]; buf += ch
            if ch in "{[(": depth += 1
            elif ch in "}])":
                depth -= 1
                if depth <= 0: i += 1; break
            elif ch == "\n" and depth == 0:
                break
            i += 1
        bits[key] = buf.strip()

    pick_strings = lambda s: re.findall(r"['\"]([^'\"]+)['\"]", s or "")
    out: Dict[str, Any] = {}
    out["installed_apps"] = pick_strings(bits.get("INSTALLED_APPS",""))
    out["middleware"] = pick_strings(bits.get("MIDDLEWARE",""))
    out["auth_backends"] = pick_strings(bits.get("AUTHENTICATION_BACKENDS",""))

    rf = bits.get("REST_FRAMEWORK","")
    def strlist(pattern: str) -> List[str]:
        m = re.search(pattern, rf, re.S|re.I)
        if not m:
            return []
        group = m.group(1) if m.lastindex else m.group(0)
        return re.findall(r"['\"]([^'\"]+)['\"]", group or "")
    out["rest_framework"] = {
        "auth": strlist(r"DEFAULT_AUTHENTICATION_CLASSES\s*[:=]\s*(\[.*?\]|\(.*?\))"),
        "permissions": strlist(r"DEFAULT_PERMISSION_CLASSES\s*[:=]\s*(\[.*?\]|\(.*?\))"),
        "throttle": strlist(r"DEFAULT_THROTTLE_CLASSES\s*[:=]\s*(\[.*?\]|\(.*?\))"),
        "pagination": strlist(r"DEFAULT_PAGINATION_CLASS\s*[:=]\s*([^\n,]+)"),
    }

    db_eng = None
    for eng in re.findall(r"django\.db\.backends\.([a-z0-9_\.]+)", bits.get("DATABASES",""), re.I):
        e = eng.lower()
        if "postgres" in e: db_eng = "PostgreSQL"
        elif "mysql" in e: db_eng = "MySQL"
        elif "sqlite" in e: db_eng = "SQLite"
        elif "mariadb" in e: db_eng = "MariaDB"
    out["db_engine_from_settings"] = db_eng
    return out

def scan_backend(repo_root: Path) -> Dict[str, Any]:
    all_files = iter_files(repo_root)
    py_files = [p for p in all_files if p.suffix.lower() in CODE_EXTS]
    endpoints: List[Dict[str,str]] = []
    websocket_routes: List[Dict[str,str]] = []
    http_calls: List[Dict[str,str]] = []
    externals: Set[str] = set()
    db_engine_hint: Optional[str] = None
    has_celery = False
    has_channels = False
    celery_tasks: List[str] = []
    models: List[str] = []
    settings_meta: Dict[str, Any] = {}

    compose_list, db_engine_compose, extras = parse_compose(all_files, repo_root)
    if db_engine_compose: db_engine_hint = db_engine_compose
    if "Redis" in extras: has_celery = True

    for p in all_files:
        if p.name == ".env" or p.suffix.lower() == ".env" or p.name.lower().startswith(".env"):
            externals |= detect_externals_from_env(read_text_safe(p))

    for p in py_files:
        text = read_text_safe(p)
        rel = str(p).replace("\\","/").lower()

        if "/config/settings/" in rel:
            try:
                bits = extract_settings_bits(text)
                for k,v in bits.items():
                    if v and (k not in settings_meta or not settings_meta.get(k)):
                        settings_meta[k] = v
            except Exception:
                pass  # settings parsing is best-effort

        if p.name.endswith("urls.py"):
            for m in RE_DJANGO_PATH.finditer(text):
                endpoints.append({"method":"ANY","path":"/"+m.group(1).lstrip("/")})
            for m in RE_DJANGO_REPATH.finditer(text):
                pat = m.group(1).lstrip("^/").rstrip("$")
                endpoints.append({"method":"ANY","path":"/"+pat})
        if "router.register(" in text:
            for m in RE_DRF_ROUTER.finditer(text):
                endpoints.append({"method":"ANY","path":"/"+m.group(1).strip("/")+"/"})

        low = text.lower()
        if p.name.endswith(("routing.py","websocket.py")) or "channels.routing" in low:
            has_channels = True
            for m in RE_WS_PATTERN.finditer(text):
                websocket_routes.append({"method":"WS","path":"/"+m.group(1).lstrip("/")})

        for m in RE_REQUESTS.finditer(text):
            method, url = m.group(1).upper(), m.group(2)
            http_calls.append({"method":method,"path":url})

        if p.name == "settings.py" or "/config/settings/" in rel:
            for m in RE_DATABASES_ENGINE.finditer(text):
                eng = m.group(1).lower()
                if "postgres" in eng: db_engine_hint = "PostgreSQL"
                elif "mysql" in eng: db_engine_hint = "MySQL"
                elif "sqlite" in eng: db_engine_hint = "SQLite"
                elif "mariadb" in eng: db_engine_hint = "MariaDB"

        for m in RE_CELERY_TASK.finditer(text):
            celery_tasks.append(m.group(1))

        for m in RE_MODEL_CLASS.finditer(text):
            models.append(m.group(1))

        if "celery" in low and ("celery(" in low or "from celery" in low or "celery_app" in low):
            has_celery = True

    api_meta = {
        "http_calls_out": http_calls,
        "installed_apps": settings_meta.get("installed_apps", []),
        "auth_backends": settings_meta.get("auth_backends", []),
        "rest_framework": settings_meta.get("rest_framework", {}),
        "models": sorted(set(models)),
        "celery_tasks": sorted(set(celery_tasks)),
    }

    containers: List[Dict[str,Any]] = []
    containers.append({"name":"Api","tech":"Django/DRF","src_paths":["./"],"endpoints_in": endpoints, "metadata": api_meta})
    if has_celery:
        containers.append({"name":"Worker","tech":"Celery","src_paths":["./"], "metadata": {"tasks": sorted(set(celery_tasks))}})
    if has_channels:
        rt = {"name":"Realtime","tech":"Django Channels","src_paths":["./"]}
        if websocket_routes:
            rt["endpoints_in"] = websocket_routes
        containers.append(rt)

    datastores: List[Dict[str,Any]] = [{"name":"appdb","engine": db_engine_hint or settings_meta.get("db_engine_from_settings") or "unknown"}]
    messaging: List[Dict[str,Any]] = []
    if has_celery or ("Redis" in extras):
        messaging.append({"queue":"celery","broker":"Redis","producers":["Api"],"consumers":["Worker"]})

    manifest = {
        "system":"",
        "actors":[{"name":"User","type":"person"}],
        "externals":[{"name":e,"type":"system"} for e in sorted(externals)],
        "infra":{"docker": compose_list, "k8s": [], "terraform": []},
        "containers": containers,
        "datastores": datastores,
        "messaging": messaging,
        "relations":[]
    }
    return manifest

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("repo", help="Path to Django backend root (folder containing manage.py)")
    ap.add_argument("--out", default="manifest_back.yml")
    ap.add_argument("--system", default="Konnaxion")
    args = ap.parse_args()
    root = Path(args.repo).resolve()
    if not root.exists() or not root.is_dir():
        print(f"ERROR: {root} not found or not a directory", file=sys.stderr)
        return 2
    m = scan_backend(root)
    m["system"] = args.system
    Path(args.out).write_text(yaml.safe_dump(m, sort_keys=False, allow_unicode=True), encoding="utf-8")
    print(f"Wrote {Path(args.out).resolve()}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
