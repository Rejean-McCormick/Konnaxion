# Konnaxion Bug Harvest — mass audit 2026-09-05

## Scope

This harvest intentionally does **not** repeat the already-green full backend suite, broad 124-route Playwright smoke, or the ethiKos/EkoH/Smart Vote delivery workflow. It targets the evidence-depth gap documented for the less-qualified platform surfaces.

The source scan found 282 hotspot references across the selected frontend surfaces. The largest concentrations were KonnectED (84), keenKonnect (61), Kontrol (50), TeamBuilder (38), Kreative (25), and Konsensus (13). Common signals were mock/stub data, simulated success messages, TODOs, direct fetches, and console-only error paths.

## Fixed / wired in this batch

### TeamBuilder

- Problem library now reads the existing `/api/teambuilder/problems/` backend instead of `MOCK_PROBLEMS`.
- Create Problem now persists real `Problem` rows instead of displaying simulated success.
- Problem detail now calls a real typed `getProblemDetail()` service method instead of an unsafe cast to a missing method.
- `/teambuilder/create?problemId=...` now carries `problem_id` into session creation, preserving the intended Problem → BuilderSession relationship.
- Duplicate `sectionLabel` JSX prop removed.
- Added typed Problem request/response contracts to the frontend TeamBuilder service.

### KonnectED

Existing backend models were present but several were not routed. This batch exposes canonical `/api/konnected/*` endpoints for:

- recommendations;
- learning progress;
- mentor directory;
- mentorship requests;
- co-creation projects/contributions;
- forum topics/posts.

Additional safeguards:

- recommendations are scoped to the authenticated user;
- progress is scoped to the authenticated user and server-assigns ownership;
- mentorship requests server-assign the mentee and expose only that learner's requests;
- mentor discovery exposes active profiles;
- forum write ownership is enforced for update/delete;
- co-creation projects are read-only because the current model has no owner field; no ownership semantics were invented;
- co-creation contributions permit authenticated creation but do not expose arbitrary update/delete mutation.

Frontend wiring updated:

- Community Discussions now uses canonical `konnected/forum-topics` and `konnected/forum-posts` endpoints.
- Mentorship now loads real `MentorProfile` rows and creates real `MentorshipRequest` rows.
- KonnectED dashboard uses canonical KonnectED and keenKonnect routes instead of stale root-level endpoint guesses.
- My Teams now uses keenKonnect project-team membership and a server-side `leave` action.
- Recommended Resources now uses the canonical recommendations route and no longer treats a failed feedback request as success.

### keenKonnect team membership

- `ProjectTeamSerializer` now exposes stable project/user IDs and `project_title` for consumers.
- Added an authenticated `my-teams` projection for the current user.
- Added a guarded `leave` action; non-members cannot remove another user's membership and project owners must transfer ownership first.

### Test orchestration

- `full-scan.ps1` no longer keeps the smoke Next process alive by default. Persistence is now opt-in via `-KeepFrontend`, preventing the inherited-process/pipe hang seen in the mega campaign.
- Added a dedicated Playwright harvest config and workflow.
- Added a one-click targeted Bug Harvest GUI runner. It runs only the new backend contracts and the new TeamBuilder/KonnectED depth workflow. It starts a fresh Next dev server on port 3001 so it cannot accidentally test a stale production build on port 3000.

## Captured but intentionally not faked in this batch

These remain open because the current backend contract/model does not safely support the UI semantics yet:

- **KonnectED learning paths:** UI still contains mock fallback and TODO complete/leave actions; no equivalent complete domain contract was found in this source pack.
- **KonnectED standalone Team Builder:** UI describes a free-standing team with arbitrary email members, while the available keenKonnect model represents project membership. These are not silently treated as the same object.
- **Recommendation feedback persistence:** the UI can attempt feedback, but no persisted feedback model/endpoint exists. Failure is now surfaced instead of falsely acknowledged.
- **Kontrol roles/community/dashboard:** several pages remain mock-heavy; the inspected backend does not contain matching first-class role/community data contracts for those UI shapes.
- **Kreative collaborative-space creation:** current UI fields do not map cleanly to the existing `CollabSession` model, so no lossy persistence mapping was invented.
- **Kreative traditions archive:** frontend expects richer category/community/status/tag/year semantics than the inspected `TraditionEntry` model exposes.
- **keenKonnect AI team matching:** still explicitly mock/TODO; no complete matching backend contract was present in the inspected source pack.
- **keenKonnect knowledge document-management simulation:** save/version/comment flows still advertise simulation and need a real document-version/comment contract before wiring.

## Targeted validation added

Backend targeted tests cover:

- forum topic/post ownership;
- mentor directory + mentorship request;
- user-owned learning progress;
- user-scoped nested recommendations;
- read-only co-creation project exposure;
- cross-user forum mutation denial;
- existing TeamBuilder Problem API tests.

Playwright targeted harvest covers:

1. authenticated real Problem creation;
2. Problem library UI visibility;
3. Problem detail UI visibility;
4. authenticated real ForumTopic + ForumPost creation;
5. Active Threads UI visibility;
6. real dynamic thread detail navigation + reply write through UI;
7. new KonnectED read API surfaces;
8. Mentorship and Dashboard runtime console/network findings.

The existing full release gates should remain release gates, not the default bug-harvest loop.

## Navigation-depth findings

A static navigation-target pass found additional interactions that broad page-load smoke cannot prove. The forum thread target was fixed in this batch by adding a real dynamic thread page backed by ForumTopic/ForumPost and a real reply action.

The remaining high-confidence missing/static targets to disposition in later batches include:

- keenKonnect document detail and workspace join/request-access targets;
- KonnectED learning-library `/course/*` target;
- several Kreative collaboration/profile/idea view/edit targets;
- TeamBuilder human geo/language/schedules targets.

These were captured rather than mass-created as placeholder pages, because a route shell without a matching domain contract would increase visible surface without increasing real completion.
