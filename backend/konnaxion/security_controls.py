"""Application trust-boundary security controls for Konnaxion.

Keep these controls dependency-light so every app can reuse the same URL, upload,
and authorization rules.  The functions here intentionally fail closed.
"""
from __future__ import annotations

import ipaddress
import os
from urllib.parse import urlsplit

from django.conf import settings
from rest_framework.permissions import SAFE_METHODS, BasePermission
from rest_framework.serializers import ValidationError as DRFValidationError

DANGEROUS_UPLOAD_EXTENSIONS = {
    ".bat", ".cmd", ".com", ".cpl", ".dll", ".exe", ".hta", ".htm", ".html",
    ".jar", ".js", ".jse", ".mjs", ".msi", ".ps1", ".psm1", ".reg", ".scr",
    ".sh", ".svg", ".vbe", ".vbs", ".wsf", ".xhtml", ".xml",
}
DANGEROUS_UPLOAD_MIME_TYPES = {
    "application/ecmascript",
    "application/javascript",
    "application/x-httpd-php",
    "application/x-javascript",
    "application/x-msdownload",
    "application/x-powershell",
    "application/xhtml+xml",
    "image/svg+xml",
    "text/html",
    "text/javascript",
    "text/xml",
}
ACTIVE_CONTENT_PREFIXES = (
    b"<!doctype html", b"<html", b"<script", b"<svg", b"<?xml",
)


def is_staff_or_superuser(user) -> bool:
    return bool(
        user
        and getattr(user, "is_authenticated", False)
        and (getattr(user, "is_staff", False) or getattr(user, "is_superuser", False))
    )


def validate_safe_external_url(value: str) -> str:
    """Accept only public HTTPS URLs without embedded credentials.

    The optional ``KONNAXION_EXTERNAL_LINK_ALLOWED_HOSTS`` setting can further
    restrict destinations. Entries match the exact host or its subdomains.
    """
    raw = str(value or "").strip()
    try:
        parsed = urlsplit(raw)
    except ValueError as exc:
        raise DRFValidationError("Invalid external URL.") from exc

    if parsed.scheme.lower() != "https":
        raise DRFValidationError("External URLs must use HTTPS.")
    if not parsed.hostname:
        raise DRFValidationError("External URL must include a hostname.")
    if parsed.username is not None or parsed.password is not None:
        raise DRFValidationError("Credentials are not allowed in external URLs.")

    host = parsed.hostname.rstrip(".").lower()
    if host == "localhost" or host.endswith((".localhost", ".local", ".internal")):
        raise DRFValidationError("Local/private hosts are not allowed.")
    try:
        address = ipaddress.ip_address(host)
    except ValueError:
        address = None
    if address is not None and not address.is_global:
        raise DRFValidationError("Private/reserved IP destinations are not allowed.")

    allowed = getattr(settings, "KONNAXION_EXTERNAL_LINK_ALLOWED_HOSTS", ()) or ()
    if isinstance(allowed, str):
        allowed = [item.strip() for item in allowed.split(",") if item.strip()]
    allowed = [str(item).rstrip(".").lower() for item in allowed]
    if allowed and not any(host == item or host.endswith(f".{item}") for item in allowed):
        raise DRFValidationError("External URL host is not on the approved allowlist.")
    return raw


def _upload_header(upload, size: int = 8192) -> bytes:
    try:
        pos = upload.tell()
    except Exception:
        pos = None
    try:
        header = upload.read(size)
    except Exception:
        header = b""
    finally:
        if pos is not None:
            try:
                upload.seek(pos)
            except Exception:
                pass
    return bytes(header or b"")


