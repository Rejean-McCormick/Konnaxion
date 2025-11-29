# FILE: backend/konnaxion/ethikos/urls.py
# backend/konnaxion/ethikos/urls.py

from rest_framework.routers import DefaultRouter
from .api_views import TopicViewSet, StanceViewSet, ArgumentViewSet

# Optionnel : n'activer "categories" que si le ViewSet existe réellement.
try:
    from .api_views import CategoryViewSet  # type: ignore
    _HAS_CATEGORY = True
except Exception:
    _HAS_CATEGORY = False

router = DefaultRouter()
router.register(r"topics", TopicViewSet, basename="ethikos-topic")
router.register(r"stances", StanceViewSet, basename="ethikos-stance")
router.register(r"arguments", ArgumentViewSet, basename="ethikos-argument")

if _HAS_CATEGORY:
    router.register(r"categories", CategoryViewSet, basename="ethikos-category")

urlpatterns = router.urls
