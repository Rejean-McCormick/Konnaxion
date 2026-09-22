# Konnaxion — Documentation

## Scope

Konnaxion is an **ecosystem system** of the kOA Digital Ecosystem and a **platform** in its own product scope. It owns its civic/public domain state and its application surfaces. It is not the kOA Digital Ecosystem itself, and it does not absorb the authority of Orgo, Kristal, SemantiK Architect or kOA-Linux when integrated with them.

Within Konnaxion, the word **module** is only a convenient product/UI term. Architecture documents use the more precise terms **domain**, **application**, **service**, **component**, **gateway** and **external ecosystem system**.

The canonical visible brand spelling is **ethiKos**. Technical identifiers such as `ethikos`, `EthikosTopic`, package names and route segments keep their code spelling.

## Documentation authority

The canonical reading order below defines current authority. A document outside this order may still be useful as history, rationale, prototype material or a design exploration, but it does **not** override the canonical specifications or current qualification evidence.

Documents that call themselves “canonical”, “definitive” or “single source of truth” from an older documentation generation are superseded when they conflict with this index.

In particular, `Technical-Reference/EkoH Smart Vote/ekoh-smart-vote-definitive-module-documentation-set-v1-0.md` is retained as **historical / non-canonical** material. Its Kubernetes/Helm/Argo CD/Airflow/Dredd/k6/coverage-gate descriptions must not be read as current implementation or CI claims.

## Canonical reading order

1. `Technical-Reference/QUALIFICATION_STATUS.md`
2. `Technical-Reference/INTERACTION_KERNEL_INTEGRATION.md`
3. `Technical-Reference/DocV14/Konnaxion v14 - Full-Stack Technical Specification.md`
4. `Technical-Reference/GLOSSARY.md`
5. `Technical-Reference/BOUNDARIES_AND_OWNERSHIP.md`
6. `Technical-Reference/CONTRACTS.txt`
7. `Technical-Reference/EkoH Smart Vote/EkoH and Smart Vote - Technical Specification.md`
8. `Technical-Reference/CODE_ALIGNMENT_NOTES.md`
9. `Technical-Reference/NAVIGATION_AND_SHELL_CONTRACT.md`
10. `Technical-Reference/DocV14/Konnaxion v14 - Site Navigation Map.md`
11. `Konnaxion_User_Workflows.md`

## Status and evidence rule

Architecture and product-scope text does not by itself prove implementation or qualification.

Current status claims must point to executable evidence and use explicit labels such as **Implemented**, **Qualified**, **Preview**, **Deferred**, **Historical**, or the diagnostic verdicts **PASS/WARN/FAIL/SKIP**.

Konnaxion does not currently publish a single global engineering-maturity percentage. See `Technical-Reference/QUALIFICATION_STATUS.md` for the dated LevelUpDiag and SecurityDiag evidence and the known open qualification items.

## Architectural invariants

- One authoritative owner per state.
- No direct write across ownership boundaries.
- Source facts and derived readings are distinct.
- A reading never retroactively becomes a source fact.
- EkoH context does not become a civic vote.
- Smart Vote does not silently replace a public baseline.
- External systems integrate through explicit contracts, not shared internal tables.
- Interaction Kernel (IK) is the ecosystem interoperability protocol; it is not a central owner, shared database, transaction coordinator or artifact store.
- Konnaxion commits Konnaxion-owned operational state locally before any cross-system publication; no distributed transaction with Orgo, Da’at or Kristal is required.
- A Kristal artifact is a derived epistemic representation of selected source state, not a replacement for Konnaxion's operational database.
- Konnaxion stores references/receipts to external artifacts where needed; it does not make a mutable Runtime Pack or Kristal projection authoritative for civic state.
- Presentation does not transfer authority.
- A Konnaxion deployment inside kOA-Linux remains Konnaxion-owned at the domain level.

## Core Konnaxion rule

> **Single Truth, Multiple Readings.**

A stable source event or civic state may be interpreted through one or more explicitly declared readings. The reading identifies the method and context used to derive it; it does not mutate the source.

In this Konnaxion phrase, **Truth** means the uniquely owned source/civic state inside a Konnaxion domain. It is not a Kristal epistemic status, a universal truth authority, or a claim that Konnaxion owns knowledge outside its domain.
