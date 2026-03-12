# Konnaxion – Technical Architecture & Services

This page collects the **technical details** of Konnaxion: service code‑names, core models, configuration parameters, routing invariants, and cross‑module infrastructure. It complements:

* the repository **README**, which focuses on vision, mythology, and high‑level modules 
* the wiki **hub page**, which explains civic workflows and navigation
* the individual module pages (Knowledge, CertifiKation, Korum, etc.), which describe each sub‑module functionally

Use this page as the reference for development and integration work.

---

## 1. Platform overview

### 1.1 KOA module map

Konnaxion’s architecture is organized into six top‑level modules: 

* **KonnectED** – learning, knowledge, and certification
* **Ethikos** – structured debates and civic consultations
* **Kreative** – culture, preservation, and professional networks
* **keenKonnect** – project workspaces and storage
* **Kollective Intelligence** – reputation and voting (EkoH, Smart Vote)
* **System / Core** – cross‑cutting auth, storage, search, analytics

Each KOA module is implemented as one or more Django apps with:

* **service code‑names** (e.g. `multidimensional_scoring`, `public_consultation`) mapping 1‑to‑1 to service modules
* **OLTP models** described in the v14 schema reference
* **frozen configuration parameters** (thresholds, limits, routes)

### 1.2 Shared technology stack

Across modules, the technical stack is consistent:

* **Backend**: Django + Django REST Framework
* **Realtime**: Django Channels with Redis (`channels_redis.core.RedisChannelLayer`)
* **Data store**: PostgreSQL with tsvector full‑text search
* **Background tasks**: Celery (ETL, AI enrichment, packaging, recomputation)
* **Object storage**: `/app/media/` root, typically backed by S3/MinIO
* **Front‑end**: routes reserved per module (`/learn`, `/certs`, `/debate`, etc.)

---

## 2. Cross‑module infrastructure

### 2.1 Service code‑name convention

Every sub‑module defines **named services** that are stable integration points. Examples:

* Korum: `structured_debate`, `ai_clone_management`, `comparative_argument_analysis`, `public_debate_archive`, `automated_debate_summary` 
* Smart Vote: `dynamic_weighted_vote`, `voting_modalities`, `emerging_expert_detection`, `vote_transparency`, `vote_result_visualization`, `cross_module_vote_integration` 
* EkoH: `multidimensional_scoring`, `configuration_weights`, `contextual_analysis`, `privacy_settings`, `score_history`, `score_visualization`, `expertise_field_classification` 
* Knowledge: `library_resource_management`, `personalized_recommendation`, `content_co_creation`, `thematic_forum`, `learning_progress_tracking` 

Code‑names map 1‑to‑1 to service modules (e.g. `services/dynamic_weighted_vote.py`), and are referenced by tasks, API endpoints, and configuration.

### 2.2 Routing invariants

Top‑level routes are **owned** by specific modules and treated as invariants:

* `/learn`, `/course/[slug]` → KonnectED / Knowledge 
* `/certs` → KonnectED / CertifiKation 
* `/debate`, `/ethikos/insights` → Ethikos / Korum 
* `/consult` → Ethikos / Konsultations 
* `/projects`, `/projects/[slug]` → keenKonnect / Konstruct + Stockage
* `/kreative`, `/art/[id]`, `/archive` → Kreative / Konservation 
* `/connect`, `/profile/[user]` → Kreative / Kontact 
* `/konsensus`, `/reports/smart-vote` → Kollective Intelligence / Smart Vote 

No other module should claim these top‑level paths.

### 2.3 Storage and media

* **Media root**: `MEDIA_ROOT=/app/media/` is shared across modules.
* **File size & types** are fixed per context:

  * Stockage / Konstruct: `MAX_BLUEPRINT_UPLOAD_MB = 150`, types `[".pdf", ".png", ".jpg", ".glb", ".gltf", ".stl"]`
  * Konservation: `ARTWORK_MAX_IMAGE_MB = 50`, `ARTWORK_RESOLUTIONS = [256, 1024, 2048]` px 

Storage is typically an object store (S3/MinIO) behind the media path.

### 2.4 Search

* Knowledge and Stockage explicitly use PostgreSQL full‑text search (`SEARCH_BACKEND = "postgres"`) for library resources and documents.
* Tags (`Tag`, `ArtworkTag`) provide a shared taxonomy layer across Kreative and keenKonnect.

### 2.5 Realtime and background jobs

* **Django Channels + Redis** power:

  * live stance and result updates in Korum and Konsultations
  * real‑time tallies in Smart Vote 
  * project chat, notifications, and document events in Konstruct and Stockage
  * collaboration rooms in Kontact 

