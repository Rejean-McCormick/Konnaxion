"""World runtime and optional World-owned business API routes.

Runtime/control-plane behavior is always available.  Business routes are only
mounted when ``KONNAXION_WORLDS_DATA_PLANE_ENABLED`` is explicitly enabled;
otherwise a catch-all returns 503.  This prevents PostgreSQL ``public`` from
becoming an accidental fallback for World-owned tables before schema cutover.
"""

from django.conf import settings
from django.http import JsonResponse
from django.urls import include, path, re_path


def data_plane_unavailable(_request, path: str = ""):
    return JsonResponse(
        {
            "error": "WORLD_DATA_PLANE_NOT_READY",
            "detail": (
                "World routing is active, but the Konnaxion World data plane is "
                "disabled until release-local domain migrations/data are provisioned."
            ),
            "path": path,
        },
        status=503,
    )


urlpatterns = [
    path("", include("konnaxion.worlds.runtime_urls")),
]

if getattr(settings, "KONNAXION_WORLDS_DATA_PLANE_ENABLED", False):
    urlpatterns += [
        # Canonical DRF resources, excluding explicitly global/control routes.
        path("", include("config.world_api_router")),
        # App-local routes not fully represented in the central router.
        path("ethikos/", include("konnaxion.ethikos.urls")),
        path("v1/ekoh/", include("konnaxion.ekoh.urls")),
        path("v1/smart-vote/", include("konnaxion.smart_vote.urls")),
        path("", include("konnaxion.kontrol.urls")),
        # Compatibility aliases retained by the current Konnaxion API contract.
        path("deliberate/", include("konnaxion.ethikos.urls")),
        path("deliberate/elite/", include("konnaxion.ethikos.urls")),
    ]
else:
    urlpatterns += [re_path(r"^(?P<path>.*)$", data_plane_unavailable)]
