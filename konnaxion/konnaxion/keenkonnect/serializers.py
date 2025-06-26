from rest_framework import serializers
from .models import Project

__all__ = ["ProjectSerializer"]


class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Project
        fields = "__all__"
