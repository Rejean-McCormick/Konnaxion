from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import BuilderSession, Team
from .serializers import BuilderSessionSerializer, TeamSerializer
from .logic import generate_teams_for_session

class BuilderSessionViewSet(viewsets.ModelViewSet):
    """
    CRUD for Team Builder Sessions.
    Includes a custom action to trigger the team generation algorithm.
    """
    queryset = BuilderSession.objects.all().order_by("-created_at")
    serializer_class = BuilderSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the creator
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def generate(self, request, pk=None):
        """
        Triggers the algorithmic distribution of candidates into teams.
        POST /api/teambuilder/sessions/{id}/generate/
        """
        # Call the logic engine
        result = generate_teams_for_session(session_id=str(pk))
        
        if "error" in result:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
        # Re-fetch the session to return the updated status and new teams
        session = self.get_object()
        serializer = self.get_serializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only view for generated teams. 
    Useful if we need to fetch a specific team's details without loading the whole session.
    """
    queryset = Team.objects.all().order_by("name")
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["session"]