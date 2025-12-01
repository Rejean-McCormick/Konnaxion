# backend/konnaxion/trust/serializers.py

from __future__ import annotations

from typing import Optional

from rest_framework import serializers

from .models import Credential

__all__ = ["CredentialSerializer"]


class CredentialSerializer(serializers.ModelSerializer):
    """
    Serializer for user-submitted real-world credentials used in the Trust module.

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

    # Upload field: the raw file coming from the client, mapped to the model's
    # FileField via the `document` alias on the model.
    # This is write-only and is not exposed in responses.
    file = serializers.FileField(
        write_only=True,
        required=True,
        source="document",
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
            "file",  # write-only input for uploads
        )
        read_only_fields = (
            "id",
            "url",
            "status",
            "notes",
        )
        extra_kwargs = {
            "title": {"required": False, "allow_blank": True},
            "issuer": {"required": False, "allow_blank": True},
        }

    # ------------------------------------------------------------------
    # Creation
    # ------------------------------------------------------------------

    def create(self, validated_data: dict) -> Credential:
        """
        Create a new Credential attached to the current user.

        Behaviour:
        - `file` (document) is required.
        - `title` defaults to a cleaned-up version of the filename if omitted.
        - `issuer` is optional, defaults to empty string.
        - `issued_at` is optional and may be null.
        - `status` is initialised as a "pending" value.
        - `notes` is set to a default review message.
        """
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if user is None or not getattr(user, "is_authenticated", False):
            raise serializers.ValidationError(
                {"non_field_errors": ["Authentication required to upload credentials."]}
            )

        # Because `file` is declared with source="document",
        # the validated key here is "document".
        document = validated_data.pop("document", None)
        if document is None:
            raise serializers.ValidationError({"file": ["This field is required."]})

        title: Optional[str] = validated_data.get("title") or None
        issuer: str = (validated_data.get("issuer") or "").strip()
        issued_at = validated_data.get("issued_at")

        # Derive title from filename if not provided
        if not title and getattr(document, "name", None):
            fname = document.name
            base = fname.rsplit(".", 1)[0]
            base = base.replace("_", " ").replace("-", " ").strip()
            title = base or "Untitled credential"

        # Resolve an appropriate "pending" status value.
        status_enum = getattr(Credential, "Status", None)
        if status_enum is not None and hasattr(status_enum, "PENDING"):
            status_value = status_enum.PENDING
        elif hasattr(Credential, "STATUS_PENDING"):
            status_value = getattr(Credential, "STATUS_PENDING")
        else:
            # Fallback string; the display label will be normalised by get_status()
            status_value = "pending"

        default_notes = getattr(
            Credential,
            "DEFAULT_PENDING_NOTES",
            "Awaiting manual verification",
        )

        # IMPORTANT: the real storage field is `file`, not `document`.
        credential = Credential.objects.create(
            user=user,
            title=title or "Untitled credential",
            issuer=issuer,
            issued_at=issued_at,
            file=document,
            status=status_value,
            notes=default_notes,
        )
        return credential

    # ------------------------------------------------------------------
    # Computed fields
    # ------------------------------------------------------------------

    def get_url(self, obj: Credential) -> Optional[str]:
        """
        Returns an absolute URL to the uploaded document, if available.

        Prefers a FileField named `document` (property on the model),
        but will also fall back to `file` if present.
        """
        file_field = getattr(obj, "document", None) or getattr(obj, "file", None)
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
        Returns a human-friendly review status string for the UI.

        If the model defines `get_status_display()` (e.g. via Django `choices`),
        that label is used; otherwise, the raw value is title-cased.
        """
        display = getattr(obj, "get_status_display", None)
        if callable(display):
            return display()

        raw = getattr(obj, "status", None)
        if isinstance(raw, str):
            return raw.replace("_", " ").title()
        return raw
