# Konnaxion AI Navigation Index

This index routes an agent to the smallest useful set of authoritative sources for a task.

It is not a repository overview and does not replace `docs/README.md`.

## Authority model

The repository-defined documentation authority is:

`docs/README.md`

Follow its canonical reading order when documentation conflicts.

Older documents that call themselves `canonical`, `definitive`, or `single source of truth` do not override that order.

| Question | Start with |
|---|---|
| What is currently implemented, qualified, failing, preview, or deferred? | `docs/Technical-Reference/QUALIFICATION_STATUS.md` |
| What does the software actually do now? | Active implementation + nearest executable tests |
| What architecture and ownership must be preserved? | `docs/README.md` → canonical architecture documents |
| What are the ecosystem interoperability rules? | `docs/Technical-Reference/INTERACTION_KERNEL_INTEGRATION.md` |
| Where does code differ from the intended architecture? | `docs/Technical-Reference/CODE_ALIGNMENT_NOTES.md` |
| What API/contract should exist? | `docs/Technical-Reference/CONTRACTS.txt` + actual router/service implementation |
| Why was something designed historically? | Historical material only after current authority is established |

---

## 1. Current qualification and implementation status

### Start here

`docs/Technical-Reference/QUALIFICATION_STATUS.md`

### Use for

- Implemented / Qualified / Preview / Deferred / Historical distinctions;
- current PASS / WARN / FAIL / SKIP evidence;
- current qualification defects;
- test-layer distinctions;
- determining whether older evidence is stale.

### Verify with

The implementation and executable evidence named by the status document.

### Caveat

Do not translate:

- configured into passed;
- implemented into qualified;
- WARN or SKIP into PASS;
- historical percentages into current readiness claims.

---

## 2. Overall architecture and terminology

### Start here

`docs/Technical-Reference/DocV14/Konnaxion v14 - Full-Stack Technical Specification.md`

Then use:

- `docs/Technical-Reference/GLOSSARY.md`
- `docs/Technical-Reference/BOUNDARIES_AND_OWNERSHIP.md`
- `docs/Technical-Reference/CONTRACTS.txt`

### Implementation anchors

- `backend/konnaxion/`
- `backend/config/`
- `frontend/app/`
- `frontend/services/`

### Use for

- platform/domain/service terminology;
- system shape;
- ownership;
- integration boundaries;
- source-state ownership;
- distinguishing product/UI "modules" from architectural domains and services.

### Caveat

Architecture describes structure, ownership, invariants, and intended contracts. It does not prove every described capability is currently implemented or qualified.

---

## 3. Interaction Kernel and ecosystem interoperability

### Start here

`docs/Technical-Reference/INTERACTION_KERNEL_INTEGRATION.md`

Then use:

- `docs/Technical-Reference/BOUNDARIES_AND_OWNERSHIP.md`
- `docs/Technical-Reference/CONTRACTS.txt`
- `docs/Technical-Reference/CODE_ALIGNMENT_NOTES.md`

### Use for

- Interaction Kernel integration semantics;
- external-system boundaries;
- ownership preservation across ecosystem integrations;
- deciding whether something is a local domain responsibility or an interoperability concern.

### Rule

Interoperability does not transfer Konnaxion business-domain ownership.

Do not assume shared internal tables or undocumented direct coupling between ecosystem systems.

---

## 4. Known architecture/code divergence

### Start here

`docs/Technical-Reference/CODE_ALIGNMENT_NOTES.md`

### Use for

- compatibility ownership;
- remaining `kollective_intelligence` dependencies;
- EkoH taxonomy alignment;
- Smart Vote source-vs-derived-state alignment;
- simulated/global voting-weight semantics;
- implementation gaps;
- external adapter boundaries.

### Rule

Do not fix a divergence by creating another parallel implementation.

Identify the canonical owner, inspect current implementation and tests, then move behavior toward that owner deliberately.

---

## 5. ethiKos / Korum

### Start here

- `docs/Technical-Reference/BOUNDARIES_AND_OWNERSHIP.md`
- `docs/Technical-Reference/CONTRACTS.txt`

### Implementation

`backend/konnaxion/ethikos/`

Relevant routing includes:

- `backend/konnaxion/ethikos/urls.py`
- `backend/konnaxion/ethikos/demo_import/urls.py`

