# Konnaxion AI Navigation Index

This file routes an agent to the smallest useful set of authoritative sources for a task.

It is not a repository overview and does not replace `docs/README.md`.

## Authority model

The repository already defines its canonical documentation order in:

`docs/README.md`

Use that file when documentation conflicts.

### By question type

| Question | Primary authority |
|---|---|
| What is currently qualified or failing? | `docs/Technical-Reference/QUALIFICATION_STATUS.md` + named executable evidence |
| What does the software currently do? | Active implementation + executable tests |
| What architecture and ownership should be preserved? | Canonical architecture documents from `docs/README.md` |
| Where does current code intentionally diverge from that architecture? | `docs/Technical-Reference/CODE_ALIGNMENT_NOTES.md` |
| What APIs/contracts are active? | `docs/Technical-Reference/CONTRACTS.txt` + actual router/view/service code |
| Why was something designed historically? | Historical docs, only after current authority is established |

Do not use an older document's use of words such as `canonical`, `definitive`, or `single source of truth` to override `docs/README.md`.

---

## 1. Current qualification or release status

### Start here

`docs/Technical-Reference/QUALIFICATION_STATUS.md`

### Use for

- current PASS/WARN/FAIL/SKIP state;
- current test taxonomy;
- release/qualification closure items;
- distinction between implementation and qualification;
- current security and operational evidence;
- determining whether an older result is stale.

### Evidence

Generated diagnostic evidence may exist under locations such as `.levelupdiag/` and other diagnostic/run directories.

Treat those files as evidence, not implementation source.

### Caveat

Do not publish or repeat historical maturity/readiness percentages as current truth unless a current committed scoring method and denominator explicitly support them.

---

## 2. Overall architecture and system shape

### Start here

`docs/Technical-Reference/DocV14/Konnaxion v14 - Full-Stack Technical Specification.md`

Then use:

- `docs/Technical-Reference/GLOSSARY.md`
- `docs/Technical-Reference/BOUNDARIES_AND_OWNERSHIP.md`
- `docs/Technical-Reference/CONTRACTS.txt`

### Use for

- platform/domain/service terminology;
- ownership boundaries;
- backend/frontend system shape;
- integration boundaries;
- source-state ownership;
- distinguishing product/UI “modules” from architecture categories.

### Implementation

- `backend/konnaxion/`
- `backend/config/`
- `frontend/app/`
- `frontend/services/`

### Caveat

Architecture documents define structure and invariants. They do not, by themselves, prove that every described capability is implemented or qualified.

---

## 3. Known architecture/code divergence

### Start here

`docs/Technical-Reference/CODE_ALIGNMENT_NOTES.md`

### Use for

- code that still depends on compatibility ownership;
- old `kollective_intelligence` paths;
- Smart Vote source-vs-derived-state alignment;
- EkoH taxonomy alignment;
- simulated/global voting-weight semantics;
- current gaps between canonical architecture and implementation;
- future external-system adapter boundaries.

### Rule

Do not “fix” a divergence by creating another parallel implementation.

Follow the canonical owner and inspect the current implementation/tests before changing it.

---

## 4. ethiKos / Korum

### Start here

- `docs/Technical-Reference/BOUNDARIES_AND_OWNERSHIP.md`
- `docs/Technical-Reference/CONTRACTS.txt`

### Implementation

`backend/konnaxion/ethikos/`

Frontend routes are primarily under:

`frontend/app/ethikos/`

### Verify with

Tests closest to `backend/konnaxion/ethikos/` plus relevant browser/delivery workflows when the task crosses the UI/runtime boundary.

### Authority caveat

ethiKos owns deliberation source state. A Smart Vote reading may consume that state but must not silently rewrite it.

Logical Korum concepts may currently be physically implemented inside `konnaxion.ethikos`; do not create a new Django app merely because the logical sub-domain has a distinct name.

---

## 5. EkoH

### Start here

- `docs/Technical-Reference/EkoH Smart Vote/EkoH and Smart Vote - Technical Specification.md`
- `docs/Technical-Reference/BOUNDARIES_AND_OWNERSHIP.md`
- `docs/Technical-Reference/GENERALinstructionsForAI.txt`

### Implementation

`backend/konnaxion/ekoh/`

### Key invariants

- expertise is domain-bounded;
- contextual AI analysis is non-authoritative unless governed evidence updates canonical state;
- identity confidentiality and rating disclosure are distinct policies;
- lack of expertise is not negative merit;
- EkoH does not own civic ballots or final decision protocols.

### Caveat

Do not add new canonical EkoH behavior to:

`backend/konnaxion/kollective_intelligence/`

---

## 6. Smart Vote

### Start here

- `docs/Technical-Reference/EkoH Smart Vote/EkoH and Smart Vote - Technical Specification.md`
- `docs/Technical-Reference/CONTRACTS.txt`
- `docs/Technical-Reference/CODE_ALIGNMENT_NOTES.md`

### Implementation

`backend/konnaxion/smart_vote/`

Important current reading logic includes:

`backend/konnaxion/smart_vote/services/reading_service.py`

Relevant frontend integration includes:

`frontend/services/decide.ts`

