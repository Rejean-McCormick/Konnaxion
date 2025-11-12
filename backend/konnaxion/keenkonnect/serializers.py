from rest_framework import serializers
from .models import Project

__all__ = ["ProjectSerializer"]


class ProjectSerializer(serializers.ModelSerializer):
    # Affiche l'utilisateur créateur sous forme textuelle, non modifiable par l'API
    creator = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ("creator", "created_at", "updated_at")