Frontend work starts from:

`frontend/app/ethikos/`

### Verification

Use the nearest tests under:

`backend/konnaxion/ethikos/tests/`

and the relevant frontend/browser workflow when work crosses the UI/runtime boundary.

### Authority caveat

ethiKos owns deliberation source state.

A Smart Vote reading may consume that state but must not silently rewrite it.

Logical Korum concepts may be physically implemented inside `konnaxion.ethikos`; do not create a second Django owner merely because the logical concept has a distinct name.

---

## 6. EkoH

### Start here

- `docs/Technical-Reference/EkoH Smart Vote/EkoH and Smart Vote - Technical Specification.md`
- `docs/Technical-Reference/BOUNDARIES_AND_OWNERSHIP.md`
- `docs/Technical-Reference/GENERALinstructionsForAI.txt`

### Implementation

`backend/konnaxion/ekoh/`

Important current areas include:

- `backend/konnaxion/ekoh/models/`
- `backend/konnaxion/ekoh/services/`
- `backend/konnaxion/ekoh/views/`
- `backend/konnaxion/ekoh/tasks/`

### Verification

`backend/konnaxion/ekoh/tests/`

### Key rules

- expertise is domain-bounded;
- lack of expertise is not negative merit;
- identity confidentiality and rating disclosure are distinct concerns;
- EkoH context does not become civic source state;
- EkoH does not own ballots or final decision protocols.

### Caveat

Do not add new canonical EkoH behavior to:

`backend/konnaxion/kollective_intelligence/`

That package remains a compatibility surface, not the owner of new EkoH behavior.

---

## 7. Smart Vote

### Start here

- `docs/Technical-Reference/EkoH Smart Vote/EkoH and Smart Vote - Technical Specification.md`
- `docs/Technical-Reference/CONTRACTS.txt`
- `docs/Technical-Reference/CODE_ALIGNMENT_NOTES.md`

### Implementation

`backend/konnaxion/smart_vote/`

Important current areas include:

- `backend/konnaxion/smart_vote/models/`
- `backend/konnaxion/smart_vote/services/reading_service.py`
- `backend/konnaxion/smart_vote/services/weight_calculator.py`
- `backend/konnaxion/smart_vote/views/`

Relevant frontend integration includes:

- `frontend/services/decide.ts`
- `frontend/services/readings.ts`

### Verification

`backend/konnaxion/smart_vote/tests/`

### Core invariant

```text
source fact
!= baseline
!= derived reading
```

### Caveats

- Do not invent a global Smart Vote weight.
- Do not let client-provided derived values become source truth.
- Do not replace a missing derived reading with the baseline.
- Reproducibility metadata does not itself prove all referenced snapshot inputs are durably persisted; inspect implementation.

---

## 8. API and contract work

### Start here

`docs/Technical-Reference/CONTRACTS.txt`

### Verify actual registration against

- `backend/config/api_router.py`
- `backend/config/urls.py`
- the owning domain's `urls.py`
- owning views, serializers, models, and services.

### Rule

Documentation may describe compatibility, conditional, planned, or historical routes.

Inspect actual registration before asserting that an endpoint exists.

A compatibility alias does not create a second canonical owner.

Do not invent API paths for external ecosystem systems that have no active adapter.

---

## 9. Frontend routes and UI work

### Active implementation

Start with:

- `frontend/app/`
- `frontend/routes/index.ts`
- the relevant domain route file under `frontend/routes/`
- the relevant service under `frontend/services/`

Supporting documentation:

`docs/Technical-Reference/DocV14/Konnaxion v14 - Site Navigation Map.md`

### Verify with

- the actual route/page;
- relevant service or hook;
- backend contract when persistence or mutation is involved;
- tests or browser workflows appropriate to the surface.

### Caveat

A visible frontend surface proves only that a UI surface exists.

It does not by itself prove:

- backend completeness;
- persistence;
- qualification;
- canonical domain ownership.

Preserve intentional preview, read-only, placeholder, or deferred behavior.

---

## 10. User workflows

### Start here

`docs/Konnaxion_User_Workflows.md`

### Use for

- intended user sequences;
- cross-surface behavior;
- identifying likely frontend/backend boundaries.

### Then verify

Inspect the actual frontend, service, backend owner, and relevant tests.

### Caveat

