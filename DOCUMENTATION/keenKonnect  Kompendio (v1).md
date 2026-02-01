# keenKonnect — Kompendio (v1)

Third submodule of keenKonnect alongside

 Konstruct (project collaboration  execution)
 Stockage (secure repository  artifact preservation)
 Kompendio (reference repertory + builder charts + trust)

Kompendio is the widescale reference layer it inventories and rates reference websitesplatforms (not random subpages), and turns them into versioned, auditable “Reference Charts” that can be pinned to projects and exported.

---

## 1) Purpose

Kompendio solves a practical builder problem “Which websites and platforms are actually the reference stack for this build, and can we trust them”

It provides

 a directory of reference platforms
 a trust + rating system with evidence
 Reference Charts (curated cheat sheets  summaries) that are versioned and publish-gated
 project attachment so references become part of execution, not bookmarks
 exportable packs for offline  deployments

---

## 2) What Kompendio is (and is not)

### Is

 A curated repertory of reference platforms at the websiteplatform level (Onshape-class, McMaster-class, standards bodies, materials DBs, CAD libraries, BIM objects, EDA footprint sources, handbooks).
 A publishing pipeline for charts and “trusted” reference sets.
 A decision-support layer Raw score + Advisory score (future-proofed for expert weighting).

### Is not (v1)

 A crawler or a mirror of proprietary catalogs.
 A replacement CAD tool.
 A universal connector platform for every site.

---

## 3) Design principles (non-negotiables)

1. Website-level objects

    Kompendio stores platforms + a handful of canonical entrypoints, not millions of internal pages.

2. Mimic vs Annex

    Default Mimic patterns (indexing, matrices, curation) without ingesting proprietary datasets.
    Optional Annex open-source components as sidecars only when cleanly isolable and worth it.

3. Evidence-first

    Every rating and chart must be backed by explicit evidence (links, docs, screenshots, exports).

4. Fail-closed publishing

    If verificationreview fails, it does not publish (“no compile on fail”).

5. Portability

    Outputs are exportable as signedreference packs so projects can reproduce decisions later.

---

## 4) Scope (v1)

### Must-have deliverables

1. ReferencePlatform Registry

    createedit platforms, tags, domains, types, entrypoints

2. Capability Matrix

    formats (STEPIGESSTLDXFIFCBOMfootprints…), API, auth, exports, stability notes

3. Multi-dimensional ratings

    vector ratings (not stars), with evidence and reviewer context

4. Trust states

    Draft → Reviewed → Trusted (and the gates to move between states)

5. Reference Charts

    curated, cited, versioned charts with a reviewpublish pipeline

6. Project pinning

    attach a Reference Stack and chart versions to a Konstruct project

7. ExportImport

    “Reference Pack” bundle (platforms + charts + manifests) with integrity checks

### Explicit non-goals

 Automated crawling of internal pagesSKUs
 Copying proprietary databases
 Full-blown BOM ingestion from every external source

---

## 5) Core objects (data model)

### A) ReferencePlatform (websiteplatform level)

 `id`
 `name`
 `canonical_url`
 `type` (CAD  Catalog  Standards  Materials  Reference  BIM  EDA  Library  Community)
 `domains[]` (mechanical, electronics, building, fabrication, etc.)
 `tags[]` (fasteners, bearings, sheet metal, welding, PCB, etc.)
 `access_model` (public  account  paid  API)
 `openness_class` (open-source  open-data  proprietary  mixed  unknown)
 `ip_risk_flag` (low  medium  high)
 `entrypoints[]` (2–10 URLs that matter at widescale)
 `capability_matrix`

   formats, exports, API availability, auth type, known limitations
 `trust_state` (DraftReviewedTrusted)
 `last_verified_at`

### B) Assessment (evidence-backed review)

 `id`
 `platform_id` (or chart_id)
 `reviewer_id`
 `reviewer_context` (domain tags, role, optionally “used in project”)
 `scores{}` (0–5 per dimension)
 `evidence_links[]`
 `verification_state` (unverified  peer  expert)
 `timestamp`

### C) ReferenceChart (builder chart)

 `id`
 `title`
 `scope` (what it covers)
 `content` (tablenotes)
 `source_platform_ids[]`
 `claims[]` (each with citations)
 `version`
 `validation_state` (DraftReviewedPublished)
 `change_log`

