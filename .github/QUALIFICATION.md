# GitHub qualification layout

This directory is the first GitHub-hosted execution layer for KonnaxionDiag.

## Authority

GitHub Actions supplies a disposable Ubuntu runner, PostgreSQL and Redis.
KonnaxionDiag remains the diagnostic authority for PASS/WARN/FAIL.

The automatic CI workflow exposes three checks:

- `KonnaxionDiag self-test`
- `KDiag precommit gate`
- `KDiag backend gate`

`full-qualification.yml` is manual during bootstrap. It runs the existing
`full-local` campaign after creating a fresh database and the repository's
existing Ethikos Playwright seed.

## Pinned companion source revisions

- Konnaxion_Worlds: `ab2bea2a915a529c30fd69fb45386e1842861836`
- Konnaxion_Capsule_Manager: `790fb20ba041cf9ed7ed31f10be96ee2284c43a7`
- KonnaxionDiag: `97510540c14d69f7aedbb7e9c18eff3ce083250a`

The Konnaxion event commit is always the commit that triggered the workflow.
Konnaxion_Worlds is additionally verified against `WORLD_ENGINE.lock.json`
using `scripts/check_worlds_dependency.py`.

When a companion repository is intentionally upgraded, update its SHA in both
workflow files in the same Konnaxion change.

## Evidence

Every KonnaxionDiag campaign uploads `.konnaxiondiag/current/` plus a
`components.txt` file containing the exact Git revisions and tool versions.

The full-local workflow also uploads Playwright artifacts when present.

## Release gate intentionally not automated yet

This overlay does **not** run `release-all` against production. S05-S14 require
remote host identity, SSH trust, signed Capsule Manager evidence, recovery
attestations and release-signing/trust material. Wiring those into GitHub before
the local hosted gates are stable would create a misleading release surface.

After `precommit`, `backend`, and `full-local` are stable on GitHub, add the
protected-environment release workflow as a separate change.
