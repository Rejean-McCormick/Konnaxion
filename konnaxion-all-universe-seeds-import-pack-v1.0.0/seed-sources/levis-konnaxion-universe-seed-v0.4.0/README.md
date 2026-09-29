# Konnaxion — Ville de Lévis standardized seed 0.4.0

Konnaxion projection package: **0.4.0**  
Kristal authoring bundle retained: **0.3.0**  
Baseline: **2026-09-29**

This package is the strict external-epistemic-authority example for the Konnaxion Universe Seed Standard. It preserves the 17-World municipal topology and the Kristal v5 authoring inputs, while removing the Lévis-specific host adapter.

## Authority boundary

```text
Konnaxion operational projection          Kristal authoring / epistemic side
--------------------------------          ----------------------------------
Universe / Worlds / Releases              Referent Registry
WorldPersona / release bridge             Claim-IR / Structured Epistemic State
simulation eligibility                    evidence / provenance
representation disclosure                 validation / recognition
external referent binding  ------------>  Kristal Runtime Pack / Reader Policy

Ethikos / EkoH mutable state consumes projections; it does not become Kristal authority.
```

Konnaxion persona metadata uses `kx-world-personas/v1` with `persona_projection.mode=identity_binding_only`. Role, mandate, expertise, credential and provenance truth claims are rejected from WorldPersona profiles and remain on the Kristal side.

## Counts

- 17 Worlds
- 66 canonical operational actors/personas
- 68 WorldPersona projection instances
- 68 Kristal Claim-IR authoring files (unchanged v0.3 authoring bundle)

## Install

Requires Konnaxion Universe Seed Standard v1.1 or later. Copy:

- `seed-data/worlds/*` -> `KONNAXION_WORLD_SEED_ROOT`
- `seed-data/universes/*` -> `KONNAXION_UNIVERSE_SEED_ROOT`

Then:

```bash
python manage.py worlds_apply_universe levis --version 0.4.0 --promote
```

All exact World Packs are built READY first. The 17 Konnaxion release pointers are then promoted in one database transaction. This does **not** activate a Kristal Runtime Pack; external runtime activation remains owned by the explicit Kristal/runtime activation owner.

## Validate

```bash
python tools/validate_seed.py --konnaxion-repo /path/to/Konnaxion --write-report
```

Supply `--kristal-repo` as well to re-run the Kristal v5 JSON Schema validation. The original v0.3 Kristal validation report is preserved as `validation_report.kristal-v0.3.json`.
