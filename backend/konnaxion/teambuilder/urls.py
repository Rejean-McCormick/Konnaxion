# backend/konnaxion/teambuilder/urls.py
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

# Endpoints: /api/teambuilder/problems/
# - GET /api/teambuilder/problems/          (list)
# - POST /api/teambuilder/problems/         (create)
# - GET /api/teambuilder/problems/{id}/     (detail: problem + sessions + history)
# - PATCH /api/teambuilder/problems/{id}/   (update)
# - DELETE /api/teambuilder/problems/{id}/  (delete)
router.register("problems", views.ProblemViewSet, basename="problem")

urlpatterns = [
    path("", include(router.urls)),
]
