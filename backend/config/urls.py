# FILE: backend/config/urls.py
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import include, path
from django.views import defaults as default_views
from django.views.generic import TemplateView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.authtoken.views import obtain_auth_token

# [CHANGED] Import Analytics Views from the new Kontrol app
# Note: SmartVoteReportView needs to be added to analytics_views.py next.
from konnaxion.kontrol.analytics_views import (
    UsageReportView,
    PerformanceReportView,
    SmartVoteReportView, 
)

urlpatterns = [
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
    # Base API (DRF routers)
    # [NOTE] This router handles:
    # - /api/admin/users (UserAdminViewSet)
    # - /api/admin/moderation (ModerationTicketViewSet)
    # - /api/admin/audit-log (AuditLogViewSet)
    path("api/", include("config.api_router")),

    # Auth token (DRF)
    path("api/auth-token/", obtain_auth_token, name="obtain_auth_token"),

    # OpenAPI schema & docs
    path("api/schema/", SpectacularAPIView.as_view(), name="api-schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="api-schema"), name="api-docs"),

    # ------------------------------------------------------------------
    # Analytics / Reports Endpoints (Custom APIViews)
    # These connect the Frontend Charts to the Backend Data
    # ------------------------------------------------------------------
    path("api/reports/usage/", UsageReportView.as_view(), name="report-usage"),
    path("api/reports/perf/", PerformanceReportView.as_view(), name="report-perf"),
    path("api/reports/smart-vote/", SmartVoteReportView.as_view(), name="report-smart-vote"),

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