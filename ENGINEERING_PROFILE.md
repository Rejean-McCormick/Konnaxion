# Engineering Profile

> Generated deterministically by RepoSurveyor from the current local project files. 
> This is a scale/engineering-surface characterization, not a quality score or release-readiness claim.

## Engineering Footprint

- **1,024** files in the active engineering surface
- **788** active source files
- **742** production source files
- **46** test source files
- **133** active documentation files
- **102,561** production nonblank physical source lines
- **6,972** test nonblank physical source lines
- **53** migration-related files
- **7** schema-related files
- **38** probable HTTP route declarations *(medium-confidence framework scan)*
- **207** statically detected test declarations *(not executed-test count)*

## Language Footprint

| Language | Nonblank physical source lines |
|---|---:|
| TypeScript | 80,997 |
| Python | 25,486 |
| HTML | 954 |
| PowerShell | 751 |
| JavaScript | 709 |
| CSS | 500 |
| Shell | 73 |
| SQL | 63 |

Method: RepoSurveyor extension classification + nonblank physical line count. Comments are included in this fallback measure.

## Structural Surface

| Area | Files | Source files | Docs | Nonblank source lines |
|---|---:|---:|---:|---:|
| `frontend` | 525 | 500 | 7 | 83,145 |
| `backend` | 340 | 284 | 16 | 25,629 |
| `scripts` | 2 | 2 | 0 | 592 |
| `(root)` | 19 | 1 | 3 | 88 |
| `tools` | 1 | 1 | 0 | 79 |
| `docs` | 107 | 0 | 107 | 0 |
| `PlantUML` | 19 | 0 | 0 | 0 |
| `cinematic` | 8 | 0 | 0 | 0 |
| `Structurizr` | 3 | 0 | 0 | 0 |

## Complexity

- Functions analyzed by Lizard: **4,982**
- Median cyclomatic complexity (CCN): **1**
- 95th percentile CCN: **19**
- Maximum CCN: **283**
- Functions with CCN > 15: **306**
- Method: Lizard XML function measure / CCN column

## Verification Surface

- Static test declarations: **207** — static language-aware declaration scan; not collected/executed/passed tests
- No supported existing coverage report detected.

## Detected Engineering Controls

- **Automated tests** — configured/detected via `backend/pyproject.toml`
- **Browser/E2E testing** — configured/detected via `frontend/playwright-smokeREADME.txt`, `frontend/playwright.config.ts`, `frontend/playwright.ct.config.ts` (+3 more)
- **Containerization** — configured/detected via `backend/compose/local/django/Dockerfile`, `backend/compose/local/docs/Dockerfile`, `backend/compose/production/django/Dockerfile` (+4 more)
- **Linting** — configured/detected via `backend/pyproject.toml`, `frontend/eslint.config.mjs`
- **Pre-commit hooks** — configured/detected via `backend/.pre-commit-config.yaml`
- **Static typing** — configured/detected via `backend/pyproject.toml`, `frontend/tsconfig.json`

## Analysis Scope

- Active surface: **1,024** files
- Excluded `archive-copy`: **724** files
- Excluded `diagnostic-evidence`: **513** files
- Excluded `generated-file`: **1** files
- Excluded `local-ignore`: **53** files
- Excluded `private-local`: **16** files
- Excluded `snapshot-noise`: **352** files
- Excluded `source-dump`: **2** files
- Pruned dependency/cache/generated directories: **74**

## Measurement Notes

- Generated: `2026-09-16T14:45:58.190845+00:00`
- RepoSurveyor survey schema: `1.0`
- Source model: current local filesystem; Git state/history is intentionally irrelevant.
- Archive copies, diagnostics, dependency caches, generated output, lockfiles and private local configuration are excluded from the active engineering surface.
- Tool/configuration presence is evidence of configured engineering infrastructure, not evidence that its latest run passed.
- Static test declarations are not the same as collected, executed or passing tests.
- Existing coverage reports are not treated as freshly measured coverage.
- RepoSurveyor never converts these measurements into a synthetic quality, maturity or architecture score.
