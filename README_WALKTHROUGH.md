# Konnaxion / Ethikos V4.1.3 walkthrough delivery

This bundle updates the existing walkthrough stack instead of adding a new product architecture.

## What changed

1. `frontend/tests/ethikos-wave1-workflow.spec.ts` extends the existing real-UI smoke with the Canada → Réjean EkoH → Trump → recusal → Smart Vote path. It resolves the Canada topic by visible title instead of a hard-coded topic id.
2. `ethikos-v413-walkthrough.patch` is the same change as a unified diff.
3. `cinematic/tours/ethikos-v413/` is a V4.1.3 tour for the existing Cinematic Engine.
4. The accompanying `CinematicEnginePack_v413.zip` contains one engine fix: `scroll`, `scroll_to`, and `highlight` now resolve targets through Playwright locators, like `click` and `wait_visible`. This permits stable `data-testid`, text, role and `:has-text()` selectors consistently.

No Konnaxion architecture or application component is changed by this bundle.

## Rehearsal narration

`narration.mp3` is a locally generated timing/rehearsal voice so that the tour is immediately cue-complete. It is not intended as the final ElevenLabs take. The supplied Cinematic Engine delegates TTS generation externally, so replace `narration.mp3` with the final narration and restamp `cues.json` in Cue Studio before the final recording if the duration changes.

## Run order on the V4.1.3 workstation

1. Start the normal backend and frontend with the V4.1.3 seed already loaded.
2. Run the Playwright smoke **without recording** first: `npx playwright test -c playwright.smoke.config.ts --project=chromium tests/ethikos-wave1-workflow.spec.ts` with `WAVE1_STRICT_UI=1`.
3. Copy/merge the `cinematic` directory and `cinematic.project.json` at the Konnaxion repo root.
4. Use the patched Cinematic Engine pack to `validate --check-app`, then `rehearse`, then `record`; render only after a clean rehearsal.
5. Keep a fixed 1920×1080 viewport, clean browser profile, no devtools and no notifications.

## Intended path

Konnaxion home → Ethikos expert deliberation → Canada/U.S. autonomy → King Klown / Réjean / moderation → Réjean EkoH drawer → Trump emergent question → DEMO FICTION background → King Klown recusal → Smart Vote baseline vs relevant-expertise → Pulse overview.

## Runtime requirement

A real smoke/recording requires the V4.1.3 application to be reachable at the configured base URL (default `http://localhost:3000`). Static/engine validation cannot substitute for that runtime check.
