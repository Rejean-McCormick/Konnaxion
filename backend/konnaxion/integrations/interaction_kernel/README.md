# Konnaxion Interaction Kernel adapter

Konnaxion-owned boundary for Interaction Kernel `ik/1.1`.

- `DecisionRecord` and `InteractionEmission` live in the main ethiKos app.
- `publish` freezes the canonical decision artifact.
- `execute` creates/replays one durable `governance.decision.execute/1.0.0` emission.
- World/release metadata is optional transport context; this package does not import `konnaxion.worlds`.
- Orgo impacts enter through `/api/integrations/ik/konnaxion/interactions/`.
