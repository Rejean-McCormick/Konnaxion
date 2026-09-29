# Konnaxion Universe Seed Standard v1

This package reconciles the existing Konnaxion_Worlds engine with three independently-authored Universe seeds (UNESCO, Cuba Koali and Kristal Farms).

## Canonical contracts

1. `kx-universe-pack/v1` — composition only: Universe, exact World Pack bindings, relations and subscriptions.
2. `kx-world-pack/v1` — existing WorldRelease Seed Pack lifecycle contract.
3. `ethikos-demo-scenario/v3` — existing host scenario contract.
4. `kx-world-personas/v1` — host projection metadata from actor keys to WorldPersona/WorldPersonaBridge.

## Layering

```text
kx-universe-pack/v1
  -> Universe control plane
  -> exact kx-world-pack/v1 bindings
       -> WorldRelease
       -> ethiKos scenario v3
            -> actors[].key
            -> metadata.actor_profiles (kx-world-personas/v1)
                 -> WorldPersona
                 -> WorldPersonaBridge
                 -> release-local User
```

Universe-specific behavior belongs in data: topology, personas, EkoH seed policy, debates, evidence and project metadata. No Universe may ship its own replacement `world_adapters.py`.

## What remains context-specific

- UNESCO may seed open debates and no EkoH scores.
- Cuba may seed synthetic personas, arguments and EkoH scores.
- Kristal Farms may seed institutional simulation roles and source-only real-person references.

All three are valid because the standard constrains identity/lifecycle boundaries, not content policy.


## Strict external epistemic authority

`kx-world-personas/v1` also supports `persona_projection.mode=identity_binding_only`. This is the profile for seeds such as Lévis/Kristal: Konnaxion owns operational World/Persona state, while Kristal owns referent semantics, claims, evidence/provenance, validation/recognition and Runtime Pack reader-policy views. The Universe/World seed carries only an external referent binding.

The same Universe Pack release-set behavior still applies: every exact WorldRelease is built READY first, then all target release pointers are promoted in one database transaction. External Runtime Pack activation is a separate owner/state transition and is not conflated with World promotion.
