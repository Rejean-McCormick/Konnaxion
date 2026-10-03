# Konnaxion ↔ Kristal v7 integration boundary

**Status:** current target integration boundary  
**Kristal Standard:** `7.0.0-draft.3.1`  
**Portable state foundation:** unchanged Kristal v6 `kristal_state` (`6.0.0`)

## Authority and migration model

Kristal v7 is additive. Existing v6 portable artifacts keep their bytes and identity. Konnaxion does not convert them in place and does not write Kristal/Kristall internals directly. The Da’at boundary remains responsible for mapping/compilation into Kristal-native structures.

The intended path is:

```text
Konnaxion authoritative local commit
→ durable export/outbox intent
→ immutable snapshot / ExportManifest / ArtifactRef
→ IK kristal.build.request/2.0.0 or kristal.revision.request/2.0.0
→ Da’at mapping/compilation
→ Kristal v6-compatible portable state (+ extensions.kristal_v7 where applicable)
→ Kristall registration/orchestration
→ IK kristal.artifact.ready/2.0.0
→ Konnaxion stores only domain-relevant reference/linkage
```

## v7 epistemic guards

Konnaxion integrations must preserve these distinctions:

- source assertion != derived assertion != structural relation != semantic-resonance signal != hypothesis != Mesh path;
- semantic resonance cannot establish identity, equivalence, truth, causality or authority;
- KQ/KP/KA/KS identities remain Kristall-owned semantic identifiers, not Konnaxion database keys;
- external KOS identifiers remain mappings and do not replace KQ identity;
- factorization/deduplication must preserve source membership and provenance;
- Kristal actionability and Kristall crystallization do not authorize Konnaxion mutations.

## World provenance

When Konnaxion exports World-derived information, the export must preserve stable Universe + World + exact Release provenance. Display names and an implicitly resolved later “current World” are not persistent identity.

## Canonicalization

The active lock keeps `kristal.v6:jcs-rfc8785` only for the unchanged portable v6 `kristal_state` compatibility boundary. The supplied v7 draft states that v7 meta-artifacts use a separate versioned canonicalization profile but does not name a concrete profile identifier; Konnaxion therefore does not invent one.

## IK conformance caveat

The supplied alignment handoff identifies IK reference implementation `2.0.0-dev.1` and canonical v2 Kristal build/revision/artifact-ready profiles, but the actual IK schema/TCK asset snapshot was not supplied here. Konnaxion may harden known payload requirements now, but full ALN-003/004/TCK conformance remains blocked until the canonical schema assets are available by pinned digest.
