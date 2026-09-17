# Konnaxion Status Report — 2026-09-17

## Executive Summary

The Konnaxion production validation phase advanced materially on 2026-09-17.

The local ethiKos / EkoH / Smart Vote dataset was promoted into the `konnaxion-prod` production instance only after a successful rollback preview and a tested PostgreSQL backup. The real import completed successfully and was then independently re-inspected from production.

The production `www.konnaxion.com` Django host issue was also corrected. During that work, a second configuration gap was found: CSRF origin values existed in runtime environment files but were not being loaded into Django settings. The live production container was patched and validated, and a permanent source patch was applied locally to both the Konnaxion and Konnaxion Capsule Manager repositories. The new regression test passes `4/4`.

**Current state:** production data promotion validated; public ethiKos API validated; `www.konnaxion.com` accepted by Django; CSRF trusted origins validated in the live runtime; permanent source patch tested locally.

**Important persistence note:** the permanent source patch has not yet been rebuilt and redeployed to production. The current production runtime is correct, but part of the CSRF fix in the running container is a live patch and can be lost if the Django container is later recreated from an older, unpatched image.

---

## 1. Production Data Promotion — ethiKos / EkoH / Smart Vote

### Source promotion pack

Validated local promotion pack:

`C:\Users\rejea\Downloads\diagnostics\ethikos-local-packs\20260917-100505\ethikos-local-promotion.zip`

Pack SHA-256:

`04c75704a4fe0d6c36f4253b2b39fd659e56efdc3b17cdaf875f41a64b9a6486`

Fixture SHA-256:

`98b490dc28fa1f2375d5d383428f5d59aba23092afe402185e7bbecc71f4f114`

Fixture validation:

- 1,574 fixture objects;
- 104 users;
- user PK range 1–116;
- 34 PK-based user score rows validated;
- no fixture validation blockers;
- no pending local migrations.

The promotion scope included users, ethiKos, EkoH, Smart Vote, and linked legacy collective-intelligence data.

Security characteristics of the fixture:

- contains password hashes: yes;
- contains email addresses: yes;
- contains sessions: no;
- contains MFA secrets: no;
- contains social tokens: no;
- copies media files: no.

### Pre-import production state

Before import, the target application data was empty except for canonical bootstrap rows:

- `kollective_intelligence.ExpertiseCategory`: 8 bootstrap rows;
- `smart_vote.VoteModality`: 5 bootstrap rows.

The production instance had 0 users and no ethiKos topics, stances, or arguments.

### Rollback preview

The production preview completed successfully with:

- `mode = preview`;
- `ok = true`;
- `rolled_back = true`;
- `unsafe_non_empty = {}`;
- SSH return code 0;
- exact expected promotion-pack SHA-256.

The bootstrap rows were recognized as canonical, removed only inside the preview transaction, replaced by the fixture, validated, and rolled back.

### Real import

The real production promotion completed successfully with:

- `mode = import`;
- `ok = true`;
- `rolled_back = false`;
- `unsafe_non_empty = {}`;
- SSH return code 0;
- exact same validated promotion-pack SHA-256.

No second import should be performed against the now-populated production database.

---

## 2. Pre-Promotion PostgreSQL Backup and Restore Test

A dedicated production database backup was created before the real import.

Local dump:

`C:\Users\rejea\Downloads\konnaxion-prod-backups\pre-ethikos-20260917-112239.dump`

Manifest:

`C:\Users\rejea\Downloads\konnaxion-prod-backups\pre-ethikos-20260917-112239.json`

SHA-256:

`ab45a4029a80adb3e396162d71e50a5fe2692877f6ab8063c8132f9c3b8ae458`

Size:

`426894` bytes

Restore validation:

- temporary PostgreSQL restore database created successfully;
- `pg_restore` completed successfully;
- restored `django_migrations`: 101;
- restored non-system tables: 118;
- temporary restore database removed after validation.

This backup should be retained through the next rebuild/redeploy validation cycle.

---

## 3. Post-Import Production Inspection

The targeted production inspector completed successfully after import.

### Public ethiKos API probes

The following endpoints returned HTTP 200:

- `/api/ethikos/topics/`
- `/api/ethikos/categories/`
- `/api/ethikos/stances/`
- `/api/ethikos/arguments/`

### Validated production counts

| Area | Production count |
|---|---:|
| Users | 104 |
| ethiKos topics | 22 |
| ethiKos categories | 14 |
| ethiKos stances | 117 |
| ethiKos arguments | 145 |
| ethiKos demo scenario imports | 533 |
| EkoH expertise categories | 52 |
| EkoH expertise scores | 195 |
| EkoH ethics scores | 31 |
| EkoH rating visibility rows | 31 |
| Smart Vote consultations | 14 |
| Smart Vote relevance rows | 79 |
| Smart Vote source bindings | 14 |

Migration state:

- pending Django migrations: 0;
- pending targeted migrations: 0.

The post-import counts match the validated preview/local source counts for the promoted models.

---

## 4. `www.konnaxion.com` / Django `ALLOWED_HOSTS`

The production logs contained repeated historical errors:

`django.core.exceptions.DisallowedHost: Invalid HTTP_HOST header: 'www.konnaxion.com'`

The active production environment originally contained:

`DJANGO_ALLOWED_HOSTS=konnaxion.com,localhost,127.0.0.1,django-api,kx-konnaxion-prod-django-api`

The active runtime environment files were updated to include:

`www.konnaxion.com`

The Django API container was recreated without recreating PostgreSQL.

Runtime validation after the change:

- Django process environment includes `www.konnaxion.com`;
- `https://www.konnaxion.com/api/ethikos/topics/` returns HTTP 200.

