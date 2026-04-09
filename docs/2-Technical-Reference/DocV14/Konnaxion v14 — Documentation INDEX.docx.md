**Konnaxion v14 — Documentation Index**

*Use this as a directory: each entry tells you **which file** answers a given class of question and **where inside** that file the relevant details live. All filenames are exactly the objects you uploaded; headings are quoted from the documents so they are easy to find with a quick full‑text search in your editor or viewer.*

---

### **1  System‑wide references**

| What you will find | File | Look under these headings / anchors |
| ----- | ----- | ----- |
| **Frozen configuration values** (env‑vars, settings constants, route ownership) | *Konnaxion Platform – Definitive Parameter Reference (v14‑stable).docx* | “0 Global / Core …”, then the numbered module sections |
| **Complete route list** (24 Next.js pages grouped by module) | *Navigation Map.docx* | “Global & Cross‑Module Shell”, then each module block |
| **Every custom Django table** (model name, purpose, columns) | *canonical list of every custom database table (1).docx* | Module headings → sub‑module table lists |
| **Functional capability catalogue** (code‑names, one‑line purpose) | *Inventory of platform‑specific functionalities.docx* | Module → Sub‑module matrix |

---

### **2  Module technical specifications**

*All four layers (Frontend 5.x, Backend, DB, DevOps) are embedded in the same “Technical Specification v14” document; scroll or search for the layer heading.*

| Module | File | Sections / layer anchors |
| ----- | ----- | ----- |
| **Kollective Intelligence** | *Konnaxion Platform Technical Specification v14.docx* | “Kollective Intelligence → Frontend …”, “Backend …”, “Database …”, “DevOps …” |
| **ethiKos** | same as above | “ethiKos → Frontend …”, etc. |
| **keenKonnect** | same as above | ditto |
| **KonnectED** | same as above | ditto |
| **Kreative (+ Kontact)** | same as above | ditto |

---

### **3  Reporting & Analytics slice (layer 5\)**

| Layer | File & in‑document heading |
| ----- | ----- |
| **Frontend UI spec** | *Document 5 Reporting and analytics.docx* → “Document 5.1 – Reporting & Analytics · Frontend layer” |
| **Read‑only API service** | same file → “Document 5.2 – Reporting & Analytics · Backend layer” |
| **Star‑schema DB design** | same file → “Document 5.3 – Reporting & Analytics · Database & Storage layer” |
| **K8s / Airflow / monitoring** | same file → “Document 5.4 – Reporting & Analytics · DevOps / Infrastructure layer” |

*(These four sections fully implement the “Insights” module and correspond to routes starting `/reports` in the Navigation Map.)*

---

### **4  How to use this index**

1. **Need a setting or constant?** Open the Parameter Reference and jump to the module number.

2. **Need a REST endpoint, model field or pipeline?** Open the Technical Specification v14 and search for the layer heading (Frontend, Backend, Database, DevOps) under the module name.

3. **Need analytics details?** Go straight to Document 5 and pick the 5.1–5.4 sub‑section.

4. **Unsure which module owns a route or table?** Check the Navigation Map (routes) or Canonical Tables list (DB).

5. **Wondering what a code‑name like `dynamic_weighted_vote` is?** Look it up in the Functionality Inventory.

This mapping eliminates ambiguity: every architectural or implementation question now has an authoritative source and a file/section pointer.

