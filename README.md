# Konnaxion

Konnaxion is a socio-technical framework for coordinating people, knowledge, and action through a clear, ethical, and modular civic architecture.  
It follows the KOA model (KonnectED, Ethikos, Kreative, keenKonnect, EkoH, Smart Vote) and aims to connect learning, collaboration, debate, and culture, while adding domain- and ethics-aware weighting (EkoH + Smart Vote) so decisions and rankings can be read both as raw crowd signals and as expertise-sensitive views.

Alongside its technical architecture, Konnaxion includes a fictional origin mythology introduced in **Konvergence** and expanded through a series of YouTube videos. This mythos presents a symbolic narrative of how a civic system can emerge in times of turbulence and transformation.

---

## Current maturity & release status

**Current status:** Release Candidate — Production validation complete; Security Release Gate passed  
**Last quantified engineering maturity:** ~94% *(2026-09-08 assessment)*  
**Last quantified Release Candidate readiness:** ~89–92% *(2026-09-08 assessment)*  
**Current release line:** `v0.8.0`  
**Latest documented tag:** `v0.8.0-beta.2`  
**RC checkpoint:** `v0.8.0-rc.1` recommended; tag creation not confirmed by the available evidence  
**Latest validation checkpoint:** 2026-09-12

Konnaxion’s core civic-decision slice and the current production-validation stack are now strongly qualified:

- ethiKos → EkoH → Smart Vote delivery workflow: **GREEN**
- Next.js production build and TypeScript validation: **GREEN**
- common authentication migration (`django-allauth`, optional OIDC, local RBAC/MFA): **GREEN**
- production Django/PostgreSQL connectivity and migrations: **GREEN**
- Smart Vote schema and real reading runtime: **GREEN**
- host, SSH, firewall, Docker/runtime, TLS and application security gates: **GREEN**
- verified off-server backup and isolated restore drill: **GREEN**
- SecurityDiag S13 Backup & Recovery Evidence: **PASS**
- SecurityDiag S14 Security Release Gate: **PASS**
- full SecurityDiag automated suite: **62/62 PASS**

The final SecurityDiag campaign retains only accepted non-blocking warnings in S01, S02, and S03. The authentication/runtime/backup/recovery validation phase is closed; the next documented diagnostic phase is **LevelUpDiag**, focused on authentication and integration (`N00 → N02 → N03 → N04 → N05 → N07 → N11`).

Some secondary product surfaces remain explicitly **preview, read-only, placeholder, or deferred** where no complete backend contract exists. These states are intentional and should not be replaced by fabricated persistence or fake success responses.

> Konnaxion is qualified as a Release Candidate on the available engineering evidence. This does not by itself mean that the `v0.8.0-rc.1` Git tag, a final production release, or a public demo has been published.

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

The current authentication, production runtime, security, backup, and recovery path has passed its documented validation phase. The supplied project evidence does not yet document a public demo URL or general public onboarding path.

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

(A full breakdown of submodules and interactions is provided in the internal KOA / Konnaxion system document and related diagrams.)

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

Each component contributes to the assembly of a unified civic infrastructure. The core ethiKos / EkoH / Smart Vote path is substantially implemented and qualified through local and production-validation evidence. The September 12 validation also closes the current authentication, runtime, security, backup, and recovery phase. Some secondary surfaces remain intentionally experimental, preview, read-only, placeholder, or deferred pending complete domain contracts.

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

Current next directions include:

- Run the next **LevelUpDiag** authentication/integration sequence (`N00 → N02 → N03 → N04 → N05 → N07 → N11`)  
- Continue authentication/security integration validation, especially N04, N07, and N11  
- Reduce the remaining non-blocking `drf_spectacular` OpenAPI schema warnings  
- Refine release provenance and artifact metadata  
- Continue explicit Version 1 scope classification for complete, read-only, preview, and deferred surfaces  
- Formalize public demo, pilot, and local-stack onboarding paths  
- Continue cross-module integration, documentation, and mythology-based narrative UX work  

Roadmap items remain evidence-driven: real backend contracts are wired and tested where they exist; unsupported semantics stay explicitly read-only, preview, or deferred.

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
