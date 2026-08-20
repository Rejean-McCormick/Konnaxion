# V4.1 static validation report

Prepared against the 2026-08-20 Konnaxion snapshot and the V4 walkthrough overlay.

## Architecture validation

- EkoH remains owner of expertise/ethics context.
- EkoH now also owns disclosure of EkoH-owned ratings.
- Identity privacy remains separate in `ConfidentialitySetting`.
- Smart Vote remains owner of derived readings.
- No business-role RBAC was added to EkoH.
- No organisation, department, Team Builder, KeenKonnect or Ethikos foreign key was added to the EkoH access model.
- Existing `/api/v1/ekoh/profile/<uid>/` route is preserved.
- Existing score tables and Smart Vote formula are preserved.

## Static code checks performed while building the package

- Python source compilation: passed.
- TypeScript/TSX syntax transpilation for modified/new frontend files: passed.
- V4 seed JSON parsing: passed.
- V4.1 seed counts: verified.
- All 31 EkoH profiles contain explicit `rating_visibility=public`.
- New documentation contract `27_EKOH_RATING_VISIBILITY_AND_ACCESS_CONTRACT.md` created.
- ADR-012 appended to the existing ADR register.

## Runtime checks delegated to updater

The updater must run the authoritative runtime checks in the user repository:

- `python manage.py migrate`;
- `python manage.py check`;
- `makemigrations --check --dry-run ethikos ekoh smart_vote`;
- targeted pytest suite including `ekoh/tests/test_rating_access.py`;
- preview/import of the Canada/Québec V4.1 seed;
- runtime Smart Vote reading verification;
- runtime public EkoH profile disclosure verification;
- TypeScript typecheck;
- Next.js production build.

## Important compatibility decisions

A missing `RatingVisibilitySetting` preserves the pre-V4.1 readable-profile behavior by resolving current ratings as public. This avoids silently hiding existing EkoH profiles after migration. New organisational/private use should create explicit scoped/private policies.

A `private` rating policy is stricter than scoped grants. A private subject remains accessible only to self/staff compatibility access.

Participant-level Smart Vote detail is disclosure-filtered, but aggregate reading arithmetic remains independent of display permissions.
