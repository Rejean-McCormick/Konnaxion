# Konnaxion ecosystem alignment status — 2026-10-02

**Scope:** the supplied Konnaxion + Konnaxion_Worlds snapshots, with Kristal Standard v7 taking precedence over the older Kristal v6 target in the supplied alignment handoff.

**Claim level:** local source update and static/contract checks. This document is not a claim of full ecosystem qualification.

## Priority resolution

The supplied alignment handoff targets Kristal Standard 6.0.0. The supplied Kristal Standard snapshot is newer and declares `7.0.0-draft.3.1`. For this update, Kristal v7 is authoritative wherever those inputs conflict.

Kristal v7 is treated as additive over the unchanged v6 portable `kristal_state` contract. Existing v6 artifact bytes/identity are not rewritten. Konnaxion and Worlds consume v7 as an ecosystem boundary/meta-orchestration layer while retaining v6 portable-state compatibility.

## Implemented in Konnaxion

- **ALN-001 / ALN-002:** active IK lock targets IK reference `2.0.0-dev.1`, Kristal Standard `7.0.0-draft.3.1`, and Kristal build/revision/artifact-ready Profile version `2.0.0`. The v6 portable-state compatibility profile remains explicitly scoped to v6 compatibility only.
- **Kristal v7 guards:** Konnaxion does not promote semantic resonance to identity/truth/authority, does not treat Mesh paths as assertions, does not replace KQ identity with external KOS identity, and requires provenance-preserving factorization.
- **ALN-005:** `accountability.impact.publish` rejects missing/empty `external_reference` and requires a `summary` object; no synthesized fallback masks an invalid payload.
- **ALN-006:** Orgo impact `subject_id` storage now accepts the IK protocol string form up to 500 characters.
- **ALN-008:** inbound invalid-token semantics use `IK_UNAUTHENTICATED`; outbound 401/403/429/provider-unavailable mappings use IK semantic codes, and canonical remote `IK_*` receipt codes/retryability are preserved when supplied.
- **ALN-009 (state representation):** transport delivery is no longer automatically final business success. Emissions can represent `accepted`, `succeeded`, or `failed`, with acceptance and final receipts persisted separately. Manual redrive is restricted to `dead`/`retrying` emissions or `failed` emissions whose canonical receipt explicitly marks them retryable.
- **ALN-016 (repository dependency):** Konnaxion pins the supplied Konnaxion_Worlds `0.3.6` source package by version and deterministic SHA-256 tree digest and validates the sibling before local startup installation.
- **ALN-019:** Konnaxion export provenance includes Universe + World + exact Release.

## Implemented in Konnaxion_Worlds

- Added a Kristal v7 boundary contract while retaining the v6 portable-state compatibility boundary.
- Added v7 anti-drift invariants for additive registration, v6 identity preservation, typed semantic roles, resonance/authority separation, external-KOS/KQ separation and provenance-preserving factorization.
- Added a Kristal v7 boundary checker and retained the v6 checker as a compatibility-foundation check.
- Bumped the Worlds component package to `0.3.6` for this boundary update.

## Explicitly incomplete / blocked

The following handoff outcomes are **not** claimed complete by this update:

- **ALN-003 / ALN-004:** canonical IK `envelope.schema.json`, Profile payload schemas, `artifact-ref.schema.json`, `receipt.schema.json`, JCS vectors and fingerprint TCK assets were not supplied. Konnaxion therefore retains local boundary validation but does not claim canonical IK schema/TCK conformance.
- **ALN-004 final-receipt callback:** acceptance and final states are represented separately, but a new asynchronous final-receipt ingress is not invented without the canonical receipt schema/routing contract. A synchronous final receipt is persisted when returned by the configured transport.
- **ALN-007:** the `governance.decision.execute` idempotency formula conflict between the reference adapter and product cannot be resolved without the canonical IK reference source/decision; this update does not silently choose a new formula.
- **ALN-010 / ALN-011 / ALN-018:** cross-repository IK/Orgo qualification cannot be completed because the canonical IK/Orgo source/TCK runtime is not in the supplied input set.
- **ALN-012 through ALN-015 / ALN-017:** Capsule Manager / Agent / KonnaxionDiag sources required by these items were not supplied here.
- Full Django/backend integration tests were not run in this patch environment because Django is not installed. Static compilation, source-boundary checks, pure contract tests, Kristal lock verification and Worlds dependency verification were run instead.

## Local validation evidence

The following checks pass on the updated source snapshot:

```text
python scripts/check_kristal_v7_alignment.py --kristal-standard ../kristal_standard
python scripts/check_worlds_dependency.py ../worlds
python scripts/check_worlds_ownership.py
python -m compileall -q backend/konnaxion/integrations/interaction_kernel backend/konnaxion/ethikos scripts
```

The pure Interaction Kernel contract test module passes 4/4 tests, covering transient fingerprint fields, strict impact payload requirements/string subject IDs, and acceptance-vs-final receipt phase classification.

Konnaxion_Worlds separately passes:

```text
python scripts/check_kristal_v6_boundary.py
python scripts/check_kristal_v7_boundary.py
python scripts/check_repo_boundaries.py
python -m compileall -q backend/konnaxion/worlds backend/worlds_config backend/worlds_manage.py
```

## No ecosystem-aligned release claim yet

The supplied handoff explicitly requires all P0 items ALN-001 through ALN-018 to close before an “ecosystem aligned” claim (with only the stated external-Orgo exception). Because multiple external-source/TCK/security items remain unavailable or open, this update must be described as a **Kristal-v7-prioritized alignment patch**, not a completed ecosystem qualification.
