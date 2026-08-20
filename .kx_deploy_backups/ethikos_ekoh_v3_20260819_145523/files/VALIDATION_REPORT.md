# Konnaxion / ethiKos / EkoH V3 package validation

Date: 2026-08-19

## Result

The package is now closed around the Canadian ethiKos demo path rather than leaving topic-domain relevance as metadata only.

Canonical separation used by the package:

- **ethiKos** keeps topics, stances, arguments and source links as source facts.
- **EkoH** keeps domain-bounded participant expertise context.
- **Smart Vote** owns the declared advisory reading.
- **SourceConsultationBinding** explicitly maps an ethiKos topic to the Smart Vote consultation that owns its relevance vector.
- The democratic/source baseline is never rewritten by the advisory reading.

## Final integration added

The previous integration gap is removed for ethiKos topics.

New flow:

```text
EthikosTopic
    ↓ explicit SourceConsultationBinding
Smart Vote Consultation
    ↓
ConsultationRelevance
    +
EkoH UserExpertiseScore
    ↓
Smart Vote advisory reading
```

`ethikos-demo-scenario/v3` now accepts the preferred `topic_relevance` shape. The importer creates the explicit Smart Vote binding and persists the relevance vector. Legacy `consultation_relevance` remains accepted for compatibility but is not guessed across subsystems.

## Important files added in the final pass

- `backend/konnaxion/smart_vote/models/source_binding.py`
- `backend/konnaxion/smart_vote/migrations/0004_source_consultation_binding.py`
- `backend/konnaxion/smart_vote/services/reading_service.py`
- `backend/konnaxion/smart_vote/views/reading.py`
- `backend/konnaxion/smart_vote/tests/test_reading_service.py`
- `backend/konnaxion/ethikos/models_demo.py`
- `backend/konnaxion/ethikos/migrations/0005_demo_import_v3_object_types.py`
- `backend/konnaxion/ekoh/management/commands/load_isced.py`
- `Konnaxion_Ethikos_Seed_Manager.pyw`
- `seed-data/ethikos/canada_quebec_public_debates_2026.json`

The ISCED loader was also made non-destructive: it upserts taxonomy rows instead of deleting the taxonomy and cascading away existing EkoH scores.

## Final seed

Validated payload:

```text
schema                  ethikos-demo-scenario/v3
actors                  26
categories               8
topics                   14
stances                  61
arguments                71
argument-source links    95
EkoH profiles            26
topic relevance rows     79
```

The new narrative path is present in the seed:

- Canada–US economic autonomy leads to King Klown's AI infrastructure proposal.
- Réjean asks for discretion and prior Indigenous consultation.
- King Klown answers that it is already announced and pushes the large headlines.
- Inquisiteur removes King Klown from the thread through a visible moderation notice.
- Government questions Réjean; his answers remain short and technical.
- A new question emerges: whether Donald Trump should be excluded from the services.
- King Klown's prior activism is attached as a **background-report source** to his conflict disclosure, and is explicitly marked as fictional demo context.

## EkoH / topic relevance

All 26 demo actors have an EkoH profile record. Inquisiteur intentionally has no claimed domain expertise: moderation authority is role-based, not an expertise bonus.

Every one of the 14 questions has a multi-domain relevance vector summing to `1.0`.

All domain codes used by the final seed exist in the bundled ISCED-F fixture.

## Automated validation completed here

Passed:

- Python syntax / bytecode compile for the final backend patch and Seed Manager.
- Django-free demo schema suite: **22/22 tests passed**.
- Final Canadian seed schema validation: **0 errors**.
- TypeScript / TSX transpile syntax: **9 files, 0 errors**.
- ISCED-F fixture parse and parent/depth integrity: **52 categories, 0 errors**.
- Final seed uses **18** domain codes; all 18 are present in the fixture.
- All 14 topic relevance vectors sum to `1.0`.
- Argument parent ordering is valid for the current one-pass argument importer.
- Smart Vote formula still preserves a `1.0` baseline plus a bounded contextual expertise bonus.

## Runtime checks that require the real Konnaxion environment

This isolated environment does not contain Django or Docker, so the following cannot be truthfully executed here:

- Django migrations against the project database.
- `manage.py check`.
- importer/API database tests.
- Smart Vote reading-service database test.
- the actual import into the running Konnaxion instance.

The bundled `Konnaxion_Ethikos_Seed_Manager.pyw` is updated for V3. Its **Vérifier** / Preview / Import flow runs in the actual Konnaxion Docker environment, applies migrations, synchronizes ISCED-F without deleting existing scores, validates the runtime schema, and then invokes the canonical demo importer.

## Runtime test set bundled

```text
konnaxion/ethikos/tests/test_demo_import_schema.py
konnaxion/ethikos/tests/test_demo_importer.py
konnaxion/ethikos/tests/test_demo_import_api.py
konnaxion/smart_vote/tests/test_reading_service.py
```

The package is ready for the repository overlay followed by the Seed Manager runtime verification/import.
