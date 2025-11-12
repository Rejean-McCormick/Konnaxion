# backend/konnaxion/ethikos/api_views.py

from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .models import (
    EthikosCategory,
    EthikosTopic,
    EthikosStance,
    EthikosArgument,
)
from .serializers import (
    EthikosCategorySerializer,
    EthikosTopicSerializer,
    EthikosStanceSerializer,
    EthikosArgumentSerializer,
)


# ---- Permissions simples owner-or-read-only ---------------------------------
class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Lecture pour tous. Ecriture réservée au propriétaire.
    - Topic: champ 'created_by'
    - Stance/Argument: champ 'user'
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner_id = getattr(obj, "created_by_id", None) or getattr(obj, "user_id", None)
        return owner_id == getattr(request.user, "id", None)


# ---- Categories (lecture seule par défaut) ----------------------------------
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Liste et détail des catégories de débats.
    """
    queryset = EthikosCategory.objects.all().order_by("name")
    serializer_class = EthikosCategorySerializer
    permission_classes = [permissions.AllowAny]


# ---- Topics -----------------------------------------------------------------
class TopicViewSet(viewsets.ModelViewSet):
    """
    CRUD pour les sujets de débat.
    Injecte 'created_by' et gère 'category' malgré le serializer read-only.
    """
    queryset = EthikosTopic.objects.select_related("created_by", "category")
    serializer_class = EthikosTopicSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def _resolve_category(self, request, required: bool) -> EthikosCategory | None:
        cat_id = request.data.get("category") or request.data.get("category_id")
        if not cat_id:
            if required:
                raise ValidationError({"category": "Requis"})
            return None
        return get_object_or_404(EthikosCategory, pk=cat_id)

    def perform_create(self, serializer):
        category = self._resolve_category(self.request, required=True)
        serializer.save(created_by=self.request.user, category=category)

    def perform_update(self, serializer):
        # category facultative en update
        category = self._resolve_category(self.request, required=False)
        if category is not None:
            serializer.save(category=category)
        else:
            serializer.save()

    def get_queryset(self):
        qs = super().get_queryset()
        cat = self.request.query_params.get("category")
        if cat:
            qs = qs.filter(category_id=cat)
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    @action(detail=True, methods=["get"], permission_classes=[permissions.AllowAny])
    def preview(self, request, pk=None):
        """
        Retourne un aperçu minimal du topic.
        Compatible avec un usage front de type .../topics/{id}/preview.
        """
        topic = self.get_object()
        desc = topic.description or ""
        preview_desc = desc if len(desc) <= 280 else (desc[:280] + "…")
        data = {
            "id": topic.id,
            "title": topic.title,
            "description": preview_desc,
            "category": topic.category.name if topic.category_id else None,
            "status": topic.status,
            "total_votes": topic.total_votes,
            "last_activity": topic.last_activity,
        }
        return Response(data, status=status.HTTP_200_OK)


# ---- Stances ----------------------------------------------------------------
class StanceViewSet(viewsets.ModelViewSet):
    """
    Crée/Met à jour la position d’un utilisateur sur un topic.
    - GET list: filtrable par ?topic=<id>
    - POST: upsert (update_or_create) pour respecter l'unicité (user, topic)
    """
    queryset = EthikosStance.objects.select_related("topic", "user")
    serializer_class = EthikosStanceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        topic_id = self.request.query_params.get("topic")
        if topic_id:
            qs = qs.filter(topic_id=topic_id)
        return qs

    def create(self, request, *args, **kwargs):
        topic_id = request.data.get("topic")
        value = request.data.get("value")
        if topic_id is None or value is None:
            raise ValidationError({"topic": "Requis", "value": "Requis"})
        # Upsert sur (user, topic) pour éviter les erreurs d'unicité
        stance, created = EthikosStance.objects.update_or_create(
            user=request.user,
            topic_id=topic_id,
            defaults={"value": value},
        )
        serializer = self.get_serializer(stance)
        code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=code)

    def perform_create(self, serializer):
        # Non utilisé car create() est surchargé, mais gardé par sécurité.
        serializer.save(user=self.request.user)


# ---- Arguments --------------------------------------------------------------
class ArgumentViewSet(viewsets.ModelViewSet):
    """
    Messages argumentés, threadés par 'parent' (pro/contra).
    - GET list: filtrable par ?topic=<id>
    - POST: fixe 'user' et accepte 'parent' même si le serializer le marque read-only.
    """
    queryset = EthikosArgument.objects.select_related("user", "topic", "parent")
    serializer_class = EthikosArgumentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        topic_id = self.request.query_params.get("topic")
        if topic_id:
            qs = qs.filter(topic_id=topic_id)
        return qs

    def perform_create(self, serializer):
        parent_id = self.request.data.get("parent")
        extra = {"user": self.request.user}
        if parent_id:
            parent = get_object_or_404(EthikosArgument, pk=parent_id)
            # Si 'topic' fourni et différent de celui du parent -> erreur
            topic_in = self.request.data.get("topic")
            if topic_in and int(topic_in) != parent.topic_id:
                raise ValidationError({"parent": "Le parent doit appartenir au même topic."})
            extra["parent"] = parent
        serializer.save(**extra)
