# konnaxion/konnected/api_views.py
from rest_framework import viewsets, permissions

from .models import KnowledgeResource
from .serializers import KnowledgeResourceSerializer


class KnowledgeResourceViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for KonnectED knowledge-library items
    (video, document, course, other).

    The model follows v14 spec:
        id, title, type, url, author, created_at, updated_at
    """
    queryset = (
        KnowledgeResource.objects
        .select_related("author")        # eager-load author for list/detail
    )
    serializer_class = KnowledgeResourceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Record the authenticated user as the author
        serializer.save(author=self.request.user)
