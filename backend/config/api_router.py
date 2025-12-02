# FILE: backend/config/api_router.py
# config/api_router.py
"""
Central DRF router for every Konnaxion v14 API endpoint.
`config/urls.py` only needs:
    path("api/", include("config.api_router"))
"""

from typing import Any, Optional, Type

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

# Optional category ViewSet (name can be CategoryViewSet or EthikosCategoryViewSet)
EthikosCategoryViewSet: Optional[Type[Any]] = getattr(
    ethikos_api,
    "CategoryViewSet",
    getattr(ethikos_api, "EthikosCategoryViewSet", None),
)

# ── keenKonnect ───────────────────────────────────────────
from konnaxion.keenkonnect.api_views import (
    ProjectViewSet,
    ProjectResourceViewSet,
    ProjectTaskViewSet,
    ProjectMessageViewSet,
    ProjectTeamViewSet,
    ProjectRatingViewSet,
    TagViewSet as KeenKonnectTagViewSet,
)

# ── Kollective Intelligence ───────────────────────────────
# Vote-related ViewSets are optional for now; the app's api_views module may be incomplete.
VoteViewSet: Optional[Type[Any]]
VoteResultViewSet: Optional[Type[Any]]
try:
    from konnaxion.kollective_intelligence.api_views import (  # type: ignore[attr-defined]
        VoteViewSet as _VoteViewSet,
        VoteResultViewSet as _VoteResultViewSet,
    )

    VoteViewSet = _VoteViewSet
    VoteResultViewSet = _VoteResultViewSet
except Exception:
    VoteViewSet = None
    VoteResultViewSet = None

# ── KonnectED (Knowledge + CertifiKation) ─────────────────
from konnaxion.konnected.api_views import (
    KnowledgeResourceViewSet,
    CertificationPathViewSet,
    EvaluationViewSet,
    PeerValidationViewSet,
    PortfolioViewSet,
    ExamAttemptViewSet,
)

# OfflinePackageViewSet is optional; it will be present once the offline-packages
# feature is implemented in konnected.api_views.
OfflinePackageViewSet: Optional[Type[Any]]
try:
    from konnaxion.konnected.api_views import (  # type: ignore[attr-defined]
        OfflinePackageViewSet as _OfflinePackageViewSet,
    )

    OfflinePackageViewSet = _OfflinePackageViewSet
except Exception:
    OfflinePackageViewSet = None

# ── Kreative ──────────────────────────────────────────────
from konnaxion.kreative.api_views import (
    KreativeArtworkViewSet,
    GalleryViewSet,
    CollabSessionViewSet,
    TraditionEntryViewSet,
    KreativeTagViewSet,
)

# ── Kontrol (Admin & Moderation) ──────────────────────────
# Wiring the new admin module endpoints
AuditLogViewSet: Optional[Type[Any]]
ModerationTicketViewSet: Optional[Type[Any]]
UserAdminViewSet: Optional[Type[Any]]
KonsensusConfigViewSet: Optional[Type[Any]] # [NEW] Added this

try:
    # We use a try-import block so the router doesn't crash if the kontrol app
    # isn't fully migrated yet.
    from konnaxion.kontrol.views import (
        AuditLogViewSet as _AuditLogViewSet,
        ModerationTicketViewSet as _ModerationTicketViewSet, # [FIXED] Was ModerationQueueViewSet
        UserAdminViewSet as _UserAdminViewSet,
        KonsensusConfigViewSet as _KonsensusConfigViewSet, # [FIXED] Added this
    )
    AuditLogViewSet = _AuditLogViewSet
    ModerationTicketViewSet = _ModerationTicketViewSet
    UserAdminViewSet = _UserAdminViewSet
    KonsensusConfigViewSet = _KonsensusConfigViewSet
except ImportError:
    AuditLogViewSet = None
    ModerationTicketViewSet = None
    UserAdminViewSet = None
    KonsensusConfigViewSet = None


