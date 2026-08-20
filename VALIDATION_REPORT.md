# V4.1.2 static validation report

Prepared against the 2026-08-20 Konnaxion snapshot and the V4.1 walkthrough/access overlay.

## Hotfix in V4.1.2

The V4.1 access resolver could read a stale Django reverse one-to-one cache for
`subject.ekoh_rating_visibility`. If a rating policy was changed through another
`RatingVisibilitySetting` instance during the same request/test lifecycle, the
resolver could continue to see the earlier `scoped` value and incorrectly honor
a scope grant after the persisted policy had become `private`.

V4.1.2 resolves the rating visibility directly from the EkoH database on every
access decision. The existing regression test
`test_private_policy_does_not_accept_scope_grant` therefore remains authoritative:
`private` is stricter than scope grants and permits only self/staff compatibility
access.

No model, migration, API route, seed shape, Smart Vote formula, or frontend
contract changed in this hotfix.

## Architecture validation

- EkoH remains owner of expertise/ethics context.
- EkoH owns disclosure of EkoH-owned ratings.
- Identity privacy remains separate in `ConfidentialitySetting`.
- Smart Vote remains owner of derived readings.
- No business-role RBAC was added to EkoH.
- No organisation, department, Team Builder, KeenKonnect or Ethikos foreign key was added to the EkoH access model.
- Existing `/api/v1/ekoh/profile/<uid>/` route is preserved.
- Existing score tables and Smart Vote formula are preserved.

## Static checks

- Python source compilation of the corrected resolver: passed.
- Package checksums regenerated.
- Existing V4.1 regression test retained unchanged.

## Runtime checks delegated to updater

- `python manage.py migrate` (idempotent; 0003 is already applied when upgrading from V4.1);
- `python manage.py check`;
- `makemigrations --check --dry-run ethikos ekoh smart_vote`;
- targeted pytest suite including `ekoh/tests/test_rating_access.py`;
- preview/import of the Canada/Québec V4.1 seed;
- runtime Smart Vote reading verification;
- runtime public EkoH profile disclosure verification;
- TypeScript typecheck;
- Next.js production build.

## V4.1.2 display-name hotfix

Demo actor imports now persist `display_name` into Konnaxion `User.name`, while Smart Vote and EkoH profile serialization reject the inherited `"None None"` artefact and fall back safely to the username. No schema or migration change.
