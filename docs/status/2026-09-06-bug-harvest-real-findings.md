# Konnaxion targeted bug harvest — real findings batch 2026-09-06

## Evidence state

The targeted backend surface had already passed its dedicated tests.
The latest frontend harvest reached the consolidated final report instead of
stopping at the first locator/runtime issue.

## Real findings fixed in this batch

- Local isolated frontend `:3001` was absent from Django local CSRF/CORS trusted
  origins, while the harvest intentionally runs on `127.0.0.1:3001`.
- KonnectED Dashboard requested the nonexistent `/api/community-dashboard/`
  endpoint and silently translated failure into synthetic zero metrics.
- KonnectED Mentorship used deprecated Ant Design Card/Modal props.
- The harvest attributed previous-route navigation cancellations to the next
  route and did not strictly prove the UI ForumPost mutation response.

## Harness behavior after this batch

- targeted routes settle before the next navigation;
- Next static/RSC `ERR_ABORTED` navigation noise is excluded narrowly;
- API request failures remain visible;
- the UI Forum reply must return a real 2xx POST response;
- the persisted reply is asserted in the rendered List;
- findings continue to be accumulated and reported together.

## Separate local runtime state

The local Django runtime reported one unapplied `smart_vote` migration.
This is a database state item, not an application-code patch.

No ethiKos / EkoH / Smart Vote ownership or source-truth contract is changed.
