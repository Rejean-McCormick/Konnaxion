from rest_framework import serializers
from .models import Vote, VoteResult, VoteModality

__all__ = ["VoteSerializer", "VoteResultSerializer", "VoteModalitySerializer"]

class VoteSerializer(serializers.ModelSerializer):
    """
    Serializer for Vote (individual vote record with raw and weighted values).
    """
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Vote
        fields = "__all__"
        read_only_fields = ("id", "user", "voted_at")

class VoteResultSerializer(serializers.ModelSerializer):
    """
    Serializer for VoteResult (aggregated vote totals for a target object).
    Read-only - these results are typically computed, not created via API.
    """
    class Meta:
        model = VoteResult
        fields = "__all__"
        read_only_fields = ("id",)  # all fields should be read-only in practice

class VoteModalitySerializer(serializers.ModelSerializer):
    """
    Serializer for VoteModality (definition of a voting mode and its parameters).
    """
    class Meta:
        model = VoteModality
        fields = "__all__"
