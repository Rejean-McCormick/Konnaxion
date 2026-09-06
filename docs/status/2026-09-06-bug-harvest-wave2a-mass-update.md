# Konnaxion Bug Harvest Wave 2A — Mass Update

## Scope

This batch follows the Wave 2 harvest across keenKonnect, Kreative and Kontrol.

## Runtime defects addressed

- Kreative dashboard no longer references missing seeded media files directly.
- `KreativeArtworkSerializer` exposes `media_url` only when the underlying storage object exists.
- Kreative dashboard now derives featured work, gallery preview, creator activity and recent activity from the real artwork API.
- Document Management uses `destroyOnHidden` instead of the deprecated drawer lifecycle prop.
- Kontrol dashboard no longer presents fabricated governance KPIs or infrastructure health values.
- Kontrol dashboard now reads the real admin user, moderation and audit endpoints.
- Wave 2 route harvesting waits for delayed table/API activity before moving to the next route, reducing navigation-abort misattribution.

## False-success / persistence corrections

- Submit Creative Work now persists a real `KreativeArtwork` through multipart API upload.
- Cultural Archive contributions on Kreative Mentorship now persist real `TraditionEntry` rows.
- Showcase review submission remains unavailable because there is no dedicated review contract; the UI no longer claims success.
- Mentorship request delivery remains unavailable and the action is disabled rather than claiming success.
- keenKonnect Document Management is explicitly session-local until a general document persistence contract exists.
- Kontrol Users is explicitly read-only for user mutations.
- Kontrol Roles is explicitly a read-only role/permission preview until a role-write contract exists.
- Audit CSV export and moderation bulk actions are marked unavailable where no matching backend contract exists.

## Source audit semantics

Wave 2 source audit now distinguishes:

- **blocking source gaps**: undeclared test data, fake success, API/backend wiring TODOs, placeholder promises, fake admin mutations;
- **declared deferred surfaces**: explicit preview/read-only/unavailable product areas.

The current batch reduces blocking matches in the Wave 2 target set from **30 to 0** while keeping declared deferred surfaces visible in the harvest log.

## Architectural note

No new backend domain model is invented to make a UI pass.

Existing owners remain unchanged:

- keenKonnect owns project/collaboration state;
- Kreative owns artworks, galleries, collaboration sessions and traditions;
- Kontrol owns platform administration/moderation surfaces.

A UI is wired only where an existing backend contract matches the product semantics.
