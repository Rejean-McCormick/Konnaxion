# ethiKos Canada V3 — push procedure

This archive is an overlay for the Konnaxion repository root.

1. Back up or commit the current Konnaxion working tree.
2. Extract this package over the Konnaxion repository root, preserving paths.
3. Launch `Konnaxion_Ethikos_Seed_Manager.pyw` from the repository root.
4. Confirm that the JSON field points to:
   `seed-data/ethikos/canada_quebec_public_debates_2026.json`
5. Run **1. Vérifier**.
   - starts/checks the Django Docker service;
   - applies migrations;
   - synchronizes the ISCED-F taxonomy without deleting existing EkoH scores;
   - checks V3 importer support;
   - runs a canonical Preview.
6. Run **Tests Demo Importer**.
7. Run **4. Importer** after Preview is green.

Expected seed preview:

```text
26 actors
8 categories
14 topics
61 stances
71 arguments
95 argument-source links
26 EkoH profiles
79 topic relevance rows
```

The Smart Vote reading endpoint added by the patch is:

```text
GET /api/v1/smart-vote/readings/ethikos-topic/<topic_id>/
```

It returns the canonical baseline separately from `ekoh_weighted_v1`, including lens and EkoH snapshot hashes.
