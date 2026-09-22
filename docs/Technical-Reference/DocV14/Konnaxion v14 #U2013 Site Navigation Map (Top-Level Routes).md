# Konnaxion v14 — Top-Level Navigation Map

**Revision:** 2026-09-22.  
This document describes the accepted **user-facing sidebar/suite navigation**. For the exhaustive route inventory and non-sidebar detail/admin routes, see `Konnaxion v14 - Site Navigation Map.md`.

## Global suite switcher

| Group | Suites |
| --- | --- |
| Core experiences | **ethiKos**, **keenKonnect**, **KonnectED**, **Kreative** |
| Shared capabilities | **EkoH**, **Team Builder** |
| Operations | **Insights**, **KonTrol** |

Canonical brand spelling is **ethiKos**. The lowercase technical key/path remains `ethikos`.

## ethiKos

| Section | Entry points | Purpose |
| --- | --- | --- |
| Overview | `/ethikos/insights` | Civic/opinion overview. |
| Deliberate | `/ethikos/deliberate/elite`, `/ethikos/deliberate/guidelines` | Structured discussion and norms. |
| Decide | `/ethikos/decide/public`, `/ethikos/decide/elite`, `/konsensus`, `/ethikos/decide/results`, `/ethikos/decide/methodology` | Consultation, expert decision, Konsensus, results and method. |
| Impact | `/ethikos/impact/tracker`, `/ethikos/impact/outcomes`, `/ethikos/impact/feedback` | Follow what happens after decisions. |
| Pulse | `/ethikos/pulse/*` | Live activity, health, trends and overview. |
| Trust | `/ethikos/trust/*` | Trust profile, badges and credentials. |
| Learn | `/ethikos/learn/*` | Guides, glossary and changelog. |

**Konsensus belongs to ethiKos product navigation.** `/konsensus/*` remains a separate technical route namespace. Secondary Konsensus dashboard/feed/leaderboard pages remain reachable without each becoming a sidebar leaf.

## keenKonnect

| Section | User goal |
| --- | --- |
| Overview | See project/collaboration state. |
| Projects | Browse, create and manage projects/workspace. |
| Workspaces | Discover, launch and revisit workspaces. |
| AI Team Matching | Discover recommended teams/partners and tune matching preferences. |
| Knowledge | Browse/search/manage/upload project knowledge. |
| Sustainability Impact | Track and submit project impact. |
| User Reputation | View EkoH context, manage expertise and account preferences. |

Konsensus activity/leaderboards are not keenKonnect sidebar sections.

## KonnectED

| Section | User goal |
| --- | --- |
| Overview | See learning activity. |
| Learning Library | Browse/search/recommend/offline resources. |
| Learning Paths | Follow, create and manage learning paths. |
| Certifications | Programs, exam preparation/registration/results. |
| Community Discussions | Read/start/moderate discussions where authorized. |
| Teams Collaboration | My teams, planner, project workspaces and **Create team**. |

The existing technical route `/konnected/teams-collaboration/team-builder` keeps its URL but its visible action is **Create team** to avoid confusion with the shared Team Builder suite.

## Kreative

| Order | Section | User goal |
| ---: | --- | --- |
| 1 | Overview | Entry/dashboard. |
| 2 | Creative Hub | Explore inspiration and submit creative work. |
| 3 | Idea Incubator | Create, refine and collaborate on ideas. |
| 4 | Collaborative Spaces | Find/start/revisit collaboration spaces. |
| 5 | Community Showcases | Discover featured work/top creators and submit a showcase. |

This order follows inspiration/creation → maturation → collaboration → exposure.

## EkoH

| Section | Entry points |
| --- | --- |
| Overview | `/ekoh/dashboard` |
| Reputation | profile analytics, expertise areas, achievements & badges |
| Influence | contextual influence |

EkoH is a shared contextual-intelligence capability. It does **not** own the Konsensus or Insights navigation surfaces.

## Team Builder

| Section | Entry points |
| --- | --- |
| Sessions | all sessions, new session |
| Problems | problem library, new problem, UNESCO taxonomy |
| People & Constraints | people overview, language/geo/schedule, conflicts/pairing, team modes |

Team Builder is a shared capability, not a KonTrol/admin subsection.

## Insights

Technical namespace: `/reports/*`.

| Entry | Route |
| --- | --- |
| Overview | `/reports` |
| Smart Vote | `/reports/smart-vote` |
| Adoption & usage | `/reports/usage` |
| System performance | `/reports/perf` |
| Custom reports | `/reports/custom` |

Insights is a standalone operations/read suite beside KonTrol.

## KonTrol

| Section | Entry points |
| --- | --- |
| Overview | `/kontrol/dashboard` |
| Operations | user database, moderation queue, community contexts |
| Governance | Konsensus rules, roles & permissions, system audit log |

`/konsensus/admin` should redirect to `/kontrol/konsensus`; there should not be two independent Konsensus administration surfaces.

## Shell invariants

- Suite keys/labels/landing routes are centralized.
- Groups are collapsible and the active group opens automatically.
- Breadcrumb roots use the canonical landing route.
- Longest/specific route matching wins.
- Existing route URLs are preserved unless a separate migration explicitly changes them.

See `../NAVIGATION_AND_SHELL_CONTRACT.md` for the normative contract.
