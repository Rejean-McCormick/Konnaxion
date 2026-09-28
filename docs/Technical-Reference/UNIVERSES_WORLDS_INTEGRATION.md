# Konnaxion Host Contract — Universes / Worlds

**Status:** canonical Konnaxion host-boundary document  
**Engine/spec owner:** sibling repository/package `Konnaxion_Worlds`  
**Current engine lock:** `KX-UNIVERSES-1` over `KX-WORLDS-1`

## Purpose

Konnaxion consumes the Universe/World runtime but does not own it. This document defines only the
host integration boundary. Canonical Universe/World models, migrations, resolver semantics,
isolation rules, release lifecycle, relations/publications/subscriptions and their detailed
architecture belong to `Konnaxion_Worlds`.

## Repository boundary

The following paths are forbidden in the main Konnaxion repository:

```text
backend/konnaxion/worlds/
docs/Technical-Reference/Worlds/
```

Their presence indicates ownership drift. Run:

```text
python scripts/check_worlds_ownership.py
```

The check MUST fail if either canonical-engine/spec surface reappears locally.

## Allowed Konnaxion host surfaces

Konnaxion MAY own:

- `backend/config/world_adapters.py`: Konnaxion-domain callbacks injected into the engine;
- `backend/config/world_urls.py` and `backend/config/urls.py`: host route mounting;
- host settings selecting adapter callables;
- `backend/config/websocket.py`: product WebSocket integration using the engine's resolver/runtime;
- `frontend/lib/worlds.ts`, `frontend/context/WorldContext.tsx`, and UI switcher components;
- product tests proving that Konnaxion behaves correctly while hosted in a resolved Universe/World context.

These surfaces MUST consume public engine contracts. They MUST NOT reimplement engine models,
migrations, isolation, release management, permissions or canonical topology semantics.

## Python package composition

The main product's `konnaxion` package uses `pkgutil.extend_path` so a separately installed
`konnaxion-worlds` distribution can provide `konnaxion.worlds` without vendoring it into this repo.

Local development expects `Konnaxion_Worlds` beside `Konnaxion`; `RUN_backend_local.bat` installs
its `backend` package in editable mode before running Konnaxion migrations/server startup.
Production packaging must likewise install a deliberate/versioned `konnaxion-worlds` dependency;
it must not restore a copied source directory.

## Host-domain adapters

The standalone engine must not import Konnaxion product domains such as ethiKos or EkoH directly.
Konnaxion provides configured adapters for host-owned behavior, currently including:

- scenario import into a pinned WorldRelease;
- Konnaxion-owned auxiliary fixture checksum/loading.

Adapter code remains product-owned because it knows product-domain models. Engine code remains
standalone because it invokes adapters only through configured dotted-callable contracts.

## Runtime/navigation contract

Target product route:

```text
/u/{universe_key}/w/{world_key}/...
```

Phase-U1 World-only routes may remain for compatibility while World keys are globally unique.
The frontend must treat the active context as at least:

```text
Universe + World + WorldRelease
```

and discard stale responses whose `X-Konnaxion-Universe`, `X-Konnaxion-World` or
`X-Konnaxion-World-Release` headers disagree with the current context.

Changing Universe/World is navigation only. Konnaxion host UI MUST NOT trigger seed import,
build, migration, reset, release promotion or schema provisioning as a side effect of switching.

## Change rule

If a requested change alters any of these concepts, implement/specify it first in `Konnaxion_Worlds`:

- Universe/World/WorldRelease data model;
- memberships and access semantics;
- route resolution or runtime pinning;
- schema/cache/task/search/WebSocket/media isolation;
- relation/publication/subscription semantics;
- build/release/snapshot lifecycle;
- canonical architecture locks/invariants.

Only then update Konnaxion's host adapters/navigation to consume the new contract.


### Web UI ownership

The main Konnaxion repository owns the product-shell web integration: `UniverseSwitcher`, `WorldSwitcher`, Next.js route adaptation, and browser response guards. `Konnaxion_Worlds` owns the engine/API contract and MUST NOT carry a second maintained copy of these product UI files. Konnaxion UI code may interpret the contract but MUST NOT recreate engine models, migrations, runtime resolution, or canonical Universe/World specifications.
