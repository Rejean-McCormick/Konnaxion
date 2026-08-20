"""Read-only, privacy-aware EkoH profile serializer.

Surfaced by ``GET /api/v1/ekoh/profile/<uid>/``.  EkoH exposes contextual
profile data only; it does not expose or compute a global Smart Vote weight.
"""

from __future__ import annotations

from typing import Any

from django.contrib.auth import get_user_model
from rest_framework import serializers

from konnaxion.ekoh.models.privacy import ConfidentialitySetting
from konnaxion.ekoh.models.scores import UserEthicsScore, UserExpertiseScore

User = get_user_model()


class ExpertiseScoreNested(serializers.Serializer):
    domain_code = serializers.CharField()
    domain_name = serializers.CharField()
    weighted_score = serializers.DecimalField(max_digits=12, decimal_places=4)


class ProfileSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(source="pk")
    display_name = serializers.SerializerMethodField()
    confidentiality_level = serializers.SerializerMethodField()
    ethics_score = serializers.SerializerMethodField()
    expertise = serializers.SerializerMethodField()

    def _privacy(self, user: User) -> ConfidentialitySetting | None:
        return getattr(user, "confidentialitysetting", None)

    def get_confidentiality_level(self, user: User) -> str:
        setting = self._privacy(user)
        return setting.level if setting else ConfidentialitySetting.PUBLIC

    def get_display_name(self, user: User) -> str:
        level = self.get_confidentiality_level(user)
        request = self.context.get("request")
        requester = getattr(request, "user", None)
        is_self = bool(
            requester
            and getattr(requester, "is_authenticated", False)
            and requester.pk == user.pk
        )
        is_staff = bool(requester and getattr(requester, "is_staff", False))

        if level == ConfidentialitySetting.ANONYMOUS and not (is_self or is_staff):
            return "Anonymous"
        if level == ConfidentialitySetting.PSEUDONYM and not (is_self or is_staff):
            return user.get_username()

        return user.get_full_name().strip() or user.get_username()

    def get_ethics_score(self, user: User):
        score = getattr(user, "userethicsscore", None)
        return score.ethical_score if score is not None else 1

    def get_expertise(self, user: User) -> list[dict[str, Any]]:
        qs = (
            UserExpertiseScore.objects.select_related("category")
            .filter(user_id=user.pk)
            .order_by("-weighted_score")[:20]
        )
        return [
            {
                "domain_code": row.category.code,
                "domain_name": row.category.name,
                "weighted_score": row.weighted_score,
            }
            for row in qs
        ]

    @classmethod
    def setup_eager_loading(cls, queryset):
        """Fetch one-to-one privacy and ethics records in the same query."""
        return queryset.select_related("confidentialitysetting", "userethicsscore")
