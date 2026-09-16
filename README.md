# Konnaxion

Konnaxion is a socio-technical framework for coordinating people, knowledge, and action through a clear, ethical, and modular civic architecture.  
It follows the KOA model (KonnectED, Ethikos, Kreative, keenKonnect, EkoH, Smart Vote) and aims to connect learning, collaboration, debate, and culture, while adding domain- and ethics-aware weighting (EkoH + Smart Vote) so decisions and rankings can be read both as raw crowd signals and as expertise-sensitive views.

Alongside its technical architecture, Konnaxion includes a fictional origin mythology introduced in **Konvergence** and expanded through a series of YouTube videos. This mythos presents a symbolic narrative of how a civic system can emerge in times of turbulence and transformation.

---

## Current maturity & release status

**Release target:** `v0.8.0` Release Candidate  
**Current qualification state:** remediation in progress; the latest full engineering qualification is not completely green  
**Latest documented tag:** `v0.8.0-beta.2`  
**RC checkpoint:** `v0.8.0-rc.1` remains a target; tag creation is not established by the repository evidence used here  
**Latest validation checkpoint:** 2026-09-15

Konnaxion no longer uses a single aggregate maturity/readiness percentage as a current claim unless the scoring method and denominator are committed with the evidence. The earlier September 8 percentages are historical assessments, not current release gates.

Current evidence is mixed but specific:

- **LevelUpDiag full:** N00, N01, N02, N04, N05, N06, N08 and N09 passed; N03 failed on frontend ESLint; N07 warned on two Capsule Manager security-gate tests; N10 reported frontend/full-backend qualification debt; N11 therefore remained non-green.
- **SecurityDiag release:** S04 through S12 passed; S01–S03 retained review warnings; S13 failed because backup evidence exceeded the configured freshness threshold; S14 failed as a consequence of S13.
- **Core runtime/browser evidence:** local backend/frontend startup, Ethikos seed and Playwright smoke passed in N05.
- **Backend deep suite:** 146 tests passed and 7 failed in the latest N10 run, concentrated in EkoH/TeamBuilder database-schema/test-fixture paths.
- **Capsule Manager gate suite:** 40 tests passed and 2 failed in the N07 security-gate suite.

Backup freshness and restore-drill evidence are tracked as **operational resilience evidence**. They are not presented as proof that application, host, network or runtime security controls passed or failed. Do not claim a current SecurityDiag S14 PASS unless the actual S14 gate passes.

Some secondary product surfaces remain explicitly **preview, read-only, placeholder, or deferred** where no complete backend contract exists. These states are intentional and should not be replaced by fabricated persistence or fake success responses.

See `docs/Technical-Reference/QUALIFICATION_STATUS.md` for the dated gate-by-gate evidence, test taxonomy, known qualification defects and closure criteria.

## Mythological Origins

Konnaxion’s fictional foundation appears in the **Konvergence** universe, where symbolic events, archetypes, and narrative structures illuminate the forces that shape collective intelligence.

Extended worldbuilding is presented through the following YouTube playlists and videos:

- https://www.youtube.com/watch?v=Hh6R8k7Xny4&list=PLLBzJ-PjZQP5ByokC3BYBsLIIzn21Ltaw  
- https://www.youtube.com/watch?v=-g6EOGPfbOY&list=PLLBzJ-PjZQP6YMA4wDzL_wmTZfiXdofrt&index=16  
- https://www.youtube.com/watch?v=JgSh8syza0g&list=PLLBzJ-PjZQP6YMA4wDzL_wmTZfiXdofrt&index=15  
- https://youtu.be/BgtqbQ65wic  

This mythology serves as an imaginative lens that complements the system’s civic functions and long-term vision.

---

## ️Purpose & Vision

Konnaxion advances civic coordination through:

- structured knowledge ecosystems  
- meaningful participation and constructive deliberation  
- transparent decision-making  
- merit-sensitive evaluation models  
- culturally enriched collaboration  
- shared digital spaces and cooperative workflows  

Each component is designed to operate independently or as part of a larger integrated civic ecosystem.

---

## Access & how to try (placeholder)

The current repository has substantial authentication, runtime and production-security evidence, but the latest full engineering qualification still has open remediation items. Backup/recovery is tracked separately as operational resilience evidence. The supplied project evidence does not yet document a general public onboarding path.

This section will be updated with:

- the URL of a **public Konnaxion demo** and demo accounts;  
- how organisations can request a **pilot instance** (city, ministry, school system, NGO, etc.);  
- instructions for developers who want to **run a local stack** (services to start, commands, sample data).

Until those paths are formalised, this repository and the wiki focus on **architecture, modules, and concepts** rather than end-user onboarding.

---

## System Architecture

The Konnaxion architecture consists of six major modules, each supported by detailed functional submodules:

1. KonnectED — Learning, Knowledge, and Certification  
2. Ethikos — Structured Debate and Civic Consultation  
3. Kreative — Culture, Preservation & Professional Networks  
4. keenKonnect — Collaboration Spaces & Document Infrastructure  
5. EkoH — Merit Signaling & Contextual Evaluation  
6. Smart Vote — Flexible & Merit-Sensitive Voting  

(A full breakdown of domains and interactions is provided in the canonical technical documentation.)

> **Implementation note:** the feature lists below describe Konnaxion's product/design scope. They are not a claim that every listed capability is currently implemented or qualified. Current implementation and qualification status is tracked in `docs/Technical-Reference/QUALIFICATION_STATUS.md`.

---

## 1. KonnectED — Learning, Knowledge, and Certification

### CertifiKation

- Modular certification paths  
- AI-based assessment  
- Peer validation  
- Competency portfolios  
- Interoperable credentials  

### Knowledge

