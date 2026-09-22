# Konnaxion — Navigation and Shell Contract

**Status:** normative product/UI navigation contract.  
**Revision:** 2026-09-22.  
**Qualification note:** this document defines the accepted navigation model. It is not, by itself, evidence that a given build has the corresponding overlay applied or has passed browser/build qualification.

## 1. Purpose

Konnaxion exposes several domain/application surfaces through one shared shell. The sidebar and suite switcher must communicate **product ownership and user intent**, not simply mirror the physical folder tree.

The navigation model therefore distinguishes:

- **product navigation ownership** — which suite/sidebar a user sees;
- **technical route ownership** — the URL namespace and physical Next.js route;
- **domain/state ownership** — the backend authority that may mutate canonical state.

These three concepts may align, but they are not required to have identical names or folder locations.

## 2. Canonical brand spelling

The canonical user-facing product label is **ethiKos**.

Use:

- `ethiKos` in visible UI labels, prose, breadcrumbs, switchers and product documentation;
- `ethikos` for route segments, suite keys, package/folder identifiers and lowercase technical identifiers;
- existing technical class/model identifiers such as `EthikosTopic` unchanged.

Do not introduce new visible variants such as `ethiKos` or `ethiKos` when the text refers to the product brand.

## 3. Suite switcher hierarchy

The global switcher is grouped as follows.

### Core experiences

1. **ethiKos** — civic deliberation, decision and impact.
2. **keenKonnect** — projects, workspaces, collaboration and impact delivery.
3. **KonnectED** — learning, certification, discussion and learning collaboration.
4. **Kreative** — ideation, creative collaboration and showcases.

### Shared capabilities

5. **EkoH** — contextual expertise, reputation and influence context.
6. **Team Builder** — reusable team-composition/problem capability.

### Operations

7. **Insights** — cross-domain read/analytics surface; technical URL namespace remains `/reports/*`.
8. **KonTrol** — administrative moderation, users/roles, audit and governed platform configuration.

The technical suite keys and landing routes are:

| Suite key | UI label | Landing route |
| --- | --- | --- |
| `ethikos` | ethiKos | `/ethikos/insights` |
| `keenkonnect` | keenKonnect | `/keenkonnect/dashboard` |
| `konnected` | KonnectED | `/konnected/dashboard` |
| `kreative` | Kreative | `/kreative/dashboard` |
| `ekoh` | EkoH | `/ekoh/dashboard` |
| `teambuilder` | Team Builder | `/teambuilder` |
| `reports` | Insights | `/reports` |
| `kontrol` | KonTrol | `/kontrol/dashboard` |

## 4. URL-to-sidebar ownership

The default sidebar normally follows the first URL segment, with two deliberate product mappings:

- `/konsensus/*` → **ethiKos**;
- `/reports/*` → **Insights**.

`?sidebar=<known-suite-key>` may explicitly preserve a selected suite during cross-mounted navigation, but a missing override must resolve according to the product ownership above.

**Konsensus is not a standalone suite and is not part of EkoH navigation.** It is an ethiKos product surface implemented under a separate technical route namespace.

## 5. Canonical sidebar information architecture

### 5.1 ethiKos

- **Overview** — `/ethikos/insights`
- **Deliberate**
  - Expert deliberation — `/ethikos/deliberate/elite`
  - Guidelines — `/ethikos/deliberate/guidelines`
- **Decide**
  - Public consultations — `/ethikos/decide/public`
  - Expert decisions — `/ethikos/decide/elite`
  - Konsensus — `/konsensus`
  - Results — `/ethikos/decide/results`
  - Methodology — `/ethikos/decide/methodology`
- **Impact**
  - Impact tracker
  - Outcomes
  - Feedback
- **Pulse**
  - Live activity
  - Debate health
  - Trends
  - Pulse overview
- **Trust**
  - Trust profile
  - Badges
  - Credentials
- **Learn**
  - Guides
  - Glossary
  - Changelog

`/konsensus/dashboard`, `/konsensus/activity-feed` and `/konsensus/leaderboards` remain valid secondary pages but do not each need a top-level sidebar item. `/konsensus/admin` is a compatibility route and should redirect to the canonical KonTrol administration surface `/kontrol/konsensus`.

### 5.2 keenKonnect

- Overview
- Projects
  - Browse projects
  - Create new project
  - My projects
  - Project workspace
- Workspaces
  - Browse available workspaces
  - My workspaces
  - Launch new workspace
- AI Team Matching
  - Find teams
  - Match preferences
  - My matches
- Knowledge
  - Browse repository
  - Search / filter documents
  - Document management
  - Upload new document
- Sustainability Impact
  - Sustainability dashboard
  - Track project impact
  - Submit impact reports
- User Reputation
  - View reputation / EkoH
  - Manage expertise areas
  - Account preferences

Konsensus activity/leaderboards are not keenKonnect sidebar items. AI Team Matching is a keenKonnect discovery/recommendation experience; it does not replace the reusable Team Builder composition engine.

### 5.3 KonnectED

