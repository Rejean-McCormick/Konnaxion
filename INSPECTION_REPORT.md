# Konnaxion V4.1.3 walkthrough inspection / repair report

## Scope

Source inspected from the 2026-08-20 Konnaxion snapshot rooted at `C:\mycode\Konnaxion\Konnaxion`, plus the supplied Cinematic Engine Pack.

No Konnaxion architecture or unrelated product module was changed.

## Existing walkthrough / automation stack found

### Native Konnaxion Playwright

- `frontend/tests/ethikos-wave1-workflow.spec.ts` — real-page / real-UI workflow; **best smoke foundation**.
- `frontend/tests/ethikos-wave1-demo.spec.ts` — focused route/demo smoke.
- `frontend/tests/ethikos-authenticated-workflow.spec.ts` — authenticated write-path workflow.
- `frontend/_e2e/ethikos-korum-deliberate.spec.ts` — older/mock-heavy Korum/Deliberate e2e coverage; useful regression coverage but not the final walkthrough driver.
- `frontend/playwright.smoke.config.ts` — smoke project; includes the Wave 1 demo/workflow specs.
- `frontend/playwright.config.ts` — general Playwright config.

### Supplied capture tool

`Cinematic Engine Pack` manifest version `0.2.0`, with:

- Control Center;
- Director;
- Renderer;
- Cue Studio;
- Auth Capture;
- Python Playwright driver;
- FFmpeg muxing;
- `examples/konnaxion/cinematic/tours/carney`.

This is the most recent supplied **capture/cinematic engine**, but its Konnaxion `carney` example predates the V4.1.3 UI and expects generic `data-cinematic` anchors that are not the current walkthrough surface.

## Recency / V4.1.3

The repository backup chronology contains:

- `ethikos_ekoh_v4_1_walkthrough_access_20260820_131813`
- `ethikos_ekoh_v4_1_1_walkthrough_access_20260820_133822`
- `ethikos_ekoh_v4_1_2_walkthrough_access_20260820_135057`
- `ethikos_ekoh_v4_1_3_frontend_access_20260820_141837`

Comparing the V4.1.3 frontend-access backup to current files shows a narrow access/display hotfix, not a walkthrough route rewrite. The current walkthrough components and their stable test IDs remain present.

## Current V4.1.3 route / selector anchors used

| Purpose | Current route / anchor |
| --- | --- |
| Expert deliberation list | `/ethikos/deliberate/elite?sidebar=ethikos` |
| Topic detail | `/ethikos/deliberate/[topic]` |
| EkoH drawer | `[data-testid="ekoh-context-drawer"]` |
| Emergent question card | `[data-testid="emergent-question-card"]` |
| Open emergent question | `[data-testid="open-emergent-question"]` |
| Smart Vote panel | `[data-testid="smart-vote-readings-panel"]` |
| Expand readings | `[data-testid="view-readings-button"]` |
| Baseline | `[data-testid="baseline-reading-card"]` |
| Expertise reading | `[data-testid="expertise-reading-card"]` |
| Pulse ending | `/ethikos/pulse/overview?sidebar=ethikos` |

The Canada topic is resolved from its visible title/row, not from a hard-coded database id. The Trump question is entered through the existing emergent-question UI.

## Narrative data verified in the V4.1.3 seed

The current seed contains the requested sequence:

- Canada/U.S. autonomy question;
- King Klown AI-infrastructure proposal;
- Réjean consultation-first reply;
- `C'est déjà annoncé.`;
- large AI/energy/international/KristALL announcement;
- Inquisiteur moderation;
- emergent Trump service-access question;
- King Klown conflict disclosure and advisory-only recusal;
- DEMO FICTION background report as a source/context record rather than a new argumentative claim.

The UI also exposes public demo EkoH ratings, contextual alignment, relevant domains, advisory status/weight, baseline/advisory cards and participant recusal details.

## Repairs made

### 1. Existing real-UI Playwright smoke extended

`frontend/tests/ethikos-wave1-workflow.spec.ts` now follows the requested demo path when the walkthrough seed is present:

Canada topic → narrative sequence → Réjean EkoH drawer → Trump emergent question → DEMO FICTION background source → recusal → Smart Vote readings.

It asserts the expected walkthrough counts:

- baseline: 7 source stances;
- advisory: 6 participants;
- 1 declared recusal;
- King Klown: Recused, advisory weight `0.00×`.

The prior generic fallback remains intact for environments without the walkthrough seed.

### 2. Cinematic Engine locator consistency fix

The engine originally used Playwright locators for `click`, `hover`, `wait_visible` and `mouse_move`, but browser `document.querySelector()` for `scroll`, `scroll_to` and `highlight`.

That meant Playwright selector syntax such as `:has-text()` could work for a click and fail for a cinematic scroll/highlight on the same target.

The supplied patched engine resolves target-based `scroll`, `scroll_to` and `highlight` through `page.locator(...).first` as well. No Konnaxion component needed new cinematic-only attributes.

### 3. V4.1.3 cinematic tour created

`cinematic/tours/ethikos-v413/` includes:

- `script.json` — narration blocks;
- `narration.mp3` — timing/rehearsal voice only;
- `cues.json` — cue-complete timing (~3:03);
- `targets.json` — current V4.1.3 selectors;
- `timeline.json` — slower scroll/highlight/click choreography;
- `tour.json`.

The ending uses Pulse Overview.

## Validation completed in this environment

Passed:

- Cinematic Engine tour contract validation;
- Cinematic Engine Python compilation;
- Cinematic Engine unit tests: **5 passed**;
- synthetic Chromium locator/action smoke exercising Playwright text and `:has-text()` selectors through `scroll_to`, `highlight`, `wait_visible`, and `click`;
- TypeScript syntactic transpile of the modified workflow spec.

Not possible here:

- a real Konnaxion V4.1.3 browser smoke;
- a real V4.1.3 browser recording;
- final ElevenLabs narration generation.

Reason: this sandbox does not expose the user's running backend/frontend. `validate --check-app` correctly reports `http://localhost:3000` as connection refused. A static source snapshot cannot replace that runtime check.

## Exact real-runtime run order

From the Konnaxion workstation, with backend/frontend and the V4.1.3 seed already running:

```powershell
cd C:\mycode\Konnaxion\Konnaxion\frontend
$env:WAVE1_STRICT_UI='1'
npx playwright test -c playwright.smoke.config.ts --project=chromium tests/ethikos-wave1-workflow.spec.ts
```

Only after this passes, use the patched Cinematic Engine:

```powershell
python -m cinematic_engine.cli validate C:\mycode\Konnaxion\Konnaxion\cinematic\tours\ethikos-v413\tour.json --check-app
python -m cinematic_engine.cli rehearse C:\mycode\Konnaxion\Konnaxion\cinematic\tours\ethikos-v413\tour.json
python -m cinematic_engine.cli record C:\mycode\Konnaxion\Konnaxion\cinematic\tours\ethikos-v413\tour.json
python -m cinematic_engine.cli render C:\mycode\Konnaxion\Konnaxion\cinematic\tours\ethikos-v413\tour.json
```

For the final voice, replace the rehearsal `narration.mp3`, restamp `cues.json` in Cue Studio if timing changes, rehearse again, then record/render.
