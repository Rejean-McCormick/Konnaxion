from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import include, path
from django.views import defaults as default_views
from django.views.generic import TemplateView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.authtoken.views import obtain_auth_token

from konnaxion.moderation.api_views import (
    ModerationQueueView,
    ModerationDecisionView,
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
    path("api/", include("config.api_router")),

    # Auth token (DRF)
    path("api/auth-token/", obtain_auth_token, name="obtain_auth_token"),

    # OpenAPI schema & docs
    path("api/schema/", SpectacularAPIView.as_view(), name="api-schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="api-schema"), name="api-docs"),

    # ------------------------------------------------------------------
    # Admin moderation endpoints (backed by konnaxion.moderation.api_views)
    #   GET  /api/admin/moderation
    #   POST /api/admin/moderation/<id>
    # ------------------------------------------------------------------
    path(
        "api/admin/moderation",
        ModerationQueueView.as_view(),
        name="admin-moderation-queue",
    ),
    path(
        "api/admin/moderation/<int:pk>",
        ModerationDecisionView.as_view(),
        name="admin-moderation-decision",
    ),

    # ------------------------------------------------------------------
    # Compat FE aliases: map "deliberate" to existing Ethikos endpoints.
    # Gives /api/deliberate/topics|stances|arguments and
    #      /api/deliberate/elite/topics|stances|arguments
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
