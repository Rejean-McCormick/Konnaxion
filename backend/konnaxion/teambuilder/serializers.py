# backend/konnaxion/teambuilder/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from konnaxion.users.api.serializers import UserSerializer
from .models import BuilderSession, Team, TeamMember

User = get_user_model()

class TeamMemberSerializer(serializers.ModelSerializer):
    """
    Serializes a member within a team, expanding the User details.
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = TeamMember
        fields = ["id", "user", "suggested_role", "match_reason"]


class TeamSerializer(serializers.ModelSerializer):
    """
    Serializes a generated team and its members.
    """
    members = TeamMemberSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = ["id", "name", "metrics", "members", "created_at"]


class BuilderSessionSerializer(serializers.ModelSerializer):
    """
    Serializes the session configuration and the resulting teams.
    """
    teams = TeamSerializer(many=True, read_only=True)
    
    # Helper to see how many people are in the pool without loading all User objects
    candidates_count = serializers.IntegerField(source="candidates.count", read_only=True)
    
    # Field to accept a list of User IDs when creating/updating the session
    candidate_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=User.objects.all(), 
        write_only=True,
        source="candidates"
    )

    class Meta:
        model = BuilderSession
        fields = [
            "id",
            "name",
            "description",
            "status",
            "algorithm_config",
            "created_by",
            "created_at",
            "updated_at",
            "teams",
            "candidates_count",
            "candidate_ids",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at", "status"]