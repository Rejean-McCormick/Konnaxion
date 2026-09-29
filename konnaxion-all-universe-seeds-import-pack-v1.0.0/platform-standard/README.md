# Konnaxion Universe Seed Standard v1.1

This is the normalization package for the Konnaxion_Worlds snapshot dated 2026-09-29.

## Apply once to the platform

1. Apply `patches/Konnaxion_Worlds_universe_pack_v1.patch` to the `Konnaxion_Worlds` repository.
2. Apply `patches/Konnaxion_host_world_personas_v1.patch` to the main `Konnaxion` repository.
3. Run the normal migrations/tests (the standard adds no DB migration).

After that, Universe seeds MUST NOT ship their own `world_adapters.py` patches.

## Install any normalized Universe

Copy its `seed-data/worlds/*` into `KONNAXION_WORLD_SEED_ROOT` and `seed-data/universes/*` into `KONNAXION_UNIVERSE_SEED_ROOT`. Then run:

```bash
python manage.py worlds_apply_universe <universe-key> --version <version> --promote
```

Normalized packages included:
- UNESCO `1.4.0`
- Cuba Koali `0.2.0`
- Kristal Farms `0.4.0`
- Ville de Lévis `0.4.0` (strict Kristal-bound projection)

All three validate against the supplied `ethikos-demo-scenario/v3` schema and the same Persona/Universe contracts.


## Strict projection profile

For a seed whose knowledge authority lives outside Konnaxion (for example Kristal v5), use `persona_projection.mode: identity_binding_only`. The generic adapter then rejects epistemic claims leaked into WorldPersona profiles while preserving external referent bindings.

Normalized strict example included: Ville de Lévis `0.4.0`.
