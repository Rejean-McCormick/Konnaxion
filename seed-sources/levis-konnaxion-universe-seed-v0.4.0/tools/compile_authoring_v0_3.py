#!/usr/bin/env python3
from __future__ import annotations
import hashlib, json, re, shutil, unicodedata
from pathlib import Path
import yaml

EMPTY_LISTS=("categories","topics","stances","arguments","argument_sources","consultations","consultation_votes","impact_items","ekoh_profiles","consultation_relevance","topic_relevance","reading_exclusions")

def load(p): return json.loads(Path(p).read_text(encoding="utf-8"))
def dump(p,obj):
    p=Path(p); p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
def canon(o): return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(",", ":")).encode("utf-8")
def digest(o): return hashlib.sha256(canon(o)).hexdigest()
def slug(s):
    s=unicodedata.normalize("NFKD",str(s)).encode("ascii","ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+","-",s).strip("-") or "item"
def evidence(pv,sources):
    sid=pv.get("source_id"); s=sources.get(sid,{})
    d={"source":{"source_id":f"source:{sid}" if sid else "source:unknown"},"evidence_type":"document_reference","strength":"unknown"}
    if s.get("url"): d["source"]["source_url"]=s["url"]
    if s.get("title"): d["source"]["title"]=s["title"]
    return d
def prov_refs(pvs):
    ids=[]
    for p in pvs:
        sid=p.get("source_id")
        if sid and sid not in ids: ids.append(sid)
    return [{"ref":f"source:{sid}","kind":"source"} for sid in ids]

