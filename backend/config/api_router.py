# config/api_router.py
"""
Central DRF router for every Konnaxion v14 API endpoint.
`config/urls.py` only needs:
    path("api/", include("config.api_router"))
"""

from django.conf import settings
from rest_framework.routers import DefaultRouter, SimpleRouter

# ── Core / Users ──────────────────────────────────────────
from konnaxion.users.api.views import UserViewSet  # /api/users/...

# ── ethiKos ───────────────────────────────────────────────
from konnaxion.ethikos import api_views as ethikos_api  # module import, safer
# Required
TopicViewSet = ethikos_api.TopicViewSet
StanceViewSet = ethikos_api.StanceViewSet
ArgumentViewSet = ethikos_api.ArgumentViewSet
# Optional (will be None if not implemented yet)
EthikosCategoryViewSet = getattr(ethikos_api, "EthikosCategoryViewSet", None)

# ── keenKonnect ───────────────────────────────────────────
from konnaxion.keenkonnect.api_views import ProjectViewSet

# ── Kollective Intelligence ───────────────────────────────
from konnaxion.kollective_intelligence.api_views import VoteViewSet

# ── KonnectED (Knowledge + CertifiKation) ─────────────────
from konnaxion.konnected.api_views import (
    KnowledgeResourceViewSet,
    CertificationPathViewSet,
    EvaluationViewSet,
    PeerValidationViewSet,
    PortfolioViewSet,
    ExamAttemptViewSet,
)

# ── Kreative ──────────────────────────────────────────────
from konnaxion.kreative.api_views import KreativeArtworkViewSet, GalleryViewSet

# ---------------------------------------------------------------------------

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

# Core / Users
router.register("users", UserViewSet, basename="user")

# ethiKos
router.register("ethikos/topics",    TopicViewSet,    basename="ethikos-topic")
router.register("ethikos/stances",   StanceViewSet,   basename="ethikos-stance")
router.register("ethikos/arguments", ArgumentViewSet, basename="ethikos-argument")
# Register categories only if the ViewSet exists in the codebase
if EthikosCategoryViewSet is not None:
    router.register("ethikos/categories", EthikosCategoryViewSet, basename="ethikos-category")

# keenKonnect
router.register("keenkonnect/projects", ProjectViewSet, basename="keenkonnect-project")

# Kollective Intelligence
router.register("kollective/votes", VoteViewSet, basename="kollective-vote")

# KonnectED – Knowledge
router.register("konnected/resources", KnowledgeResourceViewSet, basename="konnected-resource")

# KonnectED – CertifiKation
router.register(
    "konnected/certifications/paths",
    CertificationPathViewSet,
    basename="konnected-certification-path",
)
router.register(
    "konnected/certifications/evaluations",
    EvaluationViewSet,
    basename="konnected-evaluation",
)
router.register(
    "konnected/certifications/peer-validations",
    PeerValidationViewSet,
    basename="konnected-peer-validation",
)
router.register(
    "konnected/portfolios",
    PortfolioViewSet,
    basename="konnected-portfolio",
)
router.register(
    "konnected/certifications/exam-attempts",
    ExamAttemptViewSet,
    basename="konnected-exam-attempt",
)

# Kreative
router.register("kreative/artworks",  KreativeArtworkViewSet, basename="kreative-artwork")
router.register("kreative/galleries", GalleryViewSet,        basename="kreative-gallery")

# ---------------------------------------------------------------------------

app_name = "api"
urlpatterns = router.urls
