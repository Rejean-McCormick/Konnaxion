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

# Import Analytics Views from the new Kontrol app
# These handles aggregate data for the frontend charts
try:
    from konnaxion.kontrol.analytics_views import (
        UsageReportView,
        PerformanceReportView,
    )
except ImportError:
    # Fallback if the app isn't fully migrated yet, to prevent crash
    UsageReportView = None
    PerformanceReportView = None

urlpatterns = [
    path("", TemplateView.as_view(template_name="pages/home.html"), name="home"),
    path("about/", TemplateView.as_view(template_name="pages/about.html"), name="about"),
    # Django Admin, use {% url 'admin:index' %}
    path(settings.ADMIN_URL, admin.site.urls),
    # User management
    path("users/", include("konnaxion.users.urls", namespace="users")),
    path("accounts/", include("allauth.urls")),
    # Your stuff: custom urls includes go here
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    # Static file serving when using Gunicorn + Uvicorn for local web socket development
    urlpatterns += staticfiles_urlpatterns()

# API URLS
urlpatterns += [
    # API base url
    path("api/", include("config.api_router")),
    # DRF auth token
    path("auth-token/", obtain_auth_token),
    # OpenAPI 3
    path("api/schema/", SpectacularAPIView.as_view(), name="api-schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="api-schema"),
        name="api-docs",
    ),
    
    # ------------------------------------------------------------------
    # Analytics / Reports (Custom APIViews)
    # These handle the aggregated JSON data for charts
    # ------------------------------------------------------------------
]

# Only add these paths if the views imported successfully
if UsageReportView and PerformanceReportView:
    urlpatterns += [
        path(
            "api/reports/usage",
            UsageReportView.as_view(),
            name="report-usage",
        ),
        path(
            "api/reports/perf",
            PerformanceReportView.as_view(),
            name="report-perf",
        ),
        # Smart Vote report placeholder (until view is implemented)
        # path("api/reports/smart-vote", SmartVoteReportView.as_view(), name="report-smart-vote"),
    ]

# ------------------------------------------------------------------
# Compat FE aliases: map "deliberate" to existing Ethikos endpoints.
# Gives /api/deliberate/topics|stances|arguments and
#       /api/deliberate/elite/topics|stances|arguments
# ------------------------------------------------------------------
urlpatterns += [
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
    # This allows the error pages to be debugged during development, just visit
    # these url in browser to see how these error pages look like.
    urlpatterns += [
        path(
            "400/",
            default_views.bad_request,
            kwargs={"exception": Exception("Bad Request!")},
        ),
        path(
            "403/",
            default_views.permission_denied,
            kwargs={"exception": Exception("Permission Denied")},
        ),
        path(
            "404/",
            default_views.page_not_found,
            kwargs={"exception": Exception("Page not Found")},
        ),
        path("500/", default_views.server_error),
    ]
    if "debug_toolbar" in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns