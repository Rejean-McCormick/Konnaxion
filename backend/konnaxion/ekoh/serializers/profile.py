"""
Read-only profile serializer surfaced at GET /ekoh/profile/:uid
Combines:
  • basic user display name
  • confidentiality level
  • per-domain weighted expertise scores
  • global ethics multiplier
"""

from typing import Any

from django.contrib.auth import get_user_model
from rest_framework import serializers

from konnaxion.ekoh.models.scores import (
    UserExpertiseScore,
    UserEthicsScore,
)
from konnaxion.ekoh.models.privacy import ConfidentialitySetting

User = get_user_model()


class ExpertiseScoreNested(serializers.Serializer):
    domain_code = serializers.CharField()
    domain_name = serializers.CharField()
    weighted_score = serializers.DecimalField(max_digits=12, decimal_places=4)


class ProfileSerializer(serializers.Serializer):
    # top-level fields
    user_id = serializers.IntegerField(source="pk")
    display_name = serializers.CharField(source="get_full_name")
    confidentiality_level = serializers.SerializerMethodField()
    ethics_score = serializers.DecimalField(
        max_digits=5, decimal_places=3, source="ethics.ethical_score"
    )

    expertise = serializers.SerializerMethodField()

    # ------------------------------------------------------------------ #
    #  helper methods                                                    #
    # ------------------------------------------------------------------ #
    def get_confidentiality_level(self, user: User) -> str:
        setting = getattr(user, "confidentialitysetting", None)
        return setting.level if setting else ConfidentialitySetting.PUBLIC

    def get_expertise(self, user: User) -> list[dict[str, Any]]:
        qs = (
            UserExpertiseScore.objects.select_related("category")
            .filter(user_id=user.pk)
            .order_by("-weighted_score")[:20]  # top 20 for brevity
        )
        return [
            {
                "domain_code": row.category.code,
                "domain_name": row.category.name,
                "weighted_score": row.weighted_score,
            }
            for row in qs
        ]

    # ------------------------------------------------------------------ #
    #  override to optimise query count                                  #
    # ------------------------------------------------------------------ #
    @classmethod
    def setup_eager_loading(cls, queryset):
        """Fetch confidentiality & ethics in one go."""
        return queryset.select_related("confidentialitysetting", "ethics")
