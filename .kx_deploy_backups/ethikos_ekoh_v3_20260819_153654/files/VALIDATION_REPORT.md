# Konnaxion Ethikos/EkoH V3.2 validation

Packaging/static checks:
- seed JSON parses as `ethikos-demo-scenario/v3`;
- patched Python sources compile;
- EkoH 0001 creates/selects `ekoh_smartvote` transactionally;
- EkoH 0002 selects `ekoh_smartvote` transactionally;
- Smart Vote 0002 selects `ekoh_smartvote` transactionally;
- Smart Vote 0004 remains transactionally scoped;
- test settings remove connection startup `OPTIONS["options"]`;
- ZIP integrity and package SHA-256 validated;
- deploy `.pyw` self-test validated.

The actual Django/Neon tests must run in the user's Docker environment.
