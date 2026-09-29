# Integration notes — optimized boundary

## Konnaxion owns

- Universe / World / Release lifecycle
- WorldPersona and release-local WorldPersonaBridge
- Ethikos mutable deliberation state
- EkoH readings and local operational state
- DecisionRecord and local application records

## Kristal owns

- referent identity semantics
- claims/assertions
- source/evidence provenance
- validation/certainty/authority recognition
- Runtime Pack reader-policy views

## Persona binding

Every generated `WorldPersona.metadata_json` contains `kristal_referent_ref`; it does **not** contain role/expertise/provenance truth claims. Runtime code resolves those through the active Kristal Runtime Pack.

## Ethikos grounding

No ecosystem contract is added. With the current Konnaxion model, an `ArgumentSource` may represent a Kristal assertion using:

- `source_type = kristal_assertion`
- `citation_text = <assertion_id>`
- `title/excerpt/url` for user-facing source presentation
- `note` only for optional local audit context

A future typed `source_ref` JSON field could improve machine ergonomics, but it is not required by this seed.


## Konnaxion Universe Seed Standard 0.4 projection

The previous Lévis-specific host adapter has been removed. `kx-world-personas/v1` with `identity_binding_only` now enforces the same authority boundary generically. `kx-universe-pack/v1` replaces the custom bootstrap/release-set scripts and performs READY-first, atomic Konnaxion promotion. Kristal Runtime Pack activation remains a distinct external state transition and is never implied by World promotion.
