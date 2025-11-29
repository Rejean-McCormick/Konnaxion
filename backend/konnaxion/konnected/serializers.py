# FILE: backend/konnaxion/konnected/serializers.py
# konnaxion/konnected/serializers.py
from rest_framework import serializers

from .models import (
    CertificationPath,
    Evaluation,
    PeerValidation,
    Portfolio,
    KnowledgeResource,
)

__all__ = [
    "KnowledgeResourceSerializer",
    "CertificationPathSerializer",
    "EvaluationSerializer",
    "PeerValidationSerializer",
    "PortfolioSerializer",
    "ExamAttemptSerializer",
]


class KnowledgeResourceSerializer(serializers.ModelSerializer):
    """
    Serialises library items (video, doc, course…) defined by the
    KnowledgeResource model in v14.
    """

    author = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = KnowledgeResource
        fields = "__all__"


class CertificationPathSerializer(serializers.ModelSerializer):
    """
    Minimal representation of a certification / learning path.

    v14 only stores basic metadata in the database (name, description…).
    Any extra fields used by the frontend (level, tags, KPIs) can be
    added later either as DB columns or via a CMS / enrichment layer.
    """

    class Meta:
        model = CertificationPath
        fields = "__all__"


class EvaluationSerializer(serializers.ModelSerializer):
    """
    Stores a single evaluation / exam attempt for a user on a path.

    The JSON `metadata` field is intentionally flexible and can contain:
        - delivery_mode, proctored, status
        - session_id, full_name, agreed_terms
        - score_percent, max_score
        - appeal_status, peer_validation_required, etc.
    """

    user = serializers.StringRelatedField(read_only=True)
    path = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Evaluation
        fields = "__all__"
        read_only_fields = ("id", "user", "path", "created_at", "updated_at")


class PeerValidationSerializer(serializers.ModelSerializer):
    """
    Peer mentor validation on a given evaluation.
    """

    peer = serializers.StringRelatedField(read_only=True)
    evaluation = serializers.PrimaryKeyRelatedField(queryset=Evaluation.objects.all())

    class Meta:
        model = PeerValidation
        fields = "__all__"
        read_only_fields = ("id", "peer", "created_at", "updated_at")


class PortfolioSerializer(serializers.ModelSerializer):
    """
    User skill portfolio – curated collection of KnowledgeResources.
    """

    user = serializers.StringRelatedField(read_only=True)
    items = serializers.PrimaryKeyRelatedField(
        queryset=KnowledgeResource.objects.all(),
        many=True,
        required=False,
    )

    class Meta:
        model = Portfolio
        fields = "__all__"
        read_only_fields = ("id", "user", "created_at", "updated_at")


class ExamAttemptSerializer(serializers.Serializer):
    """
    Read-only projection used by the Exam Dashboard UI.

    This is *not* backed by a dedicated model; it aggregates data coming
    from Evaluation (+ PeerValidation, Portfolio / certificates) into a
    single flattened record.

    It matches the shape used in:
      app/konnected/certifications/exam-dashboard-results/page.tsx
    """

    id = serializers.CharField()
    certificationPathId = serializers.CharField()
    certificationPathName = serializers.CharField()
    attemptNumber = serializers.IntegerField()
    takenAt = serializers.DateTimeField()

    deliveryMode = serializers.CharField()
    proctored = serializers.BooleanField()

    scorePercent = serializers.FloatField(allow_null=True)
    maxScore = serializers.FloatField(allow_null=True, required=False)

    status = serializers.CharField()
    peerValidationRequired = serializers.BooleanField()
    peerValidationStatus = serializers.CharField(
        allow_null=True,
        required=False,
    )
    appealStatus = serializers.CharField(
        allow_null=True,
        required=False,
    )

    certificateId = serializers.CharField(
        allow_null=True,
        allow_blank=True,
        required=False,
    )
    certificateUrl = serializers.CharField(
        allow_null=True,
        allow_blank=True,
        required=False,
    )
    portfolioItemId = serializers.CharField(
        allow_null=True,
        allow_blank=True,
        required=False,
    )
    portfolioUrl = serializers.CharField(
        allow_null=True,
        allow_blank=True,
        required=False,
    )

    canRetry = serializers.BooleanField()
    nextRetryAt = serializers.DateTimeField(
        allow_null=True,
        required=False,
    )
