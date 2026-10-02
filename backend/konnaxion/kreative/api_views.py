# FILE: backend/konnaxion/kreative/api_views.py
# kreative/api_views.py

from django.db.models import Q
from rest_framework import filters, permissions, viewsets

from konnaxion.security_controls import OwnerOrStaffWritePermission, StaffWritePublicReadPermission

from .models import CollabSession, Gallery, KreativeArtwork, Tag, TraditionEntry
from .serializers import (
    CollabSessionSerializer,
    GallerySerializer,
    KreativeArtworkSerializer,
    TagSerializer,
    TraditionEntrySerializer,
)


class KreativeArtworkViewSet(viewsets.ModelViewSet):
    """
    ViewSet for KreativeArtwork.

    Users must be authenticated to list or create artworks because art content
    is members-only.
    """

    queryset = (
        KreativeArtwork.objects.select_related("artist")
        .prefetch_related("tags")
        .all()
    )
    serializer_class = KreativeArtworkSerializer
    permission_classes = [permissions.IsAuthenticated, OwnerOrStaffWritePermission]
    owner_fields = ("artist",)
    filterset_fields = ["artist", "media_type", "year"]

    def perform_create(self, serializer):
        serializer.save(artist=self.request.user)


class GalleryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Gallery.

    Galleries can be viewed by anyone. Only authenticated users can create or
    curate galleries.
    """

    queryset = Gallery.objects.select_related("created_by").prefetch_related(
        "artworks",
    )
    serializer_class = GallerySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, OwnerOrStaffWritePermission]
    owner_fields = ("created_by",)
    filterset_fields = ["created_by", "theme"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CollabSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CollabSession.

    Allows listing ongoing or past sessions and starting new sessions.
    Authentication is required to create a session; reading sessions is public.
    """

    queryset = CollabSession.objects.select_related(
        "host",
        "final_artwork",
    ).all()
    serializer_class = CollabSessionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, OwnerOrStaffWritePermission]
    owner_fields = ("host",)
    filterset_fields = ["session_type", "host", "ended_at"]

    def perform_create(self, serializer):
        serializer.save(host=self.request.user)


class TraditionEntryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TraditionEntry.

    Anyone can view approved tradition entries. Authenticated users can submit
    new entries. Approval is handled separately by admins.
    """

    queryset = TraditionEntry.objects.select_related(
        "submitted_by",
        "approved_by",
    ).all()
    serializer_class = TraditionEntrySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, OwnerOrStaffWritePermission]
    owner_fields = ("submitted_by",)
    filterset_fields = ["approved", "region", "submitted_by"]

    def get_queryset(self):
        qs = TraditionEntry.objects.select_related("submitted_by", "approved_by")
        user = self.request.user
        if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
            return qs
        if getattr(user, "is_authenticated", False):
            return qs.filter(Q(approved=True) | Q(submitted_by=user))
        return qs.filter(approved=True)

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.approved and not (
            getattr(self.request.user, "is_staff", False)
            or getattr(self.request.user, "is_superuser", False)
        ):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Approved tradition entries are immutable to submitters.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.approved and not (
            getattr(self.request.user, "is_staff", False)
            or getattr(self.request.user, "is_superuser", False)
        ):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Approved tradition entries can only be removed by staff.")
        instance.delete()


class TagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Kreative tags.

    Tags are used to categorize artworks. Reading is public; writes require
    authentication so the central API router can safely expose kreative/tags.
    """

    queryset = Tag.objects.all().order_by("name")
    serializer_class = TagSerializer
    permission_classes = [StaffWritePublicReadPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["name"]
    search_fields = ["name"]
    ordering_fields = ["name"]
    ordering = ["name"]


# Compatibility alias for older imports/usages.
KreativeTagViewSet = TagViewSet