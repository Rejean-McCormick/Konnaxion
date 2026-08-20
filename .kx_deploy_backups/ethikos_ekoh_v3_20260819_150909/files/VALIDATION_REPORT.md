# Validation report — Ethikos / EkoH V3.1

## Static validation

- Python source compilation: PASS
- Demo seed schema validation: PASS (0 errors)
- Seed: 26 actors, 14 topics, 61 stances, 71 arguments, 95 argument sources, 26 EkoH profiles, 79 topic-relevance rows
- `smart_vote.0004_source_consultation_binding`: dedicated schema search path is set before `CreateModel`
- Seed importer: EkoH/Smart Vote search path scoped transaction-locally
- `load_isced`: EkoH/Smart Vote search path scoped transaction-locally
- Reading service / weight calculator: EkoH/Smart Vote search path scoped transaction-locally
- EkoH profile read path: schema scope applied

## Failure addressed

Observed runtime failure: `django.db.utils.ProgrammingError: relation "consultation" does not exist` while applying `smart_vote.0004_source_consultation_binding`. Root cause: the local settings remove connection startup `search_path`; the migration created an FK to the legacy Smart Vote `consultation` table without first exposing the `ekoh_smartvote` schema.

## Runtime validation still performed by deployer

The deployer runs, in the target repository/container: migrations, ISCED synchronization, `manage.py check`, runtime V3 import checks, targeted tests, seed preview, import, post-import verification, TypeScript typecheck and Next build.