Workflow documentation expresses intended behavior. It does not establish current executable behavior by itself.

---

## 11. Backend implementation work

### Start with

- the owning package under `backend/konnaxion/`;
- `backend/config/api_router.py` for API registration;
- `backend/pyproject.toml` for backend tooling;
- nearest tests.

### Common validation from `backend/`

```text
python manage.py check
pytest
```

For model/schema changes:

```text
python manage.py makemigrations --check --dry-run
```

For relevant typed Python work:

```text
mypy konnaxion
```

### Caveat

Pytest is configured with `--reuse-db`.

Do not treat a reused test database as clean schema/release qualification when `QUALIFICATION_STATUS.md` requires different evidence.

---

## 12. Frontend implementation work

### Start with

- `frontend/app/`
- `frontend/routes/`
- `frontend/services/`
- relevant hooks/components/modules;
- `frontend/package.json`.

### Mechanically evidenced scripts include

```text
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
pnpm run smoke:gate
pnpm run delivery:ethikos
```

Use only the validation layers relevant to the changed surface.

Browser workflows require their backend, seed, authentication, and runtime prerequisites.

Do not reduce build, lint, Jest, component testing, smoke testing, delivery workflows, and broader qualification to a single "frontend passed" statement.

---

## 13. Deployment and operational work

### Start with

- `docs/Technical-Reference/DEV_DOCKER_CHEATSHEET.md`
- `docs/Technical-Reference/Konnaxion_Frontend_Deployment_Runbook.md`
- `docs/Technical-Reference/QUALIFICATION_STATUS.md`

Then inspect current Docker/configuration files.

### Caveat

The existence of deployment, backup, restore, or runtime configuration proves that the mechanism is represented in the repository. It does not prove that a current operational qualification run passed.

---

## 14. External ecosystem integrations

### Start here

- `docs/Technical-Reference/INTERACTION_KERNEL_INTEGRATION.md`
- `docs/Technical-Reference/BOUNDARIES_AND_OWNERSHIP.md`

### Current rule

Do not assume active adapters for Orgo, Kristal, or SemantiK Architect unless current implementation demonstrates them.

When an integration is implemented:

- preserve Konnaxion's domain ownership;
- use an explicit adapter or contract;
- do not use shared internal database tables as the implicit integration mechanism;
- do not equate foreign objects with Konnaxion domain objects without a defined mapping.

kOA-Linux hosting does not transfer Konnaxion business-domain authority.

---

## 15. Areas that should normally not drive implementation

Do not begin ordinary implementation analysis in:

- `.kx_deploy_backups/`
- `_BUG_HARVEST_SOURCE/`
- `_BUG_HARVEST_REVIEW/`
- `*_Dump/` / `*_dump/`
- generated source/repository concatenations
- generated route inventories
- generated Storybook/static output
- generated diagnostic/run output
- historical status material

These areas may be useful for history, recovery, diagnostics, comparison, or provenance, but they are not the normal source of current implementation truth.

See `.smartignore` for additional repository-specific noise exclusions.

---

## Fast routing

```text
current implementation / qualification status?
→ docs/Technical-Reference/QUALIFICATION_STATUS.md

documentation conflict?
→ docs/README.md

architecture / ownership?
→ docs/README.md
→ Full-Stack Technical Specification
→ BOUNDARIES_AND_OWNERSHIP.md

Interaction Kernel / ecosystem interoperability?
→ INTERACTION_KERNEL_INTEGRATION.md
→ BOUNDARIES_AND_OWNERSHIP.md

known architecture/code mismatch?
→ CODE_ALIGNMENT_NOTES.md

active API?
→ CONTRACTS.txt
→ backend/config/api_router.py
→ owning urls/views/services/tests

ethiKos / Korum?
→ backend/konnaxion/ethikos/
→ nearest tests

EkoH?
→ EkoH and Smart Vote - Technical Specification
→ backend/konnaxion/ekoh/
→ nearest tests

Smart Vote?
→ EkoH and Smart Vote - Technical Specification
→ backend/konnaxion/smart_vote/
→ reading_service.py
→ nearest tests

frontend behavior?
→ frontend/app/
→ frontend/routes/
→ relevant service/hook
→ backend contract

historical document conflicts with current source?
→ do not reconcile silently
→ establish authority first
```