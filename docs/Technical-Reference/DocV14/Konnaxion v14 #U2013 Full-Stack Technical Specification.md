# Konnaxion v14 — Full-Stack Technical Specification

## 1. Architectural identity

Konnaxion is an **ecosystem system** in the kOA Digital Ecosystem and a **platform** in its own product scope.

It is implemented as a shared product composed of multiple domain/application surfaces rather than a collection of isolated standalone apps.

Current stack:

- frontend: Next.js + React + TypeScript, App Router;
- backend: Django + Django REST Framework;
- primary relational store: PostgreSQL;
- asynchronous execution: Celery + Redis;
- API documentation: drf-spectacular/OpenAPI;
- EkoH/Smart Vote tables use the dedicated `ekoh_smartvote` search-path scope in the current backend settings.

Konnaxion owns Konnaxion domain state. External ecosystem systems integrate through explicit contracts.

## 2. Terminology

Within product/UI language, Konnaxion may call named areas `modules`. In architecture, this document distinguishes:

- **domain** — authoritative business semantics/state;
- **application surface** — user-facing capability;
- **service** — executable capability/API/task;
- **gateway** — boundary adapter;
- **external ecosystem system** — independently owned system such as Orgo, Kristal, SemantiK Architect or kOA-Linux.

`Kollective Intelligence` is a legacy/conceptual umbrella, not a first-class suite in the canonical navigation shell. It is not the canonical backend owner for EkoH or Smart Vote data.

The canonical visible brand spelling is **ethiKos**. Technical identifiers such as `ethikos` and `EthikosTopic` retain their code spelling.

## 3. System shape

