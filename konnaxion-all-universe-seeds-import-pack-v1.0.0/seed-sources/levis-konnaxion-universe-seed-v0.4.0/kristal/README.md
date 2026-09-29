# Lévis — Kristal v5 authoring inputs (0.3.0)

This directory contains **authoring inputs**, not a hand-built Runtime Pack and not a canonical Structured Epistemic State.

- `input/referent-registry.json` conforms to the Kristal v5 Referent Registry schema.
- `input/claim-ir/**` conforms to the Kristal v5 Claim-IR schema.
- `source-registry.json` preserves the public-source catalog used by the Lévis seed authoring process.

The Claim-IR files carry role, mandate, expertise and professional-designation proposals that were previously copied into Konnaxion persona metadata. They now remain on the epistemic side of the boundary. They **must be resolved/validated/recognized by the Kristal pipeline** before Konnaxion treats them as runtime knowledge.

Expected flow:

```text
public sources / curated authoring
        -> Claim-IR + Referent Registry (this directory)
        -> Da’at / Kristal resolution + validation
        -> Kristal Runtime Pack
        -> Konnaxion activation/distribution
        -> Ethikos/EkoH reader-policy views
```

No new Kristal↔Ethikos contract is introduced here. Ethikos can ground runtime arguments using its existing `ArgumentSource`; `source_type=kristal_assertion` and `citation_text=<assertion_id>` are sufficient for the current model, while richer typed local fields remain an optional Konnaxion evolution.
