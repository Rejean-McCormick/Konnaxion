# Wave 2E — Playwright context isolation

## Classification

`platform_readiness`

The observed failure is not currently supported as a product/API defect:
the route prewarm remained HTTP 200 and backend runtime evidence showed healthy
API responses before the Playwright renderer reported `Page crashed`.

## Harness change

Wave 2 remains one large campaign, but runtime qualification is now split into
independent Playwright tests:

- prewarm route families;
- keenKonnect runtime/API;
- Kreative runtime/API;
- Kontrol runtime/API;
- source-gap audit.

Each runtime test receives a fresh BrowserContext/Page from Playwright.
Failure in one runtime block does not prevent evidence collection from later
blocks.

## Exit interpretation

- Crash reproducible inside one isolated module:
  candidate `targeted_bugfix` for that module/route.
- Crash disappears under isolated contexts:
  confirmed harness/resource-orchestration issue under `platform_readiness`.
- API 4xx/5xx or page runtime error remains:
  classify and fix from the concrete evidence.