* **Celery tasks & schedules** include:

  * `etl_smart_vote` every 10 minutes, with ~5‑year retention for facts 
  * periodic EkoH score recomputation and leaderboard refresh 
  * weekly offline packaging for Knowledge (`OFFLINE_PACKAGE_CRON = 0 3 * * SUN`) 
  * image rendition, AI enrichment, and partner ingest for Konservation 

---

## 3. Module–by–module technical summary

### 3.1 KonnectED

#### 3.1.1 Knowledge – Collaborative Learning Library

**Services** 

* `library_resource_management` – CRUD and classify `KnowledgeResource`; enforce type enum.
* `personalized_recommendation` – compute `KnowledgeRecommendation` per user.
* `content_co_creation` – manage `CoCreationProject` and `CoCreationContribution` drafts.
* `thematic_forum` – forums via `ForumTopic` and `ForumPost`.
* `learning_progress_tracking` – track `LearningProgress` (per user + resource).

**Core models**

* `KnowledgeResource(id, title, type, url, author)`
* `KnowledgeRecommendation(user, resource, recommended_at)`
* `LearningProgress(user, resource, progress_percent)`
* `CoCreationProject`, `CoCreationContribution`
* `ForumTopic`, `ForumPost` 

**Key configuration**

* Content types: `article | video | lesson | quiz | dataset`
* `MAX_CONTRIBUTION_DRAFTS = 10` per user
* Search backend: `SEARCH_BACKEND = "postgres"`
* Offline packaging: `OFFLINE_PACKAGE_CRON = 0 3 * * SUN` 

**Routes**

* `/learn` – catalog, recommendations, offline download
* `/course/[slug]` – course player (lessons, progression) 

#### 3.1.2 CertifiKation – Skills & Certification

**Services** 

* `certification_path_management` – manage `CertificationPath`.
* `automated_evaluation` – create `Evaluation` with `raw_score` and metadata.
* `peer_validation` – handle `PeerValidation` decisions.
* `skills_portfolio` – connect to `Portfolio` and core `Certificate` records.
* `certification_interoperability` – manage `InteropMapping` with external LMS/registries.

**Core models**

* `CertificationPath(id, name, description)`
* `Evaluation(user, path, raw_score, metadata)`
* `PeerValidation(evaluation, peer, decision)`
* `Portfolio(user, title, description, items)`
* `InteropMapping(local_certification, external_system, external_id)`
* `Certificate` (core model for issued credentials) 

**Key configuration**

* `CERT_PASS_PERCENT = 80`
* `QUIZ_RETRY_COOLDOWN_MIN = 30` minutes
* Routes reserved: `/certs` (Programs, My Certificates) 

---

### 3.2 Ethikos

#### 3.2.1 Korum – Structured Debates

**Services** 

* `structured_debate`, `ai_clone_management`, `comparative_argument_analysis`,
  `public_debate_archive`, `automated_debate_summary`.

**Core models**

* `EthikosCategory` – thematic categories
* `EthikosTopic` – debate topic/question
* `EthikosStance(topic, user, value −3…+3)`
* `EthikosArgument(topic, author, content, parent, side)` 

**Key configuration**

* Stance scale: −3 … +3 (0 = neutral)
* Expert cohort quorum: 12 distinct experts (EkoH threshold)
* Moderation auto‑hide: 3 independent reports 

**Routes**

* `/debate` – Debate Hub (Open / Archived / Start New)
* `/ethikos/insights` – opinion analytics dashboards 

#### 3.2.2 Konsultations – Public Consultations & Feedback

**Services** 

* `public_consultation`, `citizen_suggestion`,
  `weighted_consultation_vote`, `consultation_result_visualization`, `impact_tracking`.

**Core models**

* `Consultation(id, title, open_date, close_date, status)`
* `CitizenSuggestion(consultation, author, content)`
* `ConsultationVote(user, consultation, raw_value, weighted_value)`
* `ConsultationResult(consultation, results_data JSONB)`
* `ImpactTrack(consultation, action, status, date)` 

**Key configuration**

* Ballot modalities: `approval | ranking | rating | preferential`
* Consensus threshold (platform‑wide): ≥ 75% weighted agreement
* Route namespace: `/consult` owned exclusively by Ethikos

**Routes**

* `/consult` – Consultation Hub (Live / Results / Suggest)
* `/ethikos/insights` – shared with Korum analytics 

---

### 3.3 Kreative

#### 3.3.1 Konservation – Creative Content & Cultural Preservation

**Services** 

* `digital_archive_management`, `virtual_exhibition`,
  `archive_documentation`, `ai_enriched_catalogue`, `cultural_partner_integration`.

