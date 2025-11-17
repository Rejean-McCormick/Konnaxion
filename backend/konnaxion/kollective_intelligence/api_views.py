from rest_framework import viewsets, permissions
from .models import Vote, VoteResult, VoteModality
from .serializers import VoteSerializer, VoteResultSerializer, VoteModalitySerializer

class VoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for casting Votes in the smart voting system.
    Users can create a vote (with raw value, system computes weighted value).
    Only authenticated users can vote; listing votes may be restricted.
    """
    queryset = Vote.objects.select_related("user").all()
    serializer_class = VoteSerializer
    permission_classes = [permissions.IsAuthenticated]  # must be logged in to cast or view votes
    filterset_fields = ["user", "target_type", "target_id"]

    def perform_create(self, serializer):
        # Assign current user as the voter
        serializer.save(user=self.request.user)

class VoteResultViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for VoteResult (aggregated results of votes for a target).
    Allows retrieving aggregated scores for content.
    """
    queryset = VoteResult.objects.all()
    serializer_class = VoteResultSerializer
    permission_classes = [permissions.AllowAny]  # anyone can view vote results
    filterset_fields = ["target_type", "target_id"]

class VoteModalityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for VoteModality (voting mode definitions).
    Typically managed by admins to define how votes are weighted.
    """
    queryset = VoteModality.objects.all()
    serializer_class = VoteModalitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ["name"]
