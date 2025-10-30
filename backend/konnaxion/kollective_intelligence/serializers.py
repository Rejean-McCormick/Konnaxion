# konnaxion/kollective_intelligence/serializers.py
from rest_framework import serializers
from .models import Vote   # import real models only

__all__ = ["VoteSerializer"]            # export what actually exists

class VoteSerializer(serializers.ModelSerializer):
    """
    Serialises the core Smart-Vote record.

    Fields mirror the Vote model exactly as defined in v14:
        id, user, target_type, target_id, raw_value, weighted_value, voted_at
    """
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model  = Vote
        fields = "__all__"