### Key invariant

```text
source fact
!= baseline
!= derived reading
```

### Caveats

- Do not invent a global Smart Vote weight.
- Do not let a client-provided derived weight become source truth.
- Do not replace a missing reading with the baseline.
- A reading exposed with reproducibility metadata does not automatically prove that all referenced snapshot inputs are durably persisted; inspect the current implementation.

---

## 7. Active API work

### Start here

`docs/Technical-Reference/CONTRACTS.txt`

### Verify against

- `backend/config/api_router.py`
- the owning domain's `urls.py`, views, serializers, services, and tests.

### Rule

Documentation may list conditional or compatibility routes. Inspect current router registration before asserting that a route exists.

Compatibility aliases do not create a second authoritative owner.

Do not invent API paths for external ecosystem systems that have no active adapter.

---

## 8. Frontend routes and UI work

### Start here

Active App Router source:

`frontend/app/`

Supporting navigation reference:

`docs/Technical-Reference/DocV14/Konnaxion v14 - Site Navigation Map.md`

### Verify with

- the actual `page.tsx`;
- the relevant service/hook;
- the backend contract when persistence or mutation is involved;
- tests/browser workflows appropriate to the surface.

### Caveat

A route proves that an interface surface exists. It does not prove:

- backend completeness;
- persistence;
- production qualification;
- domain ownership.

Preserve intentional preview/read-only/deferred behavior where the backend contract is incomplete.

---

## 9. User workflows

### Start here

`docs/Konnaxion_User_Workflows.md`

Then inspect the actual implementation for the affected workflow.

### Use for

- intended user sequence;
- cross-surface interaction;
- identifying likely frontend/backend boundaries.

### Caveat

Workflow documentation expresses intended behavior. Current executable behavior must still be verified in code/tests.

---

## 10. Backend implementation work

### Start with

- the owning package under `backend/konnaxion/`;
- `backend/config/api_router.py` for API registration;
- `backend/pyproject.toml` for test/type/lint configuration;
- nearest tests.

### Basic validation from `backend/`

```text
python manage.py check
pytest
```

For schema/model work:

```text
python manage.py makemigrations --check --dry-run
```

For relevant typing changes:

```text
mypy konnaxion
```

### Important test caveat

Pytest is configured with `--reuse-db`.

For release/schema qualification, consult `QUALIFICATION_STATUS.md` before treating the default test run as clean-database evidence.

---

## 11. Frontend implementation work

### Start with

- `frontend/app/`
- `frontend/services/`
- relevant hooks/components/modules;
- `frontend/package.json`.

### Available validation scripts include

```text
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
pnpm run smoke:gate
pnpm run delivery:ethikos
pnpm run harvest:platform
```

Use browser workflows only when their required backend, seed, authentication, and runtime prerequisites are prepared.

Do not collapse build, lint, Jest, component tests, smoke tests, delivery tests, and harvest tests into a single “frontend passed” claim.

---

## 12. Deployment and operations

### Start with

- `docs/Technical-Reference/DEV_DOCKER_CHEATSHEET.md`
- `docs/Technical-Reference/Konnaxion_Frontend_Deployment_Runbook.md`
- `docs/Technical-Reference/QUALIFICATION_STATUS.md`

Use current deployment configuration as implementation evidence.

### Caveat

Existence of:

- a backup script;
- a restore script;
- Docker configuration;
- security configuration

does not prove that the corresponding operational/release qualification currently passes.

Keep disaster-recovery evidence separate from application/runtime security claims.

---

## 13. External ecosystem integration

### Start here

`docs/Technical-Reference/BOUNDARIES_AND_OWNERSHIP.md`

### Current rule

Do not assume active integration with:

- Orgo;
- Kristal;
- SemantiK Architect.

If implementing one, create an explicit adapter/contract boundary.

Never use shared internal database tables as the integration mechanism.

kOA-Linux hosting/integration does not transfer Konnaxion's business-domain authority.

---

## 14. Repository areas that should normally not drive implementation

Do not begin ordinary implementation analysis in:

- `.kx_deploy_backups/`
- `_BUG_HARVEST_SOURCE/`
- `_BUG_HARVEST_REVIEW/`
- `*_Dump/` / `*_dump/`
- generated source concatenations/bundles
- generated route inventories
- generated Storybook/static output
- generated diagnostic/run output
- historical `docs/status/` assessments

These may be useful for historical comparison, recovery, diagnostics, or provenance, but they are not the normal active source of implementation truth.

See `.smartignore` for additional snapshot-noise exclusions.

---

## 15. Fast decision rule

When unsure where to start:

```text
current status?
→ QUALIFICATION_STATUS.md

architecture/ownership?
→ docs/README.md
→ Full-Stack Technical Specification
→ BOUNDARIES_AND_OWNERSHIP.md

active API?
→ CONTRACTS.txt
→ backend/config/api_router.py
→ owner implementation

known mismatch?
→ CODE_ALIGNMENT_NOTES.md

frontend behavior?
→ frontend/app
→ service/hook
→ backend contract

historical document conflicts with current source?
→ do not resolve silently
→ establish authority first
```