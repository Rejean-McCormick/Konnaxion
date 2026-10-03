# Konnaxion pre-launch security review — 2026-10-03

## Gate

Do **not** expose the VPS to the public Internet until the dependency locks are regenerated, the production images are pinned by digest, secrets are rotated, privileged accounts have MFA, and the external/host security checks are rerun against the rebuilt host.

## Code fixes in this snapshot

- Private World media (`/media/worlds/...`) now traverses Django authorization before file serving.
- KREATIVE artwork media additionally requires authentication; unapproved tradition media is restricted to submitter/staff even inside an otherwise public World.
- Trust credential documents (`/media/trust/credentials/...`) are owner/staff-only and forced to attachment responses.
- Production `DEBUG` is hard-disabled regardless of inherited environment values.
- Production HTTPS redirect, one-year HSTS (+ subdomains/preload), nosniff and COOP are hard fail-closed; wildcard `ALLOWED_HOSTS` is rejected at startup and the frontend origin must be credential-free HTTPS.
- Redis/Celery TLS uses certificate validation (`CERT_REQUIRED`) instead of `CERT_NONE` whenever `rediss://` is configured.
- Interaction Kernel outbound bearer-token delivery refuses cleartext HTTP outside DEBUG localhost.
- Server fetch logging no longer records full URLs/query strings.
- Frontend capsule builds now require the committed pnpm lock (`--frozen-lockfile`) instead of silently resolving a different dependency graph.
- `.konnaxiondiag/` evidence is explicitly ignored by Git.
- MFA recovery codes are one-time display and trusted-browser bypass remains disabled.
- django-allauth trusts exactly one Traefik proxy hop for client-IP rate limiting, and Redis cache failures no longer silently disable rate-limit state.
- Direct security dependency pins are raised to Next.js 15.5.27 (Maintenance LTS security release), Django 5.2.17 LTS and django-allauth 65.19.7.

## Required local regeneration before build

The SmartSnap intentionally does not contain the live lockfiles. In the real repository regenerate and review them after applying this snapshot/patch:

- Frontend: `pnpm install --lockfile-only` (then `pnpm install --frozen-lockfile`, typecheck, lint, test, build).
- Backend: regenerate `uv.lock` using the project's normal `uv` workflow, then run Django checks, migrations check, pytest and mypy.

Do not deploy a manifest change with an old lockfile.

## Remaining deployment gates

- Pin every non-local production container image/base image by immutable `sha256` digest and rebuild from current supported images.
- Rotate all passwords, API tokens, Django secret, database credentials, Redis credentials, SMTP/Sentry/third-party credentials and deployment/signing keys that existed before either compromise.
- Revoke old sessions/tokens and rebuild the VPS from a clean image instead of trusting the previous filesystem.
- Require MFA for staff/superusers before opening admin access.
- Keep Redis/PostgreSQL private to the Docker network; expose only 80/443 publicly unless an explicit reviewed exception exists.
- Run the full KonnaxionDiag security campaign after rebuild, including SSH/firewall/listening-port/runtime/IOC/TLS/backup/restore checks.

## Local verification evidence (VPS offline)

KonnaxionDiag v4.2.4 `security-repo` was executed against this hardened snapshot on 2026-10-03:

- S00 Diagnostic Integrity: PASS
- S01 Target & Security Context: WARN only because SmartSnap has no `.git` directory.
- S02 Repository Secrets & Artifact Hygiene: PARTIAL only because Git inventory cannot be established from SmartSnap; the conservative tracked/untracked pattern scans themselves reported no secret matches.
- S03 Supply Chain: FAIL because SmartSnap omits live lockfiles and production/base container declarations are not pinned by immutable `sha256` digest.
- S04 Application Production Security: PASS
- S04W Web Trust & Authorization: PASS

Static post-compromise review also found no obvious reverse-shell/download-and-execute patterns, `shell=True`, `os.system`, hard-coded private keys, or common embedded API-token signatures in active backend/config source. This is evidence, not proof that no implant exists; a clean-host rebuild and runtime/IOC validation are still required.

## Supply-chain blockers observed in active source

The current production/container sources still reference mutable or obsolete families including `nginx:1.17.8-alpine`, `traefik:3.4.1`, `redis:6`, `postgres:15`, `python:3.12.10-slim-bookworm`, and mutable Node bases for the frontend capsule. Do not simply deploy these tags. Select supported versions, scan them, then pin the accepted multi-platform manifest digests in source and release evidence.
