# Konnaxion v14 — Site Navigation Map

**Revision:** 2026-09-22 navigation alignment.  
This document combines the current App Router surface from the supplied code snapshot with the accepted sidebar ownership defined in `../NAVIGATION_AND_SHELL_CONTRACT.md`.

A route is an interface surface, not a backend ownership declaration. A technical route namespace may intentionally appear under a different product sidebar.

## Canonical suite switcher

```text
Core experiences
  ethiKos · keenKonnect · KonnectED · Kreative

Shared capabilities
  EkoH · Team Builder

Operations
  Insights · KonTrol
```

Canonical visible spelling: **ethiKos**. Technical path/key: `ethikos`.

## Sidebar-owned routes

### ethiKos (`ethikos`)

Landing: `/ethikos/insights`

- Overview — `/ethikos/insights`
- Deliberate
  - Expert deliberation — `/ethikos/deliberate/elite`
  - Guidelines — `/ethikos/deliberate/guidelines`
- Decide
  - Public consultations — `/ethikos/decide/public`
  - Expert decisions — `/ethikos/decide/elite`
  - Konsensus — `/konsensus`
  - Results — `/ethikos/decide/results`
  - Methodology — `/ethikos/decide/methodology`
- Impact
  - `/ethikos/impact/tracker`
  - `/ethikos/impact/outcomes`
  - `/ethikos/impact/feedback`
- Pulse
  - `/ethikos/pulse/live`
  - `/ethikos/pulse/health`
  - `/ethikos/pulse/trends`
  - `/ethikos/pulse/overview`
- Trust
  - `/ethikos/trust/profile`
  - `/ethikos/trust/badges`
  - `/ethikos/trust/credentials`
- Learn
  - `/ethikos/learn/guides`
  - `/ethikos/learn/glossary`
  - `/ethikos/learn/changelog`

Secondary ethiKos-owned Konsensus pages remain reachable at `/konsensus/dashboard`, `/konsensus/activity-feed` and `/konsensus/leaderboards` without each becoming a sidebar leaf. `/konsensus/admin` is a compatibility route whose canonical destination is `/kontrol/konsensus`.

### keenKonnect (`keenkonnect`)

Landing: `/keenkonnect/dashboard`

- Overview — `/keenkonnect/dashboard`
- Projects
  - `/keenkonnect/projects/browse-projects`
  - `/keenkonnect/projects/create-new-project`
  - `/keenkonnect/projects/my-projects`
  - `/keenkonnect/projects/project-workspace`
- Workspaces
  - `/keenkonnect/workspaces/browse-available-workspaces`
  - `/keenkonnect/workspaces/my-workspaces`
  - `/keenkonnect/workspaces/launch-new-workspace`
- AI Team Matching
  - `/keenkonnect/ai-team-matching/find-teams`
  - `/keenkonnect/ai-team-matching/match-preferences`
  - `/keenkonnect/ai-team-matching/my-matches`
- Knowledge
  - `/keenkonnect/knowledge/browse-repository`
  - `/keenkonnect/knowledge/search-filter-documents`
  - `/keenkonnect/knowledge/document-management`
  - `/keenkonnect/knowledge/upload-new-document`
- Sustainability Impact
  - `/keenkonnect/sustainability-impact/sustainability-dashboard`
  - `/keenkonnect/sustainability-impact/track-project-impact`
  - `/keenkonnect/sustainability-impact/submit-impact-reports`
- User Reputation
  - `/keenkonnect/user-reputation/view-reputation-ekoh`
  - `/keenkonnect/user-reputation/manage-expertise-areas`
  - `/keenkonnect/user-reputation/account-preferences`

### KonnectED (`konnected`)

Landing: `/konnected/dashboard`

- Overview — `/konnected/dashboard`
- Learning Library
  - `/konnected/learning-library/browse-resources`
  - `/konnected/learning-library/search-filters`
  - `/konnected/learning-library/recommended-resources`
  - `/konnected/learning-library/offline-content`
- Learning Paths
  - `/konnected/learning-paths/my-learning-path`
  - `/konnected/learning-paths/create-learning-path`
  - `/konnected/learning-paths/manage-existing-paths`
- Certifications
  - `/konnected/certifications/certification-programs`
  - `/konnected/certifications/exam-dashboard-results`
  - `/konnected/certifications/exam-preparation`
  - `/konnected/certifications/exam-registration`
