#!/usr/bin/env python3
# MIT License
"""
merge_manifests.py — merge N partial manifests into a combined manifest
"""
import argparse
from pathlib import Path
from typing import Any, Dict, List

try:
    import yaml  # type: ignore
except Exception as e:
    raise SystemExit("PyYAML is required. pip install pyyaml")

def as_list(x): return x if isinstance(x, list) else (x or [])

def uniq(seq, key=lambda x: x):
    seen=set(); out=[]
    for item in seq or []:
        k = key(item)
        if k in seen: continue
        seen.add(k); out.append(item)
    return out

def merge_by_name(a: List[Dict[str, Any]], b: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    idx = {d.get("name"): d for d in a if isinstance(d, dict) and d.get("name")}
    for d in b or []:
        if not isinstance(d, dict) or not d.get("name"): continue
        nm = d["name"]
        if nm in idx:
            idx[nm].update({k: v for k, v in d.items() if v is not None})
            for k in ("endpoints_in","calls_out","src_paths","metadata"):
                if isinstance(d.get(k), list):
                    idx[nm][k] = uniq(as_list(idx[nm].get(k)) + as_list(d.get(k)), key=lambda x: str(x))
                elif isinstance(d.get(k), dict):
                    cur = idx[nm].get(k) or {}
                    cur.update(d.get(k) or {})
                    idx[nm][k] = cur
        else:
            a.append(d)
    return a

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", dest="outfile", required=True)
    ap.add_argument("--system", default=None)
    ap.add_argument("--in", dest="inputs", nargs="+", required=True)
    args = ap.parse_args()

    combined: Dict[str, Any] = {"system": args.system or "Konnaxion"}
    combined.update({"actors": [], "externals": [], "containers": [], "datastores": [], "messaging": [], "relations": [], "infra": {"docker":[],"k8s":[],"terraform":[]}, "graphql": [], "grpc_services": []})

    for path in args.inputs:
        p = Path(path)
        if not p.exists():
            print(f"WARNING: missing {p}")
            continue
        m = yaml.safe_load(p.read_text(encoding="utf-8"))
        combined["actors"]    = uniq(as_list(combined["actors"])    + as_list(m.get("actors")),    key=lambda d: d.get("name"))
        combined["externals"] = uniq(as_list(combined["externals"]) + as_list(m.get("externals")), key=lambda d: d.get("name"))
        combined["containers"] = merge_by_name(combined["containers"], as_list(m.get("containers")))
        combined["datastores"] = uniq(as_list(combined["datastores"]) + as_list(m.get("datastores")), key=lambda d: d.get("name"))
        def msg_key(d):
            if "queue" in d: return ("queue", d.get("queue"), d.get("broker"))
            if "topic" in d: return ("topic", d.get("topic"), d.get("broker"))
            return ("_", None, None)
        combined["messaging"] = uniq(as_list(combined["messaging"]) + as_list(m.get("messaging")), key=msg_key)
        infra = combined["infra"]; mi = m.get("infra") or {}
        for part in ("docker","k8s","terraform"):
            infra[part] = uniq(as_list(infra.get(part)) + as_list(mi.get(part)))
        # carry through infra.services if present
        if "services" in mi:
            infra["services"] = as_list(infra.get("services")) + as_list(mi.get("services"))
        combined["graphql"] = uniq(as_list(combined["graphql"]) + as_list(m.get("graphql")))
        combined["grpc_services"] = uniq(as_list(combined["grpc_services"]) + as_list(m.get("grpc_services")))
        combined["relations"] = uniq(as_list(combined["relations"]) + as_list(m.get("relations")), key=lambda d: (d.get("from"), d.get("to"), d.get("via")))

    # Ensure WebApp -> Api call if both present
    names = {c.get("name") for c in combined["containers"]}
    if "WebApp" in names and "Api" in names:
        for c in combined["containers"]:
            if c.get("name") == "WebApp":
                calls = as_list(c.get("calls_out"))
                if not any((d.get("to") == "Api") for d in calls if isinstance(d, dict)):
                    calls.append({"method":"GET","path":"/api/*","to":"Api"})
                c["calls_out"] = calls

    Path(args.outfile).write_text(yaml.safe_dump(combined, sort_keys=False, allow_unicode=True), encoding="utf-8")
    print(f"Wrote {Path(args.outfile).resolve()}")

if __name__ == "__main__":
    main()
