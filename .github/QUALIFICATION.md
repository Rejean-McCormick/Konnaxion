# GitHub qualification layout

Konnaxion uses two deliberately different GitHub execution layers.

## 1. Automatic FAST CI

`.github/workflows/ci.yml` runs on normal pushes and pull requests.
It tests **Konnaxion itself**, without checking out KonnaxionDiag,
Konnaxion_Worlds or Capsule Manager.

It exposes two product-health checks:

- `Backend fast`: Django system check + the Konnaxion backend pytest suite on
  clean PostgreSQL and Redis services.
- `Frontend fast`: frozen pnpm install + TypeScript typecheck + Jest tests +
  production Next.js build.

The purpose is fast, trustworthy feedback. A normal development push should not
fail because release metadata, an external companion repository, or a
supply-chain qualification is temporarily incomplete.

Documentation-only and cinematic-only pushes are intentionally ignored by the
automatic workflow.

## 2. Manual DEEP qualification

`.github/workflows/full-qualification.yml` remains manual (`workflow_dispatch`).
It checks out the pinned companion repositories, proves KonnaxionDiag before
trusting it, creates a clean runtime database and runs the existing `full-local`
campaign.

Use it at checkpoints and before release-oriented work, not as a tax on every
small development commit.

### Pinned companion revisions

- Konnaxion_Worlds: `ab2bea2a915a529c30fd69fb45386e1842861836`
- Konnaxion_Capsule_Manager: `790fb20ba041cf9ed7ed31f10be96ee2284c43a7`
- KonnaxionDiag: `97510540c14d69f7aedbb7e9c18eff3ce083250a`

When a companion repository is intentionally upgraded, update its SHA in the
manual deep-qualification workflow in the same Konnaxion change.

## Release qualification

Release-only concerns such as immutable production images, remote host identity,
SSH trust, signed Capsule Manager evidence, recovery attestations and signing
material belong to an explicit release workflow/operation. They are not part of
the normal automatic development CI.

## GitHub-hosted security

CodeQL should be enabled with GitHub's **Default setup** and left informative
(no required merge gate while Konnaxion is under rapid solo development).
Secret scanning / push protection should remain enabled for the public repo.

See `ONLINE_SETUP.md` in the engineering pack for the one-time account/UI steps.