Historical `DisallowedHost` lines can still appear in old container logs and should not be treated as current failures unless new timestamps reproduce the error.

---

## 5. CSRF Trusted Origins — Live Runtime Fix

The active environment files already contained CSRF origin variables, but Django reported:

`CSRF_TRUSTED_ORIGINS = []`

This established that the environment value existed but was not being consumed by production Django settings.

The active runtime origin list was updated to include:

`https://www.konnaxion.com`

The live production Django settings were then patched to load:

`DJANGO_CSRF_TRUSTED_ORIGINS`

Final live runtime validation:

```text
ALLOWED_HOSTS = ['konnaxion.com', 'localhost', '127.0.0.1', 'django-api', 'kx-konnaxion-prod-django-api', 'www.konnaxion.com']
CSRF_TRUSTED_ORIGINS = ['https://konnaxion.com', 'http://konnaxion.com', 'https://127.0.0.1', 'http://127.0.0.1', 'https://localhost', 'http://localhost', 'https://www.konnaxion.com']
www API: HTTP 200
```

No PostgreSQL or ethiKos data changes were involved in this host/CSRF remediation.

---

## 6. Permanent Source Patch

A permanent local source patch was applied on 2026-09-17.

Patch identity:

`www-csrf-permanent/v1`

Changed files:

- `Konnaxion\backend\config\settings\production.py`
- `Konnaxion_Capsule_Manager\kx_agent\instances\secrets.py`
- `Konnaxion_Capsule_Manager\kx_agent\instances\env_writer.py`
- `Konnaxion_Capsule_Manager\tests\test_www_csrf_alias_regression.py`

Patch effects validated by the patch tool:

- production Django reads `DJANGO_CSRF_TRUSTED_ORIGINS`;
- legacy secret/env writer adds apex + `www` aliases;
- canonical env writer adds apex + `www` aliases;
- IP and `sslip.io` targets do not receive a synthetic `www` alias;
- syntax check: PASS.

Patch backup/report directory:

`C:\mycode\Konnaxion\Konnaxion_Capsule_Manager\diagnostics\source-patches\www-csrf-20260917T174011Z`

Regression test:

```text
python -m pytest tests\test_www_csrf_alias_regression.py -q
.... [100%]
4 passed in 0.15s
```

### Deployment caveat

The permanent source patch is validated **locally** but is not yet confirmed as built into a new production image/capsule and redeployed.

Until that happens:

- the current production runtime is correct;
- the manually patched `production.py` inside the live container can be lost on container recreation;
- generated environment files can also be rewritten by an older Capsule Manager build.

The next build/deploy must therefore use the patched Konnaxion and Capsule Manager sources.

---

## 7. Capsule Manager Backup Action — Known Issue

The Capsule Manager GUI backup action remains a known implementation issue.

Observed behavior:

- Manager submitted `instance.backup`;
- the agent returned `KX_AGENT_ACTION_NOT_ALLOWED`;
- the action enum exists, but no `instance.backup` handler was registered in the inspected source snapshot.

This was not a user-input error. A dedicated database backup/restore-test utility was used successfully as the safe workaround for the ethiKos promotion.

The Capsule Manager backup-action registration should be corrected separately before relying on the Manager GUI for production backup creation.

---

## 8. Current Validation Matrix

| Area | Status |
|---|---|
| SecurityDiag release gate S14 | PASS (2026-09-12) |
| Production DB migrations | PASS — 0 pending |
| Pre-promotion DB backup | PASS |
| Backup restore test | PASS |
| ethiKos promotion preview | PASS — rolled back |
| ethiKos real production import | PASS — committed |
| Post-import production inspector | PASS |
| Public ethiKos API | PASS — HTTP 200 |
| `www.konnaxion.com` Django host | PASS in current runtime |
| CSRF trusted origins | PASS in current runtime |
| Permanent source patch | PASS locally |
| WWW/CSRF regression tests | PASS — 4/4 |
| Permanent patch rebuilt/redeployed | **PENDING** |
| Capsule Manager GUI backup create | **KNOWN ISSUE** |

---

## 9. Recommended Next Actions

1. Review and commit the permanent WWW/CSRF source patch in both repositories.
2. Build the next Konnaxion image/capsule from the patched source.
3. Ensure the production Capsule Manager/agent version used for regeneration also contains the patched env-generation logic.
4. Redeploy/recreate `django-api` through the normal deployment path from the patched artifact.
5. Re-run the production inspector and verify:
   - 104 users;
   - 22 ethiKos topics;
   - 117 stances;
   - 145 arguments;
   - 195 EkoH expertise scores;
   - 31 EkoH ethics scores;
   - 14 Smart Vote bindings;
   - 0 pending migrations.
6. Re-check live Django settings after the normal redeploy:
   - `www.konnaxion.com` present in `ALLOWED_HOSTS`;
   - `https://www.konnaxion.com` present in `CSRF_TRUSTED_ORIGINS`.
7. Correct the missing Capsule Manager `instance.backup` handler and retest the GUI backup workflow.
8. Keep the pre-promotion backup and manifest until the rebuilt/redeployed runtime has passed final verification.

---

## Closure State — 2026-09-17

The ethiKos / EkoH / Smart Vote production data promotion is complete and verified.

The live `www.konnaxion.com` host and CSRF configuration is working and returns HTTP 200 for the public ethiKos API.

The corresponding permanent source patch is applied locally and regression-tested successfully. The remaining release-engineering task is to rebuild/redeploy from those patched sources so the live fix becomes artifact-level persistent rather than partly runtime-local.
