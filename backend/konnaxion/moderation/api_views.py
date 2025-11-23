# backend/konnaxion/moderation/api_views.py
"""
REST API for the cross‑module moderation queue.

This module exposes two endpoints (to be wired in config/urls.py):

    GET  /api/admin/moderation
    POST /api/admin/moderation/<id>

They are consumed by:
  - services/admin.fetchModerationQueue
  - services/admin.actOnReport
and by the Ethikos / KonnectED admin moderation UIs.
"""

from __future__ import annotations

from typing import Any

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ModerationReport
from .serializers import ModerationReportSerializer


class IsModerationAdmin(permissions.BasePermission):
    """
    Permission class for moderation endpoints.

    Default behaviour:
      - requires an authenticated user
      - and user.is_staff or user.is_superuser

    If you later introduce a dedicated "moderator" role or group,
    you can extend `has_permission` accordingly (e.g. check groups).
    """

    def has_permission(self, request, view) -> bool:  # type: ignore[override]
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Keep it simple and predictable: staff/superusers only by default
        return bool(getattr(user, "is_staff", False) or getattr(user, "is_superuser", False))


class ModerationQueueView(generics.ListAPIView):
    """
    GET /api/admin/moderation

    Returns the global moderation queue used by several frontends.

    Response shape is intentionally simple and stable:

        {
            "items": [
                {
                    "id": "...",
                    "content": "...",
                    "reporter": "...",
                    "type": "Spam" | "Harassment" | "Misinformation",
                    "status": "Pending" | "Resolved" | "Escalated",
                    ... // optional richer fields
                },
                ...
            ]
        }

    The serializer can expose additional fields (targetType, targetId,
    severity, timestamps, etc.). Frontends are defensive and will
    gracefully consume whatever superset you provide.
    """

    serializer_class = ModerationReportSerializer
    permission_classes = [IsModerationAdmin]
    pagination_class = None  # return full queue, not paginated

    def get_queryset(self):
        qs = ModerationReport.objects.all()

        # Optional status filter: /api/admin/moderation?status=Pending
        status_param = self.request.query_params.get("status")
        if status_param and any(f.name == "status" for f in ModerationReport._meta.fields):
            qs = qs.filter(status=status_param)

        # Prefer created_at ordering if the field exists
        if any(f.name == "created_at" for f in ModerationReport._meta.fields):
            qs = qs.order_by("-created_at")
        else:
            qs = qs.order_by("-pk")

        return qs

    def list(self, request, *args, **kwargs) -> Response:  # type: ignore[override]
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        # Wrap into { items: [...] } to match services/admin.ModernationPayload
        return Response({"items": serializer.data})


class ModerationDecisionView(APIView):
    """
    POST /api/admin/moderation/<id>

    Body:
        { "remove": true | false }

    Semantics:
      - remove = true  → content should be removed/hidden, report resolved
      - remove = false → content is approved/kept, report resolved

    Frontends do not rely on a particular response body; a 2xx with
    empty content is sufficient. This view returns HTTP 204 on success.
    """

    permission_classes = [IsModerationAdmin]

    def post(self, request, pk: int, *args: Any, **kwargs: Any) -> Response:
        report = get_object_or_404(ModerationReport, pk=pk)

        if "remove" not in request.data:
            raise ValidationError({"remove": "This field is required."})

        remove = bool(request.data.get("remove"))

        # Always mark as resolved in the moderation queue.
        # Prefer a typed constant on the model if it exists.
        if hasattr(report, "status"):
            resolved_value = getattr(report, "STATUS_RESOLVED", None)
            if resolved_value is None:
                # Fallback to simple string value if no constant defined
                resolved_value = "Resolved"
            setattr(report, "status", resolved_value)

        # Optional bookkeeping fields on the model, if they exist.
        now = timezone.now()

        if hasattr(report, "last_action_at"):
            setattr(report, "last_action_at", now)

        if hasattr(report, "resolved_at"):
            setattr(report, "resolved_at", now)

        if hasattr(report, "resolved_by") and getattr(request.user, "is_authenticated", False):
            # type: ignore[assignment]
            setattr(report, "resolved_by", request.user)

        # If the domain model exposes a helper method to apply the decision
        # to the underlying target object, call it defensively.
        apply_fn = getattr(report, "apply_decision", None)
        if callable(apply_fn):
            # Recommended signature on the model:
            #   def apply_decision(self, *, remove: bool, actor: User | None) -> None: ...
            apply_fn(remove=remove, actor=request.user if request.user.is_authenticated else None)

        # Finally persist changes on the report itself.
        report.save()

        return Response(status=status.HTTP_204_NO_CONTENT)
