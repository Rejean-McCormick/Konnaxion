#!/usr/bin/env python3
import argparse
from pathlib import Path
from typing import Any, Dict, Optional

try:
    import yaml  # type: ignore
except Exception as e:
    raise SystemExit("PyYAML is required. pip install pyyaml")

def norm(s: str) -> str:
    return "".join(ch if ch.isalnum() else "_" for ch in s)

def q(s: str) -> str:
    return '"' + s.replace('"','\\"') + '"'

def build_desc(c: Dict[str,Any]) -> str:
    md = c.get("metadata") or {}
    bits = []
    if "ui_pages" in md and md["ui_pages"]:
        bits.append(f'{len(md["ui_pages"])} pages')
    if "models" in md and md["models"]:
        bits.append(f'{len(md["models"])} models')
    if "celery_tasks" in md and md["celery_tasks"]:
        bits.append(f'{len(md["celery_tasks"])} Celery tasks')
    return ", ".join(bits)

def build_dsl(m: Dict[str, Any], override_system: Optional[str]) -> str:
    sysname = override_system or m.get("system") or "System"
    sys_id = f"sys_{norm(sysname)}"
    people = m.get("actors") or []
    externals = m.get("externals") or []
    containers = m.get("containers") or []
    datastores = m.get("datastores") or []
    messaging = m.get("messaging") or []
    relations = m.get("relations") or []
    infra = m.get("infra") or {}

    cid = {c["name"]: f'c_{norm(c["name"])}' for c in containers if c.get("name")}
    did = {d.get("name","db"): f'ds_{norm(d.get("name","db"))}' for d in datastores}

    out = []
    out.append(f'workspace {q(sysname)} {q("Generated from manifest (deep)")} {{')
    out.append('  model {')
    for p in people:
        nm = p.get("name","User")
        out.append(f'    person {q(nm)} as p_{norm(nm)}')
    out.append(f'    softwareSystem {q(sysname)} as {sys_id} {{')
    for c in containers:
        tech = c.get("tech","")
        desc = build_desc(c)
        out.append(f'      container {q(c["name"])} as {cid[c["name"]]} {q(tech)} {q(desc)}')
    for d in datastores:
        nm = d.get("name","db"); eng = d.get("engine","Database")
        out.append(f'      containerDb {q(nm)} as {did[nm]} {q(eng)} {q("Persistent data")}')
    for msg in messaging:
        if "topic" in msg:
            nm = msg.get("topic")
            out.append(f'      container {q(nm)} as msg_{norm(nm)} {q("Kafka")} {q("Topic")}')
        if "queue" in msg:
            nm = msg.get("queue")
            out.append(f'      container {q(nm)} as msg_{norm(nm)} {q("Redis/RabbitMQ")} {q("Queue")}')
    out.append('    }')
    for e in externals:
        nm = e.get("name","External")
        out.append(f'    softwareSystem {q(nm)} as ext_{norm(nm)}')
    def id_for(x: str):
        if x in cid: return cid[x]
        if x in did: return did[x]
        if x == sysname: return sys_id
        return f'ext_{norm(x)}'
    for r in relations:
        f, t, via = r.get("from"), r.get("to"), r.get("via","")
        if isinstance(f,str) and isinstance(t,str):
            lbl = f" {q(via)}" if via else ""
            out.append(f'    {id_for(f)} -> {id_for(t)}{lbl}')
    # Explicit calls_out
    for c in containers:
        src = cid[c["name"]]
        for call in c.get("calls_out",[]) or []:
            to = call.get("to"); method = (call.get("method") or "HTTP").upper()
            if to and to in cid:
                out.append(f'    {src} -> {cid[to]} {q(method)}')
    # DB edges for non-UI
    if datastores:
        for c in containers:
            tech = (c.get("tech") or "").lower()
            if not any(x in tech for x in ["next.js","react","vue","nuxt","svelte"]):
                for d in datastores:
                    out.append(f'    {cid[c["name"]]} -> {did[d["name"]]} "read/write"')
    out.append('  }')
    out.append('  views {')
    out.append(f'    systemContext {sys_id} "System Context" {{ include * autoLayout }}')
    out.append(f'    container {sys_id} "Containers" {{ include * autoLayout }}')
    out.append('    styles { element "Person" { shape Person } }')
    out.append('  }')
    out.append('}')
    return "\n".join(out)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="infile", required=True)
    ap.add_argument("--out", dest="outfile", default="workspace.dsl")
    ap.add_argument("--system", dest="system", default=None)
    args = ap.parse_args()
    m = yaml.safe_load(Path(args.infile).read_text(encoding="utf-8"))
    dsl = build_dsl(m, args.system)
    Path(args.outfile).write_text(dsl, encoding="utf-8")
    print(f"Wrote {args.outfile}")
if __name__ == "__main__":
    main()