**Core models**

* `KreativeArtwork(id, artist, title, description, media_file, media_type, year, medium, style)`
* `Tag`, `ArtworkTag` (global tagging vocabulary and join table)
* `Gallery`, `GalleryArtwork(order)`
* `TraditionEntry(title, description, region, media_file, approved, approved_by)` 

**Key configuration**

* `ARTWORK_MAX_IMAGE_MB = 50`
* `ARTWORK_RESOLUTIONS = [256, 1024, 2048]`
* `VIRTUAL_GALLERY_CAPACITY = 24` artworks/room
* `NSFW_FLAG_REQUIRED` (bool, default `False`)
* `MEDIA_ROOT = /app/media/` 

**Routes**

* `/kreative` – Creativity Hub
* `/art/[id]` – Artwork sheet
* `/archive` – Konservation archive/partners 

#### 3.3.2 Kontact – Collaboration & Networking

**Services** 

* `professional_profile`, `intelligent_matching`,
  `collaboration_workspace`, `opportunity_announcement`, `partner_recommendation`.

**Core models**

* `CollabSession(id, name, host, session_type, started_at, ended_at, final_artwork)`
* Re‑uses `KreativeArtwork`, `Tag`, `ArtworkTag` for portfolios and tagging.

**Key configuration**

* `COLLAB_CANVAS_MAX_USERS = 6`
* `MEDIA_ROOT = /app/media/` (shared)
* Routes reserved: `/connect`, `/profile/[user]` 

**Routes**

* `/connect` – People, Opportunities, Collaboration Workspace
* `/profile/[user]` – public profile/portfolio 

---

### 3.4 keenKonnect

#### 3.4.1 Konstruct – Project Collaboration Spaces

**Services** 

* `collaboration_space`, `project_task_management`,
  `real_time_document_editing`, `integrated_communication`, `ai_collaboration_analysis`.

**Core models**

* `Project(id, title, description, creator, category, status)`
* `ProjectResource(project, title, url, added_by)`
* `ProjectTask(project, title, description, assignee, status, due_date)`
* `ProjectMessage(project, sender, content)`
* `ProjectTeam(project, user, role, joined_at)`
* `ProjectRating(project, user, rating, comment)`
* `Tag` (shared)

**Key configuration**

* `MAX_BLUEPRINT_UPLOAD_MB = 150`
* `ALLOWED_BLUEPRINT_TYPES = [".pdf", ".png", ".jpg", ".glb", ".gltf", ".stl"]`
* `COLLAB_SPACE_MEMBER_CAP = 40`
* `AI_SUGGESTION_TOP_N = 8`
* `VIDEO_SESSION_PROVIDER = "livekit"` via `KC_VIDEO_PROVIDER` env var 

**Routes**

* `/projects` – Project Studio (Browse, Create, My Projects)
* `/projects/[slug]` – workspace (Overview, Tasks, Blueprints, Chat, AI Insights, Settings) 

#### 3.4.2 Stockage – Secure Repository & Versioned Storage

**Services** 

* `secure_document_storage`, `document_versioning`,
  `intelligent_indexing`, `real_time_sync`, `granular_permissions`.

**Core models**

* `ProjectResource` (same as above; canonical file record)
* `Project` and `ProjectTeam` for scoping and access control
* `Tag` for classification 

**Key configuration**

* `MAX_BLUEPRINT_UPLOAD_MB = 150`
* Allowed types: `[".pdf", ".png", ".jpg", ".glb", ".gltf", ".stl"]`
* `SEARCH_BACKEND = "postgres"`
* Realtime layer: `channels_redis.core.RedisChannelLayer`
* `MEDIA_ROOT = /app/media/` 

**Routes**

* Exposed inside `/projects/[slug]` as the “Blueprints” tab. 

---

### 3.5 Kollective Intelligence

#### 3.5.1 EkoH – Reputation & Expertise

**Services** 

* `multidimensional_scoring`, `configuration_weights`,
  `contextual_analysis`, `privacy_settings`,
  `score_history`, `score_visualization`, `expertise_field_classification`.

**Core models**

* `ExpertiseCategory(id, name)`
* `UserExpertiseScore(user, category, raw_score, weighted_score)`
* `UserEthicsScore(user, ethical_score)`
* `ScoreConfiguration(weight_name, weight_value, field)`
* `ContextAnalysisLog(entity_type, entity_id, field, input_metadata, adjustments_applied)`
* `ConfidentialitySetting(user, level)`
* `ScoreHistory(merit_score, old_value, new_value, change_reason)` 

