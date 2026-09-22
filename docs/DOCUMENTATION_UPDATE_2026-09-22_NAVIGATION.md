# Konnaxion Documentation Update — Navigation & Sidebar Alignment

**Date:** 2026-09-22

## Scope

This documentation pass aligns the active documentation set with the accepted navigation/sidebar redesign prepared for Konnaxion.

## Updated canonical decisions

- User-facing spelling is **ethiKos**; technical identifiers remain `ethikos` / `Ethikos*` as appropriate.
- The suite switcher is grouped into:
  - core experiences: ethiKos, keenKonnect, KonnectED, Kreative;
  - shared capabilities: EkoH, Team Builder;
  - operations: Insights, KonTrol.
- Konsensus is product-owned by **ethiKos** and appears under `ethiKos > Decide`, while preserving `/konsensus/*` technical URLs.
- `/konsensus/admin` is treated as compatibility debt; canonical administration is `/kontrol/konsensus`.
- EkoH is limited to reputation/expertise/contextual influence navigation and no longer carries Konsensus or Reports links.
- Insights is a first-class suite with technical key/namespace `reports` and URLs `/reports/*`; it is not nested in KonTrol.
- KonTrol is limited to administration, moderation and governance.
- keenKonnect removes cross-module Konsensus sidebar signals and uses Projects/Workspaces/AI Team Matching/Knowledge/Impact/Reputation grouping.
- KonnectED keeps domain collaboration but relabels its `/teams-collaboration/team-builder` action as **Create team** to avoid collision with the shared Team Builder suite.
- Kreative navigation follows Creative Hub → Idea Incubator → Collaborative Spaces → Community Showcases.
- Team Builder follows Sessions → Problems → People & Constraints.
- Grouped sidebar sections are expected to be collapsible with the active group expanded.
- Suite keys, display labels and landing routes should be centralized to prevent MainLayout/switcher/breadcrumb drift.

## Files updated

- `docs/README.md`
- `docs/Konnaxion_User_Workflows.md`
- `docs/Konnaxion_UserWorkflow_Documentation_v0_1.md` (legacy notice)
- `docs/Technical-Reference/NAVIGATION_AND_SHELL_CONTRACT.md` (new)
- `docs/Technical-Reference/BOUNDARIES_AND_OWNERSHIP.md`
- `docs/Technical-Reference/CODE_ALIGNMENT_NOTES.md`
- `docs/Technical-Reference/GLOSSARY.md`
- `docs/Technical-Reference/DocV14/Konnaxion v14 - Documentation Index.md`
- `docs/Technical-Reference/DocV14/Konnaxion v14 - Full-Stack Technical Specification.md`
- `docs/Technical-Reference/DocV14/Konnaxion v14 - Site Navigation Map.md`
- `docs/Technical-Reference/DocV14/Konnaxion v14 - Site Navigation Map (Top-Level Routes).md`
- active Insights UI references (standalone-suite navigation note)
- legacy EkoH/Smart Vote “Kollective Intelligence sub-module” descriptions (legacy notice)

## Qualification rule

These documentation changes define/record the accepted navigation contract. They do **not** assert that the frontend overlay has been applied to a particular checkout or that `pnpm typecheck`, `pnpm build` or Playwright navigation tests have passed. Those claims require executable evidence and belong in qualification/status documentation.
