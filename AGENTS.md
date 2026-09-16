# Konnaxion Agent Instructions

These instructions apply to the whole repository.

For non-trivial work, start with `docs/ai/INDEX.md`. It routes by task to the smallest useful set of documentation, implementation, and verification sources.

## 1. Establish authority before making claims or changes

Konnaxion contains current specifications, executable code, qualification evidence, historical design material, backups, generated inventories, and experimental surfaces. Do not treat them as equivalent.

Start with:

- `docs/README.md` for the repository-defined documentation authority and canonical reading order.
- `docs/Technical-Reference/QUALIFICATION_STATUS.md` for current implementation and qualification evidence.
- `docs/Technical-Reference/INTERACTION_KERNEL_INTEGRATION.md` for current Interaction Kernel integration rules.
- `docs/Technical-Reference/DocV14/Konnaxion v14 - Full-Stack Technical Specification.md` for current architectural structure.
- `docs/Technical-Reference/CODE_ALIGNMENT_NOTES.md` for known differences between architecture and implementation.

Authority depends on the question:

- Current runtime behavior: inspect active implementation and executable tests.
- Current qualification/status: use `QUALIFICATION_STATUS.md` and its named evidence.
- Architecture, ownership, terminology, and invariants: follow the canonical order in `docs/README.md`.
- Known architecture/code divergence: use `CODE_ALIGNMENT_NOTES.md`.
- Historical rationale: historical documents may explain decisions but do not override current canonical sources.

Do not turn an architecture statement into an implementation claim.

## 2. Avoid archive, diagnostic, and generated noise

Unless the task explicitly concerns history, recovery, diagnostics, or forensic comparison, do not use these areas as implementation starting points:

- `.kx_deploy_backups/`
- `_BUG_HARVEST_SOURCE/`
- `_BUG_HARVEST_REVIEW/`
- paths matching `*_Dump/` or `*_dump/`
- generated repository/source concatenations
- generated Storybook/static output
- generated diagnostic/run evidence

Use active source instead.

`.smartignore` identifies additional content that is normally irrelevant to AI/code-navigation work.

Do not modify an archive, dump, generated inventory, or diagnostic artifact to change current application behavior.

## 3. Preserve ownership boundaries

Konnaxion is an ecosystem system and, within its own scope, a multi-domain platform.

Important canonical implementation owners include:

- ethiKos / Korum: `backend/konnaxion/ethikos/`
- EkoH: `backend/konnaxion/ekoh/`
- Smart Vote: `backend/konnaxion/smart_vote/`

`backend/konnaxion/kollective_intelligence/` is retained for compatibility and is not the canonical owner for new EkoH or Smart Vote behavior.

Do not create a second canonical model, service, or state owner when one already exists.

Cross-domain state changes must respect explicit service/API boundaries rather than directly mutating another domain's state.

## 4. Preserve source, baseline, and reading semantics

Maintain this distinction:

`source fact != baseline != derived reading`

In particular:

- ethiKos owns its source deliberation state.
- EkoH provides contextual expertise, ethics, privacy, and disclosure information.
- Smart Vote produces declared contextual readings.
- A Smart Vote reading must not silently mutate source facts.
- Do not invent a universal per-person Smart Vote weight.
- Do not substitute a baseline for a missing derived reading.
- UI presentation does not transfer domain ownership.

Before changing EkoH or Smart Vote semantics, inspect:

- `docs/Technical-Reference/EkoH Smart Vote/EkoH and Smart Vote - Technical Specification.md`
- `docs/Technical-Reference/BOUNDARIES_AND_OWNERSHIP.md`
- `docs/Technical-Reference/CONTRACTS.txt`
- `docs/Technical-Reference/CODE_ALIGNMENT_NOTES.md`

## 5. Do not invent ecosystem integrations

Orgo, Kristal, SemantiK Architect, and kOA-Linux are external ecosystem systems relative to Konnaxion.

Do not infer an active adapter merely because an external system appears in architecture documentation.

Do not:

- invent shared-database integration;
- equate foreign domain objects with Konnaxion objects without an explicit mapping contract;
- create undocumented external API routes;
- transfer Konnaxion business-domain authority to a hosting or interoperability system.

Use explicit adapters and contracts when integrations actually exist.

For Interaction Kernel work, start with:

`docs/Technical-Reference/INTERACTION_KERNEL_INTEGRATION.md`

## 6. Before editing implementation

For non-trivial implementation work:

1. Identify the owning domain or service.
2. Read the exact current implementation.
3. Inspect the nearest relevant tests.
4. Check `CODE_ALIGNMENT_NOTES.md` for known divergence.
5. Check `QUALIFICATION_STATUS.md` before relying on an older green result.
6. Extend the current owner instead of creating a parallel implementation.

For API changes, verify actual registration through `backend/config/api_router.py` and the owning domain's `urls.py`, views, serializers, and services.

For frontend route changes, inspect the actual `frontend/app/` route surface and relevant files under `frontend/routes/`.

A visible UI route does not prove backend completeness, persistence, qualification, or domain ownership.

Preserve intentional preview, read-only, placeholder, or deferred behavior rather than fabricating persistence or success responses.

## 7. Validation

Run validation appropriate to the changed surface. Never claim a command, test layer, gate, or workflow passed unless it was actually run successfully.

### Backend

Work from `backend/` as appropriate:

```text
python manage.py check
pytest
```

For model/schema changes:

```text
python manage.py makemigrations --check --dry-run
```

For relevant typed Python changes:

```text
mypy konnaxion
```

`backend/pyproject.toml` configures the backend tooling. Pytest uses `--reuse-db`; do not treat a reused test database as clean release/schema qualification when current qualification requires clean-database evidence.

### Frontend

Use scripts defined in `frontend/package.json`, including as appropriate:

```text
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

Browser workflows have runtime, seed, authentication, and service prerequisites. Use the specific package scripts for the workflow being changed.

Do not collapse build, lint, unit tests, component tests, browser smoke, delivery workflows, and release qualification into a single "passed" claim.

## 8. Change discipline

- Keep changes in the authoritative active source location.
- Do not silently resolve documentation conflicts; identify the conflict and follow `docs/README.md`.
- Do not convert historical maturity percentages or old status claims into current facts.
- Do not weaken tests merely to make qualification green.
- Prefer explicit failure, read-only, preview, or deferred behavior over simulated success.
- Do not infer implementation from filenames, route presence, architecture diagrams, or product feature lists alone.

`docs/Technical-Reference/GENERALinstructionsForAI.txt` contains useful supporting AI-oriented domain guidance, but it does not override the authority order in `docs/README.md`.