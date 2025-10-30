from rest_framework import viewsets, permissions
from .models import EthikosTopic, EthikosStance, EthikosArgument
from .serializers import (
    EthikosTopicSerializer,
    EthikosStanceSerializer,
    EthikosArgumentSerializer,
)


class TopicViewSet(viewsets.ModelViewSet):
    """CRUD for debate topics"""
    queryset = EthikosTopic.objects.select_related("created_by", "category")
    serializer_class = EthikosTopicSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class StanceViewSet(viewsets.ModelViewSet):
    """
    Create/update a user’s stance.
    Listing (`?topic=<id>`) shows all stances on a topic.
    """
    queryset = EthikosStance.objects.select_related("topic", "user")
    serializer_class = EthikosStanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        topic_id = self.request.query_params.get("topic")
        if topic_id:
            qs = qs.filter(topic_id=topic_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ArgumentViewSet(viewsets.ModelViewSet):
    """Threaded arguments under a topic (pro/contra)"""
    queryset = EthikosArgument.objects.select_related("user", "topic", "parent")
    serializer_class = EthikosArgumentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
