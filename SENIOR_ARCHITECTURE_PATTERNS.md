# Senior Architecture Pattern Alignment

This note makes the current Konnaxion alignment with the `senior-architecture-patterns` corpus explicit. It is an architecture map, not a blanket claim that every pattern is complete or release-qualified.

**Status vocabulary:** **Applied** = visible in current code/contracts; **Selective** = used at a meaningful boundary rather than application-wide; **Partial** = the core mechanism exists but not the full corpus pattern.

| Pattern | Status | Konnaxion alignment |
|---|---|---|
| Modular Monolith | **Applied (backend)** | The Django backend is organized as domain modules/apps with one operational ownership model; frontend, workers and realtime remain separate runtime roles. |
| Hexagonal Architecture (Ports & Adapters) | **Selective** | Ecosystem integrations are kept behind dedicated adapter/boundary packages instead of leaking foreign models into Konnaxion domain code. |
| Anti-Corruption Layer | **Selective / Applied** | Interaction Kernel boundaries preserve Konnaxion semantics and prohibit direct writes to Orgo/Kristal internals. |
| Idempotency | **Applied** | IK envelopes and ingress use explicit idempotency keys and duplicate-safe persistence. |
| Transactional Outbox | **Applied** | `InteractionEmission` is persisted with the owner transaction and delivery is scheduled post-commit; remote failure does not roll back valid civic state. |
| Exponential Backoff + Jitter | **Partial** | Capped exponential retry backoff is implemented for IK delivery; jitter is not currently evident in that implementation. |
| Dead Letter Queue (DLQ) | **Partial** | Exhausted/non-retryable IK deliveries enter a terminal `dead` state and can be redriven; this is not a separate broker DLQ. |
| Pub/Sub | **Applied** | Django Channels uses Redis pub/sub for realtime fan-out; Redis is also used as the Celery broker. |
| Timeout Budgets | **Applied at external boundaries** | IK HTTP delivery and ecosystem readiness probes use bounded timeouts. |
| Health Check API | **Applied** | Explicit liveness/readiness endpoints exist, including database-aware readiness used by Koali integration. |

## Important non-claims

Konnaxion is **not** documented here as application-wide hexagonal architecture, event sourcing, or microservices. Retry/backoff does not imply a complete circuit-breaker implementation, and the current terminal delivery state should not be described as a broker-native DLQ.

## Evidence anchors

- `docs/Technical-Reference/BOUNDARIES_AND_OWNERSHIP.md`
- `docs/Technical-Reference/INTERACTION_KERNEL_INTEGRATION.md`
- `backend/konnaxion/integrations/interaction_kernel/services.py`
- `backend/konnaxion/integrations/interaction_kernel/transport.py`
- `backend/konnaxion/ethikos/tasks.py`
- `backend/config/koali_health.py`
- `PlantUML/Konnaxion_C2_Containers.puml`