def compile(root:Path):
    wd=load(root/"registry/worlds.json"); ad=load(root/"registry/actors.json"); pa=load(root/"registry/persona_assignments.json")
    full=load(root/"kristal/authoring/assignments_source.json"); sources=load(root/"kristal/source-registry.json")
    version=wd["seed_version"]; baseline=wd["baseline_date"]; worlds=wd["worlds"]; actors=ad["actors"]; assignments=full["assignments"]
    actor_by={a["actor_id"]:a for a in actors}; op_assign=pa["assignments"]

    # Referent registry
    refs=[]; seen=set()
    def add(ref,kind,label,**kw):
        if ref in seen:return
        seen.add(ref); d={"ref":ref,"kind":kind,"labels":[{"text":label,"lang":"fr"}]}
        for k,v in kw.items():
            if v not in (None,[],{}): d[k]=v
        refs.append(d)
    add("levis:organization:ville-de-levis","collective","Ville de Lévis",description="Organisation municipale utilisée comme juridiction du corpus Lévis.")
    for a in actors: add(a["canonical_actor_key"],"collective" if a["persona_type"]=="organization" else "person",a["display_name"])
    for sid,s in sorted(sources.items()):
        ex=[{"system":"url","id":s["url"],"url":s["url"]}] if s.get("url") else []
        add(f"source:{sid}","document",s.get("title",sid),external_ids=ex,attributes={"publisher":s.get("publisher"),"source_type":s.get("source_type")})
    role_refs={}; exp_refs={}; cred_refs={}
    for x in assignments:
        title=(x.get("institutional_role") or {}).get("title")
        if title:
            rr=f"role:levis/{slug(x['world_key'].removeprefix('levis-'))}/{slug(title)}"; role_refs[(x["world_key"],title)]=rr
            add(rr,"concept",title,classifications=["municipal_institutional_role"],attributes={"world_key":x["world_key"]})
        for c in x.get("expertise_claims",[]):
            label=str(c.get("label") or "").strip()
            if label:
                rr=f"expertise:levis/{slug(label)}"; exp_refs[label]=rr
                add(rr,"concept",label,classifications=["expertise_domain"],attributes={"isced_f_code":str(c.get("isced_f_code") or "") or None})
        for c in x.get("credential_claims",[]):
            des=str(c.get("designation") or "").strip()
            if des:
                rr=f"credential:levis/{slug(des)}"; cred_refs[des]=rr; add(rr,"concept",des,classifications=["professional_designation"])
    base={"schema_version":"5.0","artifact_type":"referent_registry","profile_version":"1.0.0","scope":{"domain":"civic"},"referents":sorted(refs,key=lambda z:z["ref"]),"external_sources":[],"extensions":{"jurisdiction":"Ville de Lévis, Québec, Canada","authoring_bundle_version":version,"status":"authoring_input_not_runtime_pack"}}
    rid="sha256:"+digest(base); registry={**base,"registry_id":rid}
    # reorder top-level for readability
    registry={"schema_version":"5.0","artifact_type":"referent_registry","profile_version":"1.0.0","registry_id":rid,"scope":base["scope"],"referents":base["referents"],"external_sources":[],"extensions":base["extensions"]}
    dump(root/"kristal/input/referent-registry.json",registry)

    # Claim-IR
    claim_root=root/"kristal/input/claim-ir"
    if claim_root.exists(): shutil.rmtree(claim_root)
    claim_files=[]
    for x in assignments:
        a=actor_by[x["canonical_actor_key"]]; scope={"domain":"civic","subdomain":x["world_key"],"jurisdiction":"Ville de Lévis, Québec, Canada","tenant_id":"levis","environment":"seed","language":"fr"}
        subject={"surface":a["display_name"],"lang":"fr","external_id":x["canonical_actor_key"],"source_ref":{"ref":rid,"kind":"artifact"}}
        claims=[]; bp=x.get("provenance",[]); role=(x.get("institutional_role") or {}).get("title")
        if role:
            claims.append({"claim_id":f"claim:{slug(x['world_key'])}:{slug(x['actor_key'])}:role","predicate":{"surface":"occupe la fonction institutionnelle","lang":"fr"},"object":{"kind":"item","value":{"surface":role,"lang":"fr","external_id":role_refs[(x['world_key'],role)],"source_ref":{"ref":rid,"kind":"artifact"}}},"proposed_assertion_status":"sourced","proposed_certainty_level":"unknown","proposed_validated_as":"sourced_claim","scope":scope,"qualifiers":[{"predicate":{"surface":"statut de rôle","lang":"fr"},"object":{"kind":"string","value":str(x.get("role_status","last_verified"))}}],"evidence":[evidence(p,sources) for p in bp],"notes":"Proposition sourcée pour résolution Kristal; le seed Konnaxion ne fait pas autorité sur ce rôle.","extensions":{"verification_status":(x.get("institutional_role") or {}).get("verification_status"),"last_reviewed_at":(x.get("institutional_role") or {}).get("last_reviewed_at")}})
        for i,sco in enumerate(x.get("institutional_scope",[]),1):
            claims.append({"claim_id":f"claim:{slug(x['world_key'])}:{slug(x['actor_key'])}:scope:{i}","predicate":{"surface":"a pour périmètre institutionnel","lang":"fr"},"object":{"kind":"string","value":sco},"proposed_assertion_status":"claimed","proposed_certainty_level":"unknown","proposed_validated_as":"claim","scope":scope,"evidence":[evidence(p,sources) for p in bp],"notes":"Projection d’auteur issue du corpus de seed; nécessite résolution/validation Kristal."})
        for i,c in enumerate(x.get("expertise_claims",[]),1):
            label=str(c.get("label") or "").strip(); pvs=c.get("provenance") or bp; direct=str(c.get("claim_type") or "") in {"public_professional_source","official_municipal_document","verified_public_source"}
            claims.append({"claim_id":f"claim:{slug(x['world_key'])}:{slug(x['actor_key'])}:expertise:{i}","predicate":{"surface":"a pour domaine d’expertise","lang":"fr"},"object":{"kind":"item","value":{"surface":label,"lang":"fr","external_id":exp_refs[label],"source_ref":{"ref":rid,"kind":"artifact"}}},"proposed_assertion_status":"sourced" if direct else "claimed","proposed_certainty_level":"unknown","proposed_validated_as":"sourced_claim" if direct else "claim","scope":scope,"evidence":[evidence(p,sources) for p in pvs],"notes":f"Claim-IR de type {c.get('claim_type','unspecified')}; aucune note EkoH n’est déduite.","extensions":{"isced_f_code":c.get("isced_f_code"),"authoring_claim_type":c.get("claim_type")}})
        for i,c in enumerate(x.get("credential_claims",[]),1):
            des=str(c.get("designation") or "").strip(); pvs=c.get("provenance") or bp
            claims.append({"claim_id":f"claim:{slug(x['world_key'])}:{slug(x['actor_key'])}:credential:{i}","predicate":{"surface":"détient la désignation professionnelle","lang":"fr"},"object":{"kind":"item","value":{"surface":des,"lang":"fr","external_id":cred_refs[des],"source_ref":{"ref":rid,"kind":"artifact"}}},"proposed_assertion_status":"sourced","proposed_certainty_level":"unknown","proposed_validated_as":"sourced_claim","scope":scope,"evidence":[evidence(p,sources) for p in pvs],"notes":"Désignation publique proposée comme assertion sourcée; elle ne crée pas automatiquement un Trust.Credential Konnaxion.","extensions":{"authoring_verification":c.get("verification")}})
        pvs=list(bp)
        for c in x.get("expertise_claims",[]):
            for p in c.get("provenance",[]):
                if p not in pvs:pvs.append(p)
        for c in x.get("credential_claims",[]):
            for p in c.get("provenance",[]):
                if p not in pvs:pvs.append(p)
        ci={"schema_version":"5.0","artifact_type":"claim_ir","profile_role":"extractor_proposal_profile","canonicalization_profile":"kristal.v5:jcs-rfc8785","scope":scope,"subject":subject,"claims":claims,"provenance_refs":prov_refs(pvs),"target_state":{"artifact_type":"structured_epistemic_state","conversion_policy_ref":{"ref":"policy:kristal.v5:claim-ir-to-structured-epistemic-state@1","kind":"policy"},"notes":"Requires Kristal resolution/validation; Claim-IR does not imply authority recognition."},"warnings":[],"errors":[],"extensions":{"bundle":"levis","bundle_version":version,"world_key":x["world_key"],"actor_key":x["actor_key"],"source_registry":"../source-registry.json","authoring_only":True}}
        rel=Path("kristal/input/claim-ir")/x["world_key"]/(slug(x["actor_key"])+".json"); dump(root/rel,ci); claim_files.append(str(rel).replace("\\","/"))

    # Konnaxion scenarios + manifests
    op_actor={a["actor_id"]:a for a in actors}; fp=digest({"worlds":wd,"actors":actors,"assignments":op_assign}); out=root/"worlds"
    if out.exists():shutil.rmtree(out)
    out.mkdir(); compiled=[]
    for w in worlds:
        wk=w["key"]; d=out/wk; d.mkdir(); sel=[x for x in op_assign if x["world_key"]==wk and x.get("seed_enabled",True)]; profiles=[]; sactors=[]
        for x in sel:
            a=op_actor[x["canonical_actor_key"]]; p={"actor_key":x["actor_key"],"canonical_actor_key":x["canonical_actor_key"],"display_name":a["display_name"],"persona_type":a["persona_type"],"bridge_account_type":a["bridge_account_type"],"representation":a["representation"],"kristal_referent_ref":x["kristal_referent_ref"],"knowledge_projection":{"authority":"kristal_v5","binding":"referent_ref","runtime_pack_required_for_epistemic_claims":True}}
            profiles.append(p); compiled.append({"world_key":wk,**p}); sactors.append({"key":x["actor_key"],"username":x["actor_key"],"display_name":a["display_name"],"is_ethikos_elite":False})
        s={"schema_version":"ethikos-demo-scenario/v3","scenario_key":f"{wk}-baseline-v3","scenario_title":f"{w['title']} — baseline opérationnelle v3","mode":"replace_scenario","metadata":{"seed_kind":"municipal_persona_projection_baseline","baseline_date":baseline,"seed_version":version,"generated_statements":False,"registry_fingerprint":fp,"generated_from_registry":True,"knowledge_authority":"kristal_v5_runtime_pack","simulation_policy":{"all_real_person_interventions_must_be_labelled_simulated":True,"do_not_infer_personal_opinions":True,"require_kristal_source_basis_for_reconstructed_positions":True},"konnaxion_personas":profiles},"actors":sactors}
        for k in EMPTY_LISTS:s[k]=[]
        dump(d/"scenario.json",s)
        m={"world_contract":"kx-world-pack/v1","world_key":wk,"title":w["title"],"description":w["description"],"pack_version":version,"requires":{"ethikos_scenario_schema":"ethikos-demo-scenario/v3","fixtures":["isced-f"]},"scenarios":["scenario.json"],"metadata":{"universe_key":"levis","municipality":"Ville de Lévis","jurisdiction":"Québec, Canada","municipal_group":w["municipal_group"],"seed_kind":"municipal_persona_projection_baseline","baseline_date":baseline,"persona_profile_schema":"konnaxion-civic-persona-projection/v1","registry_schema":"konnaxion-levis-operational-registry/v3","registry_fingerprint":fp,"knowledge_authority":"kristal_v5_runtime_pack","generated_statements":False}}
        (d/"world.yaml").write_text(yaml.safe_dump(m,sort_keys=False,allow_unicode=True,width=1000),encoding="utf-8")
    dump(root/"actor_registry.json",{"schema":"konnaxion-civic-persona-projection-registry/v3","baseline_date":baseline,"seed_version":version,"registry_fingerprint":fp,"entries":compiled})
    dump(root/"kristal/input-manifest.json",{"manifest_type":"levis.kristal-authoring-input-bundle/1","bundle_version":version,"baseline_date":baseline,"status":"authoring_input","not_runtime_pack":True,"not_structured_epistemic_state":True,"referent_registry":"input/referent-registry.json","claim_ir_files":claim_files,"source_registry":"source-registry.json","compiler_owner":"Da’at/Kristal pipeline","notes":["Claim-IR proposes sourced/claimed assertions; it does not imply validation or authority recognition.","Konnaxion consumes a compiled/activated Kristal Runtime Pack using existing distribution/query/reader-policy contracts."]})
    return {"ok":True,"seed_version":version,"world_count":len(worlds),"actor_count":len(actors),"persona_instances":len(op_assign),"claim_ir_files":len(claim_files),"referent_registry_id":rid,"registry_fingerprint":fp}

def main():
    root=Path(__file__).resolve().parents[1]; print(json.dumps(compile(root),ensure_ascii=False,indent=2))
if __name__=="__main__":main()
