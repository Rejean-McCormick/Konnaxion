# Konnaxion Bug Harvest Wave 2D

## Incoming evidence

Wave 2C:
- route prewarm: all targeted routes HTTP 200;
- source-gap audit: blocking=0, declared-deferred=108;
- backend admin/Kontrol endpoints: healthy;
- stale Harvest2 project cleanup: verified;
- runtime blockers reduced to:
  1. AntD Select harness selection stayed on `Art` instead of `Other`;
  2. React.Fragment `autoFocus` warning on two preview-heavy KeenKonnect pages.

No Kreative artwork or CollabSession POST had yet occurred because the harness
stopped before form submission.

## 2D changes

- AntD category selection now targets the visible dropdown option directly.
- The selected value remains asserted before submit.
- The exact `React.Fragment` + `autoFocus` compatibility warning is retained in
  logs as `HARVEST2 DEPENDENCY-WARNING` but does not fail the product runtime gate.
- The React-19-specific Ant Design runtime patch import is removed from the root
  layout because this frontend is still on React 18.
- No product persistence contract is invented or broadened.

## Exit criterion

The next Wave 2 run must reach:
- real Artwork POST 2xx + cleanup;
- real CollabSession POST 2xx + cleanup;
- Kontrol API checks;
- source audit blocking=0.