- Overview
- Learning Library
- Learning Paths
- Certifications
- Community Discussions
- Teams Collaboration
  - My teams
  - Activity planner
  - Project workspaces
  - **Create team** — technical URL remains `/konnected/teams-collaboration/team-builder`

The user-facing label **Create team** avoids implying that KonnectED owns or duplicates the reusable Team Builder engine. Existing `/konnected/knowledge/contribute` and `/konnected/mentorship` routes may remain reachable without being promoted into the canonical sidebar until their product placement is explicitly accepted.

### 5.4 Kreative

- Overview
- Creative Hub
- Idea Incubator
- Collaborative Spaces
- Community Showcases

This order follows the primary journey: inspiration/creation → idea maturation → collaboration → exposure. Existing mentorship/archive routes may remain reachable but are not canonical sidebar groups in this navigation model.

### 5.5 EkoH

- Overview
- Reputation
  - Profile analytics
  - Expertise areas
  - Achievements & badges
- Influence
  - Contextual influence

EkoH does not own Konsensus navigation and does not own the Reports/Insights surface. Any influence presentation must remain contextual rather than imply a single global voting power.

### 5.6 Team Builder

- Sessions
  - All sessions
  - New session
- Problems
  - Problem library
  - New problem
  - UNESCO taxonomy
- People & Constraints
  - People overview
  - Language, geo & schedule
  - Conflicts & pairing
  - Team modes

The canonical sidebar is the shared shell route configuration. A second standalone `TeamBuilderSidebar` must not coexist as an alternative taxonomy.

### 5.7 Insights

Technical namespace: `/reports/*`.

- Overview — `/reports`
- Insights
  - Smart Vote — `/reports/smart-vote`
  - Adoption & usage — `/reports/usage`
  - System performance — `/reports/perf`
  - Custom reports — `/reports/custom`

Insights is a cross-domain read surface. It must not be nested under KonTrol solely because some analytics are operational.

### 5.8 KonTrol

- Overview
- Operations
  - User database
  - Moderation queue
  - Community contexts
- Governance
  - Konsensus rules
  - Roles & permissions
  - System audit log

KonTrol owns the administrative presentation/authorization surface, not the underlying domain state shown inside it.

## 6. Sidebar interaction behavior

Grouped sections are collapsible. The shell should:

- open the section containing the active route automatically;
- keep at most one grouped section expanded at a time;
- preserve a clear selected leaf state;
- avoid duplicate route keys;
- use the most specific/longest route match for selection and breadcrumbs.

This reduces vertical overload while retaining the route data model.

## 7. Breadcrumb and landing invariants

Breadcrumb roots must use the same canonical suite configuration as the switcher. Do not reconstruct root paths with a generic `/${suite}` rule.

Examples:

- ethiKos root → `/ethikos/insights`;
- EkoH root → `/ekoh/dashboard`;
- keenKonnect root → `/keenkonnect/dashboard`;
- Insights root → `/reports`;
- Team Builder root → `/teambuilder`.

When multiple route definitions prefix-match the current path, the longest valid match wins.

## 8. Cross-surface overlap rules

- **Konsensus vs EkoH:** Konsensus is an ethiKos decision surface; EkoH supplies contextual expertise/reputation inputs where authorized.
- **ethiKos Trust vs EkoH:** ethiKos Trust presents civic/debate trust and credentials in context; EkoH owns contextual expertise/reputation state.
- **keenKonnect AI Team Matching vs Team Builder:** keenKonnect recommends/discovers teams/partners for project intent; Team Builder composes groups from candidates, problems and constraints.
- **KonnectED Create team vs Team Builder:** KonnectED creates/manages a learning collaboration team; the label must not imply a second generic Team Builder engine.
- **Insights vs KonTrol:** Insights reads/aggregates; KonTrol administers/moderates/configures.

## 9. Preserved URLs and compatibility

The navigation cleanup does not require broad URL migrations. In particular, these remain valid:

- `/konsensus` and secondary `/konsensus/*` pages;
- `/reports/*`;
- `/konnected/teams-collaboration/team-builder`;
- existing EkoH, Team Builder and module paths.

Navigation ownership and labels may change without changing the technical route.

## 10. Source-of-truth rule

The frontend should centralize suite keys, labels, landing routes and switcher grouping in one shared configuration (for example `frontend/routes/suites.ts`). `MainLayout`, the suite switcher and breadcrumbs must consume that shared contract instead of maintaining independent copies.

Route arrays remain responsible for the leaf/group contents of each sidebar.

## 11. Validation contract

A navigation-shell smoke test should verify at minimum:

- `/konsensus` resolves to the **ethiKos** suite by default;
- `/reports` resolves to **Insights** by default;
- suite-switcher labels and landing routes are canonical;
- `ethiKos` uses the exact product casing;
- all visible sidebar destinations resolve;
- breadcrumb roots use the canonical landing route;
- the active sidebar section opens automatically;
- no obsolete second Team Builder sidebar is mounted;
- `/konsensus/admin` reaches the canonical KonTrol configuration surface.

Build/typecheck/browser qualification remains separate evidence and must be recorded in the qualification/status documents when actually run.
