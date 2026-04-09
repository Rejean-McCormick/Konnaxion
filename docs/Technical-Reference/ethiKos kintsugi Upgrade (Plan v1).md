# **Konnaxion v14 — ethiKos Upgrade (Plan v1)**

## 

## **A unified civic deliberation & decision pipeline**

**\#kinstugi edition — harmonizing the best civic tech patterns into one orchestrated flow**

**Author:** Réjean McCormick  
**Date:** 2026-01-26  
**Status:** Public plan v1 (pre-code)  
**Purpose of this PDF:** explain what’s being built, why it matters, and exactly what is **mimicked vs integrated** from leading civic platforms—before implementation.

---

## **1\) Why this upgrade exists**

Online debate fails for structural reasons:

* Chronological feeds reward repetition, outrage, and dominance  
* Threads collapse into identity conflict instead of converging on decisions  
* “Consensus” becomes a popularity contest, not a clarity mechanism  
* Even when a vote happens, follow-through disappears

**ethiKos vNext** restructures participation into distinct stages—each optimized for a different job:

1. **Discovery** (surface the real landscape of opinions)  
2. **Deliberation** (capture the “why,” not the noise)  
3. **Drafting** (convert agreement into text people can sign)  
4. **Decision** (choose an outcome using a clear protocol)  
5. **Accountability** (track implementation and keep receipts)

This is the **\#kinstugi approach**: consolidate what works, harmonize it, and orchestrate it into one coherent civic engine.

## **2\) The core architecture principle: many inputs, one common “reading layer”**

ethiKos introduces multiple ways to participate (tri-votes, reasons, proposals, protocols…) but avoids building separate voting systems for each.

Instead, the architecture converges into a shared aggregation layer (Konnaxion’s **Smart Vote** system), so every signal can be:

* compared fairly  
* audited consistently  
* analyzed through multiple “lenses”  
* displayed in a way that resists manipulation

This is not about “one right answer.”  
It’s about providing **multiple legitimate readings of the same civic input**.

## 

## **3\) Smart Vote (explained simply)**

Smart Vote is not a “power grab” mechanism.  
It is a **reading quality multiplier** that can be turned on or off depending on the context.

### **Smart Vote stores votes in a standardized way**

Every vote is represented as:

* **who** voted  
* **what object** they voted on (topic, statement, reason, proposal…)  
* the **raw value** (what they chose)  
* optional **metadata** (region, cohort, language, etc.)  
* optional **weighting** (a multiplier used for certain readings)

### 

### **Smart Vote enables multiple lenses on the same result**

#### **Lens A — “1 person \= 1 vote” (always available)**

This is the baseline democratic view:

* everyone counts equally  
* simple, understandable, universal legitimacy

Use when:

* broad civic consultations  
* public referendums  
* high trust scenarios  
* you want maximal equality of influence

#### **Lens B — “Quality-weighted reading” (optional)**

This is where Smart Vote becomes useful as a clarity tool:

* votes can be weighted by **domain expertise** or **trusted participation history**  
* not to silence anyone, but to add **signal resolution** when topics require competence

Use when:

* medical/scientific domains  
* high-risk decisions  
* technical governance  
* professional standards and safety questions

**Important:** the platform can show both readings side-by-side.  
No single lens is forced.

## 

## 

## **4\) Cohort filters: the “library of readings”**

ethiKos results will support filters that help communities understand *who agrees with what*—without fragmenting the process into separate debates.

Examples of filter lenses:

* **Region / jurisdiction**  
* **Language**  
* **Age bands** (where appropriate)  
* **Role** (citizen / stakeholder / organization member)  
* **Field of expertise**  
* **Level of expertise**  
* **Verified cohorts** (credentialed or validated groups)

This makes it possible to ask:

* “What does the overall crowd think?”  
* “What do local residents think?”  
* “What do professionals think?”  
* “Where do experts disagree with the public?”  
* “Where do all groups converge?”

This is how ethiKos avoids two extremes:

* purely popular outcomes with low competence  
* purely technocratic outcomes with low legitimacy

## 

## 

## **5\) The ethiKos pipeline (Plan v1)**

### **Stage 0 — Idea Intake & Early Prioritization**

**Job:** gather many ideas quickly without chaos.

**What happens**

* submit ideas / statements  
* lightweight prioritization (fast feedback)  
* shortlisting for deeper deliberation

**Inspired by / optionally integrated**

* **Your Priorities** (idea intake \+ prioritization patterns)  
* **All Our Ideas** (pairwise ranking patterns)

**Why it matters**  
This prevents “10,000 comments \= unusable noise.”

---

### **Stage 1 — Consultation \+ Consensus Map**

**Job:** reveal the real opinion landscape and detect common ground.

**Interaction rules (anti-troll by design)**

* no reply chains  
* no thread combat  
* only: **Agree / Disagree / Pass** on statements

**What the engine produces**

* an opinion map (participants grouped by voting similarity)  
* clusters (“tribes”)  
* **bridge statements** (high agreement across clusters)  
* divisive statements (polarizing)

