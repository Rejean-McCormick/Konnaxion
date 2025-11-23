# backend/konnaxion/<trust_app_or_kollective>/serializers.py

from __future__ import annotations

from typing import Optional

from rest_framework import serializers

from .models import Credential

__all__ = ["CredentialSerializer"]


class CredentialSerializer(serializers.ModelSerializer):
    """
    Serializer for user-submitted real‑world credentials used in the Trust module.

    It matches the `Credential` / `CredentialRow` shape used on the frontend:
      - services/trust.ts  → interface Credential
      - app/ethikos/trust/credentials/page.tsx → type CredentialRow
    """

    # Frontend expects `issuedAt` (camelCase), mapped to model field `issued_at`.
    issuedAt = serializers.DateTimeField(
        source="issued_at",
        required=False,
        allow_null=True,
        format=None,  # ISO 8601
    )

    # Public URL to the stored document (built from FileField).
    url = serializers.SerializerMethodField()

    # Human-readable review status ("Verified" | "Pending" | "Rejected").
    status = serializers.SerializerMethodField()

    # Optional reviewer notes; exposed read-only to the end-user.
    notes = serializers.CharField(
        read_only=True,
        allow_blank=True,
        allow_null=True,
    )

    class Meta:
        model = Credential
        fields = (
            "id",
            "title",
            "issuer",
            "issuedAt",
            "url",
            "status",
            "notes",
        )
        read_only_fields = (
            "id",
            "url",
            "status",
            "notes",
        )

    # ------------------------------------------------------------------
    # Computed fields
    # ------------------------------------------------------------------

    def get_url(self, obj: Credential) -> Optional[str]:
        """
        Returns an absolute URL to the uploaded document, if available.

        Assumes the model exposes a FileField named `document`.
        """
        file_field = getattr(obj, "document", None)
        if not file_field:
            return None

        try:
            relative_url = file_field.url
        except Exception:
            # File may not exist in storage yet
            return None

        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(relative_url)
        return relative_url

    def get_status(self, obj: Credential) -> Optional[str]:
        """
        Returns a human‑friendly review status string for the UI.

        If the model defines `get_status_display()` (e.g. via Django `choices`),
        that label is used; otherwise, the raw value is title‑cased.
        """
        display = getattr(obj, "get_status_display", None)
        if callable(display):
            return display()

        raw = getattr(obj, "status", None)
        if isinstance(raw, str):
            return raw.replace("_", " ").title()
        return raw
