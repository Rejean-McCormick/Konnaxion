# FILE: backend/konnaxion/users/api/urls.py
# backend/konnaxion/users/api/urls.py
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

app_name = "users_api"  # distinct namespace to avoid clashing with central "api"
router = DefaultRouter()
router.register(r"", UserViewSet, basename="user")

urlpatterns = router.urls
