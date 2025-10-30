from rest_framework import viewsets, permissions
from .models import Vote  # Only import real models
from .serializers import VoteSerializer  # Only import real serializers

class VoteViewSet(viewsets.ModelViewSet):
    """
    Weighted Smart-Vote cast on any target object (FK generic in the model).
    """
    queryset = Vote.objects.select_related("user")
    serializer_class = VoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Remove ReputationViewSet entirely (no such model, no such serializer)
