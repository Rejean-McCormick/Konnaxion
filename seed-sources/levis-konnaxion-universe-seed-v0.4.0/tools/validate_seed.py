#!/usr/bin/env python3
from __future__ import annotations
import argparse, importlib.util, json
from pathlib import Path
import yaml
try:
    from jsonschema import Draft202012Validator, FormatChecker
except Exception:
    Draft202012Validator=FormatChecker=None

FORBIDDEN={"role","institutional_role","expertise","expertise_claims","credentials","credential_claims","institutional_scope","provenance","source_basis","role_status","panel_eligibility","claims","assertions","certainty","validated_as","authority_recognition"}

def load(p): return json.loads(Path(p).read_text(encoding="utf-8"))
def nested_keys(v):
    out=set()
    if isinstance(v,dict):
        for k,x in v.items(): out.add(str(k)); out |= nested_keys(x)
    elif isinstance(v,list):
        for x in v: out |= nested_keys(x)
    return out
def errors_for(schema,obj):
    if Draft202012Validator is None:return [{"path":"/","message":"jsonschema unavailable"}]
    v=Draft202012Validator(schema,format_checker=FormatChecker())
    return [{"path":"/"+"/".join(map(str,e.absolute_path)),"message":e.message} for e in sorted(v.iter_errors(obj),key=lambda e:list(e.absolute_path))]
def validator_from_repo(repo):
    p=repo/"backend/konnaxion/ethikos/demo_import/schema.py"
    s=importlib.util.spec_from_file_location("kx_schema",p); m=importlib.util.module_from_spec(s); s.loader.exec_module(m); return m.validate_demo_scenario
def validate(root,kx=None,kr=None):
    errs=[]; warns=[]
    up=yaml.safe_load((root/"seed-data/universes/levis/universe.yaml").read_text(encoding="utf-8"))
    if up.get("universe_contract")!="kx-universe-pack/v1": errs.append("bad universe contract")
    if up.get("pack_version")!="0.4.0": errs.append("bad universe version")
    worlds=up.get("worlds") or []; keys={w["world_key"] for w in worlds}
    if len(keys)!=17: errs.append(f"expected 17 worlds, got {len(keys)}")
    kv=validator_from_repo(kx) if kx else None
    referents=load(root/"kristal/input/referent-registry.json"); refs={r["ref"] for r in referents["referents"]}
    if kr:
        rs=load(kr/"docs/Technical-Reference/kristal-docs-v5/02-schemas/referent-registry.schema.json")
        cs=load(kr/"docs/Technical-Reference/kristal-docs-v5/02-schemas/claim-ir.schema.json")
        for e in errors_for(rs,referents): errs.append("referent-registry"+e["path"]+": "+e["message"])
        for p in (root/"kristal/input/claim-ir").rglob("*.json"):
            for e in errors_for(cs,load(p)): errs.append(str(p.relative_to(root))+e["path"]+": "+e["message"])
    else:
        warns.append("Kristal repo not supplied; Kristal schema revalidation skipped (original v0.3 validation report preserved).")
    reports={}
    for w in worlds:
        wk=w["world_key"]; d=root/"seed-data/worlds"/wk
        m=yaml.safe_load((d/"world.yaml").read_text(encoding="utf-8")); s=load(d/"scenario.json"); se=[]
        if m.get("world_contract")!="kx-world-pack/v1": se.append("bad world contract")
        if m.get("pack_version")!="0.4.0": se.append("bad world version")
        if "kx-world-personas/v1" not in (m.get("requires",{}).get("host_contracts") or []): se.append("missing persona host contract")
        if kv: se.extend(kv(s))
        md=s.get("metadata") or {}
        if md.get("persona_contract")!="kx-world-personas/v1": se.append("missing persona contract")
        if (md.get("persona_projection") or {}).get("mode")!="identity_binding_only": se.append("strict projection mode missing")
        profiles=md.get("actor_profiles") or {}; actor_keys={a["key"] for a in s.get("actors",[])}
        if set(profiles)!=actor_keys: se.append("actor/profile mismatch")
        for key,p in profiles.items():
            leaked=FORBIDDEN & nested_keys(p)
            if leaked: se.append(f"{key}: epistemic metadata leak {sorted(leaked)}")
            k=p.get("knowledge_projection") or {}
            if k.get("authority")!="kristal_v5_runtime_pack" or k.get("runtime_pack_required_for_epistemic_claims") is not True: se.append(f"{key}: bad knowledge projection")
            er=p.get("external_referents") or {}
            if er.get("kristal") not in refs: se.append(f"{key}: missing Kristal referent")
        if any(s.get(k) for k in ["stances","arguments","argument_sources","consultation_votes","ekoh_profiles"]): se.append("baseline must not seed opinions/scores")
        reports[wk]={"ok":not se,"errors":se,"actor_count":len(s.get("actors",[]))}
        errs.extend(f"{wk}: {x}" for x in se)
    return {"ok":not errs,"seed_version":"0.4.0","world_count":len(worlds),"errors":errs,"warnings":warns,"worlds":reports}
def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--root",default=str(Path(__file__).resolve().parents[1])); ap.add_argument("--konnaxion-repo"); ap.add_argument("--kristal-repo"); ap.add_argument("--write-report",action="store_true"); a=ap.parse_args()
    r=validate(Path(a.root),Path(a.konnaxion_repo) if a.konnaxion_repo else None,Path(a.kristal_repo) if a.kristal_repo else None)
    if a.write_report:(Path(a.root)/"validation_report.json").write_text(json.dumps(r,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(r,ensure_ascii=False,indent=2)); raise SystemExit(0 if r["ok"] else 1)
if __name__=="__main__":main()
