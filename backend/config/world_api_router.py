"""World-scoped projection of the canonical DRF router.

The canonical route registrations stay in :mod:`config.api_router`.  This
module reuses those URLPattern objects and removes surfaces that are explicitly
owned by the global/control plane, avoiding a second registry that could drift.
"""

from config.api_router import urlpatterns as canonical_urlpatterns

_GLOBAL_ROUTE_NAME_PREFIXES = (
    "user-",
    "kontrol-user-admin-",
    "kontrol-audit-log-",
)


def _is_global(pattern) -> bool:
    name = str(getattr(pattern, "name", "") or "")
    if name == "api-root":
        return True
    return any(name.startswith(prefix) for prefix in _GLOBAL_ROUTE_NAME_PREFIXES)


urlpatterns = [pattern for pattern in canonical_urlpatterns if not _is_global(pattern)]
