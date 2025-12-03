"""
Ballot input / output schema.

POST body example
-----------------
{
  "consultation": "7077e77f-0a1e-4f8a-83b2-d12e2c68b4ec",
  "target_id":     "7077e77f-0a1e-4f8a-83b2-d12e2c68b4ec",   # same as consultation for single-question
  "modality":      "approval",
  "raw_value":     1
}
"""

from uuid import UUID
from decimal import Decimal

from rest_framework import serializers

from konnaxion.smart_vote.models.core import Vote, VoteModality
from konnaxion.smart_vote.services.weight_calculator import get_weight


class BallotSerializer(serializers.Serializer):
    consultation = serializers.UUIDField()
    target_id = serializers.UUIDField()
    modality = serializers.ChoiceField(choices=[m[0] for m in VoteModality._meta.get_field("name").choices])
    raw_value = serializers.DecimalField(max_digits=12, decimal_places=4)

    def validate(self, attrs):
        user = self.context["request"].user
        if Vote.objects.filter(
            user=user,
            target_type="consultation",
            target_id=attrs["target_id"],
        ).exists():
            raise serializers.ValidationError("You have already voted on this target.")
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        weighted = get_weight(user.id, validated_data["consultation"])
        return Vote.objects.create(
            user=user,
            target_type="consultation",
            target_id=validated_data["target_id"],
            modality_id=validated_data["modality"],
            raw_value=validated_data["raw_value"],
            weighted_value=Decimal(validated_data["raw_value"]) * weighted,
        )

    # Response body
    id = serializers.IntegerField(read_only=True)
    weighted_value = serializers.DecimalField(max_digits=12, decimal_places=4, read_only=True)
