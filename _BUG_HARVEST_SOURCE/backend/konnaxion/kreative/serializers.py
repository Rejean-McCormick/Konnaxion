# FILE: backend/konnaxion/kreative/serializers.py
from rest_framework import serializers
from .models import KreativeArtwork, Gallery, CollabSession, TraditionEntry, Tag

__all__ = [
    "KreativeArtworkSerializer",
    "GallerySerializer",
    "CollabSessionSerializer",
    "TraditionEntrySerializer",
    "TagSerializer",
]

class TagSerializer(serializers.ModelSerializer):
    """Serializer for Tag (artwork/tagging keyword)."""
    class Meta:
        model = Tag
        fields = "__all__"

class KreativeArtworkSerializer(serializers.ModelSerializer):
    """Serializer for KreativeArtwork (a creative artwork uploaded by a user)."""
    artist = serializers.StringRelatedField(read_only=True)
    # Embed tag details read-only: list tags with id and name
    tags = TagSerializer(many=True, read_only=True)
    class Meta:
        model = KreativeArtwork
        fields = "__all__"
        read_only_fields = ("id", "artist", "created_at")

class GallerySerializer(serializers.ModelSerializer):
    """Serializer for Gallery (a curated collection of artworks)."""
    created_by = serializers.StringRelatedField(read_only=True)
    # List artworks in the gallery with their details (read-only for output).
    artworks = KreativeArtworkSerializer(many=True, read_only=True)
    class Meta:
        model = Gallery
        fields = "__all__"
        read_only_fields = ("id", "created_by", "created_at")

class CollabSessionSerializer(serializers.ModelSerializer):
    """Serializer for CollabSession (real-time collaboration session for creatives)."""
    host = serializers.StringRelatedField(read_only=True)
    final_artwork = serializers.PrimaryKeyRelatedField(queryset=KreativeArtwork.objects.all(), allow_null=True, required=False)
    class Meta:
        model = CollabSession
        fields = "__all__"
        read_only_fields = ("id", "host", "started_at", "ended_at")

class TraditionEntrySerializer(serializers.ModelSerializer):
    """Serializer for TraditionEntry (cultural heritage submission for preservation)."""
    submitted_by = serializers.StringRelatedField(read_only=True)
    approved_by = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = TraditionEntry
        fields = "__all__"
        read_only_fields = ("id", "submitted_by", "submitted_at", "approved", "approved_by", "approved_at")
