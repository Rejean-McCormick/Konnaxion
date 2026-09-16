# Documentation alignment update — 2026-09-16

This update aligns Konnaxion documentation with the supplied kOA Digital Ecosystem / Interaction Kernel integration baseline without claiming implementation that the Konnaxion snapshot does not prove.

Updated:
- documentation authority / reading order;
- Interaction Kernel target profiles and ownership boundaries;
- DecisionRecord handoff semantics;
- Runtime Pack activation ownership;
- explicit distinction between Konnaxion “Single Truth” terminology and Kristal epistemic semantics;
- qualification language so core diagnostic PASS/WARN/FAIL does not imply IK conformance.

Added:
- `Technical-Reference/INTERACTION_KERNEL_INTEGRATION.md`.

Important evidence note:
- Konnaxion documentation reports no active IK-conformant adapter as qualified;
- Interaction Kernel migration material references an existing/historical `orgo_bridge_*` J30 / `OrgoImpactPublication` surface;
- this update records the discrepancy and requires executable verification rather than silently choosing one source.

## Operational state / Kristal boundary clarification

The documentation now makes the ecosystem persistence boundary explicit:

- Konnaxion remains the authoritative owner of mutable civic/application state;
- Interaction Kernel transports interactions, receipts and artifact references and is neither a shared database nor an artifact store;
- Konnaxion-to-Kristal publication is a target local-commit → durable export/outbox → IK → Da’at → Kristal flow;
- Kristal Exchanges are epistemic artifacts derived from selected source state, not replacements for Konnaxion operational tables;
- Runtime Pack physical structures, including possible SQLite/Parquet/search/vector materializations, are derived/read-oriented and non-authoritative;
- Konnaxion may persist `ArtifactRef`, digest, locator, correlation and receipt metadata locally;
- no distributed transaction or bidirectional row synchronization across Konnaxion / IK / Da’at / Kristal is required or implied.

This clarification does not claim that the Kristal adapter path is implemented in the current Konnaxion snapshot.
