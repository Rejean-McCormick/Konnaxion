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


class EthikosTopicSerializer(serializers.ModelSerializer):
    category = EthikosCategorySerializer(read_only=True)
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = EthikosTopic
        fields = "__all__"


class EthikosStanceSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = EthikosStance
        fields = "__all__"


class EthikosArgumentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    parent = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = EthikosArgument
        fields = "__all__"
