# Konnaxion — Interaction Kernel Integration Baseline

**Status:** target ecosystem contract / implementation qualification pending  
**Updated:** 2026-09-16

## Purpose

Interaction Kernel (IK) is the distributed interoperability protocol used between independently owned kOA ecosystem systems. It is **not** a central server, a control plane for Konnaxion, or an owner of Konnaxion civic state.

Konnaxion remains the authoritative owner of its civic/governance state. Orgo remains the owner of operational/workflow state. Kristal remains the owner of Kristal-native epistemic artifacts. kOA-Linux owns physical Runtime Pack verify/stage/activate/rollback state when it is present as the host platform.

## Target Konnaxion ↔ Orgo profiles

### Konnaxion → Orgo

`governance.decision.execute/1.0.0` carries explicit execution intent for an immutable Konnaxion `DecisionRecord`. Publishing/finalizing a decision does not by itself mean that Orgo executed it.

Target flow:

```text
Konnaxion DecisionRecord finalized
→ durable IK emission
→ governance.decision.execute/1.0.0
→ Orgo Signal
→ published WorkflowVersion
→ Orgo Case / Tasks
```

### Orgo → Konnaxion

`accountability.impact.publish/1.0.0` is the target profile for publishing operational/accountability impact back toward Konnaxion.

Target flow:

```text
Orgo workflow/accountability output
→ accountability.impact.publish/1.0.0
→ Konnaxion adapter boundary
→ Konnaxion validation/domain rules
→ Konnaxion-owned read model/state where applicable
```

No Orgo Case is identical to a Konnaxion Topic, and no Orgo Task is identical to a Konnaxion Consultation.

## Operational write invariant

For Konnaxion-owned state, the authoritative write occurs inside Konnaxion first. Cross-system effects are emitted after/alongside that local commit through a durable delivery mechanism such as an outbox. Failure to publish an IK interaction must be retryable without rolling back already-valid civic state, and duplicate delivery must be handled idempotently at the receiving boundary.

IK therefore coordinates interoperability semantics, not a distributed ACID transaction across product databases.

## Current implementation evidence rule

The current Konnaxion documentation snapshot does **not** establish an active IK-conformant adapter as qualified. The supplied IK migration material references an existing/historical `orgo_bridge_*` J30 implementation and `OrgoImpactPublication`; that compatibility surface must be verified in executable code before it is described as current/active Konnaxion behavior.

Until that proof exists:

- document the IK profiles as **target contracts**;
- do not claim Konnaxion↔Orgo IK conformance;
- do not infer the presence of a bridge from architecture text alone;
- qualify adapter behavior separately from core Konnaxion qualification.

## DecisionRecord

The target ecosystem handoff is an immutable/read-model `DecisionRecord`. The handoff preserves Konnaxion authority over the decision while making execution intent explicit through the IK profile.

A DecisionRecord is not an Orgo Case and does not transfer Konnaxion civic ownership to Orgo.

## Kristal and Da’at

When a Konnaxion use case requires Kristal, the ecosystem boundary is profile-driven and preserves Kristal-native semantics such as artifact identity, assertion status, certainty, validation, authority recognition and Reader Policy. Konnaxion must not reinterpret those semantics as Konnaxion-native civic status.

The target authority flow is intentionally one-way at the ownership boundary:

```text
Konnaxion-owned operational state
→ local commit + durable outbox/export intent
→ immutable snapshot / ExportManifest / ArtifactRef inputs
→ Interaction Kernel
→ kristal.build.request/1.0.0 or kristal.revision.request/1.0.0
→ Da’at mapping/compilation boundary
→ Kristal-native artifact
→ kristal.artifact.ready/1.0.0 + ArtifactRef/receipt
→ Konnaxion stores only the reference/linkage needed by its own domain
```

Normative constraints:

- Konnaxion does **not** write Kristal internal files/tables directly.
- Interaction Kernel carries the interaction and references; it does **not** persist Konnaxion civic state or become the artifact repository.
- Da’at performs the translation/compilation into Kristal-native semantics.
- Konnaxion's source rows remain authoritative for the operational/civic event that produced the export.
- A Kristal Exchange may make epistemic assertions *about* Konnaxion state without becoming the mutable source of that state.
- A Runtime Pack, SQLite projection, Parquet materialization, search index or vector index is derived/read-oriented and must be reproducible from its authoritative Kristal inputs if it is distributed as part of the Kristal runtime surface.
- No cross-system two-phase commit or other distributed transaction is required between Konnaxion, IK, Da’at and Kristal.

The current Konnaxion snapshot does not prove this Kristal write path as implemented; these are target ecosystem contracts until executable adapter evidence exists.

## Runtime Pack activation

Konnaxion may own desired/application selection. Physical activation has exactly one owner per deployment:

- when kOA-Linux is present, kOA-Linux owns verify/stage/activate/rollback through the Runtime Pack activation boundary;
- a standalone Konnaxion deployment may provide its own activation implementation;
- Konnaxion must not maintain a second competing physical activation state.

## Qualification requirement

IK conformance is a separate evidence surface. A green Konnaxion LevelUpDiag/SecurityDiag run does not, by itself, prove:

- `governance.decision.execute/1.0.0` conformance;
- `accountability.impact.publish/1.0.0` conformance;
- durable delivery/idempotency/correlation behavior;
- DecisionRecord finalization/emission behavior;
- Runtime Pack activation delegation behavior.

Those claims require dedicated integration tests and executable adapter evidence.
