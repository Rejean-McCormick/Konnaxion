# backend/konnaxion/moderation/serializers.py

from __future__ import annotations

from rest_framework import serializers

from .models import ModerationReport


__all__ = [
    "ModerationReportSerializer",
    "ModerationActionSerializer",
]


class ModerationReportSerializer(serializers.ModelSerializer):
    """
    Serializer used by the admin moderation UI.

    It exposes both the original minimal moderation shape
    (id, content, reporter, type, status) and richer fields
    consumed by the newer Ethikos/KonnectED moderation pages.
    """

    # Backward‑compatible name used by the existing frontend
    # (maps to the model's `reason` field).
    type = serializers.CharField(source="reason")

    # Human‑readable relations
    reporter = serializers.StringRelatedField(read_only=True)
    author = serializers.StringRelatedField(read_only=True)

    # CamelCase aliases consumed by the React adapters
    targetType = serializers.CharField(source="target_type", read_only=True)
    targetId = serializers.IntegerField(source="target_id", read_only=True)

    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    lastActionAt = serializers.DateTimeField(source="updated_at", read_only=True)

    reporterName = serializers.SerializerMethodField()
    authorName = serializers.SerializerMethodField()

    # Reporter free‑text message / notes
    reporterMessage = serializers.CharField(
        source="message",
        allow_blank=True,
        required=False,
    )

    # Number of merged reports; defaults to 1 if not explicitly maintained.
    reportCount = serializers.IntegerField(
        source="report_count",
        read_only=True,
        default=1,
    )

    class Meta:
        model = ModerationReport
        fields = (
            # Core moderation payload
            "id",
            "content",
            "type",          # alias for reason
            "status",
            "reason",
            "severity",
            "message",
            "reporter",
            "author",
            "target_type",
            "target_id",
            "created_at",
            "updated_at",
            # Aliases / enriched fields for the UI
            "targetType",
            "targetId",
            "createdAt",
            "lastActionAt",
            "reporterName",
            "authorName",
            "reporterMessage",
            "reportCount",
        )
        read_only_fields = (
            "id",
            "status",
            "reporter",
            "author",
            "created_at",
            "updated_at",
            "createdAt",
            "lastActionAt",
            "reportCount",
        )

    def get_reporterName(self, obj: ModerationReport) -> str:
        """
        Prefer the User.name field when available,
        otherwise username, otherwise the string representation.
        """
        user = getattr(obj, "reporter", None)
        if user is None:
            return ""
        name = getattr(user, "name", None)
        return name or user.get_username() or str(user)

    def get_authorName(self, obj: ModerationReport) -> str:
        user = getattr(obj, "author", None)
        if user is None:
            return ""
        name = getattr(user, "name", None)
        return name or user.get_username() or str(user)


class ModerationActionSerializer(serializers.Serializer):
    """
    Payload used by POST admin/moderation/{id}/ from the frontend.

    Field:
        remove: if true, the offending content is removed and the report is
                marked as resolved; if false, the content is approved and
                the report is simply resolved.
    """

    remove = serializers.BooleanField()
