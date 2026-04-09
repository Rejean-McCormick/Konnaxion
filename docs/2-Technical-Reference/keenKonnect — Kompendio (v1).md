# **keenKonnect — Kompendio (v1)**

**The builder reference layer:** a curated repertory of **reference platforms** \+ **versioned reference charts**, connected to projects and preserved as reproducible artifacts.

## 

## **0\) Where Kompendio fits**

keenKonnect has 3 submodules:

* **Konstruct** — run the build (projects, tasks, coordination)  
* **Stockage** — preserve the build (files, releases, bundles)  
* **Kompendio** — **guide the build** (reference stack, charts, trust)

Kompendio doesn’t replace external tools. It makes them **legible, comparable, and reusable** in a build workflow.

## 

## **1\) What Kompendio is (in one sentence)**

Kompendio is a **reference platform repertory** (website/platform level) that produces **builder charts** and **trusted reference stacks** you can pin to projects and export as packs.

Key point: it deals with **widescale reference sites** (the site as a “reference”), not random internal pages.

## 

## **2\) What Kompendio integrates with (the full map)**

Kompendio has three integration layers:

1. **Core Konnaxion integrations (always-on inside keenKonnect)**  
2. **Annexable open-source sidecars (optional but first-class)**  
3. **External reference ecosystem (mostly link \+ metadata, not data mirroring)**

### **2.1 Core Konnaxion integrations (always-on)**

These are “integrated tech” because Kompendio depends on them to be useful:

* **Konstruct (Projects / Tasks)**  
  * Kompendio attaches *Reference Stacks* and chart versions to projects  
  * Tasks can link to a chart/platform (“use chart X”, “order from catalog Y”)  
* **Stockage (Repository / Artifacts)**  
  * Stores chart exports (PDF/MD/CSV), evidence snapshots, and versioned packs  
  * Preserves “what we relied on” for a build so it stays reproducible  
* **Identity \+ Permissions (RBAC)**  
  * Who can publish, who can review, who can mark something “Trusted”  
  * Needed for moderation and credibility  
* **Search**  
  * Makes Kompendio usable at scale (find platforms, stacks, charts across domains)  
* **(Optional / later) EkoH / Smart Vote**  
  * Adds an “Advisory score” layer (expert-weighted), while keeping a raw baseline visible

### **2.2 Annexable open-source sidecars (explicit, optional, supported)**

These are the “bring open source under the same roof” candidates. They integrate as sidecars, not as core replacements.

**Identity & access**

* **Keycloak (OIDC)** — unify login for sidecars (optional, recommended if self-hosting)

**Storage**

* **MinIO or SeaweedFS (S3-compatible object storage)** — durable storage for large artifacts, packs, evidence snapshots

**Search**

* **OpenSearch** — indexing and retrieval across Kompendio entries and chart content

**Real-time docs (if you want collaborative chart editing)**

* **HedgeDoc / Etherpad / OnlyOffice / Collabora** — collaborative editing *as a sidecar*, with outputs preserved back into Stockage

**Inventory / BOM (builder-grade parts management)**

* **InvenTree** (strong OSS candidate)  
* **Part-DB** (strong OSS candidate)  
* **PartKeepr** (legacy/archived, optional only if needed)

Kompendio does **not** need to ingest full inventories in v1. It can:

* reference these tools as platforms  
* optionally sync summaries (later) without becoming the “system of record” for inventory

**CAD / geometry utilities (optional helpers, not a CAD replacement)**

* **FreeCAD (headless/CLI usage)** — conversion/export workflows  
* **OpenSCAD / SolveSpace** — OSS design ecosystems to reference and optionally bundle examples/templates  
* **Viewers**:  
  * **Three.js-based viewer** for STEP/STL previews (web)  
  * **IFC.js** (or equivalent) for BIM previews

### **2.3 External reference ecosystem (what Kompendio covers explicitly)**

These are not “sidecars”; they’re the reference platforms Kompendio inventories and rates. Integration is typically:

* **Link \+ structured metadata**  
* **Evidence snapshots**  
* **Export format notes**  
* **No mirroring of proprietary datasets**

**CAD / design platforms**