def validate_safe_upload(
    upload,
    *,
    allowed_extensions: set[str] | None = None,
    allowed_mime_types: set[str] | None = None,
    max_bytes: int = 25 * 1024 * 1024,
) -> None:
    """Validate an uploaded file using name, declared MIME and bounded sniffing.

    This is intentionally a deny+allow boundary, not malware detection. Production
    media responses are separately sandboxed/nosniff'd and SecurityDiag verifies
    that defense-in-depth contract.
    """
    if upload is None:
        return
    name = str(getattr(upload, "name", "") or "")
    ext = os.path.splitext(name)[1].lower()
    content_type = str(getattr(upload, "content_type", "") or "").lower().split(";", 1)[0]
    size = int(getattr(upload, "size", 0) or 0)

    if size <= 0:
        raise DRFValidationError("Uploaded file is empty.")
    if size > max_bytes:
        raise DRFValidationError(f"Uploaded file exceeds the {max_bytes // (1024*1024)} MiB limit.")
    if ext in DANGEROUS_UPLOAD_EXTENSIONS:
        raise DRFValidationError("Active/executable file types are not accepted.")
    if content_type in DANGEROUS_UPLOAD_MIME_TYPES:
        raise DRFValidationError("Active/executable MIME types are not accepted.")
    if allowed_extensions is not None and ext not in allowed_extensions:
        raise DRFValidationError("File extension is not allowed for this upload type.")
    if allowed_mime_types is not None and content_type and content_type not in allowed_mime_types:
        raise DRFValidationError("File MIME type is not allowed for this upload type.")

    header = _upload_header(upload).lstrip().lower()
    if any(header.startswith(prefix) for prefix in ACTIVE_CONTENT_PREFIXES):
        raise DRFValidationError("Active HTML/XML/SVG content is not accepted.")


class StaffWritePublicReadPermission(BasePermission):
    """Public reads; only staff/superusers may write."""
    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return is_staff_or_superuser(request.user)


class OwnerOrStaffWritePermission(BasePermission):
    """Allow safe reads and object writes only to an owner or staff.

    Views can set ``owner_fields``; common ownership names are used otherwise.
    """
    DEFAULT_OWNER_FIELDS = (
        "owner", "creator", "created_by", "artist", "host", "author",
        "submitted_by", "uploaded_by", "user",
    )

    def has_permission(self, request, view) -> bool:
        return request.method in SAFE_METHODS or bool(
            request.user and request.user.is_authenticated
        )

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True
        if is_staff_or_superuser(request.user):
            return True
        user_id = getattr(request.user, "pk", None)
        for field in getattr(view, "owner_fields", self.DEFAULT_OWNER_FIELDS):
            owner_id = getattr(obj, f"{field}_id", None)
            if owner_id is None:
                owner = getattr(obj, field, None)
                owner_id = getattr(owner, "pk", None)
            if owner_id is not None and owner_id == user_id:
                return True
        return False


def user_can_manage_project(user, project) -> bool:
    if is_staff_or_superuser(user):
        return True
    if not user or not getattr(user, "is_authenticated", False) or project is None:
        return False
    if getattr(project, "creator_id", None) == getattr(user, "pk", None):
        return True
    memberships = getattr(project, "team_memberships", None)
    if memberships is None:
        return False
    try:
        return memberships.filter(user=user, role="owner").exists()
    except Exception:
        return False


def user_can_participate_project(user, project) -> bool:
    if user_can_manage_project(user, project):
        return True
    if not user or not getattr(user, "is_authenticated", False) or project is None:
        return False
    memberships = getattr(project, "team_memberships", None)
    if memberships is None:
        return False
    try:
        return memberships.filter(user=user).exists()
    except Exception:
        return False


class ProjectManagerWritePermission(BasePermission):
    """Public reads; project writes require the project manager/owner or staff."""
    def has_permission(self, request, view) -> bool:
        return request.method in SAFE_METHODS or bool(
            request.user and request.user.is_authenticated
        )

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True
        project = getattr(obj, "project", None)
        if project is None and hasattr(obj, "team_memberships"):
            project = obj
        return user_can_manage_project(request.user, project)


class SelfOrStaffWritePermission(OwnerOrStaffWritePermission):
    DEFAULT_OWNER_FIELDS = ("user",)
