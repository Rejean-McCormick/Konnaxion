# FILE: backend/konnaxion/kreative/serializers.py
from rest_framework import serializers

from konnaxion.security_controls import validate_safe_upload
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
    tags = TagSerializer(many=True, read_only=True)
    media_url = serializers.SerializerMethodField()

    def get_media_url(self, obj):
        media_file = getattr(obj, "media_file", None)
        if not media_file or not getattr(media_file, "name", ""):
            return None

        try:
            if not media_file.storage.exists(media_file.name):
                return None
            url = media_file.url
        except (OSError, ValueError):
            return None

        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url

    class Meta:
        model = KreativeArtwork
        fields = "__all__"
        read_only_fields = ("id", "artist", "created_at", "media_url")

    def validate(self, attrs):
        attrs = super().validate(attrs)
        upload = attrs.get("media_file")
        media_type = attrs.get("media_type") or getattr(self.instance, "media_type", "image")
        if upload:
            policies = {
                "image": ({".jpg", ".jpeg", ".png", ".gif", ".webp"}, {"image/jpeg", "image/png", "image/gif", "image/webp"}, 20),
                "video": ({".mp4", ".webm"}, {"video/mp4", "video/webm"}, 150),
                "audio": ({".mp3", ".wav", ".ogg", ".m4a"}, {"audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"}, 50),
            }
            if media_type not in policies:
                raise serializers.ValidationError({"media_file": "Arbitrary 'other' uploads are disabled."})
            ext, mime, max_mib = policies[media_type]
            try:
                validate_safe_upload(upload, allowed_extensions=ext, allowed_mime_types=mime, max_bytes=max_mib * 1024 * 1024)
            except serializers.ValidationError as exc:
                raise serializers.ValidationError({"media_file": exc.detail}) from exc
        return attrs

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

    def validate_media_file(self, upload):
        validate_safe_upload(
            upload,
            allowed_extensions={".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp3", ".wav", ".ogg", ".mp4", ".webm", ".pdf"},
            allowed_mime_types={"image/jpeg", "image/png", "image/gif", "image/webp", "audio/mpeg", "audio/wav", "audio/ogg", "video/mp4", "video/webm", "application/pdf"},
            max_bytes=100 * 1024 * 1024,
        )
        return upload
