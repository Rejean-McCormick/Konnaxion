# Bug Harvest Wave 2C — 2026-09-06

## Input evidence

Wave 2B established:
- all expanded prewarm routes returned HTTP 200;
- source audit: blocking=0, declared-deferred=108;
- keenKonnect project creation reached HTTP 201;
- the runtime workflow then exhausted the 360s test timeout waiting for the
  `Other` option in the Submit Creative Work category Select;
- because the test timeout closed the browser context, the following Kontrol
  step failed while reading cookies and is not classified as a Kontrol API defect;
- the backend log contains no artwork/collab POST after that point;
- Track Project Impact emitted a `Tabs.TabPane` deprecation warning.

## Fix classification

- harness robustness: targeted bugfix / platform readiness
- `Tabs.TabPane`: tech debt cleanup
- Ant Design static message context on real Kreative mutations: tech debt cleanup
- stale `Harvest2 ...` records after interrupted runs: test hygiene

No product ownership boundary changes are introduced.
No missing backend contract is invented.
Declared preview/read-only surfaces remain declared deferred.

## Required validation

Run only the Wave 2 targeted harvest. A successful pass must prove:
- source audit remains blocking=0;
- real Artwork POST succeeds and is cleaned;
- real CollabSession POST succeeds and is cleaned;
- Kontrol real read endpoints remain healthy;
- no runtime finding remains in the targeted Wave 2 surfaces.
