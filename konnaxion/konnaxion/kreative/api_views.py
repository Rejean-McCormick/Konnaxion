# konnaxion/kreative/api_views.py
from rest_framework import viewsets, permissions

from .models import KreativeArtwork, Gallery
from .serializers import KreativeArtworkSerializer, GallerySerializer


class KreativeArtworkViewSet(viewsets.ModelViewSet):
    """
    CRUD for uploaded artworks (image / video / audio / other).
    Matches the KreativeArtwork model in v14.
    """
    queryset = KreativeArtwork.objects.select_related("artist")
    serializer_class = KreativeArtworkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(artist=self.request.user)


class GalleryViewSet(viewsets.ModelViewSet):
    """
    Curated collections of artworks.
    """
    queryset = Gallery.objects.select_related("created_by").prefetch_related("artworks")
    serializer_class = GallerySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
