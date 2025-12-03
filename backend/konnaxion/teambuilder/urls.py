from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = "teambuilder"

router = DefaultRouter()
# Endpoints: /api/teambuilder/sessions/
# Includes action: /api/teambuilder/sessions/{id}/generate/
router.register("sessions", views.BuilderSessionViewSet, basename="session")

# Endpoints: /api/teambuilder/teams/
router.register("teams", views.TeamViewSet, basename="team")

urlpatterns = [
    path("", include(router.urls)),
]