```text
Konnaxion
│
├── shared platform
│   ├── users/auth/session
│   ├── moderation/audit
│   ├── shared navigation/search
│   └── common frontend/runtime infrastructure
│
├── civic domain / core experience
│   └── ethiKos
│       ├── Korum              logical structured deliberation
│       ├── Konsultations      logical consultation/decision source boundary
│       └── Konsensus UI       decision/consensus presentation surface
│
├── contextual intelligence / shared capability
│   ├── EkoH                  expertise / ethics / privacy / rating access
│   └── Smart Vote            declared derived readings
│
├── collaboration / core experience
│   └── keenKonnect
│
├── learning / credentials / core experience
│   └── KonnectED
│
├── creative / cultural / core experience
│   └── Kreative
│
├── shared capability
│   └── Team Builder
│
└── operations
    ├── Insights              cross-domain read / analytics surface (`/reports/*`)
    └── KonTrol               administration / moderation / governance
```

The diagram is a responsibility map, not a claim that every logical sub-domain has a separate Django app.

## 4. Global invariants

### 4.1 One owner per authoritative state

A domain mutates its own state. Other domains/systems use APIs, services, commands, queries, events or artifact references.

### 4.2 Single Truth, Multiple Readings

```text
source facts
    ↓
baseline
    ↓
optional declared lens + snapshot context
    ↓
derived reading
```

The reading does not rewrite the source.

Here, “Truth” means the uniquely owned source/civic state inside the relevant Konnaxion domain. It is not a Kristal epistemic status or universal truth authority.

### 4.3 EkoH is context, not sovereignty

Expertise and ethics signals are contextual and bounded. They do not become a universal rank or a fixed global voting power.

### 4.4 Presentation does not own the domain

A page may combine results from several domains. That does not transfer write ownership to the UI or aggregation layer.

## 5. Backend platform

### 5.1 Django apps

Current local apps include:

- `konnaxion.users`;
- `konnaxion.ethikos`;
- `konnaxion.ekoh`;
- `konnaxion.smart_vote`;
- `konnaxion.keenkonnect`;
- `konnaxion.konnected`;
- `konnaxion.kreative`;
- `konnaxion.moderation`;
- `konnaxion.trust`;
- `konnaxion.kontrol`;
- `konnaxion.teambuilder`.

`konnaxion.kollective_intelligence` remains present in the codebase but is not the canonical owner for EkoH/Smart Vote functionality. Active runtime references to it are an alignment concern documented in `CODE_ALIGNMENT_NOTES.md`.

### 5.2 API routing

The central router lives in `backend/config/api_router.py`; project-level URL composition lives in `backend/config/urls.py`.

Primary current route families:

```text
/api/ethikos/*
/api/v1/ekoh/*
/api/v1/smart-vote/*
/api/keenkonnect/*
/api/konnected/*
/api/kreative/*
/api/teambuilder/*
/api/admin/*
/api/reports/*
```

Compatibility aliases under `/api/deliberate/*` map to ethiKos and do not create a second civic owner.

## 6. ethiKos / civic domain

### 6.1 Current physical implementation

Primary backend package:

```text
backend/konnaxion/ethikos/
```

Primary frontend family:

```text
frontend/app/ethikos/
```

### 6.2 Current source objects

`EthikosTopic`
- title/description/status;
- category;
- creator;
- total-vote/activity metadata;
- current code still carries an expertise-category relation that must be aligned to canonical EkoH taxonomy.

`EthikosStance`
- one user stance per topic;
- integer value constrained to -3..+3;
- source participation state.

`EthikosArgument`
- structured argument/reply;
- parent relation;
- pro/con side where declared;
- moderation visibility flag.

Additional implemented deliberation objects:

- `ArgumentSource`;
- `ArgumentImpactVote`;
- `ArgumentSuggestion`;
- `DiscussionParticipantRole`;
- `DiscussionVisibilitySetting`.

Together these form the implemented Korum-style structured deliberation surface.

### 6.3 Korum

Korum is the logical structured-deliberation sub-domain. In the current code it is implemented inside `konnaxion.ethikos` rather than as a separate persistence owner.

Pattern mapping:

```text
Discussion        → EthikosTopic
Claim/argument     → EthikosArgument
Reply relation     → parent
Pro/con relation   → side
Evidence/source    → ArgumentSource
Argument impact    → ArgumentImpactVote
Participation role → DiscussionParticipantRole
Visibility policy  → DiscussionVisibilitySetting
```

### 6.4 Konsultations

Konsultations is the logical consultation/intake/decision source boundary. Formal civic source ballots must remain distinguishable from deliberation stances and from Smart Vote readings.

No automatic identity is allowed between:

```text
Konsultation ≠ Orgo Task
EthikosTopic ≠ Orgo Case
EthikosStance ≠ Smart Vote reading
```

## 7. EkoH

Canonical backend package:

```text
backend/konnaxion/ekoh/
```

EkoH owns:

- `ExpertiseCategory`;
- `UserExpertiseScore`;
- `UserEthicsScore`;
- `ScoreConfiguration`;
- `ScoreHistory`;
- `ConfidentialitySetting`;
- `RatingVisibilitySetting`;
- `RatingAccessScope`;
- `RatingScopeSubject`;
- `RatingAccessGrant`;
- `ContextAnalysisLog`.

### 7.1 Expertise

Expertise is a domain vector, not a single global rank.

The current multidimensional scoring service normalizes evidence axes and persists a bounded `0..1` domain score. Lack of expertise does not create negative merit.

### 7.2 AI/context analysis

The current contextual-analysis service correctly records analysis as **non-authoritative**. It does not silently mutate `UserExpertiseScore`.

This behavior is architectural and should be preserved.

### 7.3 Rating access

`konnaxion.ekoh.services.rating_access` is the server-side authority for rating disclosure. It distinguishes self/staff, explicit scope grants, public policy and deny behavior.

Identity confidentiality and rating visibility remain separate contracts.

## 8. Smart Vote

Canonical backend package:

```text
backend/konnaxion/smart_vote/
```

### 8.1 Current implemented reading path

The current code implements:

```text
GET /api/v1/smart-vote/readings/ethikos-topic/<topic_id>/
```

The reading service:

1. resolves `SourceConsultationBinding`;
2. loads `ConsultationRelevance`;
3. reads canonical `EthikosStance` rows;
4. reads EkoH expertise/ethics context;
5. computes a lens hash;
6. computes a baseline from source stances;
7. computes a separate `ekoh_weighted_v1` advisory reading;
8. returns baseline and derived reading separately.

This is the correct source/reading separation to preserve.

### 8.2 Reading envelope

Current payload shape includes:

```text
target_type
target_id
smart_vote_consultation_id
baseline.reading_key
baseline.computed_at
baseline.results_payload
readings[].reading_key
readings[].lens_hash
readings[].snapshot_ref
readings[].computed_at
readings[].results_payload
```

### 8.3 Reproducibility requirement

A `snapshot_ref` is only sufficient for a published/replayable reading if the referenced input snapshot can actually be recovered or reconstructed. Current on-demand hashing is useful identity evidence but should not be confused with durable snapshot persistence.

### 8.4 Source ballot separation

Target architecture requires raw source participation and weighted/derived interpretation to remain separate. Current Smart Vote `Vote.weighted_value` / `VoteResult.sum_weighted_value` paths require code alignment; see `CODE_ALIGNMENT_NOTES.md`.

## 9. keenKonnect

Current backend package:

```text
backend/konnaxion/keenkonnect/
```

Canonical API families include projects, resources, tasks, messages, teams, ratings and tags under `/api/keenkonnect/*`.

KeenKonnect state remains owned by its domain. EkoH context displayed in collaboration surfaces does not make EkoH the project owner.

## 10. KonnectED

Current backend package:

```text
backend/konnaxion/konnected/
```

Implemented model families include:

- knowledge resources;
- recommendations/progress;
- certification paths/evaluations;
- peer validation;
- portfolios;
- offline packages;
- mentorship;
- co-creation;
- forums.

A KonnectED `OfflinePackage` is a Konnaxion learning/content artifact. It is not a Kristal Runtime Pack unless an explicit integration contract adopts that semantics.

## 11. Kreative

Current backend package:

```text
backend/konnaxion/kreative/
```

Implemented model families include artworks, galleries, collaboration sessions, traditions, digital archives, archive documents, virtual exhibitions, AI catalogue entries and cultural partners.

## 12. Team Builder

Current backend package:

```text
backend/konnaxion/teambuilder/
```

Core implemented state includes:

- `Problem`;
- `ProblemChangeEvent`;
- `BuilderSession`;
- `Team`;
- `TeamMember`.

Team Builder is a Konnaxion problem/team application and a shared product capability. Its session/task semantics are not Orgo Case/Task semantics unless an explicit boundary is added. In the global switcher it sits with shared capabilities rather than administration.

## 13. KonTrol

KonTrol is the Konnaxion administrative application surface for platform-level moderation, users/roles, audit and governed configuration views. Analytics/Reports are not part of the canonical KonTrol sidebar.

It may aggregate multiple Konnaxion domains, but every domain mutation remains subject to the domain's actual backend service/authorization path.

## 14. Insights / Reports

**Insights** is the user-facing suite label for the cross-domain read/analytics surface. Its technical route/API namespaces remain `/reports/*` and `/api/reports/*` where implemented.

Insights is a first-class operations suite beside KonTrol, not a child of KonTrol. Reporting does not become an authoritative state owner simply because it aggregates data.

## 15. Frontend architecture

The current product uses Next.js App Router under `frontend/app` with shared providers/layout plus domain page shells.

Major route families include:

```text
/ethikos/*
/ekoh/*
/keenkonnect/*
/konnected/*
/kreative/*
/konsensus/*
/kontrol/*
/reports/*
/teambuilder/*
/search
```

Route namespace and product sidebar ownership are intentionally not identical in every case:

- `/konsensus/*` is product-owned by the **ethiKos** sidebar;
- `/reports/*` is presented as the standalone **Insights** suite;
- `/konsensus/admin` is a compatibility path whose canonical administration destination is `/kontrol/konsensus`.

The global switcher groups core experiences (`ethiKos`, `keenKonnect`, `KonnectED`, `Kreative`), shared capabilities (`EkoH`, `Team Builder`) and operations (`Insights`, `KonTrol`). Suite keys, visible labels and landing routes should be centralized in one frontend configuration so MainLayout, switcher and breadcrumbs cannot drift independently.

The exact route inventory is maintained in `Konnaxion v14 - Site Navigation Map.md`; canonical shell behavior is defined in `../NAVIGATION_AND_SHELL_CONTRACT.md`.

## 16. External boundaries

### 16.1 Interaction Kernel and Orgo

Interaction Kernel (IK) is the distributed interoperability protocol, not a central owner. The current Konnaxion documentation snapshot does not establish an active IK-conformant Orgo adapter as qualified. The supplied IK migration material references an existing/historical `orgo_bridge_*` J30 surface and `OrgoImpactPublication`; verify it in executable code before describing it as current behavior.

Target profiles are `governance.decision.execute/1.0.0` for immutable/read-model `DecisionRecord` execution intent from Konnaxion to Orgo, and `accountability.impact.publish/1.0.0` for accountability/impact publication from Orgo to Konnaxion. No shared database write is permitted.

### 16.2 Kristal

No current code adapter is present. Konnaxion may eventually contribute to and consume/present Kristal artifacts, but Kristal owns their epistemic semantics and kOA-Linux owns local Runtime Pack activation state when that platform is used.

The target write path is local-first and profile-driven:

```text
Konnaxion operational commit
→ durable export/outbox
→ IK kristal.build.request / kristal.revision.request
→ Da’at
→ Kristal Exchange
→ kristal.artifact.ready + ArtifactRef
→ Konnaxion local linkage/read use
```

Konnaxion does not write Kristal storage directly and Kristal does not replace Konnaxion's transaction database. Runtime Pack physical tables/indexes (including an optional SQLite-style query projection) are derived materializations, not shared mutable persistence. The architecture does not require a distributed transaction across Konnaxion, IK, Da’at and Kristal.

### 16.3 SemantiK Architect

No current code adapter is present. A future integration is a generation/presentation boundary, not a Konnaxion state owner.

### 16.4 kOA-Linux

When Konnaxion is deployed under kOA-Linux, kOA-Linux owns the local host/platform boundary while Konnaxion retains its domain authority.

### 16.5 K-Port

K-Port is an EkoH evidence gateway/application, not a peer ecosystem system. It may submit normalized evidence into EkoH's governed boundary; EkoH remains the score owner.

## 17. Security and privacy

- Konnaxion server-side authorization controls mutations.
- EkoH rating access is server-side and scope-aware.
- identity confidentiality and rating visibility are separate.
- AI proposals do not silently mutate EkoH authoritative scores.
- UI code must not reconstruct private scores or weights from hidden inputs.

## 18. Code alignment

The architecture above is the target Konnaxion contract. Known code areas that still diverge are listed without project-management machinery in `Technical-Reference/CODE_ALIGNMENT_NOTES.md`.
