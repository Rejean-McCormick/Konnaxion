


Konnaxion Platform – Definitive Parameter Reference (v14‑stable)
 All TBD values are now fixed; names follow Cookiecutter‑Django conventions (UPPER_SNAKE for settings.py, DJANGO_…/APP_… for .envs files, choices= enums in models). Nothing here adds new tables, routes or functions – it only freezes configuration knobs already implied in the v14 spec.

## 0  Global / Core (shared by all apps)

## 1  Kollective Intelligence
### 1.1 EkoH (engine)
These weights are the initial coefficients for the multidimensional_scoring service and correspond 1‑for‑1 with “quality, frequency, relevance, expertise” axes defined in the functionality inventory .
### 1.2 Smart Vote (engine)

## 2  ethiKos
These close every “TBD” noted in the ethiKos spec (stance granularity, expert quorum, moderation trigger) .

## 3  keenKonnect
All map directly to features in the technical spec and functionalities table .

## 4  KonnectED

## 5  Kreative

## 6  Navigation & Route Invariants
The 24 routes enumerated in the Navigation Map are locked; any new path must be added via RFC process. Route‑to‑app ownership table:
No additional frontend pages may claim these prefixes without amending this reference .

## 7  Environment‑variable Matrix (cookiecutter‑compatible)
Add these to .envs/.local/.django; production overrides live in .envs/.production/.django.

### How this document will be maintained
Immutable commit rule: Once merged into docs/parameter_reference.md, changes require a pull‑request labelled “param‑change” and approval from both backend & frontend leads.
CI guard: A lint step asserts that settings.* and model enums keep the values defined here.
Version tag: Each future alteration bumps a PARAM_VERSION env var so containers can invalidate caches.


