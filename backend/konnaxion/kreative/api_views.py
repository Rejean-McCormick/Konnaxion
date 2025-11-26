# kreative/api_views.py

from rest_framework import viewsets, permissions, filters

from .models import KreativeArtwork, Gallery, CollabSession, TraditionEntry, Tag
from .serializers import (
    KreativeArtworkSerializer,
    GallerySerializer,
    CollabSessionSerializer,
    TraditionEntrySerializer,
    TagSerializer,
)


class KreativeArtworkViewSet(viewsets.ModelViewSet):
    """
    ViewSet for KreativeArtwork (creative artworks uploaded by users).
    Users must be authenticated to list or create artworks (art content is members-only).
    """
    queryset = (
        KreativeArtwork.objects
        .select_related("artist")
        .prefetch_related("tags")
        .all()
    )
    serializer_class = KreativeArtworkSerializer
    permission_classes = [permissions.IsAuthenticated]  # Only logged-in users can view or upload artworks
    filterset_fields = ["artist", "media_type", "year"]

    def perform_create(self, serializer):
        # Set the artist (uploader) to current user
        serializer.save(artist=self.request.user)


class GalleryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Gallery (collections of artworks).
    Galleries can be viewed by anyone; only authenticated users can create (curate) galleries.
    """
    queryset = (
        Gallery.objects
        .select_related("created_by")
        .prefetch_related("artworks")
        .all()
    )
    serializer_class = GallerySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ["created_by", "theme"]

    def perform_create(self, serializer):
        # Set the curator/creator of the gallery to current user
        serializer.save(created_by=self.request.user)


class CollabSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CollabSession (live collaboration sessions for artists).
    Allows listing ongoing or past sessions and starting new sessions.
    Auth required to create a session; reading sessions is allowed to all (to discover sessions).
    """
    queryset = (
        CollabSession.objects
        .select_related("host", "final_artwork")
        .all()
    )
    serializer_class = CollabSessionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ["session_type", "host", "ended_at"]

    def perform_create(self, serializer):
        # Set the session host to the current user
        serializer.save(host=self.request.user)


class TraditionEntryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TraditionEntry (submissions of cultural traditions for preservation).
    Anyone can view approved tradition entries; authenticated users can submit new entries.
    """
    queryset = (
        TraditionEntry.objects
        .select_related("submitted_by", "approved_by")
        .all()
    )
    serializer_class = TraditionEntrySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ["approved", "region", "submitted_by"]

    def perform_create(self, serializer):
        # Set the submitter to current user
        serializer.save(submitted_by=self.request.user)
        # Note: Approval fields are read-only. Approval is handled by admins separately.


class KreativeTagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Tag in Kreative app (tags for artworks).
    Allows listing and creating tags for categorizing artworks.
    """
    queryset = Tag.objects.all().order_by("name")
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["name"]
    search_fields = ["name"]
