# Bug Harvest Wave 2B — mass update

**Date:** 2026-09-06  
**Scope:** keenKonnect + Kreative + Kontrol secondary-surface hardening

## Qualification context

Wave 1 TeamBuilder/KonnectED is already green. Wave 2A converted the first 30
blocking source gaps into real persistence or explicitly declared deferred
surfaces. The post-Wave-2A source audit reported `blocking=0` and
`declared-deferred=30`, while runtime still exposed AntD deprecations,
React.Fragment warnings and navigation-cancellation noise.

## Wave 2B classification

This batch follows the documented pre-RC rule: complete secondary product
surfaces where a real backend contract exists, otherwise explicitly defer them.
It does not create new ownership boundaries or parallel APIs.

### Real contracts used

- `keenkonnect/projects/`
- `kreative/artworks/`
- `kreative/traditions/`
- `kreative/collab-sessions/`
- Kontrol admin read surfaces already exposed by the canonical router
- canonical authenticated user update for the writable display name

### Explicitly deferred

- AI matching persistence/membership actions
- general Knowledge document persistence/versioning
- KeenKonnect Workspace persistence/membership
- native KeenKonnect Impact analytics/report persistence
- expertise editing from KeenKonnect; expertise source ownership remains EkoH
- Idea Incubator writes
- showcase-review writes
- mentor-request delivery
- Kontrol role/user mutations without a write contract
- community-moderation mutations without a dedicated contract

## Runtime/harness cleanup

- AntD deprecations corrected on targeted secondary surfaces.
- legacy `@ant-design/compatible` usage removed from Knowledge Document Management.
- targeted Kontrol message calls use context-bound message APIs.
- navigation-time `ERR_ABORTED` requests are correlated with page transition
  instead of being reported as backend defects.
- Wave 2 now performs real UI POST assertions for Artwork and CollabSession and
  cleans created data afterward.

## Static validation before packaging

```text
changed product/test files: 33
source audit blocking: 0
declared deferred markers: 108
TypeScript parser diagnostics: 0
known phantom endpoint literals: 0
```

The next evidence needed is one targeted Wave 2 rerun only.
