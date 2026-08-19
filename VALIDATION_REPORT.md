# Konnaxion / Ethikos / EkoH update validation

Date: 2026-08-19

## Scope

Updated all 22 files supplied in `temporr(2).zip` to align the demo/import path with the current Kintsugi ownership contract:

- ethiKos / Konsultations keep canonical source facts and the democratic baseline.
- EkoH supplies contextual, domain-bounded expertise/trust data.
- Smart Vote produces declared derived readings; it must not rewrite source facts.
- A weighted result is a reading/lens, not the canonical result and not an automatic decision authority.

Four additional dependent files were added because validation of the supplied Konnaxion snapshot exposed concrete defects that would break or corrupt the updated EkoH flow:

- `backend/konnaxion/ekoh/serializers/profile.py`
- `backend/konnaxion/ekoh/views/profile.py`
- `backend/konnaxion/ekoh/tasks/contextual.py`
- `backend/konnaxion/ekoh/tasks/recalc.py`

## Main corrections

- Demo schema advanced to `ethikos-demo-scenario/v3` with `ekoh_profiles` and `consultation_relevance`.
- v3 source votes reject `weighted_value`; legacy v1/v2 payloads remain accepted for compatibility.
- Demo importer persists EkoH profile context but builds baseline-only consultation result snapshots.
- Smart Vote contextual weighting now preserves a 1.0 baseline inside the advisory reading and applies only a bounded domain-aligned expertise bonus.
- EkoH domain scores are normalized to 0..1 and kept separate from voting authority.
- Contextual AI analysis no longer mutates expertise scores automatically.
- Nightly EkoH recalculation no longer overwrites all expertise with placeholder zero metrics.
- ISCED-F fixture replaced with a valid, internally consistent 52-category subset covering the domains required by the Canadian Ethikos demo.
- Decide UI no longer fabricates an EkoH reading by copying the baseline.
- Trust/EkoH UI now centers on contextual domain expertise instead of a fake global Smart Vote weight.
- EkoH profile endpoint now respects anonymous-profile privacy and uses the actual Django reverse relation names.
- Legacy `kollective_intelligence` EkoH/Smart Vote models are explicitly marked compatibility-only rather than canonical.
- The three supplied EkoH/Smart Vote technical documents were rewritten around the current source-fact / context / reading boundaries.

## Validation results

### Passed

- Python syntax/bytecode compile for the supplied backend tree: PASS.
- ISCED-F fixture JSON parse: PASS.
- ISCED-F parent/depth integrity: PASS — 52 categories.
- Django-free demo schema test suite: PASS — 20/20 tests.
- TypeScript/TSX transpile syntax check: PASS — 9/9 files.
- Smart Vote arithmetic smoke check: PASS — alignment 0.70, advisory weight 1.70, no-expertise baseline 1.00.
- Anti-drift grep for removed fake/simulated weighting patterns: PASS.
- Original archive comparison: all 22 supplied files changed; none missing.

### Could not be executed in this isolated package

The importer/API Django tests could not be collected because this execution environment does not contain Django (`ModuleNotFoundError: No module named 'django'`). This is an environment limitation, not an application assertion failure. Run these in the complete Konnaxion project environment before merge:

- `konnaxion/ethikos/tests/test_demo_importer.py`
- `konnaxion/ethikos/tests/test_demo_import_api.py`

## Intentional integration gap

`consultation_relevance` is fully validated by demo schema v3, but the demo importer does **not** yet write those rows into `smart_vote.ConsultationRelevance`.

Reason: the supplied code has a demo/ethiKos consultation object and a separate UUID `smart_vote.Consultation` object, but no canonical mapping between them. Creating a second consultation by title, or silently guessing the mapping, would violate the ownership boundary and make derived readings non-reproducible.

The importer therefore emits an explicit warning. The next integration step should add a stable cross-subsystem mapping/reference, then persist the relevance vector against the mapped Smart Vote consultation.

## Merge recommendation

Before merging into the full repository:

1. Run the full Django migration/check/test suite in the actual Konnaxion environment.
2. Load the EkoH ISCED-F fixture and verify the database taxonomy.
3. Add/confirm the canonical Ethikos/Konsultations → Smart Vote consultation mapping.
4. Run the demo importer with a v3 scenario and verify EkoH profiles, baseline results, privacy, and reading separation end-to-end.
