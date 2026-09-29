# Konnaxion — All Universe Seeds Import Pack v1.0.1

This package is an **overlay for the Konnaxion repository root**.

It places all normalized runtime seed files directly where the standard expects them:

```text
backend/
└── seed-data/
    ├── universes/
    │   ├── unesco/
    │   ├── cuba-2026/
    │   ├── kristal-farms/
    │   └── levis/
    └── worlds/
        └── 36 World Packs
```

## Included Universes

- UNESCO `1.4.0` — 7 Worlds
- Cuba Koali `0.2.0` — 1 World
- Kristal Farms `0.4.0` — 11 Worlds
- Ville de Lévis `0.4.0` — 17 Worlds, strict Kristal-bound `identity_binding_only`

Total: **4 Universes / 36 Worlds / 36 scenarios**.

There are no duplicate Universe keys or World keys.

## Platform prerequisite — apply once

The normalized seeds assume the platform supports:

- `kx-universe-pack/v1`
- `kx-world-personas/v1`

The canonical patches and documentation are included under:

```text
platform-standard/
├── patches/
└── docs/
```

Apply those platform patches **once** to Konnaxion_Worlds and Konnaxion before importing the seeds.
Do not copy any Universe-specific adapter into the host.

## Install filetree

Extract/copy this package at the **Konnaxion repository root**. The `backend/seed-data/...`
tree is already in its final location.

Rich source material that is not part of runtime seed discovery is preserved separately under:

```text
seed-sources/
```

This includes UNESCO evidence/flagships, Kristal Farms source inventory, and Lévis Kristal Claim-IR.
It is intentionally outside `backend/seed-data` so it cannot be mistaken for runtime World data.

## Verify before import

```bash
python tools/verify_filetree.py .
```

## Import all four Universes

Linux/macOS:

```bash
./IMPORT_ALL_UNIVERSES.sh
```

Windows PowerShell:

```powershell
./IMPORT_ALL_UNIVERSES.ps1
```

Equivalent individual commands from `backend/`:

```bash
python manage.py worlds_apply_universe unesco --version 1.4.0 --promote
python manage.py worlds_apply_universe cuba-2026 --version 0.2.0 --promote
python manage.py worlds_apply_universe kristal-farms --version 0.4.0 --promote
python manage.py worlds_apply_universe levis --version 0.4.0 --promote
```

## Important boundaries

- World data remains isolated by `WorldRelease`.
- `WorldPersona` / `WorldPersonaBridge` projection is handled by the generic host adapter.
- Lévis keeps Kristal as its epistemic authority; Konnaxion stores only identity/binding projection.
- Universe promotion does not activate a Kristal Runtime Pack.
- The package contains no Universe-specific `world_adapters.py` or post-build persona bridge script.

## v1.0.1 verifier fix

`tools/verify_filetree.py` now treats only Worlds referenced by a
`kx-universe-pack/v1` as strict managed Worlds.

Existing standalone/legacy World Packs remain supported and are reported as
`legacy/unmanaged` warnings rather than failing solely because they predate
`kx-world-personas/v1`.