- Collaborative libraries  
- Personalized recommendations  
- Co-creation tools  
- Thematic forums  
- Learning progression dashboards  

---

## 2. Ethikos — Structured Debate and Civic Consultation

### Korum

- Structured elite debates  
- AI-driven reasoning “Klônes”  
- Comparative analytics  
- Public archives  
- Automated syntheses  

### Konsultations

- Open citizen consultations  
- Proposal submission  
- Optional expertise-weighted voting (via EkoH)  
- Interactive result visualizations  
- Impact tracking  

---

## 3. Kreative — Culture, Preservation & Professional Networks

### Kreative Konservation

- Digital cultural archives  
- Virtual exhibitions  
- Comprehensive documentation  
- AI-enhanced cataloging  
- Cultural institution partnerships  

### Kontact

- Professional profiles  
- Intelligent matchmaking  
- Collaborative tools  
- Opportunity marketplaces  
- Endorsement and reputation features  

---

## 4. keenKonnect — Collaboration Spaces & Document Infrastructure

### Stockage

- Secure centralized repositories  
- Automatic versioning  
- Intelligent indexing  
- Real-time synchronization  
- Fine-grained access control  

### Konstruct

- Real-time collaborative workspaces  
- Integrated project management  
- Co-editing environments  
- Embedded messaging and video  
- AI-supported analysis  

---

## 5. EkoH — Merit Signaling & Contextual Evaluation

- Multidimensional scoring  
- Customizable criteria  
- Contextual AI interpretation  
- Adaptive confidentiality  
- Comprehensive traceability  
- Visualized merit maps  

EkoH models domain-specific and ethics-aware merit signals, which can be applied to debates, consultations, recommendations, and collaborative workspaces to generate different “readings” of activity and outcomes.

---

## 6. Smart Vote — Flexible & Merit-Sensitive Voting

- Dynamic weighting through EkoH  
- Multiple voting modalities  
- Emerging-expertise detection  
- Transparent results  
- Advanced visualizations  
- Integration across all civic modules  

Smart Vote uses EkoH-derived weights (when enabled) to produce expertise-sensitive readings alongside raw vote counts, and is designed to operate across KonnectED, Ethikos, Kreative, and keenKonnect scenarios.

---

## Technology

This repository currently includes:

- Next.js / React / TypeScript frontend applications and services  
- Django / Django REST Framework backend APIs  
- PostgreSQL data models and migrations  
- Redis + Celery background processing  
- Playwright browser qualification workflows  
- Docker-based local and production orchestration  
- Python analytical and diagnostic tooling  
- UI concept explorations and explicitly retained prototype/placeholder surfaces  
- data modeling and integration experiments  

Each component contributes to the assembly of a unified civic infrastructure. The core ethiKos / EkoH / Smart Vote path has substantial implementation and runtime evidence, but the latest full LevelUpDiag campaign is not completely green. SecurityDiag currently shows S04–S12 passing while operational backup evidence remains stale under its configured release threshold. Some secondary surfaces remain intentionally experimental, preview, read-only, placeholder, or deferred pending complete domain contracts.

**Ecosystem persistence boundary:** Konnaxion's PostgreSQL/Django state remains the mutable operational source for Konnaxion domains. Interaction Kernel is an interoperability protocol, not a shared database. Where a future use case publishes knowledge to Kristal, Konnaxion exports an immutable snapshot/reference through IK to Da’at and retains only the required artifact linkage/receipts; Kristal Exchanges and derived Runtime Packs do not replace Konnaxion's operational database.

---

## Conceptual Foundations

### Mythology & Narrative

- **Konvergence** — narrative origin of Konnaxion  
- Extended symbolic world via the Konvergence / King Klown YouTube playlists  

### Civic Architecture

- **The Book of kOA** — modular civic systems and KOA ecosystem  
- Additional philosophical and technical writings via open-access archives (PhilArchive, PhilPeople, etc.)  

Konnaxion is the principal software expression of the KOA civic architecture and the broader movement described on the public hubs (kingklown.com, kingklown.wiki, okido.wiki).

---

## ️Roadmap

Current closure work is evidence-driven:

- resolve the frontend ESLint gate and remove the `--passWithNoTests` escape hatch from the canonical full-scan path;
- make the full-scan browser phase reproduce its backend/seed prerequisites;
- re-run the backend full suite against a clean test database and close the remaining EkoH/TeamBuilder schema/test-fixture defects;
- resolve the two Capsule Manager `secrets_not_default` gate-test failures;
- distinguish deployed-route validity from simple HTTP reachability in LevelUpDiag N09;
- reduce the remaining non-blocking `drf_spectacular` OpenAPI schema warnings;
- refine release provenance and artifact metadata;
- continue explicit scope classification for implemented, qualified, preview, read-only, deferred and historical surfaces;
- formalize public demo, pilot and local-stack onboarding paths.

Backup/restore drills are performed when operational-release assurance requires them; they are not required for every routine code/documentation qualification pass.

Unsupported semantics stay explicitly read-only, preview or deferred rather than being represented by fabricated persistence or fake success responses.

---

## Contributing

Konnaxion welcomes collaborators interested in:

- civic technology  
- coordination systems  
- collective intelligence  
- governance innovation  
- cultural knowledge infrastructures  
- AI-assisted deliberation  

Discussions, issue proposals, and architecture reviews are encouraged. As the stack stabilises, contribution guidelines and starter issues will be added.

---

## ✨ Author

**Réjean McCormick**  
GitHub: https://github.com/Rejean-McCormick  

---

## About

Modular civic-tech platform that connects people, knowledge, and projects across learning, R&D, governance, and culture, with domain- and ethics-aware weighting (EkoH + Smart Vote).