**Mimicked from**

* **Polis** (consensus mapping methodology)

**What Konnaxion adds**

* multiple readings (1p1v \+ weighted lens)  
* cohort filters (region/expertise)  
* auditable explanation of how results were derived

---

### **Stage 2 — Deliberation (Reasons over reactions)**

**Job:** capture the “why” in a structured form.

**Mechanics**

* reasons are stored as **Pro / Con** points  
* participants vote on reasons for strength/clarity  
* debate becomes legible instead of personal

**Outputs**

* top reasons for agreement  
* top reasons for disagreement  
* concise summaries of where the tension lives

**Mimicked from**

* **Consider.it** (reason capture \+ compression patterns)  
* Kialo-style structure (argument mapping patterns)

---

### **Stage 3 — Drafting (Turn consensus into text)**

**Job:** convert agreement into a proposal people can adopt.

**Mechanics**

* collaborative drafting of a final statement/policy  
* amendments \+ version history  
* transparent evolution from idea → final text

**Mimicked from**

* **Citizen OS** drafting patterns

---

### **Stage 4 — Decision (Protocols \+ outcomes)**

**Job:** end the debate responsibly and publish a clear result.

**Mechanics**

* proposal cards with a time window  
* selectable decision protocol (consent, approval, ranked, etc.)  
* publishable outcomes (including dissent visibility)

**Mimicked from**

* **Loomio** decision lifecycle patterns  
* **LiquidFeedback** concepts (delegation/voting theory as optional advanced mode)

**What Konnaxion adds**

* dual readings: equal vote lens \+ quality-weighted lens  
* filters: “show by region / cohort / expertise field”  
* clearer governance legitimacy: you can show *who* agrees, not only *how many*

---

### **Stage 5 — Process \+ Accountability (After the vote)**

**Job:** prevent civic participation from becoming “performative.”

**Mechanics**

* process phases: consult → draft → vote → adopt → implement  
* transparency pages with milestones and updates  
* public tracking: what changed, what shipped, what stalled

**Mimicked from**

* **Decidim** participation workflows  
* **CONSUL Democracy** civic mechanics (petitions, budgeting patterns)

---

### **Optional Module — Assembly / Parliament Mode**

**Job:** support formal meetings (motions, agenda, elections).

**Optionally integrated**

* **OpenSlides** (assembly operations patterns)

## 

## 

## **6\) Mimicked vs Integrated: what came from where**

### **MIMICKED (native inside ethiKos)**

* **Polis:** consultation rules \+ opinion mapping \+ bridge statements  
* **Consider.it:** reason capture \+ summary compression  
* **Citizen OS:** collaborative drafting patterns  
* **Loomio:** proposals \+ decision protocols \+ outcome publishing  
* **Decidim:** process scaffolding \+ legitimacy workflows  
* **CONSUL Democracy:** petitions and participatory budgeting mechanics  
* **LiquidFeedback:** delegation concepts \+ governance mathematics (advanced optional)  
* **DemocracyOS:** proposal/policy framing UX patterns

### **INTEGRATED (optional annex modules)**

* **All Our Ideas:** pairwise ranking module (optional)  
* **Your Priorities:** idea intake/prioritization module (optional)  
* **OpenSlides:** assembly mode module (optional)

## **7\) What stays stable (Konnaxion integrity)**

This upgrade does **not** require merging foreign codebases into your stack.

Konnaxion remains:

* Next.js frontend  
* Django backend  
* Postgres operational store  
* Celery for compute-heavy tasks  
* Insights dashboards for map \+ analytics views

External projects are used as:

* **methodology reference** (mimic)  
* or **optional sidecars** (annex) with strict boundaries

## **8\) Why publish Plan v1 before coding**

Because civic software fails most often at the architecture level, not the UI level.

This plan is being published early so civic builders, researchers, and practitioners can:

* challenge missing edge cases  
* improve legitimacy safeguards  
* suggest interoperability patterns  
* catch errors before they become permanent design debt

Feedback is welcome from anyone working on deliberation systems, computational democracy, or governance tech.

---

## **Credits / inspirations (loud credit, deliberate respect)**

This plan draws inspiration from:

* Polis (Computational Democracy)  
* Consider.it  
* Citizen OS  
* Loomio  
* Decidim  
* CONSUL Democracy  
* All Our Ideas  
* Your Priorities  
* OpenSlides  
* LiquidFeedback (concepts)

## 

## 

## **Appendix — “Multiple readings” (sample UI presentation)**

ethiKos will present results like this:

**Results (All participants)**

* Lens: 1 person \= 1 vote  
* Lens: quality-weighted reading (optional toggle)

**Filters (optional)**

* Region  
* Language  
* Expertise field  
* Expertise level  
* Verified cohort

**Outputs**

* Opinion map  
* Top bridge statements  
* Top reasons pro/con  
* Decision outcome (with protocol \+ time window)  
* Implementation tracking

