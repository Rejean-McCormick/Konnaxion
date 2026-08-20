# Konnaxion Ethikos / EkoH V3.1 — push package

This package is the corrected V3 overlay for the Canada/Québec Ethikos demo.

## V3.1 migration repair

Local Konnaxion settings remove the PostgreSQL startup `search_path` because some pooled providers reject startup options. Existing Smart Vote tables may live in `ekoh_smartvote`. The prior `smart_vote.0004_source_consultation_binding` migration therefore attempted to create a foreign key to an unqualified `consultation` table while the dedicated schema was not visible.

V3.1 fixes this by:

- setting `SET LOCAL search_path TO ekoh_smartvote, public` inside migration 0004 before the FK is emitted;
- using a transaction-local EkoH/Smart Vote DB scope for seed import, ISCED loading, Smart Vote readings, weighting and EkoH profile reads;
- leaving ordinary Konnaxion tables on their normal public schema outside those scoped operations.

The failed 0004 migration is transactional, so a normal rerun of `python manage.py migrate --noinput` after placing this overlay is expected to continue from the failed point.

Recommended: run the bundled deploy/import/pre-build `.pyw` and choose **TOUT FAIRE**.