* Cloud CAD (Onshape-like)  
* Desktop CAD ecosystems (SolidWorks-like, Fusion-like)  
* Open CAD ecosystems (FreeCAD, OpenSCAD, SolveSpace)

**Parts catalogs / procurement**

* Industrial catalogs (McMaster-like)  
* Electronics distribution catalogs (DigiKey-like, Mouser-like)  
* Fastener specialists, bearings catalogs, pneumatics/hydraulics suppliers

**CAD content libraries (manufacturer \+ aggregator)**

* TraceParts-like  
* PARTcommunity (CADENAS)-like  
* 3D ContentCentral-like  
* Community libraries (GrabCAD-like) — flagged high IP risk, but useful

**EDA symbol/footprint sources**

* KiCad libraries (open ecosystem)  
* SnapEDA-like references (link-only unless licensed/allowed)  
* Octopart-like aggregators (link-only; note APIs/terms separately)

**BIM object libraries**

* BIMobject-like  
* National BIM libraries / NBS-like sources

**Materials databases**

* MatWeb-like  
* Manufacturer materials datasheets (primary sources)  
* Academic/handbook references (institutional sources)

**Standards and handbooks**

* ISO/ASME/DIN-like bodies (often paywalled, still reference-critical)  
* Engineering toolbox/handbook sites (variable quality → rating matters)  
* Institutional references (NIST/USDA-like)

## 

## 

## **3\) Integration modes (so “integrated tech” stays clear)**

Every platform/tech in Kompendio is assigned an **Integration Mode**:

* **Link-only**  
  Store the platform as a reference, with canonical entrypoints and notes. No data mirroring.  
* **Evidence capture**  
  Store screenshots/docs links/exports that justify ratings and chart claims.  
* **Artifact pinning**  
  Attach a platform/stack/chart version to a project; preserve artifacts in Stockage.  
* **Connector (sidecar)**  
  Optional integration to an OSS system (inventory, docs, storage, search). Sidecar remains isolated.

This is how you stay explicit about coverage without becoming a crawler or violating ToS.

## 

## **4\) What Kompendio produces (outputs builders actually use)**

### **4.1 Reference Platforms (the directory)**

For each platform, Kompendio makes explicit:

* What it’s for (CAD / catalog / standards / materials / library / BIM / EDA…)  
* What it covers (tags, domains)  
* How it plugs into real workflows (exports, formats, API notes)  
* How open/stable it is  
* Trust state (Draft / Reviewed / Trusted)

### **4.2 Reference Charts (the “builder charts”)**

Charts are the real leverage:

* curated cheat sheets (fasteners, tolerances, materials compare, etc.)  
* sourced and review-gated  
* versioned (v1, v2…) so builds stay reproducible

### **4.3 Reference Stacks (context packs)**

A “Reference Stack” is a curated set of platforms \+ chart versions for:

* Metal fab shop  
* CNC build  
* PCB \+ enclosure build  
* Timber build  
* Robotics build  
  (You define these contexts; Kompendio standardizes them.)

### **4.4 Reference Packs (export)**

A versioned export bundle containing:

* selected platforms  
* selected charts \+ versions  
* evidence pointers / snapshots  
* manifest for integrity checks

## 

## **5\) Trust: simple, strict, builder-friendly**

Kompendio uses a rule builders understand:

**If it can’t be checked, it can’t be published as Trusted.**

So you separate:

* **Draft** (proposed)  
* **Reviewed** (checked)  
* **Trusted / Published** (safe to reuse)

Disputes are normal: counter-evidence triggers re-review and potentially a new version.

## **6\) v1 “Done” criteria (non-technical, measurable)**

Kompendio v1 is done when:

* You can add a reference platform with proper entrypoints and tags  
* You can rate it with evidence (not vibes)  
* You can publish a versioned chart (review-gated)  
* A Konstruct project can pin a reference stack \+ chart versions  
* Stockage preserves the charts/evidence used for the build  
* You can export/import a reference pack for reuse/offline

## **7\) Roadmap (clear, not speculative)**

* **v1:** directory \+ ratings \+ charts \+ project pinning \+ export packs  
* **v1.1:** revalidation cadence \+ dispute UX \+ “used in project” attestations  
* **v2:** selective OSS sidecars (inventory/BOM, collab docs, search/storage enhancements) with clean boundaries

