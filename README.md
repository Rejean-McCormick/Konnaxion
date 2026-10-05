# Konnaxion

> Modular civic-tech infrastructure for coordinating people, knowledge, deliberation, collaboration, and collective decision-making.

[![Konnaxion CI](https://github.com/Rejean-McCormick/Konnaxion/actions/workflows/ci.yml/badge.svg)](https://github.com/Rejean-McCormick/Konnaxion/actions/workflows/ci.yml)
[![Full Qualification](https://github.com/Rejean-McCormick/Konnaxion/actions/workflows/full-qualification.yml/badge.svg)](https://github.com/Rejean-McCormick/Konnaxion/actions/workflows/full-qualification.yml)

Konnaxion is a socio-technical framework for coordinating people, knowledge, and action through a clear, ethical, and modular civic architecture.

It follows the **KOA model**:

- **KonnectED** — learning, knowledge, and certification
- **Ethikos** — structured debate and civic consultation
- **Kreative** — culture, preservation, and professional networks
- **keenKonnect** — collaboration spaces and document infrastructure
- **EkoH** — domain- and ethics-aware merit signaling
- **Smart Vote** — flexible and merit-sensitive voting

Konnaxion connects learning, collaboration, deliberation, culture, and governance while allowing outcomes to be viewed both as raw collective signals and through domain-sensitive or expertise-sensitive interpretations.

Alongside its technical architecture, Konnaxion includes a fictional origin mythology introduced through **Konvergence**. The mythology is a narrative layer around the project and is separate from the technical and civic claims of the software.

---

## Public verification

Konnaxion is continuously exercised on clean **GitHub-hosted runners** against explicit ecosystem revisions.

The hosted workflow does not merely run a generic test command. It first tests the diagnostic engine itself and then applies **KonnaxionDiag** to the checked-out Konnaxion revision.

Current automated verification includes:

- **KonnaxionDiag self-test** before the diagnostic engine is trusted;
- **precommit qualification** covering repository integrity, automation, security, supply-chain, and related checks;
- **backend qualification** against disposable PostgreSQL and Redis services;
- **Konnaxion Worlds boundary verification** against the declared `WORLD_ENGINE.lock.json`;
- installation of frontend dependencies using the committed pnpm lockfile with `--frozen-lockfile`;
- explicitly pinned revisions of `Konnaxion_Worlds`, `Konnaxion_Capsule_Manager`, and `KonnaxionDiag`;
- evidence artifacts containing diagnostic output and the exact component revisions used by the runner.

The broader manually triggered qualification workflow additionally prepares a clean database, seeds the declared Ethikos test workflow, installs Chromium, and executes the KonnaxionDiag `full-local` campaign.

### Current hosted qualification checkpoint

As of the latest public hosted run:

```text
KonnaxionDiag self-test        PASS

Backend qualification:
  Konnaxion Worlds tests       37 PASS / 1 FAIL
  resulting KDiag status       non-green

Precommit qualification:
  S03 Supply Chain             FAIL
  reason                       mutable or unresolved release image reference
```

The CI badge above is the live source of truth. A red badge means a reproducible gate currently remains unresolved; it does **not** mean the verification system itself is absent.

A green hosted result means the corresponding checks were reproduced on an independent runner against explicit source revisions. It is not, by itself, a production-release authorization.

---

## Current maturity and release status

**Release line:** `v0.8.0`  
**Current state:** active Release Candidate closure and qualification work  
**Qualification model:** evidence-driven; no aggregate readiness percentage is treated as authoritative without a committed scoring method

Konnaxion distinguishes several levels of evidence:

1. **Repository qualification** — structure, dependencies, contracts, backend, frontend, and automated diagnostic gates.
2. **Integrated qualification** — broader runtime, database, browser, sibling-repository, and workflow checks.
3. **Release qualification** — supply-chain integrity, recovery evidence, signatures, trusted attestations, deployment evidence, and other release-specific controls.

Passing one level does not imply that all higher levels are complete.

Some secondary product surfaces remain intentionally classified as **preview**, **read-only**, **placeholder**, or **deferred** where no complete backend contract exists. Unsupported behavior should remain explicit rather than being represented by fabricated persistence or fake success responses.

The repository also contains a dated qualification ledger at:

[`docs/Technical-Reference/QUALIFICATION_STATUS.md`](docs/Technical-Reference/QUALIFICATION_STATUS.md)

The live GitHub Actions results should be preferred when they are newer than that document.

---

## Universe / World engine dependency

Konnaxion is the **host product**, not the canonical owner of the Universe/World isolation engine.

The canonical implementation and specification live in the sibling repository:

`Konnaxion_Worlds`

and are distributed as the:

`konnaxion-worlds`

Python package.

Konnaxion may own host adapters, route mounting, navigation, and product-domain integrations, but it must not independently vendor or reimplement:

- `backend/konnaxion/worlds/`;
- canonical Universe/World models;
- World migrations;
- resolvers;
- release lifecycle;
- canonical World technical documentation.

The boundary is mechanically checked by:

```bash
python scripts/check_worlds_ownership.py
```

The exact sibling distribution is checked against:

```text
WORLD_ENGINE.lock.json
```

using:

```bash
python scripts/check_worlds_dependency.py <path-to-Konnaxion_Worlds>
```

For local development, keep `Konnaxion_Worlds` beside this repository.

The backend development launcher installs the Worlds package in editable mode before Konnaxion starts.

This separation allows the World engine to evolve as a separately versioned subsystem without silently merging its authority into the Konnaxion host.

---

## Architecture at a glance

```text
                         Konnaxion
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    Knowledge           Deliberation        Collaboration
        │                    │                    │
   KonnectED              Ethikos             keenKonnect
        │                    │                    │
        └──────────────┬─────┴─────┬──────────────┘
                       │           │
                     EkoH      Smart Vote
                       │           │
                       └─────┬─────┘
                             │
                         Contextual
                     interpretation /
                     decision views

              Kreative provides cultural,
             archival and network surfaces

        Konnaxion_Worlds provides isolated
          Universe / World runtime context
```

Each major module owns a distinct product domain while interoperating through explicit contracts and shared infrastructure.

---

## 1. KonnectED

### Learning, knowledge, and certification

KonnectED provides learning and knowledge-management capabilities.

### CertifiKation

Planned and implemented surfaces include:

- modular certification paths;
- assessment workflows;
- peer validation;
- competency portfolios;
- interoperable credentials.

### Knowledge

The knowledge domain includes:

- collaborative libraries;
- recommendations;
- co-creation tools;
- thematic discussion;
- learning progression and knowledge-navigation surfaces.

---

## 2. Ethikos

### Structured debate and civic consultation

Ethikos provides structured spaces for deliberation rather than treating all discussion as an undifferentiated social feed.

### Korum

Its debate model supports concepts such as:

- structured debates;
- reasoning agents or “Klônes” where explicitly enabled;
- comparative analysis;
- public archives;
- synthesis of arguments and positions.

### Konsultations

Consultation workflows may include:

- citizen proposals;
- structured questions;
- public participation;
- optional expertise-sensitive interpretation through EkoH;
- result visualization;
- impact and follow-up tracking.

EkoH-weighted views are complementary interpretations. They do not erase the underlying raw participation data.

---

## 3. Kreative

### Culture, preservation, and professional networks

Kreative covers cultural knowledge, archives, discovery, and professional connection.

### Kreative Konservation

Potential and implemented surfaces include:

- digital cultural archives;
- virtual exhibitions;
- structured documentation;
- assisted cataloging;
- institutional collaboration.

### Kontact

Professional-network surfaces include concepts such as:

- profiles;
- matchmaking;
- collaboration;
- opportunities;
- endorsements and reputation signals.

---

## 4. keenKonnect

### Collaboration spaces and document infrastructure

keenKonnect provides shared working environments and document-oriented collaboration.

### Stockage

The storage layer is designed around capabilities such as:

- managed repositories;
- versioning;
- indexing;
- synchronization;
- controlled access.

### Konstruct

Collaborative workspaces may combine:

- project organization;
- shared editing;
- messaging;
- communication surfaces;
- assisted analysis.

The presence of a feature in the product architecture does not imply that every planned surface is currently production-qualified.

---

## 5. EkoH

### Merit signaling and contextual evaluation

EkoH provides contextual signals that can be used when interpreting participation, recommendations, debate, collaboration, or voting.

Its model may include:

- multidimensional criteria;
- domain-specific weighting;
- contextual interpretation;
- confidentiality controls;
- traceability;
- visualized merit or expertise maps.

The important distinction is that EkoH produces an **additional reading** of activity or outcomes.

It does not need to replace the raw underlying signal.

For example:

```text
Raw consultation result
        │
        ├── ordinary unweighted view
        │
        └── EkoH-informed contextual view
```

This permits transparency between collective participation and expertise-sensitive interpretation.

---

## 6. Smart Vote

### Flexible and merit-sensitive voting

Smart Vote is the decision-interpretation layer associated with voting scenarios.

Depending on the configured scenario, it can support:

- conventional vote counts;
- multiple voting modalities;
- EkoH-informed weighting;
- emerging-expertise detection;
- transparent comparative results;
- visualizations;
- integration with other Konnaxion domains.

When EkoH weighting is enabled, the raw vote result remains distinguishable from the weighted interpretation.

---

## Implementation boundaries

The feature descriptions in this README describe the **Konnaxion product architecture**.

They are not a claim that every described surface is fully implemented, persistence-backed, exposed publicly, or release-qualified.

Engineering work should distinguish explicitly between:

```text
implemented
qualified
preview
read-only
placeholder
deferred
historical
```

Missing implementation must not be hidden behind fake success responses or fabricated persistence.

---

## Technology

The Konnaxion repository currently includes a multi-service web application stack built around:

### Backend

- Python
- Django
- Django REST Framework
- PostgreSQL
- Redis
- Celery

### Frontend

- Next.js
- React
- TypeScript
- pnpm
- Jest
- Playwright

### Engineering and qualification

- pytest
- Ruff and related Python tooling
- GitHub Actions
- KonnaxionDiag
- deterministic dependency lockfiles
- Docker-oriented development and deployment assets
- repository and subsystem boundary checks
- evidence-producing qualification campaigns

The CI currently targets Python 3.12 and Node.js 20 with pnpm 10.20.0.

---

## Persistence and interoperability boundary

Konnaxion's PostgreSQL/Django state remains the mutable operational source for Konnaxion-owned domains.

External interoperability protocols do not automatically become shared databases.

Where Konnaxion publishes or exchanges knowledge with another system:

```text
Konnaxion operational state
        │
        ├── explicit export / projection
        │
        ├── immutable artifact or reference
        │
        └── receipt / provenance
                │
                ▼
          external system
```

The external representation does not silently replace Konnaxion's operational database or transfer domain authority.

---

## Qualification architecture

Konnaxion uses a separate diagnostic repository rather than encoding every engineering assumption directly into GitHub Actions.

```text
GitHub Actions
      │
      │ clean hosted environment
      │ pinned dependencies
      │ exact revisions
      ▼
KonnaxionDiag
      │
      ├── repository checks
      ├── backend checks
      ├── runtime checks
      ├── security checks
      ├── supply-chain checks
      └── correlation / evidence
              │
              ▼
        qualification artifacts
```

This distinction is intentional:

**GitHub Actions provides the neutral execution environment.**

**KonnaxionDiag defines the diagnostic and qualification logic.**

GitHub does not replace the diagnostic authority, and a qualification result is not automatically a deployment authorization.

---

## Automatic CI

The normal Konnaxion CI runs on:

- pushes to `main`;
- pull requests targeting `main`;
- manual dispatch.

The workflow currently performs three principal jobs:

```text
KonnaxionDiag self-test
        │
        ├──────────────┐
        ▼              ▼
precommit gate     backend gate
```

Both qualification jobs use pinned companion repositories and preserve evidence artifacts.

---

## Full qualification

A broader workflow is available through manual GitHub Actions dispatch:

```text
Konnaxion Full Local Qualification
```

It includes additional preparation such as:

- PostgreSQL;
- Redis;
- pinned ecosystem repositories;
- backend dependencies;
- frontend frozen-lock installation;
- Chromium installation;
- Django migrations;
- Ethikos seed data;
- KonnaxionDiag self-tests;
- the `full-local` diagnostic campaign;
- retained qualification artifacts.

This workflow is intentionally broader than ordinary PR/push CI.

Release-level qualification may require additional trusted evidence and should remain distinct from routine development CI.

---

## Local development boundary

The expected repository layout for ecosystem development is:

```text
Konnaxion/
├── Konnaxion/
├── Konnaxion_Worlds/
├── Konnaxion_Capsule_Manager/
└── KonnaxionDiag/
```

Before treating the host/World integration as valid, verify:

```bash
python scripts/check_worlds_ownership.py
python scripts/check_worlds_dependency.py ../Konnaxion_Worlds
```

The project intentionally keeps canonical World-engine implementation outside the host repository.

---

## Access and public demo

The repository contains substantial implementation and qualification infrastructure, but a general public onboarding path should not be inferred unless it is explicitly documented.

Future public-facing onboarding may include:

- a public Konnaxion demonstration instance;
- documented demo accounts;
- pilot-instance procedures for organisations;
- a complete local developer quick-start;
- sample development data;
- deployment profiles.

Until those paths are formalized, this repository should be treated primarily as the engineering source and technical reference for Konnaxion.

---

## Mythological origins

Konnaxion's fictional foundation appears in the **Konvergence** universe, where symbolic events, archetypes, and narrative structures provide an imaginative lens around collective intelligence and social transformation.

Extended worldbuilding has been published through videos and playlists including:

- https://www.youtube.com/watch?v=Hh6R8k7Xny4&list=PLLBzJ-PjZQP5ByokC3BYBsLIIzn21Ltaw
- https://www.youtube.com/watch?v=-g6EOGPfbOY&list=PLLBzJ-PjZQP6YMA4wDzL_wmTZfiXdofrt&index=16
- https://www.youtube.com/watch?v=JgSh8syza0g&list=PLLBzJ-PjZQP6YMA4wDzL_wmTZfiXdofrt&index=15
- https://youtu.be/BgtqbQ65wic

The mythology complements the project narrative but is not evidence for technical behavior or qualification status.

---

## Conceptual foundations

### Civic architecture

Konnaxion is one software expression of the broader KOA civic architecture.

Its design is centered on several principles:

1. **Modularity** — domains should remain separable.
2. **Explicit authority** — systems and modules should have identifiable ownership boundaries.
3. **Traceability** — important transformations and evaluations should be inspectable.
4. **Plural readings** — raw collective signals and contextual interpretations should remain distinguishable.
5. **Interoperability without authority collapse** — exchanging data does not imply sharing a database or merging domain ownership.
6. **Evidence-driven engineering** — implementation and release claims should follow executable evidence.
7. **No fabricated completeness** — incomplete surfaces stay visibly incomplete.

---

## Current engineering priorities

The immediate hosted-CI closure path is narrow and measurable:

1. close the remaining failing `Konnaxion_Worlds` backend test;
2. resolve the S03 immutable-container-image requirement;
3. obtain a fully green normal hosted Konnaxion CI run;
4. execute and stabilize the broader `full-local` qualification;
5. continue reducing remaining integration and release-level evidence debt.

Longer-term work includes:

- broader product-surface completion;
- explicit public demo and pilot onboarding;
- release provenance;
- artifact signing and trusted evidence;
- recovery and operational qualification;
- continued Universe / World ecosystem development;
- explicit classification of experimental and production-ready functionality.

---

## Contributing

Konnaxion welcomes collaboration around:

- civic technology;
- collective intelligence;
- governance systems;
- structured deliberation;
- coordination infrastructure;
- cultural knowledge systems;
- interoperability;
- evidence-driven software qualification.

Useful contributions include:

- reproducible bug reports;
- tests;
- architecture review;
- contract review;
- documentation corrections;
- clearly scoped implementation work.

Changes should preserve subsystem ownership boundaries and should not convert an unsupported or deferred behavior into a fake successful implementation.

---

## Author

**Réjean McCormick**

GitHub: https://github.com/Rejean-McCormick

---

## About

Konnaxion is a modular civic-tech platform connecting people, knowledge, projects, deliberation, learning, culture, and collective decision-making, with optional domain- and ethics-aware interpretation through EkoH and Smart Vote.