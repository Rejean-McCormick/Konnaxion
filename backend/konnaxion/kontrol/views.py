# FILE: backend/konnaxion/kontrol/views.py
from rest_framework import viewsets, permissions, filters
from django.contrib.auth import get_user_model
from .models import AuditLog, ModerationTicket, KonsensusConfig
from .serializers import (
    AuditLogSerializer, 
    ModerationTicketSerializer, 
    UserAdminSerializer,
    KonsensusConfigSerializer
)

User = get_user_model()


class IsAdminOrModerator(permissions.BasePermission):
    """
    Custom permission to allow access only to admins and staff (moderators).
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset for system audit logs.
    Only accessible by staff/admins.
    """
    queryset = AuditLog.objects.all().order_by("-created")
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminOrModerator]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["action", "module", "target", "actor_name", "actor__username"]


class ModerationTicketViewSet(viewsets.ModelViewSet):
    """
    CRUD viewset for moderation tickets.
    """
    queryset = ModerationTicket.objects.all().order_by("-created")
    serializer_class = ModerationTicketSerializer
    permission_classes = [IsAdminOrModerator]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["report_reason", "content_snippet", "author__username"]
    ordering_fields = ["severity", "created", "report_count"]

    def perform_create(self, serializer):
        # When creating a ticket via API, ensure integrity if needed
        serializer.save()


class UserAdminViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset for the admin user management table.
    """
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserAdminSerializer
    permission_classes = [IsAdminOrModerator]
    filter_backends = [filters.SearchFilter]
    search_fields = ["username", "email"]


class KonsensusConfigViewSet(viewsets.ModelViewSet):
    """
    CRUD viewset for the global Konsensus voting configuration.
    Generally, there should only be one active configuration record.
    """
    queryset = KonsensusConfig.objects.all().order_by("-created")
    serializer_class = KonsensusConfigSerializer
    permission_classes = [IsAdminOrModerator]
    
    # Since this is a settings object, we usually don't need search/filter,
    # but ordering ensures the latest config is at the top.
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created", "modified"]