- Community Discussions
  - `/konnected/community-discussions/active-threads`
  - `/konnected/community-discussions/start-new-discussion`
  - `/konnected/community-discussions/moderation`
- Teams Collaboration
  - `/konnected/teams-collaboration/my-teams`
  - `/konnected/teams-collaboration/activity-planner`
  - `/konnected/teams-collaboration/project-workspaces`
  - **Create team** — `/konnected/teams-collaboration/team-builder`

Reachable but not canonical sidebar leaves in this navigation revision: `/konnected/knowledge/contribute`, `/konnected/mentorship`, `/konnected/learning-library/[resourceId]`.

### Kreative (`kreative`)

Landing: `/kreative/dashboard`

- Overview — `/kreative/dashboard`
- Creative Hub
  - `/kreative/creative-hub/explore-ideas`
  - `/kreative/creative-hub/inspiration-gallery`
  - `/kreative/creative-hub/submit-creative-work`
- Idea Incubator
  - `/kreative/idea-incubator/collaborate-on-ideas`
  - `/kreative/idea-incubator/create-new-idea`
  - `/kreative/idea-incubator/my-ideas`
- Collaborative Spaces
  - `/kreative/collaborative-spaces/find-spaces`
  - `/kreative/collaborative-spaces/start-new-space`
  - `/kreative/collaborative-spaces/my-spaces`
- Community Showcases
  - `/kreative/community-showcases/featured-projects`
  - `/kreative/community-showcases/top-creators`
  - `/kreative/community-showcases/submit-to-showcase`

Reachable but not canonical sidebar leaves in this navigation revision: `/kreative/mentorship`, `/kreative/traditions-archive`.

### EkoH (`ekoh`)

Landing: `/ekoh/dashboard`

- Overview — `/ekoh/dashboard`
- Reputation
  - Profile analytics — `/ekoh/overview-analytics/current-ekoh-score`
  - Expertise areas — `/ekoh/expertise-areas/view-current-expertise`
  - Achievements & badges — `/ekoh/achievements-badges/earned-badges-display`
- Influence
  - Contextual influence — `/ekoh/voting-influence/current-voting-weight`

Konsensus and Reports/Insights are intentionally absent from the EkoH sidebar.

### Team Builder (`teambuilder`)

Landing: `/teambuilder`

- Sessions
  - `/teambuilder`
  - `/teambuilder/create`
- Problems
  - `/teambuilder/problems`
  - `/teambuilder/problems/create`
  - `/teambuilder/problems/taxonomy`
- People & Constraints
  - `/teambuilder/humans`
  - `/teambuilder/humans/constraints`
  - `/teambuilder/humans/conflicts`
  - `/teambuilder/humans/modes`

Dynamic detail pages remain reachable at `/teambuilder/[sessionId]` and `/teambuilder/problems/[problemId]`.

### Insights (`reports`)

Landing: `/reports`

- Overview — `/reports`
- Insights
  - Smart Vote — `/reports/smart-vote`
  - Adoption & usage — `/reports/usage`
  - System performance — `/reports/perf`
  - Custom reports — `/reports/custom`

`reports` remains the technical suite/URL key; **Insights** is the visible product label.

### KonTrol (`kontrol`)

Landing: `/kontrol/dashboard`

- Overview — `/kontrol/dashboard`
- Operations
  - `/kontrol/users/all`
  - `/kontrol/moderation/queue`
  - `/kontrol/moderation/community`
- Governance
  - Konsensus rules — `/kontrol/konsensus`
  - `/kontrol/roles`
  - `/kontrol/audit-log`

Reports/Insights are intentionally absent from the KonTrol sidebar.

## Other reachable route families

### ethiKos admin/detail routes not promoted to the main sidebar

- `/ethikos/admin/audit`
- `/ethikos/admin/demo-importer`
- `/ethikos/admin/moderation`
- `/ethikos/admin/roles`
- `/ethikos/deliberate/[topic]`

### Global

- `/`
- `/search`

## Shell behavior

- grouped sections are collapsible;
- the active section opens automatically;
- one grouped section is open at a time;
- the most specific route prefix wins for selected state and breadcrumb trail;
- breadcrumb roots use canonical suite landing routes rather than `/${suite}` guessing;
- `/konsensus/*` defaults to the ethiKos sidebar;
- `/reports/*` defaults to the Insights sidebar.

See `../NAVIGATION_AND_SHELL_CONTRACT.md` for the normative rationale and overlap rules.
