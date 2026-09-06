# ethiKos / EkoH / Smart Vote — Delivery Workflow

## Purpose

This is the release-acceptance golden path for the currently demonstrable Konnaxion civic-decision slice.

It does **not** replace the existing smoke and technical workflows. It composes the already-green behaviors into one delivery proof while preserving their test isolation.

## Architectural invariants proved

- ethiKos owns the source deliberation state.
- EkoH supplies contextual/domain expertise and disclosure context.
- Smart Vote reads the source state and returns a separate declared advisory reading.
- The public baseline remains visible and distinct from the advisory reading.
- A declared recusal remains in the source baseline while receiving advisory weight `0.00×`.
- Authentication is real and a user can write a canonical ethiKos stance.
- Public Decide writes the canonical stance rather than a client-authored derived weight.
- No legacy Kialo/Kintsugi/Korum API-owner route drift is accepted.
- No unexpected 4xx/5xx, page error, or runtime/build error is accepted.

## Why the workflow uses two seeded topics

The cinematic topic is intentionally deterministic. Its baseline/readings assert seven source stances, six advisory participants, and one declared recusal. The delivery workflow therefore treats it as **read-only**.

A separate seeded workflow topic (`Should public datasets require consent receipts?`) is used for the authenticated write proof. Its stance is upserted, so repeated delivery runs do not grow duplicate stance rows.

This preserves the cinematic Smart Vote evidence while still proving real authenticated participation.

## Automated path

1. Authenticate through the existing `auth.setup.ts` flow.
2. Verify `/api/users/me/`.
3. Open Deliberate · Elite.
4. Open the Canada/US cinematic topic.
5. Verify the structured argument thread and moderation scene.
6. Open Réjean's EkoH context and verify contextual/domain expertise.
7. Open the emergent AI-access governance question.
8. Verify conflict evidence and voluntary recusal.
9. Open Smart Vote readings and verify:
   - 7 source stances;
   - 6 advisory participants;
   - 1 declared recusal;
   - King Klown advisory weight `0.00×`;
   - the contextual-expertise principle.
10. Verify the Smart Vote API exposes:
    - baseline;
    - a declared reading;
    - `reading_key`;
    - `lens_hash`;
    - `snapshot_ref`.
11. Open the separate authenticated participation topic.
12. Change and save the user's topic stance through the real UI.
13. Open Decide · Public, select Agree, and cast the vote through the real UI.
14. Open and verify the delivery surfaces:
    - Decide · Results;
    - Voting methodology;
    - EkoH trust/profile;
    - Impact tracker;
    - Pulse · Overview;
    - Ethikos overview/Insights.
15. Write machine-readable delivery evidence.

## Commands

Headless acceptance gate:

```powershell
cd C:\mycode\Konnaxion\Konnaxion\frontend
pnpm run delivery:ethikos
```

Visible demonstration:

```powershell
cd C:\mycode\Konnaxion\Konnaxion
.\RUN_ETHIKOS_DELIVERY_WORKFLOW.ps1 -Headed
```

Open the last HTML report:

```powershell
cd C:\mycode\Konnaxion\Konnaxion\frontend
pnpm run delivery:ethikos:report
```

## Required local runtime

- Django: `http://localhost:8000`
- Next.js: `http://localhost:3000`
- the standard `ethikos_seed_user` test account, unless overridden by environment variables;
- the Kintsugi Wave 1 / Canada-Québec demonstration seed;
- the authenticated workflow seed topic.

Do not mix `localhost` and `127.0.0.1` between frontend and backend for this acceptance run. The test fails early with a clear message when their cookie hostnames differ.

## Environment overrides

Optional:

```text
BACKEND_BASE_URL
SMOKE_BASE_URL
PLAYWRIGHT_AUTH_STATE
ETHIKOS_TEST_USERNAME
ETHIKOS_TEST_EMAIL
ETHIKOS_TEST_PASSWORD
ETHIKOS_DELIVERY_CINEMATIC_TOPIC_TITLE
ETHIKOS_DELIVERY_CINEMATIC_TOPIC_ID
ETHIKOS_DELIVERY_WRITE_TOPIC_TITLE
ETHIKOS_DELIVERY_WRITE_TOPIC_ID
```

## Evidence output

The test creates:

```text
frontend/artifacts/ethikos-delivery-workflow/
```

including screenshots and:

```text
delivery-evidence.json
```

The JSON records the authenticated user, both topic IDs, Smart Vote reading identity/hash/snapshot information, visited routes, write proof, and runtime findings.

The Playwright HTML report is written to:

```text
frontend/artifacts/playwright-delivery-html/
```

## Success criterion

The delivery gate is green only when:

- auth succeeds;
- the cinematic topic and its EkoH/Smart Vote evidence are present;
- real stance/vote writes succeed;
- the delivery surfaces load without runtime findings;
- Smart Vote exposes a real declared reading with lens and EkoH snapshot identity.

Expected console summary is two passed tests because Playwright reports the auth setup dependency and the single delivery acceptance spec separately:

```text
2 passed
```
