# FILE: backend/konnaxion/ethikos/serializers.py
# backend/konnaxion/ethikos/serializers.py

from rest_framework import serializers
from .models import (
    EthikosCategory,
    EthikosTopic,
    EthikosStance,
    EthikosArgument,
)

__all__ = [
    "EthikosCategorySerializer",
    "EthikosTopicSerializer",
    "EthikosStanceSerializer",
    "EthikosArgumentSerializer",
]


class EthikosCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EthikosCategory
        fields = "__all__"
        read_only_fields = ("id",)


class EthikosTopicSerializer(serializers.ModelSerializer):
    # Représentation en lecture seule (objet imbriqué)…
    category = EthikosCategorySerializer(read_only=True)
    created_by = serializers.StringRelatedField(read_only=True)
    # …et champ d’entrée write-only pour la création/mise à jour.
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=EthikosCategory.objects.all(),
        source="category",
        write_only=True,
        required=True,
    )

    class Meta:
        model = EthikosTopic
        fields = (
            "id",
            "title",
            "description",
            "category",        # read-only nested
            "category_id",     # write-only PK
            "expertise_category",
            "status",
            "total_votes",
            "created_by",
            "last_activity",
            "created_at",
        )
        read_only_fields = (
            "id",
            "created_by",
            "last_activity",
            "created_at",
            "total_votes",     # maintenu côté serveur
        )


class EthikosStanceSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = EthikosStance
        fields = (
            "id",
            "user",
            "topic",     # PK par défaut, utilisable en écriture
            "value",
            "timestamp",
        )
        read_only_fields = ("id", "user", "timestamp")


class EthikosArgumentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    # pour la lecture: on expose l'id du parent
    parent = serializers.PrimaryKeyRelatedField(read_only=True)
    # pour l'écriture: on accepte parent_id
    parent_id = serializers.PrimaryKeyRelatedField(
        queryset=EthikosArgument.objects.all(),
        source="parent",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = EthikosArgument
        fields = (
            "id",
            "topic",         # PK par défaut
            "user",
            "content",
            "parent",        # read-only id
            "parent_id",     # write-only id
            "side",
            "is_hidden",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "user", "created_at", "updated_at")

    def validate(self, attrs):
        """
        Empêche d'attacher une réponse à un parent d'un autre topic.
        """
        topic = attrs.get("topic") or getattr(self.instance, "topic", None)
        parent = attrs.get("parent")
        if parent is not None and topic is not None and parent.topic_id != topic.id:
            raise serializers.ValidationError(
                {"parent_id": "Le parent appartient à un autre topic."}
            )
        return attrs
