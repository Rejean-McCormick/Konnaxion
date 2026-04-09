# I**nventory of platform‑specific functionalities **

| Module | Sub‑module | Display Name → Code Name | Purpose / Behaviour |
| ----- | ----- | ----- | ----- |
| **Kollective Intelligence** | **EkoH** | Multidimensional Scoring → `multidimensional_scoring` | Compute per‑user/content scores along axes (quality, frequency, relevance, expertise). |
|  |  | Criteria Customization → `configuration_weights` | Admin/community adjust weighting parameters for each scoring axis. |
|  |  | Automatic Contextual Analysis → `contextual_analysis` | AI adjusts sub‑scores in real time based on topic, history, complexity. |
|  |  | Dynamic Privacy → `privacy_settings` | Apply anonymity / pseudonym modes while still displaying merit scores. |
|  |  | History & Traceability → `score_history` | Persist every score recalculation & configuration change for audit. |
|  |  | Interactive Visualizations → `score_visualization` | Serve aggregated data for live dashboards, skill‑maps, matrices. |
|  |  | Expertise Classification by Field → `expertise_field_classification` | Bind each sub‑score to a formal domain (Agronomy, HR, etc.). |
|  | **Smart Vote** | Dynamic Weighted Voting → `dynamic_weighted_vote` | Re‑weights every vote in real time using the voter’s EkoH score. |
|  |  | Flexible Voting Modalities → `voting_modalities` | Supports approval, ranking, rating, preferential ballots. |
|  |  | Emerging Expert Detection → `emerging_expert_detection` | Flags users whose EkoH score is rising sharply. |
|  |  | Transparency of Results → `vote_transparency` | Publishes raw \+ weighted values and context (no private data). |
|  |  | Advanced Result Visualizations → `vote_result_visualization` | Generates histograms, network graphs, interactive maps of outcomes. |
|  |  | Cross‑Module Integration → `cross_module_vote_integration` | Makes Smart Vote accessible from all modules (KonnectED, et al.). |
| **ethiKos** | **Korum** | Structured Debates → `structured_debate` | Create & manage ordered debate sequences (laws, ethics, policy). |
|  |  | Klônes IA → `ai_clone_management` | Spawn or retire AI agents emulating experts for continuity. |
|  |  | Comparative Analysis → `comparative_argument_analysis` | AI compares arguments to surface convergences/divergences. |
|  |  | Public Archiving → `public_debate_archive` | Stores immutable snapshots of every debate for transparency. |
|  |  | Automated Summaries → `automated_debate_summary` | Generates concise, structured digests of debate outcomes. |
|  | **Konsultations** | Public Consultations → `public_consultation` | Time‑boxed civic consultations with comments & voting. |
|  |  | Citizen Suggestions → `citizen_suggestion` | Users submit ideas/amendments feeding into consultations. |
|  |  | Weighted Voting (EkoH) → `weighted_consultation_vote` | Optional EkoH‑based weighting for consultation ballots. |
|  |  | Results Visualization → `consultation_result_visualization` | Real‑time dashboards for consultation statistics. |
|  |  | Impact Tracking → `impact_tracking` | Logs follow‑up actions & implementation status of adopted proposals. |
| **keenKonnect** | **Konstruct** | Virtual Collaboration Spaces → `collaboration_space` | Dedicated project rooms with membership & roles. |
|  |  | Project Management Tools → `project_task_management` | Kanban / tasks / milestones inside each space. |
|  |  | Real‑Time Editing → `real_time_document_editing` | Synchronous co‑editing with conflict resolution. |
|  |  | Integrated Chat & Video → `integrated_communication` | In‑socket messaging and video conferencing per space. |
|  |  | AI Collaborative Analysis → `ai_collaboration_analysis` | Summaries & action suggestions generated live during work. |
|  | **Stockage** | Secure Repository → `secure_document_storage` | Encrypted file hosting with role‑based access. |
|  |  | Automatic Versioning → `document_versioning` | Stores every file revision, enables rollback. |
|  |  | Intelligent Indexing → `intelligent_indexing` | Auto‑tag & keyword extraction for fast search. |
|  |  | Real‑Time Sync → `real_time_sync` | Pushes file updates instantly to all collaborators. |
|  |  | Fine Grained Permissions → `granular_permissions` | Read/write/admin rules per user per document. |
| **KonnectED** | **CertifiKation** | Certification Paths → `certification_path_management` | Define modular learning paths linked to competencies. |
|  |  | Automated Evaluation → `automated_evaluation` | AI/rule‑based tests & auto‑grading. |
|  |  | Peer Validation → `peer_validation` | Qualified peers approve or reject skill evidence. |
|  |  | Skills Portfolio → `skills_portfolio` | Personal showcase of validated competencies & artifacts. |
|  |  | Interoperability (LMS) → `certification_interoperability` | Map/import/export certifications with external systems. |
|  | **Knowledge** | Collaborative Library → `library_resource_management` | CRUD and classify shared learning resources. |
|  |  | Personalized Recommendations → `personalized_recommendation` | ML recommends relevant resources per learner profile. |
|  |  | Co‑Creation Tools → `content_co_creation` | Real‑time authoring/versioning of lessons & media. |
|  |  | Thematic Forums → `thematic_forum` | Subject‑based discussion boards with moderation. |
|  |  | Learning Progress Tracking → `learning_progress_tracking` | Dashboards showing completion %, strengths, goals. |
| **Kreative** | **Konservation** | Digital Archives → `digital_archive_management` | Long‑term storage of digitized artworks / media. |
|  |  | Virtual Exhibitions → `virtual_exhibition` | Interactive online galleries & VR rooms. |
|  |  | Documentation Base → `archive_documentation` | Store bios, provenance, supplemental docs. |
|  |  | AI Enriched Catalogue → `ai_enriched_catalogue` | Auto‑classification & metadata generation for art. |
|  |  | Cultural Partners Integration → `cultural_partner_integration` | Sync external museum/heritage collections. |
|  | **Kontact** | Professional Profiles → `professional_profile` | Rich artist/diffuser profiles (bio, portfolio, skills). |
|  |  | Intelligent Matching → `intelligent_matching` | Recommends contacts/collaborations via skills & style. |
|  |  | Collaboration Workspaces → `collaboration_workspace` | Shared project rooms (specific to networking context). |
|  |  | Opportunities Board → `opportunity_announcement` | Post & search residencies, exhibitions, calls, jobs. |
|  |  | Reviews & Endorsements → `partner_recommendation` | Rate & endorse partners after collaborations. |

---

### **How to Use These Code Names**

* **Backend (Django)** – each code name maps to a service class or module (e.g., `services/scoring.py` contains `multidimensional_scoring`); API controllers import these names for actions.

* **Frontend (Next.js/React)** – hooks or context providers invoke the same logical name; e.g., `useScoreVisualization()` calls the `score_visualization` endpoint.

* **Celery / Cron Tasks** – periodic jobs reference the same code names, e.g., `tasks.emerging_expert_detection`.

