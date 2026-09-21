# FILE: backend/config/urls.py

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import include, path
from django.views import defaults as default_views
from django.views.generic import TemplateView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from config.koali_health import live as koali_live, ready as koali_ready

urlpatterns = [
    path("health/live/", koali_live, name="health-live"),
    path("health/ready/", koali_ready, name="health-ready"),
    path("", TemplateView.as_view(template_name="pages/home.html"), name="home"),
    path("about/", TemplateView.as_view(template_name="pages/about.html"), name="about"),
    # Django Admin
    path(settings.ADMIN_URL, admin.site.urls),
    # User management (non-API)
    path("users/", include(("konnaxion.users.urls", "users"), namespace="users")),
    path("accounts/", include("allauth.urls")),
    # Media
    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
]

if settings.DEBUG:
    # Static file serving in dev when using Gunicorn + Uvicorn
    urlpatterns += staticfiles_urlpatterns()

# API URLS
urlpatterns += [
    # Orgo -> Konnaxion Interaction Kernel ingress. Machine-authenticated and
    # intentionally owned by the main Konnaxion product, not Konnaxion_Worlds.
    path("api/integrations/ik/konnaxion/", include("konnaxion.ethikos.ik_bridge_urls")),

    # Base API (DRF routers)
    # [NOTE] This router handles:
    # - /api/admin/users (UserAdminViewSet)
    # - /api/admin/moderation (ModerationTicketViewSet)
    # - /api/admin/audit-log (AuditLogViewSet)
    path("api/", include("config.api_router")),

    # ------------------------------------------------------------------
    # ethiKos Demo Importer
    #   /api/ethikos/demo-scenarios/preview/
    #   /api/ethikos/demo-scenarios/import/
    #   /api/ethikos/demo-scenarios/reset/
    # ------------------------------------------------------------------
    path("api/ethikos/", include("konnaxion.ethikos.urls")),


    # OpenAPI schema & docs
    path("api/schema/", SpectacularAPIView.as_view(), name="api-schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="api-schema"), name="api-docs"),

    # ------------------------------------------------------------------
    # Ekoh – expertise & ethics profiles
    #   /api/v1/ekoh/profile/<uid>/
    # ------------------------------------------------------------------
    path("api/v1/ekoh/", include("konnaxion.ekoh.urls")),

    # ------------------------------------------------------------------
    # Smart-Vote – weighted balloting
    #   /api/v1/smart-vote/cast/
    # ------------------------------------------------------------------
    path("api/v1/smart-vote/", include("konnaxion.smart_vote.urls")),

    # ------------------------------------------------------------------
    # Analytics / Reports Endpoints
    # [UPDATED] Delegated to konnaxion.kontrol.urls
    # Handles: /api/reports/usage, /api/reports/perf, /api/reports/smart-vote
    # ------------------------------------------------------------------
    path("api/", include("konnaxion.kontrol.urls", namespace="kontrol")),

    # ------------------------------------------------------------------
    # Compat FE aliases: map "deliberate" to existing Ethikos endpoints.
    # Gives /api/deliberate/topics|stances|arguments and
    #       /api/deliberate/elite/topics|stances|arguments
    # ------------------------------------------------------------------
    path(
        "api/deliberate/",
        include(("konnaxion.ethikos.urls", "deliberate"), namespace="deliberate"),
    ),
    path(
        "api/deliberate/elite/",
        include(
            ("konnaxion.ethikos.urls", "deliberate_elite"),
            namespace="deliberate_elite",
        ),
    ),
]

if settings.DEBUG:
    # Debug error pages
    urlpatterns += [
        path("400/", default_views.bad_request, kwargs={"exception": Exception("Bad Request!")}),
        path("403/", default_views.permission_denied, kwargs={"exception": Exception("Permission Denied")}),
        path("404/", default_views.page_not_found, kwargs={"exception": Exception("Page not Found")}),
        path("500/", default_views.server_error),
    ]
    if "debug_toolbar" in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns = [path("__debug__/", include(debug_toolbar.urls)), *urlpatterns]