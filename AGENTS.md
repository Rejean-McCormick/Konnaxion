# Konnaxion Agent Instructions

These instructions apply to the whole repository.

For non-trivial work, use `docs/ai/INDEX.md` to find the correct source, implementation area, validation path, and authority for the question.

## 1. Establish authority before changing code

Konnaxion contains current specifications, executable code, qualification evidence, historical design material, backups, generated inventories, and experimental surfaces. Do not treat them as equivalent.

Start with:

- `docs/README.md` for the canonical documentation order.
- `docs/Technical-Reference/QUALIFICATION_STATUS.md` for current implementation and qualification evidence.
- `docs/Technical-Reference/DocV14/Konnaxion v14 - Full-Stack Technical Specification.md` for current architectural structure.
- `docs/Technical-Reference/CODE_ALIGNMENT_NOTES.md` for known differences between current code and intended architecture.

Authority depends on the question:

- Current runtime behavior: inspect implementation and executable tests.
- Current qualification/status: use `QUALIFICATION_STATUS.md` and the named evidence.
- Architecture, ownership, and invariants: follow the canonical documentation order in `docs/README.md`.
- Known architecture/code divergence: consult `CODE_ALIGNMENT_NOTES.md`.
- Historical rationale: older documents may help explain history but do not override current canonical sources.

Do not turn an architecture statement into an implementation claim.

## 2. Avoid archive and generated noise

Unless the task explicitly concerns recovery, history, diagnostics, or forensic comparison, do not use these areas as implementation starting points and do not edit them to change application behavior:

- `.kx_deploy_backups/`
- `_BUG_HARVEST_SOURCE/`
- `_BUG_HARVEST_REVIEW/`
- paths matching `*_Dump/` or `*_dump/`
- generated concatenations and repository/source dump files
- generated Storybook/static output
- generated diagnostic/run evidence

Use the active source tree instead.

`.smartignore` documents additional repository content that is normally noise for AI/code-review snapshots.

## 3. Preserve domain ownership

Konnaxion is an ecosystem system and, within its own scope, a multi-domain platform.

Important canonical owners include:

- ethiKos / Korum: `backend/konnaxion/ethikos`
- EkoH: `backend/konnaxion/ekoh`
- Smart Vote: `backend/konnaxion/smart_vote`

`backend/konnaxion/kollective_intelligence` is retained for compatibility and is not the canonical owner for new EkoH or Smart Vote functionality.

Do not create a second canonical model or service when an owner already exists.

Cross-domain writes must go through explicit service/API boundaries rather than direct mutation of another domain's state.

## 4. Preserve source-vs-reading semantics

Maintain the distinction:

`source fact != baseline != derived reading`

In particular:

- ethiKos source state remains ethiKos-owned.
- EkoH supplies contextual expertise, ethics, privacy, and disclosure information.
- Smart Vote produces declared contextual readings.
- A Smart Vote reading must not silently mutate its source facts.
- Do not invent a universal per-person Smart Vote weight.
- Do not copy a baseline into a missing derived-reading field.
- UI presentation does not transfer ownership.

Before changing EkoH/Smart Vote behavior, read:

- `docs/Technical-Reference/EkoH Smart Vote/EkoH and Smart Vote - Technical Specification.md`
- `docs/Technical-Reference/BOUNDARIES_AND_OWNERSHIP.md`
- `docs/Technical-Reference/CONTRACTS.txt`
- `docs/Technical-Reference/CODE_ALIGNMENT_NOTES.md`

## 5. Do not invent ecosystem integrations

Orgo, Kristal, SemantiK Architect, and kOA-Linux are external ecosystem systems relative to Konnaxion.

The current Konnaxion snapshot does not establish active Orgo, Kristal, or SemantiK Architect adapters.

Do not:

- invent direct shared-database integration;
- equate Orgo Case with a Konnaxion Topic;
- equate Orgo Task with a Konnaxion Consultation;
- create undocumented external API routes;
- move Konnaxion domain authority into a hosting/integration system.

Use explicit adapters/contracts when such integrations are actually implemented.

## 6. Before editing

For implementation work:

1. Read the exact current source file.
2. Identify the owning domain/service.
3. Inspect the nearest relevant tests.
4. Check `CODE_ALIGNMENT_NOTES.md` for known divergence.
5. Check `QUALIFICATION_STATUS.md` before relying on a previous green result.
6. Extend the current owner instead of creating a parallel implementation.

For frontend route changes, inspect the actual `frontend/app/**/page.tsx` surface before inventing a route.

A visible frontend surface does not prove that a complete backend persistence contract exists. Preserve explicit preview, read-only, placeholder, or deferred behavior rather than fabricating persistence or success responses.

## 7. Validation

Run validation appropriate to the changed surface. Do not claim a gate passed unless it was actually run successfully.

### Backend

Run from `backend/`:

```text
python manage.py check
pytest
```

For model/schema changes also run:

```text
python manage.py makemigrations --check --dry-run
```

For relevant typed Python changes:

```text
mypy konnaxion
```

`backend/pyproject.toml` configures pytest with `--reuse-db`. Do not treat a reused test database as clean release/schema qualification when `QUALIFICATION_STATUS.md` requires clean-database evidence.

### Frontend

Run from `frontend/` as appropriate:

```text
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

Browser workflows have runtime, seed, authentication, and service prerequisites. Use the specific scripts in `frontend/package.json` and do not interpret a missing prerequisite as equivalent to a product defect.

A successful build does not imply that lint, unit tests, integration tests, browser tests, or release qualification are green.

## 8. Change discipline

- Keep changes in the authoritative source location.
- Do not fix current behavior by editing backup copies, dumps, generated inventories, or diagnostic output.
- Do not silently resolve documentation conflicts; identify the conflict and use the documented authority rules.
- Do not convert historical maturity percentages into current claims.
- Do not weaken tests merely to make qualification green.
- Prefer explicit failure/read-only/deferred behavior over simulated success.

For detailed AI-oriented domain rules, `docs/Technical-Reference/GENERALinstructionsForAI.txt` is useful supporting guidance, but it does not override the authority order in `docs/README.md`.