# ---------------------------------------------------------------------------

router = DefaultRouter() if settings.DEBUG else SimpleRouter()


def register_optional(
    prefix: str,
    viewset: Optional[Type[Any]],
    basename: str,
) -> None:
    """
    Helper for optional ViewSets: only register if the ViewSet exists.
    """
    if viewset is not None:
        router.register(prefix, viewset, basename=basename)


# Core / Users
router.register("users", UserViewSet, basename="user")

# ethiKos
router.register("ethikos/topics", TopicViewSet, basename="ethikos-topic")
router.register("ethikos/stances", StanceViewSet, basename="ethikos-stance")
router.register("ethikos/arguments", ArgumentViewSet, basename="ethikos-argument")

# Register categories only if the ViewSet exists in the codebase
register_optional(
    "ethikos/categories",
    EthikosCategoryViewSet,
    basename="ethikos-category",
)

# keenKonnect
# Canonical v14 path
router.register("keenkonnect/projects", ProjectViewSet, basename="keenkonnect-project")
# Backwards-compat for older services expecting /api/projects/
router.register("projects", ProjectViewSet, basename="project")

router.register(
    "keenkonnect/resources",
    ProjectResourceViewSet,
    basename="keenkonnect-resource",
)
router.register(
    "keenkonnect/tasks",
    ProjectTaskViewSet,
    basename="keenkonnect-task",
)
router.register(
    "keenkonnect/messages",
    ProjectMessageViewSet,
    basename="keenkonnect-message",
)
router.register(
    "keenkonnect/teams",
    ProjectTeamViewSet,
    basename="keenkonnect-team",
)
router.register(
    "keenkonnect/ratings",
    ProjectRatingViewSet,
    basename="keenkonnect-rating",
)
router.register(
    "keenkonnect/tags",
    KeenKonnectTagViewSet,
    basename="keenkonnect-tag",
)

# Kollective Intelligence (optional until Vote* ViewSets are implemented)
register_optional(
    "kollective/votes",
    VoteViewSet,
    basename="kollective-vote",
)
register_optional(
    "kollective/vote-results",
    VoteResultViewSet,
    basename="kollective-vote-result",
)

# KonnectED – Knowledge
router.register(
    "konnected/resources",
    KnowledgeResourceViewSet,
    basename="konnected-resource",
)

# KonnectED – Offline packages (optional; only if ViewSet exists)
# NOTE: path aligned with frontend OFFLINE_PACKAGE_* endpoints:
#   konnected/offline-packages/
register_optional(
    "konnected/offline-packages",
    OfflinePackageViewSet,
    basename="konnected-offline-package",
)

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
router.register(
    "kreative/artworks",
    KreativeArtworkViewSet,
    basename="kreative-artwork",
)
router.register(
    "kreative/galleries",
    GalleryViewSet,
    basename="kreative-gallery",
)
router.register(
    "kreative/collab-sessions",
    CollabSessionViewSet,
    basename="kreative-collab-session",
)
router.register(
    "kreative/traditions",
    TraditionEntryViewSet,
    basename="kreative-tradition",
)
router.register(
    "kreative/tags",
    KreativeTagViewSet,
    basename="kreative-tag",
)

# Kontrol (Admin)
register_optional(
    "admin/audit-log",
    AuditLogViewSet,
    basename="kontrol-audit-log",
)
register_optional(
    "admin/moderation",
    ModerationTicketViewSet,
    basename="kontrol-moderation",
)
register_optional(
    "admin/users",
    UserAdminViewSet,
    basename="kontrol-user-admin",
)
# [FIXED] Added KonsensusConfigViewSet to the router
register_optional(
    "admin/konsensus-config",
    KonsensusConfigViewSet,
    basename="kontrol-konsensus-config",
)

# ---------------------------------------------------------------------------

app_name = "api"
urlpatterns = router.urls