### D) ReferenceStack (curated set for a context)

 `id`
 `name` (e.g., “Metal Fab Starter Stack”)
 `platform_ids[]`
 `chart_ids[]`
 `intended_context` (build type)
 `version`

### E) Dispute  Revalidation (quality control)

 `dispute_id`, `target_id`, `reason`, `counter_evidence[]`, `status`
 `revalidation_schedule` and “staleness” signals

---

## 6) Ratings model (v1)

### Dimensions (recommended)

 Reliability  correctness
 Coverage  completeness (widescale)
 Practical usefulness (real workflows)
 UX  findability
 Interoperability (formatsAPIsexports)
 Openness (license clarity  portability)
 Stability (longevity  predictable URLs)

### Outputs

 Raw score (simple aggregate)
 Advisory score (reserved for domain-weighted scoring later; in v1 this can be “equal weight” but stored in the schema so you can switch on weighting without migrations)

---

## 7) Trust and publishing workflow (v1)

### 7.1 Platform onboarding (ReferencePlatform)

1. Create Platform → Draft
2. Auto-checks (required fields, canonical URL, duplicates, capability matrix minimal, openness class filled)
3. Submit for review
4. Reviewer actions

    accept → Reviewed
    reject → Draft + required fixes
5. Promote to Trusted only if evidence threshold is met (fail-closed)

### 7.2 Chart publishing (ReferenceChart)

1. Create Chart → Draft
2. Attach sources + claims + citations
3. Peer review (accuracy, completeness, license constraints)
4. Publish → Published (or fail-closed back to DraftReviewed)
5. Versioning rules

    never silently edit published charts
    new versions create new immutable releases

### 7.3 Disputes

 Any Trusted platform or Published chart can be challenged with counter-evidence
 Challenge triggers re-review and potentially a new version or downgrade of trust state

---

## 8) Integration with keenKonnect

### With Konstruct (projects)

 “References” panel

   attach a ReferenceStack to the project
   pin specific chart versions
   link tasks to chartsplatforms (“use chart X for drill sizes”, “buy from catalog Y”)

### With Stockage (artifacts)

 store

   chart exports (PDFCSVMD)
   evidence snapshots (screenshots, documents)
   release bundles (Reference Packs)
 treat published chartsstacks as artifacts that can be referenced by buildsreleases

---

## 9) Reference Packs (offlineexport)

ReferencePack is a bundle containing

 ReferencePlatforms (metadata + entrypoints + capability matrices)
 Assessments (evidence links + scores)
 ReferenceCharts (content + citations + versions)
 Manifest (hashes + signature-ready structure)

Rules

 import validates integrity before activation
 packs are versioned; old packs remain usable for reproducibility

---

## 10) UI (v1)

1. Directory

    filters domain, type, openness, trust state, access model
    sorts raw score, advisory score, stability, interoperability

2. Platform page

    summary, entrypoints
    capability matrix (formatsAPIauth)
    ratings breakdown + evidence
    trust badge + last verified + audit trail
    “attach to project” action

3. Chart page

    chart content
    sources and citations
    version history and validation state
    “attach to project” action

4. ReferenceStack builder

    create stacks, publish stacks, attach stacks

5. Review queue

    items awaiting review
    disputes  revalidation tasks

---

## 11) Acceptance criteria (definition of done for v1)

 Platforms cannot reach Trusted without evidence and review gates.
 Charts cannot be Published unless citations and review pass (fail-closed).
 A Konstruct project can pin a stack + specific chart versions and retrieve them later unchanged.
 Reference Packs exportimport with integrity validation.
 The system clearly distinguishes link-only vs annexable (open-source) resources.

---

## 12) Roadmap (tight)

 v1 registry + ratings + charts + trust workflow + project pinning + packs
 v1.1 revalidation cadence + dispute UX + “used in project” attestations
 v2 selected annex sidecars (open-source) + limited sync of summaries (never mirroring proprietary catalogs)

If you want, I can rewrite this in the exact house template you used for the “KonnectED Upgrade – Kintsugi” document (same headings, same tone, same section ordering), but keeping the content above.
