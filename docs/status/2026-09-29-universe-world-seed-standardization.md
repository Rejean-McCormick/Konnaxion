# Konnaxion status — Universe / World seed standardization

Date: 2026-09-29  
Repository: `Konnaxion`  
Status: **validated locally / operational**

## Summary

The Konnaxion host is now running the normalized Universe/World seed stack against the sibling `Konnaxion_Worlds` engine.

The host-side integration remains limited to Konnaxion-owned adapter responsibilities. Universe and World engine ownership stays in `Konnaxion_Worlds`.

Canonical contracts in use:

- `kx-universe-pack/v1`
- `kx-world-pack/v1`
- `kx-world-personas/v1`
- `ethikos-demo-scenario/v3`

The canonical local Python workflow is **UV** using:

```text
backend/.venv/Scripts/python.exe
```

`Konnaxion_Worlds` is consumed from the sibling repository in editable mode.

## Runtime state validated

Four normalized Universes were built and promoted successfully:

| Universe | Pack version | Worlds | Current releases |
| --- | ---: | ---: | ---: |
| `unesco` | `1.4.0` | 7 | 7 |
| `cuba-2026` | `0.2.0` | 1 | 1 |
| `kristal-farms` | `0.4.0` | 11 | 11 |
| `levis` | `0.4.0` | 17 | 17 |

Existing legacy state remains operational:

| Universe | Worlds | Current releases |
| --- | ---: | ---: |
| `legacy` | 8 | 8 |

Validated totals:

```text
Universes: 5
Worlds: 44
Current releases: 44
```

All 36 normalized Worlds have a promoted `r1 (current)` release.

## Host integration

`backend/config/world_adapters.py` provides the host-side projection boundary for `kx-world-personas/v1`.

The normalized seed design does not require Universe-specific Python adapters.

Persona projection remains based on canonical Worlds primitives:

```text
scenario actor.key
    -> WorldPersona
    -> WorldPersonaBridge
    -> release-local bridge User
```

Strict Kristal-bound seeds can use the `identity_binding_only` profile so Konnaxion carries operational identity/binding metadata without becoming the epistemic authority.

## Seed locations

Normalized runtime seeds are stored under:

```text
backend/seed-data/universes/
backend/seed-data/worlds/
```

Current normalized Universe keys:

```text
unesco
cuba-2026
kristal-farms
levis
```

Legacy standalone World Packs remain supported and are not required to be migrated as part of this rollout.

## Validation evidence

The following operations completed successfully:

- Django system startup under the UV-managed Python 3.12 environment.
- `worlds.0004_universes` migration applied.
- Universe Pack discovery from the host seed-data tree.
- Exact seed version resolution.
- WorldRelease build and validation.
- Persona projection through the generic host adapter.
- Promotion of each Universe composition.

The four successful Universe Pack checksums were:

```text
unesco        1.4.0  814632124a08d03804d301c0e291b32edc70314473af8986570d77ced9adc615
cuba-2026     0.2.0  d2ec3b2676ef4467c81d3128470028c3675788fb767aae0151eb0711e1a93fe2
kristal-farms 0.4.0  95ad7e27ba4bfa87e61dedb6ba7e040aa955fde5128e8bac0a57ccd32db18872
levis         0.4.0  d3d5bd547c3ffc159cae5045bce3b3d61cbb0d16c265753df20eebfbe8f0512c
```

## Known non-blocking item

Django currently emits:

```text
urls.W005: URL namespace 'world_runtime' isn't unique.
```

This warning did not prevent migrations, World builds, validation, or promotion. It should be handled as a separate routing cleanup rather than as part of the seed/import contract.

## Dependency state

Dependencies are current for this checkpoint. No dependency upgrade is part of the Universe/World seed rollout status.

## Operational commands

List current Worlds:

```powershell
Set-Location "C:\mycode\Konnaxion\Konnaxion\backend"
$PY = "C:\mycode\Konnaxion\Konnaxion\backend\.venv\Scripts\python.exe"
& $PY manage.py worlds_list
```

Apply a normalized Universe:

```powershell
& $PY manage.py worlds_apply_universe <universe-key> --pack-version <semver> --promote
```

## Result

The normalized Universe/World/Persona standard is file-valid and has been exercised successfully through the real Konnaxion runtime and database.
