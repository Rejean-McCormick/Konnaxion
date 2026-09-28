# Konnaxion backend LevelUpDiag qualification — 2026-09-28

This dated report records the successful local backend qualification of Konnaxion through the LevelUpDiag `backend` campaign after remediation of the Konnaxion Worlds test boundary, isolated pytest runtime behavior on Windows, and strict-routing test assertions.

## Result

**QUALIFIED — local backend campaign PASS on 2026-09-28.**

The final sequential campaign completed with all selected diagnostic levels passing:

```text
LevelUpDiag Konnaxion — backend [sequential]
Sequence: N00 -> N01 -> N02 -> N04 -> N06 -> N11

N00 Control & Discovery       PASS
N01 Repository & Static      PASS
N02 Backend / Django / DB    PASS
N04 API Contracts            PASS
N06 Jobs / Redis / Celery    PASS
N11 Correlation & Triage     PASS

campaign backend: PASS
```

No blocking failure or residual warning remained in the final campaign result.

## Final qualification evidence

Observed final execution:

```text
[01/06] N00 Control & Discovery — PASS (0.4s)
[02/06] N01 Repository & Static — PASS (0.8s)
[03/06] N02 Backend / Django / DB — PASS (90.7s)
[04/06] N04 API Contracts — PASS (76.7s)
[05/06] N06 Jobs / Redis / Celery — PASS (67.4s)
[06/06] N11 Correlation & Triage — PASS (0.2s)
campaign backend: PASS
```

The campaign therefore provides current local evidence for the selected backend checks covering repository/static validation, Django/database execution, API contracts, Redis/Celery jobs, and final correlation/triage.

## Defects closed during qualification

The qualification sequence exposed and closed three independent defects before the final PASS.

### 1. Konnaxion Worlds WebSocket test crossed the repository boundary

The Worlds test suite attempted to import the host application WebSocket configuration directly:

```python
from config import websocket as websocket_config
```

That import belongs to the main Konnaxion host application and is not part of the standalone `Konnaxion_Worlds` bootstrap. The failure stopped pytest during collection.

Remediation:

- kept standalone Worlds WebSocket behavior under `Konnaxion_Worlds` ownership;
- removed the direct dependency on the main Konnaxion `config.websocket` module from the Worlds test;
- kept host-level `config.websocket` integration coverage on the Konnaxion side.

This restored the intended dependency direction:

```text
Konnaxion host
    ↓
config.websocket
    ↓
konnaxion.worlds services/runtime

not:

Konnaxion_Worlds
    ↓
Konnaxion host config.websocket
```

### 2. Isolated pytest runtime collided with the shared Windows temp directory

After the WebSocket collection issue was closed, pytest reached its cleanup phase but Windows denied access to the shared pytest temp pointer:

```text
PermissionError: [WinError 5] Access denied:
...\Temp\pytest-of-<user>\pytest-current
```

Remediation in LevelUpDiag:

- isolated Django pytest probes now use a dedicated `--basetemp` location under the LevelUpDiag working state;
- the probe no longer depends on pytest's shared `%TEMP%\pytest-of-<user>\pytest-current` path;
- database isolation behavior remains independent of the pytest filesystem temp location.

This removed the Windows-specific temp cleanup collision without suppressing real pytest failures.

### 3. Strict-routing tests used the wrong response API

Once the suite could execute normally, two strict-routing tests failed with:

```text
AttributeError: 'JsonResponse' object has no attribute 'json'
```

The middleware returned a Django `JsonResponse` directly. Server-side `JsonResponse` exposes serialized response content; `.json()` is associated with test-client style response objects, not the direct middleware response used by these tests.

Remediation:

```python
json.loads(response.content)
```

replaced the invalid direct call to:

```python
response.json()
```

After this correction, the Worlds backend suite no longer reported those strict-routing failures and the complete `N02 Backend / Django / DB` level passed.

## Qualified diagnostic path

```text
Repository discovery / static checks
        ↓
Django + database backend probes
        ↓
Konnaxion Worlds standalone backend tests
        ↓
OpenAPI contract tests
        ↓
Redis / Celery task tests
        ↓
Correlation and triage
        ↓
backend campaign PASS
```

The final result confirms that the selected diagnostic path can execute sequentially without the previously observed WebSocket import failure, Windows pytest-temp permission failure, or strict-routing assertion failure.

## Repository ownership confirmed

The remediation reinforced the intended ownership split:

- **Konnaxion** owns host/application integration such as `backend/config/websocket.py`.
- **Konnaxion_Worlds** owns standalone World/Universe runtime behavior and its own backend test bootstrap.
- **LevelUpDiag** owns diagnostic orchestration, isolated pytest execution, and backend campaign correlation.

LevelUpDiag does not need to make the Konnaxion host configuration importable from the standalone Worlds repository in order to qualify Worlds.

## Qualification scope and limits

This report proves the selected **local LevelUpDiag backend campaign** on the tested Windows development environment. It does not by itself prove:

- production deployment readiness;
- production PostgreSQL/Neon operational behavior under sustained load;
- browser/frontend qualification;
- external network, TLS, reverse-proxy, or production secret-management behavior;
- load, soak, failover, or high-availability characteristics;
- full-system qualification outside the LevelUpDiag `backend` campaign.

Those remain separate qualification concerns and should be recorded by their owning diagnostics or release gates.

## Reproduction command

```powershell
cd C:\mycode\Konnaxion\LevelUpDiag
python levelupdiag.py run backend
```

Expected final verdict:

```text
campaign backend: PASS
```

## Status

**CLOSED / QUALIFIED for the LevelUpDiag local backend campaign as of 2026-09-28.**

Future backend changes should preserve the standalone `Konnaxion_Worlds` boundary and rerun this campaign before advancing any broader backend qualification claim.
