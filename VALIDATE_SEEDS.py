from __future__ import annotations
import json, sys
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parent / "backend" / "seed-data"
LISTS = ["actors","categories","topics","stances","arguments","argument_sources","consultations","consultation_votes","impact_items","ekoh_profiles","consultation_relevance","topic_relevance","reading_exclusions"]

def fail(msg):
    print("ERROR:", msg)
    return 1

def main():
    errors=[]
    for manifest in sorted((ROOT / "worlds").glob("*/world.yaml")):
        w=yaml.safe_load(manifest.read_text(encoding="utf-8"))
        for rel in w.get("scenarios",[]):
            p=manifest.parent/rel
            s=json.loads(p.read_text(encoding="utf-8"))
            actors={x["key"] for x in s.get("actors",[])}
            topics={x["key"] for x in s.get("topics",[])}
            cats={x["key"] for x in s.get("categories",[])}
            for t in s.get("topics",[]):
                if t.get("category") not in cats: errors.append(f"{p}: unknown category {t.get('category')}")
            rel_by={}
            for r in s.get("topic_relevance",[]):
                rel_by.setdefault(r["topic"],0.0); rel_by[r["topic"]]+=float(r["weight"])
            for t in topics:
                if t not in rel_by: errors.append(f"{p}: topic without relevance {t}")
                elif abs(rel_by[t]-1.0)>1e-6: errors.append(f"{p}: relevance sum {t}={rel_by[t]}")
            prof={x["actor"] for x in s.get("ekoh_profiles",[])}
            for x in s.get("stances",[]):
                if x["actor"] not in actors: errors.append(f"{p}: stance unknown actor {x['actor']}")
                if x["topic"] not in topics: errors.append(f"{p}: stance unknown topic {x['topic']}")
            # Every demo topic should have at least one EkoH-profile participant stance.
            for t in topics:
                if not any(x["topic"]==t and x["actor"] in prof for x in s.get("stances",[])):
                    errors.append(f"{p}: topic without EkoH participant stance {t}")
            ap=(s.get("metadata") or {{}}).get("actor_profiles")
            if ap is not None and set(ap)!=actors:
                errors.append(f"{p}: actor_profiles keys do not exactly match actors")
    if errors:
        print("VALIDATION FAILED")
        for e in errors: print(" -",e)
        return 1
    print("VALIDATION OK")
    return 0

if __name__=="__main__": raise SystemExit(main())
