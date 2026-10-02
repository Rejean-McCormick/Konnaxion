# Konnaxion web trust hardening — 2026-10-02

This overlay closes the authorization/content-trust issues identified after the ClickFix-style incident.

Key changes:
- production signup is fail-closed;
- owner/staff object-write policies are applied to collaborative CRUD APIs;
- global resource/taxonomy writes are staff-only;
- KnowledgeResource outbound URLs are HTTPS/public-host validated;
- uploads reject browser-active/executable content and use per-feature allowlists;
- media-nginx blocks active browser formats and adds nosniff + sandbox CSP;
- learning-library raw HTML injection was removed;
- outbound links use an explicit external-host interstitial;
- Next middleware emits a nonce CSP;
- API throttling is enabled;
- WebSocket Origin is explicitly validated;
- Ethikos privileged group names are namespaced;
- raw vote access is authenticated/self-scoped.

No database schema migration is required for these changes.
