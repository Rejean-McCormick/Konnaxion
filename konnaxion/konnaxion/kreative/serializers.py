# konnaxion/kreative/serializers.py
from rest_framework import serializers
from .models import KreativeArtwork, Gallery, Tag

__all__ = [
    "KreativeArtworkSerializer",
    "GallerySerializer",
]

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "__all__"


class KreativeArtworkSerializer(serializers.ModelSerializer):
    artist = serializers.StringRelatedField(read_only=True)
    tags   = TagSerializer(many=True, read_only=True)

    class Meta:
        model  = KreativeArtwork
        fields = "__all__"


class GallerySerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    artworks   = KreativeArtworkSerializer(many=True, read_only=True)

    class Meta:
        model  = Gallery
        fields = "__all__"
