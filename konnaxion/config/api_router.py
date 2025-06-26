"""
Central DRF router for every Konnaxion v14 API endpoint.
`config/urls.py` only needs:
    path("api/", include("config.api_router"))
"""

from django.conf import settings
from rest_framework.routers import DefaultRouter, SimpleRouter

# ── Core / Users ──────────────────────────────────────────
from konnaxion.users.api.views import UserViewSet

# ── ethiKos ───────────────────────────────────────────────
from konnaxion.ethikos.api_views import (
    TopicViewSet,
    StanceViewSet,
    ArgumentViewSet,
)

# ── keenKonnect ───────────────────────────────────────────
from konnaxion.keenkonnect.api_views import ProjectViewSet

# ── Kollective Intelligence ───────────────────────────────
from konnaxion.kollective_intelligence.api_views import VoteViewSet

# ── KonnectED (Knowledge-library) ─────────────────────────
from konnaxion.konnected.api_views import KnowledgeResourceViewSet

# ── Kreative ──────────────────────────────────────────────
from konnaxion.kreative.api_views import (
    KreativeArtworkViewSet,
    GalleryViewSet,
)

# ---------------------------------------------------------------------------

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

# Core / Users
router.register("users", UserViewSet, basename="user")

# ethiKos
router.register("ethikos/topics",    TopicViewSet,    basename="ethikos-topic")
router.register("ethikos/stances",   StanceViewSet,   basename="ethikos-stance")
router.register("ethikos/arguments", ArgumentViewSet, basename="ethikos-argument")

# keenKonnect
router.register("keenkonnect/projects", ProjectViewSet, basename="keenkonnect-project")

# Kollective Intelligence
router.register("kollective/votes", VoteViewSet, basename="kollective-vote")

# KonnectED (knowledge resources)
router.register(
    "konnected/resources",
    KnowledgeResourceViewSet,
    basename="konnected-resource",
)

# Kreative
router.register(
    "kreative/artworks",      # REST path
    KreativeArtworkViewSet,
    basename="kreative-artwork",
)
router.register(
    "kreative/galleries",
    GalleryViewSet,
    basename="kreative-gallery",
)

# ---------------------------------------------------------------------------

app_name = "api"
urlpatterns = router.urls
