# konnaxion/ethikos/urls.py

from rest_framework.routers import DefaultRouter
from .api_views import TopicViewSet, StanceViewSet, ArgumentViewSet

router = DefaultRouter()
router.register(r"topics", TopicViewSet)
router.register(r"stances", StanceViewSet)
router.register(r"arguments", ArgumentViewSet)

urlpatterns = router.urls