**Key configuration**

* Axis weights: `quality=1.000`, `expertise=1.500`, `frequency=0.750`
* Ethical multiplier bounds: floor `0.20`, cap `1.50`
* `EXPERTISE_DOMAIN_CHOICES`: 26 ISO‑based domains 

**Runtime**

* Periodic recomputation via Celery Beat; optional realtime pushes of score/leaderboard deltas over Channels+Redis. 

#### 3.5.2 Smart Vote – Weighted Voting System

**Services** 

* `dynamic_weighted_vote`, `voting_modalities`,
  `emerging_expert_detection`, `vote_transparency`,
  `vote_result_visualization`, `cross_module_vote_integration`.

**Core models**

* `Vote(user, target_type, target_id, raw_value, weighted_value)`
* `VoteModality(name, parameters JSON)`
* `EmergingExpert(user, detection_date, score_delta)`
* `VoteResult(target_type, target_id, sum_weighted_value, vote_count)`
* `IntegrationMapping(module_name, context_type, mapping_details)` 

**Key configuration**

* Modalities: `approval | ranking | rating | preferential`
* Emerging expert threshold: +15% EkoH delta over 30 days
* Strong consensus threshold: ≥ 75% weighted agreement 

**Runtime & analytics**

* Realtime results through Channels+Redis
* ETL `etl_smart_vote` every 10 minutes → `smart_vote_fact` table, 5‑year retention
* UI: `/konsensus` (live polls/results), `/reports/smart-vote` (analytics) 

---

## 4. Data flows and integration

### 4.1 Reputation‑weighted voting

* EkoH computes per‑user, per‑domain expertise and ethics scores with configurable weights and bounds. 
* Smart Vote reads those scores to weight `Vote` records via `dynamic_weighted_vote`, adjusting tallies per modality. 
* Korum and Konsultations integrate with Smart Vote to obtain EkoH‑weighted stances and ballots:

  * Korum aggregates `EthikosStance` using EkoH to compute expert cohort views.
  * Konsultations uses `weighted_consultation_vote` to store raw + weighted values per ballot.

### 4.2 Projects and documents

* Konstruct manages projects, tasks, chat, and ratings via `Project*` models. 
* Stockage attaches documents and blueprints as `ProjectResource` records and handles versioning, indexing, and sync. 
* Real‑time events (file added/updated/removed; chat messages) are emitted via Channels+Redis to subscribed project workspaces.

### 4.3 Culture, archives, and networks

* Konservation’s `KreativeArtwork`, `Gallery`, and `TraditionEntry` store creative and heritage outputs with tag‑based discovery. 
* Kontact reuses those artefacts and tags for profiles and matching, and stores collaboration sessions in `CollabSession`.
* AI enrichment and partner ingest tasks update the archive and related metadata in the background. 

### 4.4 Learning and certification

* Knowledge hosts resources, forums, and co‑creation spaces and tracks progression per user/resource. 
* CertifiKation uses `CertificationPath`, `Evaluation`, and `PeerValidation` to issue `Certificate` records and fill user portfolios. 
* Although not strictly specified, these activities can feed EkoH via `multidimensional_scoring` as part of the platform‑wide reputation engine. 

---

## 5. Analytics and insights

* Smart Vote ETL (`etl_smart_vote`) is the central pipeline for decision analytics, aggregating delta changes from OLTP into a fact table with 5‑year retention, powering `/reports/smart-vote`. 
* Ethikos exposes `/ethikos/insights` to visualize debate stances and consultation outcomes, consuming Smart Vote facts and Korum/Konsultations data.
* EkoH retains a full audit trail via `ScoreHistory` and `ContextAnalysisLog`, enabling longitudinal analysis of reputation evolution. 

---

## 6. Contribution guidelines and invariants (technical)

When extending or integrating with Konnaxion, the following invariants should be respected (all documented above):

1. **Do not change top‑level route ownership** (`/learn`, `/certs`, `/debate`, `/consult`, `/projects`, `/kreative`, `/connect`, `/konsensus`, `/reports/smart-vote`) without updating all dependent modules.
2. **Preserve service code‑names** (e.g. `dynamic_weighted_vote`, `multidimensional_scoring`); treat them as public, versioned integration points.
3. **Respect frozen parameter values** when relying on thresholds, caps, or schedule timings, or introduce new configuration entries in a documented way.
4. **Reuse shared infrastructure** (Channels+Redis, Celery, `/app/media/`, PostgreSQL tsvector) to keep behavior consistent and predictable.

This page, together with the module‑specific wiki entries, should provide enough technical context to navigate, extend, and integrate the Konnaxion codebase.
