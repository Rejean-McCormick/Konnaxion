# konnaxion/konnected/serializers.py
from rest_framework import serializers
from .models import KnowledgeResource

__all__ = ["KnowledgeResourceSerializer"]   # only export real serializers


class KnowledgeResourceSerializer(serializers.ModelSerializer):
    """
    Serialises library items (video, doc, course…) defined by the
    KnowledgeResource model in v14.
    """
    author = serializers.StringRelatedField(read_only=True)

    class Meta:
        model  = KnowledgeResource
        fields = "__all__"
